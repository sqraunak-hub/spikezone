"""
Passwordless sign-in: by mobile OTP (Firebase) and by email OTP (our SMTP).

Both paths end in exactly the same place - a SimpleJWT access/refresh pair
from get_token_for_user() - so everything downstream (the storefront's axios
interceptor, PrivateRoute, the admin panel) keeps working unchanged.

Why two paths at all: the email one costs nothing and needs no provider, so it
stays available as a fallback whenever an SMS does not arrive, and it is what
the site runs on before the Firebase billing account is live.
"""

from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from SpikeZoneApiApp.models import EmailOTP, User
from SpikeZoneApiApp.phone_auth import (
    PhoneAuthError,
    PhoneAuthNotConfigured,
    get_provider,
    normalize_phone,
)
from SpikeZoneApiApp.serializers import (
    EmailOTPLoginSerializer,
    EmailSerializer,
    PhoneLoginSerializer,
    PhoneOTPRequestSerializer,
    UserProfileSerializer,
)


# --------------------------------------------------------------------------
# Throttling
# --------------------------------------------------------------------------

class OTPTargetThrottle(SimpleRateThrottle):
    """
    Rate-limit by the number or address being targeted, not by client IP.

    DRF's stock AnonRateThrottle keys on IP, which is the wrong axis here. The
    thing we are protecting is the *recipient*: one phone number should not be
    able to be spammed with OTPs from a hundred different IPs, and one attacker
    behind one IP legitimately serves a whole office NAT. Both throttles are
    applied together on the request endpoints - this one caps per-target, the
    IP one caps per-source.

    On Firebase this is also direct cost control: every SMS is billable, so an
    unthrottled request endpoint is a metered hole in the budget.
    """

    scope = 'otp_target'

    def get_cache_key(self, request, view):
        raw_phone = request.data.get('phone')
        if raw_phone:
            try:
                target = normalize_phone(raw_phone)
            except PhoneAuthError:
                # Malformed input never reaches a provider, so there is nothing
                # to throttle; let the serializer reject it with a real message.
                return None
        else:
            target = (request.data.get('email') or '').strip().lower()

        if not target:
            return None

        return self.cache_format % {'scope': self.scope, 'ident': target}


class OTPTargetVerifyThrottle(OTPTargetThrottle):
    """Same keying, looser rate - verifying is cheap, sending is not."""

    scope = 'otp_target_verify'


# --------------------------------------------------------------------------
# Shared helpers
# --------------------------------------------------------------------------

def _auth_payload(user, is_new=False, msg='Login Success'):
    """
    The one response shape every login endpoint returns.

    It includes the serialized user because the storefront reads data.user.id
    straight off the login response to seed its zustand store.
    """
    # Imported here rather than at module scope: views.py imports from this
    # module's siblings and a top-level import would close the cycle.
    from SpikeZoneApiApp.views import get_token_for_user

    return {
        'token': get_token_for_user(user),
        'user': UserProfileSerializer(user).data,
        'is_new': is_new,
        'msg': msg,
    }


def send_otp_email(email, otp, purpose=EmailOTP.PURPOSE_VERIFY):
    """
    Mail a code. Shared by signup verification and passwordless login.

    One template for both purposes: to the customer the two are the same
    moment - they typed an address and now have to prove it is theirs - and a
    single wording is one less thing to keep in sync.

    The stated validity is read from EmailOTP.VALID_FOR rather than typed in,
    so the promise in the mail cannot drift away from what the model enforces.
    """
    minutes = int(EmailOTP.VALID_FOR.total_seconds() // 60)

    subject = 'Welcome to Spikezone - your verification code'

    # Plain-text alternative. Not decorative: some clients show only this, and
    # spam filters treat a missing text part as a signal.
    # Plain-text alternative, carrying the same copy as the HTML part rather
    # than a stripped-down version of it. Some clients show only this one, and
    # a missing text part is a spam signal, so it is worth writing properly.
    #
    # The emoji stay: they are plain Unicode, they render in every modern mail
    # client, and without them this part reads like a system notice next to the
    # HTML one. The ** bold markers do not - nothing renders them in plain
    # text, so they would show up as literal asterisks. The code gets its own
    # indented line because that is far easier to select on a phone than a
    # number buried mid-sentence.
    text_body = (
        '⚡ Welcome to Spikezone!\n\n'
        "You're almost there! Use the verification code below to securely "
        'verify your account and continue.\n\n'
        '    {otp}\n\n'
        'This OTP is valid for {minutes} minutes and can be used only once. '
        "🔐 For your security, please don't share this code with anyone.\n\n"
        'At Spikezone, we believe in keeping your space clean, protected, and '
        'bird-friendly. 🐦🏠\n\n'
        'Verify your account and step into the Spikezone.\n'
        '— Team Spikezone\n\n'
        '———\n'
        "Didn't request this code? You can safely ignore this email — "
        'nobody can access your account without it.\n'
    ).format(otp=otp, minutes=minutes)

    # Inline styles and a table shell, because that is the only layout email
    # clients agree on - Outlook in particular ignores <style> blocks and most
    # of flexbox. Brand colours are hardcoded for the same reason: CSS
    # variables do not resolve in mail.
    html_body = '''
<div style="margin:0;padding:24px 12px;background:#f2f8fb;
            font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="max-width:520px;margin:0 auto;width:100%;background:#ffffff;
                border-radius:14px;overflow:hidden;
                box-shadow:0 10px 30px -12px rgba(6,34,46,0.25);">
    <tr>
      <td style="background:#06222e;padding:26px 32px;">
        <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">
          &#9889; Welcome to Spikezone!
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 32px 8px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#0d2430;">
          You&rsquo;re almost there! Use the verification code below to securely
          verify your account and continue.
        </p>

        <div style="margin:0 0 20px;padding:18px;border-radius:12px;
                    background:#f2f8fb;border:1px solid #d7e6ee;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.6px;
                      text-transform:uppercase;color:#5e747f;">
            Verification code
          </div>
          <div style="margin-top:8px;font-size:34px;font-weight:700;
                      letter-spacing:9px;color:#0a7699;">{otp}</div>
        </div>

        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#46606c;">
          This OTP is valid for <strong>{minutes} minutes</strong> and can be used
          only once. &#128274; For your security, please don&rsquo;t share this
          code with anyone.
        </p>

        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#46606c;">
          At Spikezone, we believe in keeping your space
          <strong>clean, protected, and bird-friendly</strong>. &#128038;&#127968;
        </p>

        <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0d2430;">
          Verify your account and step into the Spikezone.
        </p>
        <p style="margin:0;font-size:14px;color:#5e747f;">&mdash; Team Spikezone</p>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 32px 28px;">
        <div style="border-top:1px solid #e2e9ee;padding-top:16px;
                    font-size:12px;line-height:1.55;color:#7b8f99;">
          Didn&rsquo;t request this code? You can safely ignore this email &mdash;
          nobody can access your account without it.
        </div>
      </td>
    </tr>
  </table>
</div>'''.format(otp=otp, minutes=minutes)

    send_mail(
        subject=subject,
        message=text_body,
        from_email=None,
        recipient_list=[email],
        html_message=html_body,
    )


def _consume_email_otp(email, otp, purpose):
    """
    Check a code and burn it.

    Returns None on success, or an error string. Everything here is written to
    be single-use and countable: the row is locked, the attempt is recorded
    even on failure, and a success flips is_used so the same digits cannot be
    presented twice.
    """
    with transaction.atomic():
        record = (
            EmailOTP.objects
            .select_for_update()
            .filter(email=email, purpose=purpose)
            .order_by('-created_at')
            .first()
        )

        if record is None:
            return 'Invalid OTP'

        if record.is_used:
            return 'This code has already been used. Please request a new one.'

        if record.is_expired():
            return 'OTP expired'

        if record.attempts >= EmailOTP.MAX_ATTEMPTS:
            return 'Too many incorrect attempts. Please request a new code.'

        if record.otp != otp:
            # Counted before returning, so repeated wrong guesses exhaust the
            # code rather than getting unlimited tries inside the 5-minute
            # window.
            record.attempts += 1
            record.save(update_fields=['attempts'])
            return 'Invalid OTP'

        record.is_used = True
        record.save(update_fields=['is_used'])
        return None


# --------------------------------------------------------------------------
# Phone OTP (Firebase)
# --------------------------------------------------------------------------

class PhoneOTPRequestView(APIView):
    """
    Start a phone login.

    With Firebase the SMS is sent by the browser SDK, so this endpoint sends
    nothing. It still exists for two reasons: it normalizes the number the
    user typed into E.164 so the client sends Firebase exactly what we will
    later match on, and it reports `server_sent` so the storefront does not
    need to know which provider is configured. Swapping to a server-side
    gateway later changes this response, not the client's flow.
    """

    throttle_classes = [OTPTargetThrottle]

    def post(self, request):
        serializer = PhoneOTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            phone = normalize_phone(serializer.validated_data['phone'])
            provider = get_provider()
            result = provider.request_otp(phone)
        except PhoneAuthNotConfigured as exc:
            return Response({'errors': str(exc)},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except PhoneAuthError as exc:
            return Response({'errors': str(exc)},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({'phone': phone, **result}, status=status.HTTP_200_OK)


class PhoneLoginView(APIView):
    """
    Finish a phone login: verified number in, JWT out.

    First sight of a number creates the account. We deliberately do not look
    for an existing account whose free-text `contact` happens to match - see
    the note on User.phone for why that would be a takeover vector.
    """

    throttle_classes = [OTPTargetVerifyThrottle]

    def post(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            provider = get_provider()
            phone = provider.verify(data)
        except PhoneAuthNotConfigured as exc:
            return Response({'errors': str(exc)},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except PhoneAuthError as exc:
            return Response({'errors': str(exc)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user = User.objects.filter(phone=phone).first()
        is_new = False

        if user is None:
            requested_email = (data.get('email') or '').strip().lower()

            # An email supplied at first login is only usable if it is free.
            # Silently attaching a verified phone to someone else's existing
            # address would merge two people's accounts.
            if requested_email and User.objects.filter(email=requested_email).exists():
                requested_email = ''

            try:
                with transaction.atomic():
                    user = User.objects.create_phone_user(
                        phone=phone,
                        name=(data.get('name') or '').strip(),
                        email=requested_email or None,
                    )
            except IntegrityError:
                # Two tabs, same number, same instant. The unique index is the
                # arbiter; whoever lost the race just reads the winner's row.
                user = User.objects.filter(phone=phone).first()
                if user is None:
                    raise
            else:
                is_new = True

        if not user.is_active:
            return Response({'errors': 'This account has been disabled.'},
                            status=status.HTTP_403_FORBIDDEN)

        return Response(
            _auth_payload(user, is_new=is_new,
                          msg='Welcome to SpikeZone' if is_new else 'Login Success'),
            status=status.HTTP_200_OK,
        )


# --------------------------------------------------------------------------
# Email OTP (free fallback, and the path used before Firebase billing is live)
# --------------------------------------------------------------------------

class EmailOTPLoginRequestView(APIView):
    """
    Mail a login code.

    Unlike a password reset this does not need the account to exist first: an
    unknown address simply becomes a new account when the code is verified.
    That also sidesteps account enumeration - the response is identical either
    way because the behaviour genuinely is identical.
    """

    throttle_classes = [OTPTargetThrottle]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()

        # Imported from views to keep one definition of the generator.
        from SpikeZoneApiApp.views import generate_otp

        otp = generate_otp()
        EmailOTP.objects.create(
            email=email, otp=otp, purpose=EmailOTP.PURPOSE_LOGIN
        )

        try:
            send_otp_email(email, otp, purpose=EmailOTP.PURPOSE_LOGIN)
        except Exception:
            # SMTP down should not read as "code sent, go check your inbox".
            return Response(
                {'errors': 'Could not send the code right now. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'message': 'OTP sent successfully'},
                        status=status.HTTP_200_OK)


class EmailOTPLoginVerifyView(APIView):
    """Check a mailed code and hand back a JWT, creating the account if new."""

    throttle_classes = [OTPTargetVerifyThrottle]

    def post(self, request):
        serializer = EmailOTPLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        otp = serializer.validated_data['otp']

        error = _consume_email_otp(email, otp, EmailOTP.PURPOSE_LOGIN)
        if error:
            return Response({'errors': error}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        is_new = False

        if user is None:
            try:
                with transaction.atomic():
                    # password=None makes Django mark the hash unusable, so
                    # this account cannot be logged into via the password
                    # endpoint until the owner sets one.
                    user = User.objects.create_user(
                        email=email, name='', contact='', password=None
                    )
            except IntegrityError:
                user = User.objects.filter(email__iexact=email).first()
                if user is None:
                    raise
            else:
                is_new = True

        if not user.is_active:
            return Response({'errors': 'This account has been disabled.'},
                            status=status.HTTP_403_FORBIDDEN)

        return Response(
            _auth_payload(user, is_new=is_new,
                          msg='Welcome to SpikeZone' if is_new else 'Login Success'),
            status=status.HTTP_200_OK,
        )

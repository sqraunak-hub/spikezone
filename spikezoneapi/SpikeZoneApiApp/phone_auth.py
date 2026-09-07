"""
Phone-OTP verification, behind a provider interface.

Right now there is exactly one provider - Firebase Phone Auth - but the point
of the indirection is that the views never import firebase_admin. When SMS
volume makes a direct Indian gateway (MSG91 etc.) cheaper than Firebase's
$0.01/verification, a second provider drops in here and the only thing that
changes anywhere else is the OTP_PROVIDER env var.

The two providers have genuinely different shapes, which is why the interface
has a `sends_otp_server_side` flag rather than a single send() method:

  Firebase   the browser asks Firebase for the SMS and gets back an ID token.
             The server never sends anything; it only verifies that token.
  MSG91      the server would send the SMS itself and later check the code the
             user typed against what it stored.

`request_otp()` exists so the storefront can call one endpoint either way and
be told which mode it is in, instead of hardcoding the flow.
"""

import json
import os
import re

from django.conf import settings


class PhoneAuthError(Exception):
    """Raised for anything the caller should turn into a 400, not a 500."""


class PhoneAuthNotConfigured(PhoneAuthError):
    """Provider credentials are missing - a deploy problem, not a user error."""


# E.164, which is what Firebase hands back: a leading + and 8-15 digits.
_E164_RE = re.compile(r'^\+[1-9]\d{7,14}$')


def normalize_phone(raw, default_country_code='+91'):
    """
    Turn whatever the user typed into E.164, or raise.

    Accepts '9876543210', '09876543210', '+91 98765-43210', '91 9876543210'
    and normalizes all of them to '+919876543210'. Anything that does not end
    up looking like E.164 is rejected rather than guessed at - a wrong guess
    means an OTP charged to us and delivered to a stranger.
    """
    if not raw:
        raise PhoneAuthError('Phone number is required.')

    digits = re.sub(r'[^\d+]', '', str(raw))

    if digits.startswith('+'):
        candidate = digits
    elif digits.startswith('00'):
        candidate = '+' + digits[2:]
    else:
        # Bare national number. Strip a leading trunk 0 (people type
        # 09876543210), then apply the default country code. '91xxxxxxxxxx'
        # is treated as already carrying the country code.
        digits = digits.lstrip('0')
        cc = default_country_code.lstrip('+')
        if digits.startswith(cc) and len(digits) == len(cc) + 10:
            candidate = '+' + digits
        else:
            candidate = default_country_code + digits

    if not _E164_RE.match(candidate):
        raise PhoneAuthError('Enter a valid mobile number.')

    return candidate


class BasePhoneAuthProvider:
    name = 'base'

    # True  -> this provider's send and verify both happen on the server
    # False -> the client SDK sends the OTP; the server only verifies a token
    sends_otp_server_side = False

    def request_otp(self, phone):
        """
        Kick off delivery. For client-side providers this is a no-op that just
        tells the storefront which flow to run.
        """
        raise NotImplementedError

    def verify(self, payload):
        """
        Confirm the user really controls the number.

        `payload` is the raw request.data. Returns the verified E.164 number.
        Raises PhoneAuthError on any failure the user can act on.
        """
        raise NotImplementedError


class FirebasePhoneAuthProvider(BasePhoneAuthProvider):
    """
    Verifies the Firebase ID token the browser gets after a successful
    confirmationResult.confirm(code).

    Trust model: the token is signed by Google and carries the phone number as
    a claim, so a valid signature is proof the SMS was delivered and the code
    entered. We additionally require the phone_number claim to be present - a
    token minted by some other Firebase sign-in method (email, Google) would
    verify fine but must not be accepted as proof of phone ownership.
    """

    name = 'firebase'
    sends_otp_server_side = False

    _app = None

    def _get_app(self):
        # Imported lazily and cached on the class: firebase_admin is only a
        # hard dependency when this provider is actually selected, so a dev
        # box without the package (or without creds) can still run the API.
        if FirebasePhoneAuthProvider._app is not None:
            return FirebasePhoneAuthProvider._app

        try:
            import firebase_admin
            from firebase_admin import credentials
        except ImportError as exc:
            raise PhoneAuthNotConfigured(
                'firebase-admin is not installed. Run: pip install firebase-admin'
            ) from exc

        # Already initialised elsewhere in the process (runserver's autoreload
        # imports this module twice) - reuse it rather than blowing up on
        # "The default Firebase app already exists".
        if firebase_admin._apps:
            FirebasePhoneAuthProvider._app = firebase_admin.get_app()
            return FirebasePhoneAuthProvider._app

        cred = self._load_credentials(credentials)
        FirebasePhoneAuthProvider._app = firebase_admin.initialize_app(cred)
        return FirebasePhoneAuthProvider._app

    def _load_credentials(self, credentials):
        # Two ways in, because the two environments want different things: a
        # file path on the server (key lives outside the repo), or inline JSON
        # for hosts that only give you env vars.
        raw_json = os.environ.get('FIREBASE_CREDENTIALS_JSON', '').strip()
        if raw_json:
            try:
                return credentials.Certificate(json.loads(raw_json))
            except (ValueError, KeyError) as exc:
                raise PhoneAuthNotConfigured(
                    'FIREBASE_CREDENTIALS_JSON is not valid service-account JSON.'
                ) from exc

        path = os.environ.get('FIREBASE_CREDENTIALS_FILE', '').strip()
        if path:
            if not os.path.exists(path):
                raise PhoneAuthNotConfigured(
                    'FIREBASE_CREDENTIALS_FILE points at a missing file: %s' % path
                )
            return credentials.Certificate(path)

        raise PhoneAuthNotConfigured(
            'Set FIREBASE_CREDENTIALS_FILE (path to the service-account JSON) '
            'or FIREBASE_CREDENTIALS_JSON in .env.'
        )

    def request_otp(self, phone):
        # Nothing to do server-side; the browser SDK sends the SMS. Returned
        # so the storefront knows not to wait for a server-sent code.
        return {'provider': self.name, 'server_sent': False}

    def verify(self, payload):
        from firebase_admin import auth as firebase_auth

        id_token = (payload.get('id_token') or '').strip()
        if not id_token:
            raise PhoneAuthError('Missing id_token.')

        app = self._get_app()

        try:
            # clock_skew_seconds absorbs the few seconds of drift between our
            # clock and Google's; without it a correct token gets rejected as
            # "used too early" on a slightly fast machine.
            decoded = firebase_auth.verify_id_token(
                id_token, app=app, clock_skew_seconds=10
            )
        except PhoneAuthError:
            raise
        except Exception as exc:
            # firebase_admin raises a family of ExpiredIdToken / InvalidIdToken
            # / RevokedIdToken errors; none of them should leak their internals
            # to the client.
            raise PhoneAuthError('Could not verify the OTP. Please try again.') from exc

        phone = decoded.get('phone_number')
        if not phone:
            # A real Firebase token, but not from phone sign-in. Refusing it is
            # the whole point of this check.
            raise PhoneAuthError('This login token does not carry a verified phone number.')

        return normalize_phone(phone)


_PROVIDERS = {
    'firebase': FirebasePhoneAuthProvider,
}


def get_provider():
    """Return the configured provider instance."""
    key = (getattr(settings, 'OTP_PROVIDER', 'firebase') or 'firebase').lower()
    try:
        return _PROVIDERS[key]()
    except KeyError:
        raise PhoneAuthNotConfigured(
            "OTP_PROVIDER='%s' is not a known provider. Available: %s."
            % (key, ', '.join(sorted(_PROVIDERS)))
        )

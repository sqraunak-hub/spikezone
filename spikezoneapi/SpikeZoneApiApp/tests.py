"""
Tests for passwordless login.

Run with:  python manage.py test --settings=test_settings

The phone tests stub the provider rather than talking to Firebase - what is
worth testing here is our half of the contract (a verified number becomes
exactly one account, a token without a phone claim is refused), not Google's
signature checking.
"""

from unittest.mock import patch

from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from SpikeZoneApiApp.models import EmailOTP, User
from SpikeZoneApiApp.phone_auth import (
    PhoneAuthError,
    normalize_phone,
)


class FakePhoneProvider:
    """Stands in for Firebase: whatever number it is told to return, it does."""

    name = 'fake'
    sends_otp_server_side = False

    def __init__(self, phone=None, error=None):
        self.phone = phone
        self.error = error

    def request_otp(self, phone):
        return {'provider': self.name, 'server_sent': False}

    def verify(self, payload):
        if self.error:
            raise self.error
        return self.phone


class NormalizePhoneTests(TestCase):
    def test_indian_formats_all_reach_the_same_e164(self):
        for raw in ['9876543210', '09876543210', '+91 98765-43210',
                    '91 9876543210', '+919876543210', '0091 9876543210']:
            with self.subTest(raw=raw):
                self.assertEqual(normalize_phone(raw), '+919876543210')

    def test_garbage_is_rejected_not_guessed_at(self):
        for raw in ['', '123', 'abcdefghij', '+0123456789']:
            with self.subTest(raw=raw):
                with self.assertRaises(PhoneAuthError):
                    normalize_phone(raw)


class EmailOTPLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _request_code(self, email='buyer@example.com'):
        response = self.client.post(
            '/api/user/email/request-otp/', {'email': email}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        return EmailOTP.objects.filter(
            email=email, purpose=EmailOTP.PURPOSE_LOGIN
        ).latest('created_at')

    def test_first_login_creates_the_account_and_returns_a_token(self):
        record = self._request_code()
        self.assertEqual(len(mail.outbox), 1)

        response = self.client.post(
            '/api/user/email/verify-login/',
            {'email': 'buyer@example.com', 'otp': record.otp},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['is_new'])
        self.assertIn('access', response.data['token'])
        self.assertEqual(response.data['user']['email'], 'buyer@example.com')

        user = User.objects.get(email='buyer@example.com')
        # No password was ever set, so the password endpoint must not accept
        # this account with a blank one.
        self.assertFalse(user.has_usable_password())

    def test_second_login_reuses_the_same_account(self):
        first = self._request_code()
        self.client.post(
            '/api/user/email/verify-login/',
            {'email': 'buyer@example.com', 'otp': first.otp}, format='json',
        )

        second = self._request_code()
        response = self.client.post(
            '/api/user/email/verify-login/',
            {'email': 'buyer@example.com', 'otp': second.otp}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_new'])
        self.assertEqual(User.objects.filter(email='buyer@example.com').count(), 1)

    def test_a_code_cannot_be_used_twice(self):
        record = self._request_code()
        payload = {'email': 'buyer@example.com', 'otp': record.otp}

        self.assertEqual(
            self.client.post('/api/user/email/verify-login/', payload, format='json').status_code,
            200,
        )
        replay = self.client.post('/api/user/email/verify-login/', payload, format='json')
        self.assertEqual(replay.status_code, 400)
        self.assertIn('already been used', str(replay.data['errors']))

    def test_wrong_guesses_are_counted_and_run_out(self):
        record = self._request_code()
        wrong = '000000' if record.otp != '000000' else '111111'

        for _ in range(EmailOTP.MAX_ATTEMPTS):
            response = self.client.post(
                '/api/user/email/verify-login/',
                {'email': 'buyer@example.com', 'otp': wrong}, format='json',
            )
            self.assertEqual(response.status_code, 400)

        # The code is now spent, so even the correct digits are refused.
        response = self.client.post(
            '/api/user/email/verify-login/',
            {'email': 'buyer@example.com', 'otp': record.otp}, format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('Too many', str(response.data['errors']))

    def test_a_signup_verification_code_is_not_a_login_code(self):
        # The signup flow issues a PURPOSE_VERIFY code for the same address.
        self.client.post('/api/user/send-otp/', {'email': 'buyer@example.com'}, format='json')
        verify_code = EmailOTP.objects.filter(
            email='buyer@example.com', purpose=EmailOTP.PURPOSE_VERIFY
        ).latest('created_at')

        response = self.client.post(
            '/api/user/email/verify-login/',
            {'email': 'buyer@example.com', 'otp': verify_code.otp}, format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email='buyer@example.com').exists())


class PhoneLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_request_otp_normalizes_and_reports_client_side_sending(self):
        response = self.client.post(
            '/api/user/phone/request-otp/', {'phone': '098765 43210'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['phone'], '+919876543210')
        self.assertFalse(response.data['server_sent'])

    @patch('SpikeZoneApiApp.auth_views.get_provider')
    def test_first_verified_login_creates_an_account(self, get_provider):
        get_provider.return_value = FakePhoneProvider(phone='+919876543210')

        response = self.client.post(
            '/api/user/phone/verify/',
            {'id_token': 'stub', 'name': 'Ravi'}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['is_new'])
        self.assertIn('access', response.data['token'])

        user = User.objects.get(phone='+919876543210')
        self.assertEqual(user.name, 'Ravi')
        self.assertFalse(user.has_usable_password())

    @patch('SpikeZoneApiApp.auth_views.get_provider')
    def test_logging_in_again_does_not_duplicate_the_account(self, get_provider):
        get_provider.return_value = FakePhoneProvider(phone='+919876543210')

        self.client.post('/api/user/phone/verify/', {'id_token': 'stub'}, format='json')
        response = self.client.post('/api/user/phone/verify/', {'id_token': 'stub'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_new'])
        self.assertEqual(User.objects.filter(phone='+919876543210').count(), 1)

    @patch('SpikeZoneApiApp.auth_views.get_provider')
    def test_a_matching_unverified_contact_does_not_hand_over_that_account(self, get_provider):
        # Somebody registered quoting a number that is not theirs.
        victim = User.objects.create_user(
            email='victim@example.com', name='Victim',
            contact='9876543210', password='pw',
        )
        get_provider.return_value = FakePhoneProvider(phone='+919876543210')

        response = self.client.post('/api/user/phone/verify/', {'id_token': 'stub'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data['user']['id'], victim.id)
        victim.refresh_from_db()
        self.assertIsNone(victim.phone)

    @patch('SpikeZoneApiApp.auth_views.get_provider')
    def test_a_token_without_a_phone_claim_is_refused(self, get_provider):
        get_provider.return_value = FakePhoneProvider(
            error=PhoneAuthError('This login token does not carry a verified phone number.')
        )

        response = self.client.post('/api/user/phone/verify/', {'id_token': 'stub'}, format='json')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(User.objects.count(), 0)

    @patch('SpikeZoneApiApp.auth_views.get_provider')
    def test_an_email_already_in_use_is_not_attached_to_the_new_account(self, get_provider):
        existing = User.objects.create_user(
            email='taken@example.com', name='Someone',
            contact='1112223334', password='pw',
        )
        get_provider.return_value = FakePhoneProvider(phone='+919876543210')

        response = self.client.post(
            '/api/user/phone/verify/',
            {'id_token': 'stub', 'email': 'taken@example.com'}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data['user']['id'], existing.id)
        self.assertNotEqual(response.data['user']['email'], 'taken@example.com')


class ProfileWriteProtectionTests(TestCase):
    """The profile endpoint is self-editable, so it must refuse the two fields
    that would otherwise be a way to grant yourself admin or claim a number
    you never proved you own."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='buyer@example.com', name='Buyer',
            contact='9876543210', password='pw',
        )
        self.client.force_authenticate(user=self.user)

    def test_a_user_cannot_make_themselves_admin(self):
        response = self.client.patch(
            f'/api/user/profiles/update/{self.user.id}/',
            {'is_admin': True}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_admin)

    def test_a_user_cannot_claim_an_unverified_phone(self):
        response = self.client.patch(
            f'/api/user/profiles/update/{self.user.id}/',
            {'phone': '+919999999999'}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertIsNone(self.user.phone)


class PasswordLoginResponseTests(TestCase):
    def test_login_returns_the_user_the_storefront_reads(self):
        User.objects.create_user(
            email='buyer@example.com', name='Buyer',
            contact='9876543210', password='secret123',
        )

        response = APIClient().post(
            '/api/user/login/',
            {'email': 'buyer@example.com', 'password': 'secret123'}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        # LoginForm reads data.user.id straight off this response.
        self.assertEqual(response.data['user']['email'], 'buyer@example.com')
        self.assertIn('access', response.data['token'])


class AdminUserListTests(TestCase):
    """The customer directory behind the admin panel's Users screen."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@spikezone.in', name='Admin', contact='1', password='pw')
        self.admin.is_admin = True
        self.admin.save()

        User.objects.create_user(
            email='asha@example.com', name='Asha Menon',
            contact='9876543210', password='pw', phone='+919876543210')
        User.objects.create_user(
            email='vikram@example.com', name='Vikram Rao',
            contact='9812345678', password='pw')

    def test_anonymous_cannot_read_the_customer_list(self):
        response = self.client.get('/api/user/admin/users/')
        self.assertIn(response.status_code, (401, 403))

    def test_a_normal_customer_cannot_read_it_either(self):
        # The whole point: this payload is every customer's phone and address.
        self.client.force_authenticate(user=User.objects.get(email='asha@example.com'))
        response = self.client.get('/api/user/admin/users/')
        self.assertEqual(response.status_code, 403)

    def test_admin_gets_the_list_with_the_details_the_panel_shows(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/user/admin/users/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 3)

        asha = next(r for r in response.data['results'] if r['email'] == 'asha@example.com')
        self.assertEqual(asha['name'], 'Asha Menon')
        self.assertEqual(asha['phone'], '+919876543210')
        self.assertEqual(asha['contact'], '9876543210')
        self.assertEqual(asha['orders_count'], 0)
        self.assertEqual(asha['signup_method'], 'mobile-otp')

    def test_search_matches_name_email_and_phone(self):
        self.client.force_authenticate(user=self.admin)
        for term in ['Asha', 'asha@example', '9876543210', '+919876543210']:
            with self.subTest(term=term):
                response = self.client.get('/api/user/admin/users/', {'search': term})
                emails = [r['email'] for r in response.data['results']]
                self.assertIn('asha@example.com', emails)
                self.assertNotIn('vikram@example.com', emails)

    def test_an_unknown_ordering_falls_back_instead_of_erroring(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/user/admin/users/', {'ordering': 'password'})
        self.assertEqual(response.status_code, 200)

    def test_the_list_is_read_only(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            '/api/user/admin/users/', {'email': 'x@example.com'}, format='json')
        self.assertEqual(response.status_code, 405)

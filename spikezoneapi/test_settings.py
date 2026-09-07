"""
Settings for running the test suite.

Same as the real settings except for the two things that would otherwise make
tests need infrastructure: the database points at in-memory SQLite instead of
MySQL, and mail goes to a list in memory instead of the SMTP host.

    python manage.py test --settings=test_settings
"""

from SpikeZoneApi.settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Tests assert on throttling explicitly where they mean to; leaving the real
# rates on would make unrelated tests fail once they issued their sixth OTP.
REST_FRAMEWORK = dict(REST_FRAMEWORK)  # noqa: F405
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'otp_target': '1000/hour',
    'otp_target_verify': '1000/hour',
}

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# SpikeZone — Full Stack E-commerce

E-commerce platform for SpikeZone (bird spikes & bird control products) with three components:

| Folder | What it is | Stack | Dev URL |
|---|---|---|---|
| `spikezoneapi/` | REST API | Django 5.1 + DRF + MySQL + JWT + Razorpay | http://127.0.0.1:8001 |
| `spikezoneadmin/` | Admin panel | React (CRA) + Recharts + CKEditor | http://localhost:3000/admin.spikezone.in |
| `vite-test/vite-project/` | Customer storefront | React + Vite + Bootstrap + Swiper | http://localhost:5175 |

## Local setup

### 1. API (Django)

```bash
cd spikezoneapi
python -m venv venv
venv\Scripts\activate        # Windows
pip install Django==5.1.3 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.6.0 mysqlclient razorpay==1.4.2 pillow requests python-dotenv "setuptools==80.9.0"
copy .env.example .env       # then fill in DB password, secret key, etc.
# create MySQL database `spikezoneapi`
python manage.py migrate
python manage.py runserver 8001
```

> Note: `setuptools==80.9.0` is pinned because razorpay 1.4.2 needs `pkg_resources`, which newer setuptools removed.

### 2. Admin panel

```bash
cd spikezoneadmin
npm install
copy .env.example .env       # set API host + storefront URL
npm start        # port 3000
```

### 3. Storefront

```bash
cd vite-test/vite-project
npm install
copy .env.example .env       # set API host
npm run dev -- --port 5175
```

## Passwordless login (OTP)

Customers sign in with a one-time code, no password. Two paths, both ending in
the same SimpleJWT pair:

| Path | Provider | Cost | Endpoints |
|---|---|---|---|
| Mobile OTP | Firebase Phone Auth (`spikezone-re`) | ~Rs 0.85/SMS | `phone/request-otp/`, `phone/verify/` |
| Email OTP | The project's own SMTP | free | `email/request-otp/`, `email/verify-login/` |

The provider sits behind `SpikeZoneApiApp/phone_auth.py`. Moving to a direct
Indian SMS gateway later (worth it somewhere north of ~15k OTPs/month, once DLT
registration has paid for itself) means adding a provider there and changing
`OTP_PROVIDER` - no view or frontend changes.

`User.phone` only ever holds an OTP-verified number in E.164. It is distinct
from the free-text `contact` field and is never matched against it: someone who
signs up quoting a number they do not own must not be handed that account when
its real owner logs in by OTP.

### Firebase phone auth does not work on `localhost`

This costs hours if you hit it cold. `signInWithPhoneNumber` fails with
`auth/invalid-app-credential` (server side: `INVALID_APP_CREDENTIAL`) whenever
the page is served from the hostname `localhost` - on http *and* on https, and
on a brand-new Firebase project. The reCAPTCHA token is generated correctly;
Google simply rejects it for that hostname.

Verified by elimination: two separate Firebase projects, both schemes, manual
and scripted attempts, no TLS interception. The only variable that fixed it was
the hostname.

To test mobile OTP locally, serve the dev server from a real domain name.
`*.localtest.me` is a public domain that resolves to 127.0.0.1, so no hosts-file
edit and no admin rights are needed:

```bash
# one-time: generate a self-signed cert into vite-project/.certs/
#   localhost-cert.pem / localhost-key.pem, SAN = spikezone.localtest.me
# vite.config.js picks them up automatically and switches the dev server to
# https; with no cert files present it stays on plain http.

cd vite-test/vite-project
npm run dev -- --port 5175 --strictPort
# then open https://spikezone.localtest.me:5175  (accept the cert warning once)
```

`spikezone.localtest.me` must be listed under Authentication > Settings >
Authorized domains in the Firebase console. It already is.

Set `VITE_API_HOST` to that same origin - `vite.config.js` proxies `/api` and
`/media` to Django on :8001, so the https page never calls plain http and there
is no mixed-content block.

Test phone numbers (Authentication > Sign-in method > Phone) skip reCAPTCHA and
never send a real SMS, so they cost nothing - but for the same reason they will
happily "work" on localhost and tell you nothing about whether real SMS does.

## Configuration

All environment-specific values live in `.env` files (never committed — each folder has a `.env.example` template):

| File | What it configures |
|---|---|
| `spikezoneapi/.env` | `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, MySQL creds (`DB_*`), Razorpay keys, SMTP email creds |
| `spikezoneadmin/.env` | `REACT_APP_API_HOST` (Django API), `REACT_APP_SITE_URL` (storefront, for "View Website" links) |
| `vite-test/vite-project/.env` | `VITE_API_HOST` (Django API) |

Both React apps read the API host through `src/Utils/appConstant.js` — no URLs are hardcoded in components. For production, point the hosts at `https://birdspikes.in` and set `DJANGO_DEBUG=False` with proper `DJANGO_ALLOWED_HOSTS`.

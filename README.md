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

## Configuration

All environment-specific values live in `.env` files (never committed — each folder has a `.env.example` template):

| File | What it configures |
|---|---|
| `spikezoneapi/.env` | `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, MySQL creds (`DB_*`), Razorpay keys, SMTP email creds |
| `spikezoneadmin/.env` | `REACT_APP_API_HOST` (Django API), `REACT_APP_SITE_URL` (storefront, for "View Website" links) |
| `vite-test/vite-project/.env` | `VITE_API_HOST` (Django API) |

Both React apps read the API host through `src/Utils/appConstant.js` — no URLs are hardcoded in components. For production, point the hosts at `https://birdspikes.in` and set `DJANGO_DEBUG=False` with proper `DJANGO_ALLOWED_HOSTS`.

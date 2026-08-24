# O2 Smart — Repo Scaffold

This is the first working slice of the O2 Smart e-commerce platform: a Node/Express
API talking to MySQL, and a React (Vite) frontend, both wired for English/Arabic
with RTL support. It's intentionally minimal — one real end-to-end module
(**categories**) plus placeholder pages for the rest of the site map, so every
future module follows the same proven pattern instead of everyone improvising
their own.

This has been tested end-to-end in a sandbox (MySQL → Express API → Vite dev
server → React) before being handed to you — `GET /categories` returns real
rows from MySQL through the whole chain.

See `build-spec.md` (delivered separately / saved in the O2 Smart project) for
the full site map, admin module list, design tokens, and payment plan this
scaffold is following.

## Structure

```
o2smart/
  server_setup.sh     — run once on the Ubuntu server to install Node/MySQL/Nginx/PM2 + firewall
  backend/             — Express API
    src/
      config/          — env.js, db.js (MySQL pool)
      middleware/       — i18n.js (AR/EN per-request), errorHandler.js
      modules/
        categories/    — the reference module: model -> controller -> routes
        health/        — GET /health (checks DB connectivity)
      locales/         — en.json / ar.json for API-generated messages
    migrations/        — plain .sql files, run in order
  frontend/            — React (Vite) app
    src/
      i18n/            — react-i18next setup + en.json/ar.json, RTL switching
      api/client.js    — axios instance (sends X-Lang header)
      components/      — Header, Footer, Layout, LanguageSwitcher, ProductCard
      pages/           — one file per site-map page (mostly placeholders for now)
```

## 1. Provision the server

```bash
scp server_setup.sh root@72.61.180.249:/root/
ssh root@72.61.180.249
chmod +x server_setup.sh && ./server_setup.sh
```

Read `/root/o2smart_credentials.txt` afterwards for the generated MySQL
password, then delete that file.

## 2. Deploy this code

From your machine (or set up git and clone directly on the server — either
works, git is cleaner for future updates):

```bash
scp -r backend frontend deploy@72.61.180.249:/var/www/o2smart/
```

On the server:

```bash
cd /var/www/o2smart/backend
cp .env.example .env        # fill in DB_PASSWORD from o2smart_credentials.txt, JWT_SECRET, etc.
npm ci
mysql -u o2smart_app -p o2smart < migrations/001_create_categories.sql
pm2 start src/server.js --name o2smart-api
pm2 save && pm2 startup

cd /var/www/o2smart/frontend
cp .env.example .env
npm ci
npm run build   # outputs to dist/, which Nginx (configured by server_setup.sh) already serves
```

Visit `http://72.61.180.249/` — you should see the Home page, and
`http://72.61.180.249/api/health` should return `{"success":true,"data":{"status":"ok",...}}`.

## 3. Local development

```bash
# terminal 1
cd backend && cp .env.example .env && npm install && npm run dev

# terminal 2
cd frontend && cp .env.example .env && npm install && npm run dev
```

Open `http://localhost:5173`. API calls to `/api/*` are proxied to the
Express server on port 4000 (see `frontend/vite.config.js`).

## Adding the next module

Follow the `categories` module as the template:

1. `backend/src/modules/<name>/<name>.model.js` — raw `mysql2` queries
2. `backend/src/modules/<name>/<name>.controller.js` — validation + i18n messages
3. `backend/src/modules/<name>/<name>.routes.js` — Express router
4. Mount it in `backend/src/app.js`
5. Add a numbered migration in `backend/migrations/`
6. Wire the corresponding frontend page(s) in `frontend/src/pages/` to call it via `frontend/src/api/client.js`

## Known gaps (by design, for this first pass)

- No auth yet (admin routes are unprotected — do not deploy publicly as-is
  beyond this first internal pass).
- No products/brands/orders/etc. modules yet — see build order in `build-spec.md` §11.
- Sadad payment integration is stubbed in `.env.example` only — needs real
  sandbox credentials from you before it can be wired up.
- Admin panel (the modules from your sidebar screenshot) hasn't been started —
  storefront came first per the agreed build order.

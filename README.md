# O2 Smart — Repo Scaffold

The O2 Smart e-commerce platform: a Node/Express API talking to MySQL, a
React (Vite) storefront, and a React (Vite) admin panel — all wired for
English/Arabic with RTL support. Everything follows one proven pattern
(model → controller → routes on the backend; a reference CRUD module on each
frontend) so future modules are additive, not improvised.

See `build-spec.md` (saved in the O2 Smart project) for the full site map,
admin module list, design tokens, and payment plan this scaffold follows.
Figma (linked there) covers the **storefront only** — the admin panel is
built in the same visual language (design tokens) but its module list and
layout come from the client's reference "Premium Phone" admin panel
screenshot, since no Figma screens exist for admin.

## Structure

```
o2smart/
  server_setup.sh      — one-time: installs Node/MySQL/Nginx/PM2 + firewall on a fresh Ubuntu server
  setup_domains.sh      — one-time: Nginx server blocks for the 3 subdomains + Let's Encrypt SSL
  deploy.sh              — every redeploy: syncs code, installs deps, runs migrations, restarts API, rebuilds both frontends
  backend/                — Express API (back.o2smart.online)
    src/
      config/            — env.js, db.js (MySQL pool)
      middleware/        — i18n.js (AR/EN per-request), adminAuth.js (JWT guard), errorHandler.js
      modules/
        categories/      — the reference module: model -> controller -> routes
        auth/            — POST /auth/admin/login, GET /auth/admin/me
        admins/          — admin user CRUD (super_admin only)
        roles/           — role CRUD (super_admin only)
        health/          — GET /health (checks DB connectivity)
      locales/           — en.json / ar.json for API-generated messages
    migrations/          — plain .sql files, run in order (idempotent — safe to re-run)
  frontend/               — customer storefront (www.o2smart.online)
    src/
      i18n/              — react-i18next setup + en.json/ar.json, RTL switching
      api/client.js      — axios instance (sends X-Lang header)
      pages/             — one file per site-map page (mostly placeholders for now)
  admin/                  — admin panel (admin.o2smart.online)
    src/
      i18n/              — admin-specific AR/EN strings (sidebar labels, common CRUD text)
      api/client.js       — axios instance (sends X-Lang + Bearer token, clears token on 401)
      context/AuthContext.jsx — login/logout/me, token persisted in localStorage
      components/         — Sidebar (all 16 modules), Topbar, AdminLayout, ProtectedRoute
      pages/
        Login.jsx
        Dashboard.jsx     — shows real data where a module exists, "—" where it doesn't (no fake KPIs)
        categories/        — the reference admin module: full list/create/edit/delete UI
        PlaceholderModule.jsx — "coming soon" screen used by every not-yet-built module's route
```

## Live environment

- Storefront: https://www.o2smart.online/
- Admin panel: https://admin.o2smart.online/
- Backend API: https://back.o2smart.online/
- Source of truth: this GitHub repo (public). Deploy flow: edit locally →
  `git push` → on the server, `cd /root/o2smart_src && git pull && ./deploy.sh`.

`deploy.sh` is idempotent about `.env` files — it only writes them the first
time they don't exist. After that, hand-edit `.env` directly on the server
for config changes (CORS origins, secrets, etc.); redeploys will never
overwrite it.

## First-time server setup (already done on the live server — for reference / a future server)

```bash
scp server_setup.sh root@<ip>:/root/
ssh root@<ip>
chmod +x server_setup.sh && ./server_setup.sh
```

Then, once DNS for the three subdomains points at the server:

```bash
git clone <this repo> /root/o2smart_src
cd /root/o2smart_src
chmod +x setup_domains.sh deploy.sh
./setup_domains.sh   # Nginx server blocks + Let's Encrypt SSL, one-time
./deploy.sh           # code, deps, migrations, PM2, builds — every redeploy
```

## Local development

```bash
# terminal 1 — backend
cd backend && cp .env.example .env && npm install && npm run dev

# terminal 2 — storefront
cd frontend && cp .env.example .env && npm install && npm run dev
# http://localhost:5173, proxies /api to localhost:4000

# terminal 3 — admin panel
cd admin && cp .env.example .env && npm install && npm run dev -- --port 5174
# http://localhost:5174, proxies /api to localhost:4000
```

## Admin login

The first migration (`002_create_admin_auth.sql`) seeds one `super_admin`
account. Its password was generated and shared with the client directly —
it is not stored anywhere in this repo. Change it via the Admins module (or
directly in the DB) once you've logged in, since there's no "forgot
password" flow yet.

## Adding the next module

Follow `categories` as the template — on both the backend and whichever
frontend(s) need it:

1. `backend/src/modules/<name>/<name>.model.js` — raw `mysql2` queries
2. `backend/src/modules/<name>/<name>.controller.js` — validation + i18n messages
3. `backend/src/modules/<name>/<name>.routes.js` — Express router (add `requireAdminAuth` / `requireRole(...)` from `middleware/adminAuth.js` to writes, or all routes, as appropriate)
4. Mount it in `backend/src/app.js`
5. Add a numbered migration in `backend/migrations/`
6. On the admin side: replace that module's `PlaceholderModule` route in `admin/src/App.jsx` with a real `list/form` pair (copy `admin/src/pages/categories/`)
7. On the storefront side, if relevant: wire the corresponding `frontend/src/pages/` page via `frontend/src/api/client.js`

## Known gaps (by design, for this pass)

- Customer-facing auth (email + OTP, Google OAuth) isn't built yet — only
  admin auth (email + password) exists so far.
- Only `categories` has a real admin UI; the other 15 sidebar modules are
  placeholders — see the build order in `build-spec.md` §11.
- Sadad payment integration is stubbed in `.env.example` only — needs real
  sandbox credentials before it can be wired up.
- Admin roles are seeded with just `super_admin` — granular permissions
  (the `permissions` JSON column on `roles`) are reserved for later, not
  enforced yet beyond the single role check on admin/role write routes.

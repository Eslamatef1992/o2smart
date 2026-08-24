#!/usr/bin/env bash
# O2 Smart — deploy step (run as root on the VPS, after o2smart_src is up to date)
#
# Safe to re-run any time you `git pull` new code: it only WRITES .env files
# the first time (when they don't exist yet). After that, .env is yours to
# edit by hand on the server — this script will never overwrite it again.
set -euo pipefail

SRC="/root/o2smart_src"
APP_DIR="/var/www/o2smart"
CREDS="/root/o2smart_credentials.txt"

if [[ ! -d "$SRC/backend" || ! -d "$SRC/frontend" ]]; then
  echo "ERROR: $SRC/backend or $SRC/frontend not found. Did the git clone/pull finish?" >&2
  exit 1
fi

echo "==> Syncing code into $APP_DIR (preserving .env files)"
mkdir -p "$APP_DIR/backend" "$APP_DIR/frontend"
rsync -a --delete --exclude '.env' --exclude 'node_modules' --exclude 'dist' "$SRC/backend/" "$APP_DIR/backend/"
rsync -a --delete --exclude '.env' --exclude 'node_modules' --exclude 'dist' "$SRC/frontend/" "$APP_DIR/frontend/"

if [[ -d "$SRC/admin" ]]; then
  mkdir -p "$APP_DIR/admin"
  rsync -a --delete --exclude '.env' --exclude 'node_modules' --exclude 'dist' "$SRC/admin/" "$APP_DIR/admin/"
fi

if [[ ! -f "$APP_DIR/backend/.env" ]]; then
  echo "==> First run: writing backend/.env from $CREDS"
  if [[ ! -f "$CREDS" ]]; then
    echo "ERROR: $CREDS not found and no existing backend/.env to fall back on." >&2
    exit 1
  fi
  DB_PASSWORD="$(grep '^MySQL password' "$CREDS" | sed 's/.*: *//')"
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > "$APP_DIR/backend/.env" <<ENV
PORT=4000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=o2smart
DB_USER=o2smart_app
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="O2 Smart <no-reply@o2smart.online>"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SADAD_BASE_URL=
SADAD_API_KEY=
SADAD_API_SECRET=
SADAD_WEBHOOK_SECRET=
CORS_ORIGIN=https://www.o2smart.online,https://o2smart.online,https://admin.o2smart.online
ENV
else
  echo "==> backend/.env already exists — leaving it untouched"
fi

if [[ ! -f "$APP_DIR/frontend/.env" ]]; then
  echo "==> First run: writing frontend/.env"
  cat > "$APP_DIR/frontend/.env" <<ENV
VITE_API_BASE_URL=https://back.o2smart.online
ENV
else
  echo "==> frontend/.env already exists — leaving it untouched"
fi

if [[ -d "$APP_DIR/admin" && ! -f "$APP_DIR/admin/.env" ]]; then
  echo "==> First run: writing admin/.env"
  cat > "$APP_DIR/admin/.env" <<ENV
VITE_API_BASE_URL=https://back.o2smart.online
ENV
elif [[ -d "$APP_DIR/admin" ]]; then
  echo "==> admin/.env already exists — leaving it untouched"
fi

echo "==> Installing backend deps"
cd "$APP_DIR/backend"
npm ci --omit=dev

echo "==> Running DB migrations"
DB_PASSWORD_FOR_MIGRATION="$(grep '^DB_PASSWORD=' .env | cut -d= -f2-)"
for f in migrations/*.sql; do
  echo "   applying $f"
  # --default-character-set=utf8mb4 is required: without it the mysql CLI
  # assumes the input is latin1 and silently mangles every hardcoded Arabic
  # seed value (roles.name_ar, cms_pages.title_ar, settings store_name_ar,
  # etc.) into mojibake on import, even though the table itself is utf8mb4.
  mysql --default-character-set=utf8mb4 -u o2smart_app -p"${DB_PASSWORD_FOR_MIGRATION}" o2smart < "$f"
done

echo "==> Starting API with PM2"
pm2 delete o2smart-api >/dev/null 2>&1 || true
pm2 start src/server.js --name o2smart-api
pm2 save

echo "==> Building frontend"
cd "$APP_DIR/frontend"
npm ci
npm run build

if [[ -d "$APP_DIR/admin" ]]; then
  echo "==> Building admin panel"
  cd "$APP_DIR/admin"
  npm ci
  npm run build
fi

echo "==> Setting ownership"
chown -R deploy:deploy "$APP_DIR"

echo "==> Done. Testing local API:"
sleep 2
curl -s http://127.0.0.1:4000/health || echo "(local API check failed)"
echo
echo "If domains are set up (see setup_domains.sh), check:"
echo "  https://www.o2smart.online/  https://back.o2smart.online/health  https://admin.o2smart.online/"

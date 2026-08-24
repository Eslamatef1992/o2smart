#!/usr/bin/env bash
# O2 Smart — deploy step (run as root on the VPS, after o2smart_src is in place)
set -euo pipefail

SRC="/root/o2smart_src"
APP_DIR="/var/www/o2smart"
CREDS="/root/o2smart_credentials.txt"

if [[ ! -d "$SRC/backend" || ! -d "$SRC/frontend" ]]; then
  echo "ERROR: $SRC/backend or $SRC/frontend not found. Did the scp finish?" >&2
  exit 1
fi

echo "==> Copying code into $APP_DIR"
mkdir -p "$APP_DIR"
cp -r "$SRC/backend" "$APP_DIR/"
cp -r "$SRC/frontend" "$APP_DIR/"

echo "==> Reading DB credentials from $CREDS"
DB_PASSWORD="$(grep '^MySQL password' "$CREDS" | sed 's/.*: *//')"
if [[ -z "$DB_PASSWORD" ]]; then
  echo "ERROR: could not read MySQL password from $CREDS" >&2
  exit 1
fi
JWT_SECRET="$(openssl rand -hex 32)"

echo "==> Writing backend/.env"
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
SMTP_FROM="O2 Smart <no-reply@o2smart.example>"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SADAD_BASE_URL=
SADAD_API_KEY=
SADAD_API_SECRET=
SADAD_WEBHOOK_SECRET=
CORS_ORIGIN=http://72.61.180.249
ENV

echo "==> Writing frontend/.env"
cat > "$APP_DIR/frontend/.env" <<ENV
VITE_API_BASE_URL=/api
ENV

echo "==> Installing backend deps"
cd "$APP_DIR/backend"
npm ci --omit=dev

echo "==> Running DB migration"
mysql -u o2smart_app -p"${DB_PASSWORD}" o2smart < migrations/001_create_categories.sql

echo "==> Starting API with PM2"
pm2 delete o2smart-api >/dev/null 2>&1 || true
pm2 start src/server.js --name o2smart-api
pm2 save

echo "==> Building frontend"
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "==> Setting ownership"
chown -R deploy:deploy "$APP_DIR"

echo "==> Done. Testing endpoints:"
sleep 2
curl -s http://127.0.0.1:4000/health || echo "(local API check failed)"
echo
curl -s http://127.0.0.1/api/health || echo "(nginx proxy check failed)"
echo
echo "Visit http://72.61.180.249/ in your browser to see the site."

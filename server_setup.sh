#!/usr/bin/env bash
#
# O2 Smart — Ubuntu server provisioning script
#
# Run this ONCE, as root, on a fresh Ubuntu server (tested against Ubuntu 22.04/24.04):
#
#   scp server_setup.sh root@72.61.180.249:/root/
#   ssh root@72.61.180.249
#   chmod +x server_setup.sh
#   ./server_setup.sh
#
# What it does:
#   1. Updates the system, installs base tools (git, curl, ufw, build tools)
#   2. Installs Node.js LTS + PM2
#   3. Installs and secures MySQL, creates the app database + a scoped app user
#   4. Installs Nginx and drops in a reverse-proxy site config for the API + a
#      static-file config for the React build (both currently pointing at the
#      raw IP — swap in your domain once you have one, then run certbot)
#   5. Creates a non-root "deploy" user for day-to-day work (root SSH is not
#      something you want to keep using long-term)
#   6. Configures UFW to only allow SSH/HTTP/HTTPS
#
# It is idempotent-ish: safe to re-run, though MySQL user/db creation will
# skip if they already exist and the firewall/package steps just no-op.
#
# IMPORTANT: this script generates a random MySQL app-user password and
# prints it ONCE at the end into /root/o2smart_credentials.txt — move that
# file's contents into your backend's .env and then delete the file.

set -euo pipefail

APP_NAME="o2smart"
APP_DIR="/var/www/${APP_NAME}"
DB_NAME="o2smart"
DB_USER="o2smart_app"
DB_PASS="$(tr -dc 'A-Za-z0-9_@%+=' </dev/urandom | head -c 24)"
DEPLOY_USER="deploy"
NODE_MAJOR="22"   # LTS as of 2026 — bump if a newer LTS is out by the time you run this

log() { echo -e "\n\033[1;32m==> $1\033[0m"; }

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root (or with sudo)." >&2
  exit 1
fi

log "1/8  Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git ufw build-essential software-properties-common ca-certificates gnupg unzip

log "2/8  Installing Node.js ${NODE_MAJOR}.x + PM2"
if ! command -v node >/dev/null || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" != "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v
npm -v
npm install -g pm2

log "3/8  Installing MySQL server"
if ! command -v mysql >/dev/null; then
  apt-get install -y mysql-server
  systemctl enable --now mysql
fi

log "4/8  Creating database + scoped app user"
mysql --protocol=socket -uroot <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log "5/8  Installing Nginx"
apt-get install -y nginx

mkdir -p "${APP_DIR}/backend" "${APP_DIR}/frontend/dist"

cat > /etc/nginx/sites-available/${APP_NAME} <<NGINX
# O2 Smart — reverse proxy + static frontend
# Replace "server_name _;" with your real domain once you have one, then run:
#   certbot --nginx -d yourdomain.com -d www.yourdomain.com

server {
    listen 80;
    server_name _;

    # React build (frontend)
    root ${APP_DIR}/frontend/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    # Node/Express API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

log "6/8  Creating non-root deploy user"
if ! id -u "${DEPLOY_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
  usermod -aG sudo "${DEPLOY_USER}"
  mkdir -p "/home/${DEPLOY_USER}/.ssh"
  if [[ -f /root/.ssh/authorized_keys ]]; then
    cp /root/.ssh/authorized_keys "/home/${DEPLOY_USER}/.ssh/authorized_keys"
  fi
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
  chmod 700 "/home/${DEPLOY_USER}/.ssh"
  chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys" 2>/dev/null || true
fi
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

log "7/8  Configuring firewall (UFW)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

log "8/8  Writing credentials file (READ THEN DELETE THIS)"
cat > /root/o2smart_credentials.txt <<EOF
O2 Smart — generated $(date -u +"%Y-%m-%d %H:%M UTC")

MySQL database : ${DB_NAME}
MySQL user     : ${DB_USER}
MySQL password : ${DB_PASS}
MySQL host     : 127.0.0.1
MySQL port     : 3306

App directory  : ${APP_DIR}
Deploy user    : ${DEPLOY_USER} (sudo, same SSH key as root — set a password or add your own key)

Next steps:
  1. Copy the DB credentials above into backend/.env (see .env.example)
  2. Deploy the app code into ${APP_DIR}
  3. cd ${APP_DIR}/backend && npm ci && pm2 start src/server.js --name o2smart-api
  4. pm2 save && pm2 startup   (so the API survives reboots)
  5. cd ${APP_DIR}/frontend && npm ci && npm run build   (outputs to dist/, which Nginx already serves)
  6. Once you have a domain: certbot --nginx -d yourdomain.com

DELETE THIS FILE once you've copied what you need:
  rm /root/o2smart_credentials.txt
EOF

log "Done. Summary written to /root/o2smart_credentials.txt — read it, copy the values, then delete it."
echo "Node:   $(node -v)"
echo "MySQL:  $(mysql --version)"
echo "Nginx:  $(nginx -v 2>&1)"
echo "PM2:    $(pm2 -v)"

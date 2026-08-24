#!/usr/bin/env bash
# O2 Smart — one-time domain + SSL setup (run as root on the VPS)
#
# Prerequisite: DNS A records for www.o2smart.online, o2smart.online,
# back.o2smart.online and admin.o2smart.online must already point at this
# server's IP (72.61.180.249) and have had a little time to propagate.
#
# What this does:
#   1. Replaces the single IP-based Nginx site with three domain-based ones:
#        www.o2smart.online / o2smart.online  -> storefront frontend
#        back.o2smart.online                  -> Node/Express API
#        admin.o2smart.online                 -> admin panel (placeholder page
#                                                 until that app is built)
#   2. Installs certbot and issues/attaches free Let's Encrypt SSL certs for
#      all four hostnames, and sets up auto-renewal (certbot does this by
#      default via a systemd timer).
#
# Safe to re-run: certbot skips domains that already have a valid cert.

set -euo pipefail

APP_DIR="/var/www/o2smart"
CERTBOT_EMAIL="eslam@teknulugy.com"

log() { echo -e "\n\033[1;32m==> $1\033[0m"; }

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root (or with sudo)." >&2
  exit 1
fi

log "1/4  Placeholder page for admin.o2smart.online (until the admin app is built)"
mkdir -p "${APP_DIR}/admin/dist"
if [[ ! -f "${APP_DIR}/admin/dist/index.html" ]]; then
  cat > "${APP_DIR}/admin/dist/index.html" <<'HTML'
<!doctype html>
<html><head><meta charset="utf-8"><title>O2 Smart Admin</title></head>
<body style="font-family:sans-serif;text-align:center;margin-top:10%">
  <h1>O2 Smart Admin Panel</h1>
  <p>Coming soon.</p>
</body></html>
HTML
fi

log "2/4  Writing Nginx site configs"
rm -f /etc/nginx/sites-enabled/o2smart  # old single-domain config, if present

cat > /etc/nginx/sites-available/o2smart-frontend <<NGINX
server {
    listen 80;
    server_name www.o2smart.online o2smart.online;

    root ${APP_DIR}/frontend/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }
}
NGINX

cat > /etc/nginx/sites-available/o2smart-backend <<NGINX
server {
    listen 80;
    server_name back.o2smart.online;

    location / {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

cat > /etc/nginx/sites-available/o2smart-admin <<NGINX
server {
    listen 80;
    server_name admin.o2smart.online;

    root ${APP_DIR}/admin/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/o2smart-frontend /etc/nginx/sites-enabled/o2smart-frontend
ln -sf /etc/nginx/sites-available/o2smart-backend /etc/nginx/sites-enabled/o2smart-backend
ln -sf /etc/nginx/sites-available/o2smart-admin /etc/nginx/sites-enabled/o2smart-admin
nginx -t && systemctl reload nginx

log "3/4  Installing certbot"
if ! command -v certbot >/dev/null; then
  apt-get update -y
  apt-get install -y certbot python3-certbot-nginx
fi

log "4/4  Issuing SSL certificates (this edits the Nginx configs above to add HTTPS + redirect)"
certbot --nginx \
  -d www.o2smart.online -d o2smart.online \
  -d back.o2smart.online \
  -d admin.o2smart.online \
  -m "${CERTBOT_EMAIL}" --agree-tos --redirect --non-interactive

log "Done."
echo "Frontend : https://www.o2smart.online/"
echo "Backend  : https://back.o2smart.online/health"
echo "Admin    : https://admin.o2smart.online/  (placeholder until that app is built)"

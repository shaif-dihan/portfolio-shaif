# Deployment

shaif.dev is hosted on **Oracle Cloud free-tier compute** with **Cloudflare** for DNS and SSL. Output is static, so any web server (nginx, caddy, apache) can serve it.

## Architecture

```
Browser → Cloudflare (DNS, SSL, CDN) → Oracle Cloud VM → nginx → dist/
```

## One-time Oracle Cloud setup

### 1. Provision a free-tier VM

- **Always Free Eligible** instance (Ampere ARM, Ubuntu 22.04 recommended)
- Open ports **80** and **443** in the VCN security list and the OS firewall:

  ```bash
  sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save
  ```

  Also add ingress rules in the **OCI Console** → VCN → Security List for ports 80/443 from `0.0.0.0/0`.

### 2. Install nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 3. Deploy directory

Create a directory for the site files:

```bash
sudo mkdir -p /var/www/shaif.dev
sudo chown -R $USER:$USER /var/www/shaif.dev
```

### 4. SSL with Certbot

Install Certbot and obtain a Let's Encrypt certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shaif.dev -d www.shaif.dev
```

Certbot will automatically modify the nginx config to add SSL and set up HTTP→HTTPS redirects.

### 5. nginx config

After Certbot runs, `/etc/nginx/sites-available/shaif.dev` will look like this (Certbot manages the SSL/redirect blocks):

```nginx
server {
    server_name shaif.dev www.shaif.dev;

    root /var/www/shaif.dev;
    index index.html;

    location / {
        try_files $uri $uri/index.html $uri.html =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|svg|ico|webp|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/shaif.dev/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/shaif.dev/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.shaif.dev) { return 301 https://$host$request_uri; }
    if ($host = shaif.dev) { return 301 https://$host$request_uri; }

    listen 80;
    listen [::]:80;
    server_name shaif.dev www.shaif.dev;
    return 404;
}
```

> **Important:** `try_files $uri $uri/index.html $uri.html =404` is the correct order for Astro static output. Do not use `$uri/` alone or `/index.html` as a catch-all — these cause redirect loops.

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/shaif.dev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## One-time Cloudflare setup

1. Add `shaif.dev` to your Cloudflare account (free plan is fine).
2. Update nameservers at your domain registrar to Cloudflare's.
3. In **Cloudflare DNS**, add an `A` record:
   - **Name:** `@`
   - **IPv4:** Oracle VM public IP
   - **Proxy status:** Proxied (orange cloud)
4. In **SSL/TLS**, set encryption mode to **Full (strict)**.
5. In **SSL/TLS → Edge Certificates**, enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

The origin VM uses a **Let's Encrypt certificate** (managed by Certbot), so Cloudflare SSL/TLS mode should be set to **Full (strict)** — this encrypts both the browser→Cloudflare and Cloudflare→origin legs.

## Build & deploy workflow

### Option A: Build locally, rsync to server

```bash
npm run build
rsync -avz --delete -e "ssh -i ~/Downloads/Oracle/ssh-key-2026-03-30.key" dist/ ubuntu@140.245.35.140:/var/www/shaif.dev/
```

This is already wired up in `package.json`:

```json
"deploy": "npm run build && rsync -avz --delete -e 'ssh -i /Users/user/Downloads/Oracle/ssh-key-2026-03-30.key' dist/ ubuntu@140.245.35.140:/var/www/shaif.dev/"
```

Then just `npm run deploy`.

### Option B: Build on the server (git-based)

Set up a deploy key on GitHub, then on the server:

```bash
cd ~
git clone git@github.com:shaif-dihan/portfolio-shaif.git
cd portfolio-shaif
npm install
npm run build
sudo rsync -av --delete dist/ /var/www/shaif.dev/
```

For updates:

```bash
cd ~/portfolio-shaif
git pull
npm install
npm run build
sudo rsync -av --delete dist/ /var/www/shaif.dev/
```

## Verifying deployment

```bash
curl -I https://shaif.dev
# expect: HTTP/2 200, server: cloudflare
```

In a browser:

- Hard refresh (Cmd+Shift+R) to bypass cache
- Check both light and dark mode (system theme + manual toggle)
- Verify mobile menu works at <640px viewport
- Check Network tab — assets should be served with long cache headers

## Cache busting

Astro fingerprints CSS/JS in `_astro/`, so `Cache-Control: immutable` is safe there. HTML uses `max-age=300` (5min) so content updates appear quickly. To force-flush Cloudflare's CDN cache after a content update, use Cloudflare dashboard → **Caching → Purge Everything**, or purge by URL.

## Rollback

`rsync` overwrites in place. To roll back, keep the previous `dist/` snapshot before deploying:

```bash
ssh -i ~/Downloads/Oracle/ssh-key-2026-03-30.key ubuntu@140.245.35.140 'cp -r /var/www/shaif.dev /var/www/shaif.dev.bak'
```

If a deploy breaks the site, swap the directories.

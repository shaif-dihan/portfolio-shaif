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

### 4. nginx config

Create `/etc/nginx/sites-available/shaif.dev`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name shaif.dev www.shaif.dev;

    root /var/www/shaif.dev;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    # Long cache for fingerprinted assets
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Short cache for HTML
    location / {
        try_files $uri $uri/ $uri.html =404;
        add_header Cache-Control "public, max-age=300";
    }

    # Favicon
    location = /favicon.svg {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

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

Cloudflare handles the public-facing TLS cert. The origin (Oracle VM) only needs HTTP unless you also want origin-to-Cloudflare encryption (recommended for "Full strict" mode — generate an Origin Certificate in Cloudflare, install on the VM, and listen on 443).

## Build & deploy workflow

### Option A: Build locally, rsync to server

```bash
npm run build
rsync -avz --delete dist/ user@<oracle-ip>:/var/www/shaif.dev/
```

Add to `package.json` scripts for convenience:

```json
"deploy": "npm run build && rsync -avz --delete dist/ user@<oracle-ip>:/var/www/shaif.dev/"
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
ssh user@<oracle-ip> 'cp -r /var/www/shaif.dev /var/www/shaif.dev.bak'
```

If a deploy breaks the site, swap the directories.

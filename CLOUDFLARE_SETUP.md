# Setting Up Form Collector with Cloudflare

This guide will walk you through deploying your form collector and connecting it to a custom domain using Cloudflare.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deploy Your Form Collector](#deploy-your-form-collector)
3. [Configure Cloudflare DNS](#configure-cloudflare-dns)
4. [Setup SSL/TLS](#setup-ssltls)
5. [Configure Nginx (if using VPS)](#configure-nginx-if-using-vps)
6. [Update Your Application](#update-your-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Form collector deployed and running
- ✅ Domain name (e.g., yourdomain.com)
- ✅ Cloudflare account (free tier works)
- ✅ Domain added to Cloudflare

---

## Step 1: Deploy Your Form Collector

First, deploy your form collector to a server. Choose one option:

### Option A: VPS (DigitalOcean, Linode, AWS, etc.)

```bash
# SSH into your server
ssh root@your-server-ip

# Clone and setup
git clone https://github.com/HLPFLCG/form-collector.git
cd form-collector
npm install
cp .env.example .env
nano .env  # Configure your settings
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/server.js --name form-collector
pm2 save
pm2 startup
```

### Option B: Heroku

```bash
heroku create your-app-name
git push heroku main
# Your app will be at: your-app-name.herokuapp.com
```

### Option C: Railway

1. Connect your GitHub repository
2. Deploy automatically
3. Note your Railway URL

---

## Step 2: Add Domain to Cloudflare

If you haven't already:

1. **Login to Cloudflare**: https://dash.cloudflare.com/
2. **Add Site**: Click "Add a Site"
3. **Enter Domain**: Enter your domain (e.g., yourdomain.com)
4. **Select Plan**: Free plan is sufficient
5. **Update Nameservers**: 
   - Cloudflare will provide nameservers (e.g., `ns1.cloudflare.com`)
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update nameservers to Cloudflare's nameservers
   - Wait for DNS propagation (can take up to 24 hours)

---

## Step 3: Configure Cloudflare DNS

### Option 1: Using a Subdomain (Recommended)

**Example**: `forms.yourdomain.com`

1. **Go to DNS Settings**:
   - Login to Cloudflare
   - Select your domain
   - Click "DNS" in the left sidebar

2. **Add A Record** (for VPS):
   ```
   Type: A
   Name: forms
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

3. **Or Add CNAME Record** (for Heroku/Railway):
   ```
   Type: CNAME
   Name: forms
   Target: your-app-name.herokuapp.com (or Railway URL)
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

### Option 2: Using Root Domain

**Example**: `yourdomain.com`

1. **Add A Record** (for VPS):
   ```
   Type: A
   Name: @
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

2. **Or Add CNAME Record** (for Heroku/Railway):
   ```
   Type: CNAME
   Name: @
   Target: your-app-name.herokuapp.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

**Important**: Click the orange cloud to enable Cloudflare proxy (provides SSL, DDoS protection, caching)

---

## Step 4: Setup SSL/TLS in Cloudflare

### Configure SSL/TLS Settings

1. **Go to SSL/TLS Settings**:
   - In Cloudflare dashboard
   - Click "SSL/TLS" in left sidebar

2. **Choose SSL/TLS Encryption Mode**:

   **For VPS with Nginx**:
   - Select: **Full (strict)** or **Full**
   - This encrypts traffic between Cloudflare and your server

   **For Heroku/Railway**:
   - Select: **Full**
   - These platforms provide SSL automatically

3. **Enable Always Use HTTPS**:
   - Go to "SSL/TLS" → "Edge Certificates"
   - Turn ON "Always Use HTTPS"
   - This redirects all HTTP to HTTPS

4. **Enable Automatic HTTPS Rewrites**:
   - Turn ON "Automatic HTTPS Rewrites"

5. **Enable Minimum TLS Version**:
   - Set to "TLS 1.2" or higher

---

## Step 5: Configure Nginx (VPS Only)

If you're using a VPS, configure Nginx as a reverse proxy:

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/form-collector
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name forms.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/form-collector-access.log;
    error_log /var/log/nginx/form-collector-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Max body size for form submissions
    client_max_body_size 10M;
}
```

### Enable Site and Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/form-collector /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Install SSL Certificate (Optional - Cloudflare provides SSL)

If you want end-to-end encryption:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d forms.yourdomain.com

# Auto-renewal is setup automatically
```

---

## Step 6: Update Your Application

### Update Environment Variables

Edit your `.env` file:

```env
# Update ALLOWED_ORIGINS with your domain
ALLOWED_ORIGINS=https://forms.yourdomain.com,https://zaitsev.co,https://hlpfl.org

# Update EMAIL_FROM if needed
EMAIL_FROM=noreply@yourdomain.com
```

### Restart Application

**VPS**:
```bash
pm2 restart form-collector
```

**Heroku**:
```bash
heroku config:set ALLOWED_ORIGINS=https://forms.yourdomain.com,https://zaitsev.co,https://hlpfl.org
```

**Railway**:
- Update environment variables in Railway dashboard
- Application will auto-restart

---

## Step 7: Configure Cloudflare Page Rules (Optional)

Optimize performance with Page Rules:

1. **Go to Page Rules**:
   - In Cloudflare dashboard
   - Click "Rules" → "Page Rules"

2. **Add Rule for Admin Dashboard**:
   ```
   URL: forms.yourdomain.com/admin*
   Settings:
   - Cache Level: Bypass
   - Security Level: High
   ```

3. **Add Rule for API**:
   ```
   URL: forms.yourdomain.com/api/*
   Settings:
   - Cache Level: Bypass
   ```

4. **Add Rule for Static Assets**:
   ```
   URL: forms.yourdomain.com/css/*
   Settings:
   - Cache Level: Standard
   - Browser Cache TTL: 1 month
   ```

---

## Step 8: Update Your Website Forms

Update your forms on zaitsev.co and hlpfl.org:

### Before:
```html
<form action="http://localhost:3000/api/submit/YOUR_API_KEY" method="POST">
```

### After:
```html
<form action="https://forms.yourdomain.com/api/submit/YOUR_API_KEY" method="POST">
```

### AJAX Example:
```javascript
fetch('https://forms.yourdomain.com/api/submit/YOUR_API_KEY', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(formData)
})
```

---

## Step 9: Testing

### Test DNS Resolution

```bash
# Check if DNS is resolving
nslookup forms.yourdomain.com

# Or use dig
dig forms.yourdomain.com
```

### Test SSL Certificate

```bash
# Check SSL certificate
curl -I https://forms.yourdomain.com

# Or visit in browser
https://forms.yourdomain.com
```

### Test Form Submission

1. **Access Admin Dashboard**:
   - Go to: https://forms.yourdomain.com/admin
   - Login with your credentials
   - Create a test form

2. **Test Submission**:
   ```bash
   curl -X POST https://forms.yourdomain.com/api/submit/YOUR_API_KEY \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
   ```

3. **Check Email**:
   - Verify you received the notification email

4. **Check Dashboard**:
   - Verify submission appears in admin dashboard

---

## Cloudflare Features to Enable

### 1. Security Features

**Go to Security → Settings**:
- ✅ Enable "Security Level: Medium"
- ✅ Enable "Challenge Passage: 30 minutes"
- ✅ Enable "Browser Integrity Check"

**Go to Security → Bots**:
- ✅ Enable "Bot Fight Mode" (free plan)

### 2. Speed Features

**Go to Speed → Optimization**:
- ✅ Enable "Auto Minify" (HTML, CSS, JS)
- ✅ Enable "Brotli"
- ✅ Enable "Rocket Loader" (optional)

**Go to Caching → Configuration**:
- ✅ Set "Browser Cache TTL: Respect Existing Headers"

### 3. Network Features

**Go to Network**:
- ✅ Enable "HTTP/2"
- ✅ Enable "HTTP/3 (with QUIC)"
- ✅ Enable "0-RTT Connection Resumption"
- ✅ Enable "WebSockets"

---

## Troubleshooting

### Issue: DNS Not Resolving

**Solution**:
1. Wait for DNS propagation (up to 24 hours)
2. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
3. Check nameservers are updated at your registrar
4. Verify DNS records in Cloudflare dashboard

### Issue: SSL Certificate Error

**Solution**:
1. Check SSL/TLS mode in Cloudflare (should be "Full" or "Full (strict)")
2. Ensure Nginx has SSL certificate (if using VPS)
3. Wait a few minutes for SSL to provision
4. Clear browser cache

### Issue: 502 Bad Gateway

**Solution**:
1. Check if application is running: `pm2 status`
2. Check Nginx configuration: `sudo nginx -t`
3. Check application logs: `pm2 logs form-collector`
4. Verify port 3000 is accessible: `curl http://localhost:3000`

### Issue: CORS Errors

**Solution**:
1. Update `ALLOWED_ORIGINS` in `.env` with your domain
2. Restart application
3. Clear browser cache
4. Check Cloudflare isn't blocking requests

### Issue: Forms Not Submitting

**Solution**:
1. Check API key is correct
2. Verify form is active in dashboard
3. Check browser console for errors
4. Test with curl to isolate issue
5. Check Cloudflare firewall rules

---

## Security Best Practices

### 1. Cloudflare Firewall Rules

Create firewall rules to protect your form collector:

**Go to Security → WAF**:

1. **Block Bad Bots**:
   ```
   (cf.bot_management.score lt 30)
   Action: Block
   ```

2. **Rate Limit Submissions**:
   ```
   (http.request.uri.path contains "/api/submit")
   Action: Rate Limit (10 requests per minute)
   ```

3. **Geo-blocking** (optional):
   ```
   (ip.geoip.country ne "US" and ip.geoip.country ne "CA")
   Action: Challenge
   ```

### 2. Enable DDoS Protection

**Go to Security → DDoS**:
- ✅ DDoS protection is automatic on Cloudflare

### 3. Enable Rate Limiting

**Go to Security → Rate Limiting Rules**:
- Create rules to limit API requests
- Protect against brute force attacks

---

## Monitoring

### Cloudflare Analytics

**Go to Analytics & Logs**:
- Monitor traffic
- Check security events
- View performance metrics

### Application Monitoring

**VPS**:
```bash
# Check application status
pm2 status

# View logs
pm2 logs form-collector

# Monitor resources
pm2 monit
```

---

## Cost Breakdown

### Cloudflare
- **Free Plan**: $0/month
  - Unlimited DDoS protection
  - Free SSL certificate
  - Basic analytics
  - Page rules (3 rules)

### VPS (Example: DigitalOcean)
- **Basic Droplet**: $6/month
  - 1 GB RAM
  - 1 vCPU
  - 25 GB SSD
  - 1 TB transfer

### Heroku
- **Free Tier**: $0/month (limited hours)
- **Hobby**: $7/month (always on)

### Railway
- **Free Tier**: $5 credit/month
- **Pro**: $20/month

---

## Complete Setup Checklist

- [ ] Form collector deployed and running
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS records configured (A or CNAME)
- [ ] SSL/TLS mode set to "Full"
- [ ] "Always Use HTTPS" enabled
- [ ] Nginx configured (if VPS)
- [ ] Environment variables updated
- [ ] Application restarted
- [ ] DNS resolution tested
- [ ] SSL certificate verified
- [ ] Form submission tested
- [ ] Email notification received
- [ ] Admin dashboard accessible
- [ ] Website forms updated
- [ ] Cloudflare security features enabled
- [ ] Page rules configured (optional)
- [ ] Monitoring setup

---

## Quick Reference

### Your URLs
- **Admin Dashboard**: https://forms.yourdomain.com/admin
- **API Endpoint**: https://forms.yourdomain.com/api/submit/YOUR_API_KEY
- **Health Check**: https://forms.yourdomain.com/health

### Important Commands

**Check DNS**:
```bash
nslookup forms.yourdomain.com
```

**Test SSL**:
```bash
curl -I https://forms.yourdomain.com
```

**Test Form**:
```bash
curl -X POST https://forms.yourdomain.com/api/submit/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Restart App (VPS)**:
```bash
pm2 restart form-collector
```

---

## Support

If you encounter issues:
1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. Review Cloudflare documentation: https://developers.cloudflare.com/
3. Check application logs
4. Verify DNS settings
5. Test without Cloudflare proxy (gray cloud) to isolate issues

---

**Your form collector is now live with Cloudflare!** 🎉

**Admin Dashboard**: https://forms.yourdomain.com/admin

**Ready to collect submissions from zaitsev.co and hlpfl.org!**
# Quick Cloudflare Setup Guide

A simplified guide to get your form collector live with Cloudflare in 30 minutes.

## 🚀 Quick Overview

```
Your Server/Heroku/Railway → Cloudflare → Your Domain → Users
```

Cloudflare sits between your server and users, providing:
- ✅ Free SSL certificate
- ✅ DDoS protection
- ✅ CDN/Caching
- ✅ Security features

---

## 📋 Prerequisites (5 minutes)

- [ ] Form collector deployed and running
- [ ] Domain name (e.g., yourdomain.com)
- [ ] Cloudflare account (sign up at cloudflare.com)

---

## 🎯 Step-by-Step Setup

### Step 1: Deploy Your Form Collector (10 minutes)

**Choose one option:**

#### Option A: VPS (DigitalOcean, Linode, etc.)
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Clone and setup
git clone https://github.com/HLPFLCG/form-collector.git
cd form-collector
npm install
cp .env.example .env
nano .env  # Edit settings
npm run build
npm install -g pm2
pm2 start dist/server.js --name form-collector
pm2 save
```

**Note your server IP**: `YOUR_SERVER_IP`

#### Option B: Heroku
```bash
heroku create your-app-name
git push heroku main
```

**Note your URL**: `your-app-name.herokuapp.com`

---

### Step 2: Add Domain to Cloudflare (5 minutes)

1. **Login**: Go to https://dash.cloudflare.com/
2. **Add Site**: Click "Add a Site"
3. **Enter Domain**: Type your domain (e.g., `yourdomain.com`)
4. **Select Free Plan**: Click "Continue"
5. **Update Nameservers**:
   - Cloudflare shows nameservers (e.g., `ns1.cloudflare.com`)
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Replace nameservers with Cloudflare's
   - Wait 5-30 minutes for activation

---

### Step 3: Configure DNS (2 minutes)

1. **Go to DNS Tab** in Cloudflare dashboard
2. **Add Record**:

**For VPS:**
```
Type: A
Name: forms (or @ for root domain)
IPv4 address: YOUR_SERVER_IP
Proxy status: ✅ Proxied (orange cloud)
```

**For Heroku/Railway:**
```
Type: CNAME
Name: forms (or @ for root domain)
Target: your-app-name.herokuapp.com
Proxy status: ✅ Proxied (orange cloud)
```

3. **Click Save**

**Your domain**: `forms.yourdomain.com` (or `yourdomain.com`)

---

### Step 4: Configure SSL (2 minutes)

1. **Go to SSL/TLS Tab**
2. **Select Encryption Mode**:
   - For VPS: Choose **"Full"**
   - For Heroku/Railway: Choose **"Full"**
3. **Go to Edge Certificates**
4. **Enable**:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites

---

### Step 5: Update Your App (3 minutes)

Edit `.env` file:

```env
ALLOWED_ORIGINS=https://forms.yourdomain.com,https://zaitsev.co,https://hlpfl.org
```

**Restart app:**
```bash
# VPS
pm2 restart form-collector

# Heroku
heroku config:set ALLOWED_ORIGINS=https://forms.yourdomain.com,https://zaitsev.co,https://hlpfl.org
```

---

### Step 6: Test Everything (3 minutes)

1. **Test DNS**:
   ```bash
   nslookup forms.yourdomain.com
   ```

2. **Test Admin Dashboard**:
   - Visit: `https://forms.yourdomain.com/admin`
   - Login with your credentials

3. **Test Form Submission**:
   ```bash
   curl -X POST https://forms.yourdomain.com/api/submit/YOUR_API_KEY \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
   ```

4. **Check Email**: Verify notification received

---

## 🌐 Update Your Website Forms

### On zaitsev.co and hlpfl.org:

**Change from:**
```html
<form action="http://localhost:3000/api/submit/YOUR_API_KEY" method="POST">
```

**To:**
```html
<form action="https://forms.yourdomain.com/api/submit/YOUR_API_KEY" method="POST">
```

---

## 🔒 Quick Security Setup (Optional - 5 minutes)

### Enable Security Features:

1. **Go to Security → Settings**
2. **Enable**:
   - ✅ Security Level: Medium
   - ✅ Bot Fight Mode

3. **Go to Speed → Optimization**
4. **Enable**:
   - ✅ Auto Minify (HTML, CSS, JS)
   - ✅ Brotli

---

## 🎉 You're Done!

Your form collector is now live at:
- **Admin**: `https://forms.yourdomain.com/admin`
- **API**: `https://forms.yourdomain.com/api/submit/YOUR_API_KEY`

### What You Get:
- ✅ Free SSL certificate (HTTPS)
- ✅ DDoS protection
- ✅ Global CDN
- ✅ Security features
- ✅ Analytics

---

## 🐛 Quick Troubleshooting

### DNS Not Working?
- Wait 5-30 minutes for propagation
- Check nameservers at your registrar
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### SSL Error?
- Wait 5 minutes for SSL to provision
- Check SSL mode is "Full" in Cloudflare
- Clear browser cache

### 502 Error?
- Check app is running: `pm2 status`
- Check logs: `pm2 logs form-collector`
- Verify port 3000 is accessible

### CORS Error?
- Update `ALLOWED_ORIGINS` in `.env`
- Restart application
- Clear browser cache

---

## 📚 Need More Details?

See the complete guide: [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)

---

## ✅ Setup Checklist

- [ ] Form collector deployed
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS record added (A or CNAME)
- [ ] SSL configured (Full mode)
- [ ] Always Use HTTPS enabled
- [ ] Environment variables updated
- [ ] Application restarted
- [ ] Admin dashboard accessible
- [ ] Form submission tested
- [ ] Email notification received
- [ ] Website forms updated

---

## 🎯 Your URLs

Replace `yourdomain.com` with your actual domain:

- **Admin Dashboard**: https://forms.yourdomain.com/admin
- **API Endpoint**: https://forms.yourdomain.com/api/submit/YOUR_API_KEY
- **Health Check**: https://forms.yourdomain.com/health

---

**Total Time**: ~30 minutes

**Cost**: $0 (Cloudflare Free Plan) + Server costs

**Result**: Production-ready form collector with SSL and security! 🚀
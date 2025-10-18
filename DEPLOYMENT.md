# Production Deployment Guide

This guide covers various deployment options for your Form Collector.

## Table of Contents
1. [VPS Deployment (DigitalOcean, Linode, AWS EC2)](#vps-deployment)
2. [Docker Deployment](#docker-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL Setup](#ssl-setup)
7. [Monitoring & Maintenance](#monitoring)

---

## VPS Deployment

### Prerequisites
- Ubuntu 20.04+ or Debian 11+ server
- Root or sudo access
- Domain name pointed to your server

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
sudo mkdir -p /var/www/form-collector
sudo chown -R $USER:$USER /var/www/form-collector
```

### Step 2: Deploy Application

```bash
# On your local machine, build the application
cd form-collector
npm run build

# Create deployment package
tar -czf form-collector.tar.gz \
  dist/ \
  node_modules/ \
  package.json \
  package-lock.json \
  .env.example \
  public/

# Upload to server
scp form-collector.tar.gz user@your-server-ip:/var/www/form-collector/

# On server, extract
cd /var/www/form-collector
tar -xzf form-collector.tar.gz
rm form-collector.tar.gz

# Create database directory
mkdir -p database

# Setup environment
cp .env.example .env
nano .env  # Edit with your production settings
```

### Step 3: Configure Environment

Edit `/var/www/form-collector/.env`:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_PATH=./database/forms.db

# Security - CHANGE THESE!
JWT_SECRET=generate-a-long-random-string-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# CORS - Your website domains
ALLOWED_ORIGINS=https://zaitsev.co,https://hlpfl.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_SUBMISSION_SIZE=10mb
MAX_FIELDS_PER_FORM=50
```

### Step 4: Start with PM2

```bash
cd /var/www/form-collector

# Start application
pm2 start dist/server.js --name form-collector

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs form-collector
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/form-collector`:

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

    # Increase max body size for form submissions
    client_max_body_size 10M;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/form-collector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL

```bash
# Get SSL certificate
sudo certbot --nginx -d forms.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Docker Deployment

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### Step 2: Deploy with Docker Compose

```bash
cd form-collector

# Create .env file
cp .env.example .env
nano .env  # Edit with your settings

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Step 3: Nginx Reverse Proxy (Optional)

If using Docker, you can still use Nginx on the host:

```nginx
server {
    listen 80;
    server_name forms.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        # ... same proxy settings as above
    }
}
```

---

## Heroku Deployment

### Step 1: Prepare Application

Create `Procfile`:

```
web: npm start
```

Create `heroku.yml` (optional, for container deployment):

```yaml
build:
  docker:
    web: Dockerfile
```

### Step 2: Deploy

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-form-collector

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set ADMIN_EMAIL=admin@example.com
heroku config:set ADMIN_PASSWORD=secure-password
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set EMAIL_FROM=noreply@yourdomain.com
heroku config:set ALLOWED_ORIGINS=https://zaitsev.co,https://hlpfl.org

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

### Step 3: Custom Domain

```bash
# Add domain
heroku domains:add forms.yourdomain.com

# Get DNS target
heroku domains

# Add CNAME record in your DNS:
# forms.yourdomain.com -> your-app.herokuapp.com

# Enable SSL (automatic with Heroku)
heroku certs:auto:enable
```

---

## Railway Deployment

### Step 1: Deploy

1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your form-collector repository
6. Railway will auto-detect and deploy

### Step 2: Configure Environment

1. Click on your project
2. Go to "Variables" tab
3. Add all environment variables from `.env`

### Step 3: Custom Domain

1. Go to "Settings" tab
2. Click "Generate Domain" for a free railway.app domain
3. Or add custom domain:
   - Click "Add Custom Domain"
   - Enter your domain
   - Add CNAME record in your DNS

---

## Nginx Configuration

### Complete Production Nginx Config

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=form_limit:10m rate=10r/s;

server {
    listen 80;
    server_name forms.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name forms.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/forms.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/forms.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/form-collector-access.log;
    error_log /var/log/nginx/form-collector-error.log;

    # Max body size
    client_max_body_size 10M;

    location / {
        # Rate limiting
        limit_req zone=form_limit burst=20 nodelay;

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

    # Cache static files
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## SSL Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d forms.yourdomain.com

# Auto-renewal is setup automatically
# Test renewal
sudo certbot renew --dry-run

# Renewal cron job (already setup by certbot)
# Check with: sudo systemctl status certbot.timer
```

### Manual SSL Certificate

If you have your own SSL certificate:

```nginx
server {
    listen 443 ssl http2;
    server_name forms.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # ... rest of config
}
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs form-collector

# View detailed info
pm2 info form-collector

# Monitor resources
pm2 monit

# Restart
pm2 restart form-collector

# Stop
pm2 stop form-collector

# Delete
pm2 delete form-collector
```

### Database Backup

Create backup script `/var/www/form-collector/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/form-collector"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/form-collector/database/forms.db \
   $BACKUP_DIR/forms_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "forms_*.db" -mtime +30 -delete

echo "Backup completed: forms_$DATE.db"
```

Make executable and add to crontab:

```bash
chmod +x /var/www/form-collector/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /var/www/form-collector/backup.sh >> /var/log/form-collector-backup.log 2>&1
```

### Log Rotation

Create `/etc/logrotate.d/form-collector`:

```
/var/log/nginx/form-collector-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### Health Monitoring

Create monitoring script `/var/www/form-collector/monitor.sh`:

```bash
#!/bin/bash

# Check if service is running
if ! pm2 list | grep -q "form-collector.*online"; then
    echo "Form Collector is down! Restarting..."
    pm2 restart form-collector
    # Send alert email
    echo "Form Collector was down and has been restarted" | \
        mail -s "Form Collector Alert" admin@yourdomain.com
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is above 80%: ${DISK_USAGE}%" | \
        mail -s "Disk Space Alert" admin@yourdomain.com
fi
```

Add to crontab (every 5 minutes):

```bash
*/5 * * * * /var/www/form-collector/monitor.sh
```

### Update Application

```bash
# Pull latest changes
cd /var/www/form-collector
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart form-collector

# Check logs
pm2 logs form-collector
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs form-collector

# Check environment
cat .env

# Test manually
cd /var/www/form-collector
node dist/server.js
```

### Database Issues

```bash
# Check permissions
ls -la database/

# Fix permissions
chmod 644 database/forms.db
chown $USER:$USER database/forms.db
```

### Email Not Sending

```bash
# Test SMTP connection
npm install -g smtp-test
smtp-test --host smtp.gmail.com --port 587 --user your-email@gmail.com --pass your-app-password
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Restart if needed
pm2 restart form-collector

# Set memory limit
pm2 start dist/server.js --name form-collector --max-memory-restart 500M
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Generated strong JWT secret
- [ ] Configured CORS with specific domains
- [ ] Enabled SSL/HTTPS
- [ ] Setup firewall (UFW)
- [ ] Configured rate limiting
- [ ] Setup automated backups
- [ ] Enabled log rotation
- [ ] Setup monitoring
- [ ] Kept dependencies updated
- [ ] Restricted database file permissions
- [ ] Used environment variables for secrets

---

## Performance Optimization

### Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Database Optimization

For high traffic, consider migrating to PostgreSQL:

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb formcollector
sudo -u postgres createuser formcollector_user

# Update connection in code
```

---

## Support

For deployment issues:
1. Check application logs: `pm2 logs form-collector`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables
4. Test email configuration
5. Check firewall rules

Your form collector is now production-ready! 🚀
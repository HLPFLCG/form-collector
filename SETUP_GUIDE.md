# Step-by-Step Setup Guide

This guide will walk you through setting up your Form Collector from scratch.

## Part 1: Local Development Setup (15 minutes)

### Step 1: Install Node.js

**Windows:**
1. Download from https://nodejs.org/ (LTS version)
2. Run installer
3. Verify: Open Command Prompt and run `node --version`

**Mac:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

### Step 2: Setup Email Provider

#### Option A: Gmail (Easiest for Testing)

1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. Go to "App passwords": https://myaccount.google.com/apppasswords
5. Select "Mail" and "Other (Custom name)"
6. Name it "Form Collector"
7. Click "Generate"
8. **Copy the 16-character password** (you'll need this for .env)

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com/ (free tier: 100 emails/day)
2. Verify your email
3. Go to Settings > API Keys
4. Create API Key with "Mail Send" permissions
5. **Copy the API key** (you'll need this for .env)

### Step 3: Install Form Collector

```bash
# Navigate to the form-collector directory
cd form-collector

# Install dependencies
npm install
```

### Step 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your favorite editor
nano .env
# or
code .env
# or
notepad .env
```

**Minimum Required Configuration:**

```env
# Server
PORT=3000
NODE_ENV=development

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123!

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-here-make-it-long-and-random

# Email - Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Email - SendGrid Example (alternative)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key

# From Address
EMAIL_FROM=noreply@yourdomain.com

# CORS (your website domains)
ALLOWED_ORIGINS=http://localhost:3000,https://zaitsev.co,https://hlpfl.org
```

### Step 5: Build and Start

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

You should see:
```
✅ Database initialized successfully
✅ Default admin user created: your-email@example.com
✅ Email service is ready
🚀 Form Collector Server Running
```

### Step 6: Access Admin Dashboard

1. Open browser: http://localhost:3000/admin
2. Login with your ADMIN_EMAIL and ADMIN_PASSWORD
3. You're in! 🎉

## Part 2: Creating Your First Form (5 minutes)

### Step 1: Create Form in Dashboard

1. Click "Forms" in sidebar
2. Click "Create New Form"
3. Fill in:
   - **Name**: "Contact Form" (or any name)
   - **Email**: your-email@example.com (where submissions go)
   - **Redirect URL**: (leave empty for now)
   - **Success Message**: "Thank you for contacting us!"
4. Click "Save Form"

### Step 2: Get Integration Code

1. Click "Details" button on your form
2. Copy the "Submission URL" - it looks like:
   ```
   http://localhost:3000/api/submit/abc123...
   ```
3. Copy the HTML integration example

### Step 3: Test with HTML File

Create a test file `test-form.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Contact Form</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    button {
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <h1>Contact Us</h1>
  
  <!-- Replace YOUR_API_KEY with your actual API key -->
  <form action="http://localhost:3000/api/submit/YOUR_API_KEY" method="POST">
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    
    <button type="submit">Send Message</button>
  </form>
</body>
</html>
```

### Step 4: Test Submission

1. Open `test-form.html` in your browser
2. Fill out the form
3. Click "Send Message"
4. You should see a success page
5. Check your email - you should receive a notification!
6. Check admin dashboard - submission should appear

## Part 3: Integrating with Your Websites

### For zaitsev.co

1. Open your contact form HTML file
2. Update the form action:
   ```html
   <form action="http://localhost:3000/api/submit/YOUR_API_KEY" method="POST">
   ```
3. Ensure all inputs have `name` attributes
4. Test locally first

### For hlpfl.org

Same process as above. Each website can use the same form or different forms.

### AJAX Integration (For Better UX)

```html
<form id="contactForm">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>

<div id="message" style="display:none;"></div>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('http://localhost:3000/api/submit/YOUR_API_KEY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    // Show success message
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = result.message;
    document.getElementById('message').style.color = 'green';
    
    // Reset form
    e.target.reset();
  } catch (error) {
    document.getElementById('message').style.display = 'block';
    document.getElementById('message').textContent = 'Error submitting form. Please try again.';
    document.getElementById('message').style.color = 'red';
  }
});
</script>
```

## Part 4: Production Deployment

### Option 1: Deploy to VPS (DigitalOcean, Linode, etc.)

#### Step 1: Setup Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 2: Upload Application

```bash
# On your local machine, create a zip
cd form-collector
npm run build
tar -czf form-collector.tar.gz dist node_modules package.json .env database

# Upload to server
scp form-collector.tar.gz root@your-server-ip:/var/www/

# On server, extract
cd /var/www
tar -xzf form-collector.tar.gz
mv form-collector form-collector-app
cd form-collector-app
```

#### Step 3: Configure Environment

```bash
# Edit .env on server
nano .env

# Update these values:
NODE_ENV=production
ALLOWED_ORIGINS=https://zaitsev.co,https://hlpfl.org
```

#### Step 4: Start with PM2

```bash
pm2 start dist/server.js --name form-collector
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx

```bash
nano /etc/nginx/sites-available/form-collector
```

Add:
```nginx
server {
    listen 80;
    server_name forms.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/form-collector /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 6: Setup SSL

```bash
certbot --nginx -d forms.yourdomain.com
```

#### Step 7: Update Your Websites

Update form actions to use your production URL:
```html
<form action="https://forms.yourdomain.com/api/submit/YOUR_API_KEY" method="POST">
```

### Option 2: Deploy to Heroku (Easier)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-form-collector

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
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
```

Your form collector will be at: `https://your-form-collector.herokuapp.com`

## Part 5: Maintenance & Monitoring

### Daily Tasks
- Check admin dashboard for new submissions
- Monitor email delivery

### Weekly Tasks
- Review submission patterns
- Check for spam
- Backup database

### Monthly Tasks
- Update dependencies: `npm update`
- Review security settings
- Check server resources

### Backup Database

```bash
# Local backup
cp database/forms.db database/forms.db.backup

# Server backup (add to crontab)
0 2 * * * cp /var/www/form-collector-app/database/forms.db /var/backups/forms-$(date +\%Y\%m\%d).db
```

## Troubleshooting

### Problem: Email not sending

**Solution:**
1. Check SMTP credentials in `.env`
2. Test email settings:
   ```bash
   npm run dev
   # Check console for email errors
   ```
3. For Gmail: Ensure app password is correct
4. For SendGrid: Verify API key has Mail Send permission

### Problem: CORS errors in browser

**Solution:**
1. Add your domain to `ALLOWED_ORIGINS` in `.env`:
   ```env
   ALLOWED_ORIGINS=https://zaitsev.co,https://hlpfl.org
   ```
2. Restart server
3. Clear browser cache

### Problem: "Form not found" error

**Solution:**
1. Verify API key is correct
2. Check form is active in admin dashboard
3. Ensure no extra spaces in API key

### Problem: Can't login to admin

**Solution:**
1. Verify credentials in `.env`
2. Check database exists: `ls database/`
3. Reset password by editing `.env` and restarting

## Next Steps

1. ✅ Setup complete - your form collector is running!
2. 📝 Create forms for each website
3. 🔗 Integrate with zaitsev.co and hlpfl.org
4. 🚀 Deploy to production
5. 📧 Test email notifications
6. 🔒 Setup SSL certificate
7. 📊 Monitor submissions

## Support

If you encounter issues:
1. Check the logs: `pm2 logs form-collector`
2. Review this guide
3. Check environment variables
4. Verify email settings

Congratulations! Your form collector is ready to use! 🎉
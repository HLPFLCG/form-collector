# Custom Form Collector

A self-hosted form collection service similar to Formspree.io. Collect form submissions from your static websites, receive email notifications, and manage submissions through a beautiful admin dashboard.

## 🌟 Features

- **Easy Integration**: Simple HTML form integration with just an action URL
- **Email Notifications**: Instant email alerts for new submissions
- **Admin Dashboard**: Beautiful web interface to manage forms and view submissions
- **API Support**: RESTful API for programmatic access
- **Security**: Rate limiting, CORS protection, input validation
- **Self-Hosted**: Complete control over your data
- **Scalable**: Built with Node.js and SQLite (easily upgradable to PostgreSQL)
- **TypeScript**: Type-safe codebase for reliability

## 📋 Prerequisites

- Node.js 18+ and npm
- SMTP email server (Gmail, SendGrid, Mailgun, etc.)
- Domain name (optional, for production deployment)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the form-collector directory
cd form-collector

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configuration

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_PATH=./database/forms.db

# Security (IMPORTANT: Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change-this-secure-password

# Email Configuration (Example: Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email From Address
EMAIL_FROM=noreply@yourdomain.com

# CORS Configuration (comma-separated domains)
ALLOWED_ORIGINS=https://zaitsev.co,https://hlpfl.org,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Email Provider Setup

**Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

### 3. Build and Run

```bash
# Build TypeScript
npm run build

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Access Admin Dashboard

1. Open `http://localhost:3000/admin`
2. Login with your admin credentials from `.env`
3. **IMPORTANT**: Change the default password immediately!

## 📝 Usage

### Creating a Form

1. Login to the admin dashboard
2. Click "Create New Form"
3. Fill in:
   - **Form Name**: Identifier for your form (e.g., "Contact Form")
   - **Notification Email**: Where submissions will be sent
   - **Redirect URL** (optional): Where to redirect after submission
   - **Success Message**: Message shown on successful submission

4. Click "Save Form"
5. Copy the API key and integration code

### Integrating with Your Website

#### Method 1: HTML Form (Recommended for Static Sites)

```html
<form action="https://your-domain.com/api/submit/YOUR_API_KEY" method="POST">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

#### Method 2: JavaScript/AJAX

```javascript
const formData = {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
};

fetch('https://your-domain.com/api/submit/YOUR_API_KEY', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  alert(data.message);
})
.catch(error => {
  console.error('Error:', error);
});
```

#### Method 3: Fetch with Form Data

```javascript
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('https://your-domain.com/api/submit/YOUR_API_KEY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    alert('Submission failed. Please try again.');
  }
});
```

## 🔒 Security Features

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Prevents spam and abuse

### CORS Protection
- Whitelist specific domains
- Prevents unauthorized access
- Configure in `.env` file

### Input Validation
- Maximum field count per form (default: 50)
- Maximum submission size (default: 10MB)
- Email validation
- URL validation

### Authentication
- JWT-based authentication for admin dashboard
- Secure password hashing with bcrypt
- Token expiration (7 days)

## 🚢 Deployment

### Option 1: VPS/Cloud Server (Recommended)

1. **Setup Server** (Ubuntu/Debian):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy Application**:
```bash
# Upload your form-collector directory to server
# Navigate to directory
cd /path/to/form-collector

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name form-collector

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

3. **Setup Nginx Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

4. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  form-collector:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./.env:/app/.env
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: Platform as a Service

**Heroku:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... set all other env vars

# Deploy
git push heroku main
```

**Railway/Render:**
1. Connect your Git repository
2. Set environment variables in dashboard
3. Deploy automatically

## 📊 Database

### SQLite (Default)
- Perfect for small to medium deployments
- No additional setup required
- File-based storage

### Migrating to PostgreSQL (For Scale)

1. Install PostgreSQL adapter:
```bash
npm install pg
```

2. Update `src/config/database.ts` to use PostgreSQL
3. Update connection string in `.env`

## 🔧 API Reference

### Submit Form
```
POST /api/submit/:apiKey
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}

Response:
{
  "success": true,
  "message": "Thank you for your submission!",
  "submission_id": "uuid"
}
```

### Admin Endpoints (Require Authentication)

**Login:**
```
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Get Forms:**
```
GET /api/admin/forms
Authorization: Bearer <token>
```

**Create Form:**
```
POST /api/admin/forms
Authorization: Bearer <token>
{
  "name": "Contact Form",
  "email": "admin@example.com"
}
```

**Get Submissions:**
```
GET /api/admin/forms/:id/submissions
Authorization: Bearer <token>
```

## 🛠️ Maintenance

### Backup Database
```bash
# SQLite
cp database/forms.db database/forms.db.backup

# Or use automated backup script
0 2 * * * cp /path/to/database/forms.db /path/to/backups/forms-$(date +\%Y\%m\%d).db
```

### View Logs
```bash
# PM2 logs
pm2 logs form-collector

# Docker logs
docker-compose logs -f
```

### Update Application
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart form-collector
```

## 🐛 Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify SMTP server allows connections
3. Check firewall rules
4. Test with: `npm run dev` and check console logs

### CORS Errors
1. Add your domain to `ALLOWED_ORIGINS` in `.env`
2. Restart server
3. Clear browser cache

### Database Locked
1. Ensure only one instance is running
2. Check file permissions
3. Restart application

### Rate Limit Issues
1. Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
2. Whitelist specific IPs if needed

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Check environment configuration
4. Verify email settings

## 🎯 Roadmap

- [ ] PostgreSQL support
- [ ] Webhook notifications
- [ ] File upload support
- [ ] Custom email templates
- [ ] Multi-user support
- [ ] Form analytics
- [ ] Export submissions (CSV/JSON)
- [ ] Spam protection (reCAPTCHA)

## 🙏 Credits

Built with Node.js, Express, TypeScript, and SQLite.
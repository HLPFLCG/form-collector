# 🚀 Custom Form Collector

A production-ready, self-hosted form collection service similar to Formspree.io. Collect form submissions from your static websites, receive email notifications, and manage submissions through a beautiful admin dashboard.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Easy Integration** - Simple HTML form integration with just an action URL
- 📧 **Email Notifications** - Instant email alerts with beautiful HTML templates
- 🎨 **Admin Dashboard** - Modern, responsive web interface
- 🔐 **Secure** - Rate limiting, CORS, JWT authentication, input validation
- 🚀 **Self-Hosted** - Complete control over your data
- 💰 **No Fees** - Unlimited forms and submissions
- 📊 **Multiple Forms** - Create unlimited forms with unique API keys
- 🐳 **Docker Ready** - Easy containerized deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- SMTP email server (Gmail, SendGrid, Mailgun, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/HLPFLCG/form-collector.git
cd form-collector

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Build and start
npm run build
npm start
```

### Access Admin Dashboard

Open http://localhost:3000/admin and login with credentials from `.env`

## 📧 Email Configuration

### Gmail (Easiest for Testing)

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## 🌐 Integration Example

### HTML Form

```html
<form action="http://localhost:3000/api/submit/YOUR_API_KEY" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

### AJAX/JavaScript

```javascript
fetch('http://localhost:3000/api/submit/YOUR_API_KEY', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed step-by-step setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** - Complete Cloudflare setup with custom domain
- **[QUICK_CLOUDFLARE_GUIDE.md](QUICK_CLOUDFLARE_GUIDE.md)** - Quick 30-minute Cloudflare setup
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Comprehensive project overview

## 🐳 Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or build manually
docker build -t form-collector .
docker run -p 3000:3000 --env-file .env form-collector
```

## 🚢 Deployment Options

### VPS (DigitalOcean, Linode, AWS)
Full control, best for production. See [DEPLOYMENT.md](DEPLOYMENT.md)

### Heroku
```bash
heroku create your-app
git push heroku main
```

### Railway
Connect GitHub repository and auto-deploy

### Docker
```bash
docker-compose up -d
```

### 🌐 Custom Domain with Cloudflare
Want to use your own domain? See our Cloudflare guides:
- **[Quick Setup (30 min)](QUICK_CLOUDFLARE_GUIDE.md)** - Fast track to production
- **[Complete Guide](CLOUDFLARE_SETUP.md)** - Detailed setup with all options

## 🔒 Security Features

- ✅ Rate limiting (configurable)
- ✅ CORS protection
- ✅ Input validation
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ XSS protection

## 📊 Admin Dashboard

### Features
- Dashboard with statistics
- Form management (create, edit, delete)
- View all submissions
- Regenerate API keys
- Copy integration code
- Beautiful, responsive UI

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (PostgreSQL-ready)
- **Authentication**: JWT
- **Email**: Nodemailer
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Security**: Helmet, CORS, bcrypt

## 📁 Project Structure

```
form-collector/
├── src/                    # TypeScript source code
│   ├── config/            # Database configuration
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation, rate limiting
│   ├── services/          # Email service
│   └── server.ts          # Main server
├── public/                # Frontend files
│   ├── admin.html         # Admin dashboard
│   ├── css/              # Styles
│   └── js/               # Client-side logic
├── examples/              # Integration examples
└── database/              # SQLite database
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run in production
npm start
```

## 🧪 Testing

```bash
# Test form submission
curl -X POST http://localhost:3000/api/submit/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Check health
curl http://localhost:3000/health
```

## 📈 Scaling

### Current Setup (SQLite)
- Handles 1000s of submissions
- Perfect for small to medium sites

### Scaling Up (PostgreSQL)
- Easy migration path
- Handles millions of submissions
- Better for high-traffic sites

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Free to use in your projects!

## 🙏 Acknowledgments

Built with Node.js, Express, TypeScript, and SQLite.

## 📞 Support

For issues and questions:
1. Check the [documentation](SETUP_GUIDE.md)
2. Review [troubleshooting guide](DEPLOYMENT.md#troubleshooting)
3. Open an issue on GitHub

## 🎯 Use Cases

- Contact forms
- Newsletter signups
- Feedback collection
- Lead generation
- Survey responses
- Support tickets
- Job applications
- Event registrations

## 🌟 Why Choose This?

### vs. Formspree.io
✅ **Self-Hosted** - Complete data ownership  
✅ **No Fees** - Unlimited forms and submissions  
✅ **Customizable** - Modify anything you want  
✅ **Private** - Your data stays on your server  
✅ **Scalable** - Handles as much as your server can  
✅ **Full Control** - No third-party dependencies  

## 🚀 Roadmap

- [ ] Webhook notifications
- [ ] File upload support
- [ ] Custom email templates
- [ ] Multi-user support
- [ ] Form analytics
- [ ] Export submissions (CSV/JSON)
- [ ] Spam protection (reCAPTCHA)
- [ ] Form builder UI

## 📊 Stats

- **Lines of Code**: 3,500+
- **API Endpoints**: 12+
- **Security Features**: 7+
- **Deployment Options**: 4
- **Documentation Pages**: 5

---

**Made with ❤️ for developers who want control over their form submissions**

**Star ⭐ this repo if you find it helpful!**
#!/bin/bash

# Form Collector Quick Start Script
# This script helps you get started quickly

set -e

echo "🚀 Form Collector Quick Start"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your settings:"
    echo "   - ADMIN_EMAIL and ADMIN_PASSWORD"
    echo "   - JWT_SECRET (generate a random string)"
    echo "   - SMTP settings for email"
    echo "   - ALLOWED_ORIGINS (your website domains)"
    echo ""
    read -p "Press Enter after you've edited .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start          (production)"
echo "  npm run dev        (development with auto-reload)"
echo ""
echo "After starting, access:"
echo "  - Admin Dashboard: http://localhost:3000/admin"
echo "  - API Health: http://localhost:3000/health"
echo ""
echo "Default admin credentials (CHANGE THESE!):"
echo "  Email: Check your .env file (ADMIN_EMAIL)"
echo "  Password: Check your .env file (ADMIN_PASSWORD)"
echo ""
read -p "Start the server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Form Collector..."
    npm start
fi
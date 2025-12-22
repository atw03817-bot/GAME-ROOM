#!/bin/bash

echo "🚨 EMERGENCY SERVER UPDATE - إصلاح مشكلة التسجيل"
echo "=================================================="

# التأكد من أننا في المجلد الصحيح
cd /var/www/mobile-store

echo "📁 Current directory: $(pwd)"

# إيقاف السيرفر
echo "⏹️  Stopping PM2 processes..."
pm2 stop all
pm2 delete all

# سحب آخر التحديثات
echo "📥 Pulling latest updates..."
git stash
git pull origin main

# التأكد من وجود ملف .env
echo "🔧 Checking .env file..."
if [ ! -f backend/.env ]; then
    echo "❌ .env file not found! Creating from template..."
    cp backend/.env.example backend/.env
fi

# عرض محتوى .env للتأكد
echo "📄 Current .env content:"
head -5 backend/.env

# تثبيت التبعيات
echo "📦 Installing dependencies..."
cd backend
npm install

# إعادة تشغيل السيرفر
echo "🚀 Starting server with PM2..."
pm2 start server.js --name "mobile-store-backend"

# عرض حالة PM2
echo "📊 PM2 Status:"
pm2 status

# عرض آخر 20 سطر من اللوج
echo "📋 Recent logs:"
pm2 logs --lines 20

echo "✅ Server update completed!"
echo "🧪 Test registration at: https://api.ab-tw.com/api/auth/register"
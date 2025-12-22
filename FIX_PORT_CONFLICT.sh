#!/bin/bash

echo "=========================================="
echo "🔧 إصلاح تضارب Port 5000"
echo "=========================================="
echo ""

echo "📊 البحث عن العمليات اللي تستخدم port 5000..."
sudo lsof -i :5000

echo ""
echo "📋 حالة خدمات PM2:"
pm2 status

echo ""
echo "🛑 إيقاف جميع خدمات PM2..."
pm2 stop all

echo ""
echo "🗑️ حذف جميع العمليات من PM2..."
pm2 delete all

echo ""
echo "📊 التحقق من port 5000 مرة أخرى..."
sudo lsof -i :5000

echo ""
echo "🔄 بدء الخدمات من جديد..."
cd /mobile-store-vite

# بدء Backend
echo "🚀 بدء Backend..."
cd backend
pm2 start npm --name "mobile-store-backend" -- start

# بدء Frontend (إذا كان مطلوب)
echo "🌐 بدء Frontend..."
cd ../frontend
pm2 start npm --name "mobile-store-frontend" -- run preview

echo ""
echo "📊 حالة الخدمات الجديدة:"
pm2 status

echo ""
echo "📝 آخر logs:"
pm2 logs --lines 10

echo ""
echo "=========================================="
echo "✅ تم إصلاح تضارب Port"
echo "=========================================="
echo ""
echo "🌐 اختبر الموقع: https://www.ab-tw.com"
echo ""
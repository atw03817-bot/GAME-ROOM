#!/bin/bash

echo "=========================================="
echo "🔧 إصلاح سريع لمشكلة قاعدة البيانات"
echo "=========================================="
echo ""

# تحقق من حالة MongoDB
echo "📊 تحقق من حالة MongoDB..."
sudo systemctl status mongod --no-pager

echo ""
echo "🔄 إعادة تشغيل MongoDB..."
sudo systemctl restart mongod

echo ""
echo "✅ تفعيل التشغيل التلقائي..."
sudo systemctl enable mongod

echo ""
echo "📋 تحقق من ملف .env..."
cd /mobile-store-vite/backend
if [ -f .env ]; then
    echo "✅ ملف .env موجود"
    grep MONGODB .env || echo "❌ MONGODB_URI غير موجود في .env"
else
    echo "❌ ملف .env غير موجود!"
    echo "إنشاء ملف .env..."
    cat > .env << EOF
MONGODB_URI=mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.ab-tw.com
JWT_SECRET=mobile-store-secret-key-2024
EOF
    echo "✅ تم إنشاء ملف .env"
fi

echo ""
echo "🔄 إعادة تشغيل خدمات PM2..."
pm2 restart all

echo ""
echo "📊 حالة الخدمات:"
pm2 status

echo ""
echo "📝 آخر logs:"
pm2 logs --lines 10

echo ""
echo "=========================================="
echo "✅ تم الانتهاء من الإصلاح"
echo "=========================================="
echo ""
echo "🌐 اختبر الموقع الآن: https://www.ab-tw.com"
echo ""
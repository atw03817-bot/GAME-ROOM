#!/bin/bash

echo "🔄 بدء عملية التحديث..."

# الانتقال للمشروع
cd /home/ubuntu/mobile-store-vite

# إيقاف السيرفرات
echo "⏸️  إيقاف السيرفرات..."
pm2 stop all

# حفظ نسخة احتياطية من uploads
echo "💾 حفظ نسخة احتياطية..."
if [ -d "backend/uploads" ]; then
    cp -r backend/uploads backend/uploads.backup.$(date +%Y%m%d_%H%M%S)
fi

# سحب التحديثات
echo "📥 سحب التحديثات من GitHub..."
git pull origin main

# تثبيت packages الجديدة
echo "📦 تثبيت التحديثات..."
cd backend && npm install
cd ../frontend && npm install
cd ..

# التأكد من وجود مجلد uploads
echo "📁 التحقق من المجلدات..."
mkdir -p backend/uploads
chmod 755 backend/uploads

# إعادة تشغيل السيرفرات
echo "▶️  إعادة تشغيل السيرفرات..."
pm2 restart all

# الانتظار قليلاً
sleep 3

# عرض الحالة
echo ""
echo "✅ تم التحديث بنجاح!"
echo ""
pm2 status

echo ""
echo "📊 آخر 20 سطر من اللوقات:"
pm2 logs --lines 20 --nostream

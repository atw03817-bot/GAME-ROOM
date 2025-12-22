#!/bin/bash

echo "🔍 CHECKING SERVER LOGS - فحص سجلات السيرفر"
echo "=============================================="

# التأكد من أننا في المجلد الصحيح
cd /var/www/mobile-store

echo "📁 Current directory: $(pwd)"

# عرض حالة PM2
echo -e "\n📊 PM2 Status:"
pm2 status

# عرض آخر 50 سطر من اللوج
echo -e "\n📋 Recent PM2 Logs (last 50 lines):"
pm2 logs --lines 50

# محاولة تسجيل جديد وعرض اللوج مباشرة
echo -e "\n🧪 Testing registration and watching logs..."
echo "سيتم اختبار التسجيل الآن - راقب اللوج:"

# تشغيل PM2 logs في الخلفية
pm2 logs --lines 0 &
LOGS_PID=$!

# انتظار ثانيتين ثم قتل عملية اللوج
sleep 10
kill $LOGS_PID 2>/dev/null

echo -e "\n✅ Log check completed"
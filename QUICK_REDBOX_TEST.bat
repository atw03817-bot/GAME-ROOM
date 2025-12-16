@echo off
echo 🚀 اختبار سريع لـ RedBox مع المفاتيح الحقيقية
echo.

cd backend

echo 📋 فحص الإعدادات...
node -e "
const dotenv = require('dotenv');
dotenv.config();
console.log('✅ Organization ID:', process.env.REDBOX_ORGANIZATION_ID ? 'موجود' : '❌ مفقود');
console.log('✅ API Key:', process.env.REDBOX_API_KEY ? 'موجود' : '❌ مفقود');
console.log('✅ API URL:', process.env.REDBOX_API_URL || '❌ مفقود');
"

echo.
echo 🧪 تشغيل اختبار التكامل...
node scripts/test-redbox.js

echo.
echo ✅ انتهى الاختبار السريع
pause
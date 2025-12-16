@echo off
echo 🔑 إعداد مفاتيح RedBox...
echo.

cd backend
node scripts/setup-redbox-credentials.js

echo.
echo ✅ تم إعداد المفاتيح بنجاح
echo.
echo 🧪 هل تريد اختبار التكامل الآن؟
pause

echo.
echo 🧪 اختبار تكامل RedBox...
node scripts/test-redbox.js

echo.
echo ✅ انتهى الإعداد والاختبار
pause
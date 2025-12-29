@echo off
echo ========================================
echo فحص قاعدة البيانات السحابية
echo ========================================
echo.

echo جاري الاتصال بقاعدة البيانات السحابية...
echo MongoDB Atlas
echo.

cd backend
node ../CHECK_CLOUD_DATABASE.js

echo.
echo تم الانتهاء من الفحص!
pause
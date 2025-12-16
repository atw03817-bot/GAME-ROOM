@echo off
echo ========================================
echo        اختبار API المحلي - إصلاح سريع
echo ========================================
echo.

echo 1. اختبار الاتصال بالـ Backend المحلي...
curl -s http://localhost:5000/api/settings > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend شغال على localhost:5000
) else (
    echo ❌ Backend مش شغال على localhost:5000
    echo تأكد من تشغيل الـ Backend أولاً
    pause
    exit /b 1
)

echo.
echo 2. اختبار Frontend على localhost:5173...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend شغال على localhost:5173
) else (
    echo ❌ Frontend مش شغال على localhost:5173
    echo تأكد من تشغيل الـ Frontend أولاً
    pause
    exit /b 1
)

echo.
echo 3. فتح الموقع المحلي...
echo 🌐 افتح هذا الرابط في المتصفح:
echo    http://localhost:5173
echo.
echo ⚠️  تأكد من استخدام localhost:5173 وليس ab-tw.com
echo.

start http://localhost:5173

echo.
echo 4. اختبار Tamara API...
echo 📝 اذهب إلى: الإعدادات > طرق الدفع > تمارا
echo 🔍 افتح Developer Tools (F12) وشوف Console
echo 📊 تأكد من أن API_URL يشير إلى localhost:5000
echo.

pause
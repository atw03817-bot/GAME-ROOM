@echo off
echo 🚀 إنشاء حساب مدير على السيرفر Ubuntu
echo.
echo 📋 الخطوات المطلوبة:
echo.
echo 1️⃣ رفع الملفات إلى السيرفر:
echo    - create_admin_server.js
echo    - package.json (إذا لم يكن موجود)
echo.
echo 2️⃣ على السيرفر Ubuntu، نفذ الأوامر التالية:
echo.
echo    cd /path/to/your/project
echo    npm install
echo    node create_admin_server.js
echo.
echo 3️⃣ أو استخدم curl مباشرة:
echo.
echo    curl -X POST https://www.ab-tw.com/api/auth/register \
echo      -H "Content-Type: application/json" \
echo      -d '{"phone":"0501234567","password":"Admin@123456"}'
echo.
echo 4️⃣ اختبار تسجيل الدخول:
echo.
echo    curl -X POST https://www.ab-tw.com/api/auth/login \
echo      -H "Content-Type: application/json" \
echo      -d '{"phone":"0501234567","password":"Admin@123456"}'
echo.
echo 🔗 روابط مهمة:
echo    الموقع: https://www.ab-tw.com
echo    تسجيل الدخول: https://www.ab-tw.com/login
echo    لوحة الإدارة: https://www.ab-tw.com/admin
echo.
echo ⚠️ تذكر:
echo    - غير رقم الجوال وكلمة المرور في السكريبت
echo    - استخدم كلمة مرور قوية
echo    - غير كلمة المرور بعد تسجيل الدخول
echo.
pause
@echo off
echo ========================================
echo   حل سريع لمشكلة الإعدادات
echo ========================================
echo.

echo المشكلة: خطأ 500 عند حفظ الإعدادات
echo السبب: مشاكل في validation أو authentication
echo.
echo الحل السريع:
echo 1. تسجيل دخول كمدير أولاً
echo 2. استخدام endpoint بديل
echo.
echo خطوات الحل:
echo.
echo 1. افتح صفحة تسجيل الدخول:
start http://localhost:5173/login
echo.
echo 2. سجل دخول بهذه البيانات:
echo    البريد: admin@ab-tw.com
echo    كلمة المرور: 123456
echo.
echo 3. بعد تسجيل الدخول، اذهب لإعدادات الثيم:
timeout /t 5 /nobreak > nul
start http://localhost:5173/admin/theme-settings
echo.
echo 4. جرب تغيير الإعدادات والحفظ
echo.
echo إذا لم يعمل، استخدم هذا الحل البديل:
echo - افتح Developer Tools (F12)
echo - اذهب إلى Application tab
echo - اذهب إلى Local Storage
echo - تأكد من وجود 'token' في localStorage
echo.
echo إذا لم يوجد token، سجل دخول مرة أخرى
echo.
pause
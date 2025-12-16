@echo off
echo ========================================
echo   اختبار وتشخيص مشكلة الأزرار
echo ========================================
echo.

echo خطوات التشخيص:
echo.
echo 1. افتح Developer Tools (F12)
echo 2. اذهب إلى Console tab
echo 3. افتح صفحة إعدادات الثيم
echo 4. جرب تغيير أي زر
echo 5. راقب الرسائل في Console
echo.
echo ما يجب أن تراه في Console:
echo - "Changing header field: [اسم الحقل] to: [القيمة]"
echo - "New settings: [الإعدادات الجديدة]"
echo.
echo إذا لم تظهر هذه الرسائل، فالمشكلة في الـ event handlers
echo إذا ظهرت لكن الأزرار لا تتغير، فالمشكلة في الـ rendering
echo.
start http://localhost:5173/admin/theme-settings
echo.
echo بيانات تسجيل الدخول:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
pause
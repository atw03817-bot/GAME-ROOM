@echo off
echo ========================================
echo   تشخيص مشكلة الأزرار
echo ========================================
echo.

echo خطوات التشخيص:
echo.
echo 1. افتح Developer Tools (F12)
echo 2. اذهب إلى Console tab
echo 3. افتح صفحة إعدادات الثيم:
start http://localhost:5173/admin/theme-settings
echo.
echo 4. جرب تغيير زر "إظهار اسم المتجر في الجوال"
echo.
echo 5. راقب الرسائل في Console:
echo    - "Changing showStoreNameMobile to true/false"
echo    - "Saved to localStorage: {...}"
echo.
echo 6. افتح الموقع في تبويب جديد:
timeout /t 3 /nobreak > nul
start http://localhost:5173
echo.
echo 7. راقب Console في الموقع:
echo    - "Loaded header settings: {...}"
echo    - "Settings changed: {...}"
echo.
echo 8. صغر الشاشة وتأكد من التغيير
echo.
echo إذا لم تظهر الرسائل، فالمشكلة في الكود
echo إذا ظهرت لكن لا تأثير، فالمشكلة في العرض
echo.
echo بيانات تسجيل الدخول:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
pause
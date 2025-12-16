@echo off
echo اختبار اسم المتجر في الجوال...
echo.
echo خطوات التشخيص:
echo.
echo 1. افتح الموقع في الجوال أو محاكي الجوال
echo 2. اضغط F12 لفتح Developer Tools
echo 3. اذهب لتبويب Console
echo 4. تحقق من الرسائل التالية:
echo    - "Navbar: Loaded header settings"
echo    - "ThemeSettings: Saved header to localStorage"
echo.
echo 5. اختبر localStorage:
echo    localStorage.getItem('headerSettings')
echo.
echo 6. اذهب لإعدادات الثيم:
echo    - تبويب "رأس الصفحة"
echo    - املأ "اسم المتجر" و "الشعار"
echo    - فعّل "إظهار اسم المتجر في الجوال"
echo    - فعّل "إظهار الشعار في الجوال"
echo    - احفظ الإعدادات
echo.
echo 7. تحقق من النتيجة:
echo    - يجب أن يظهر اسم المتجر في الجوال
echo    - يجب أن يظهر الشعار تحته
echo.
echo إذا لم يظهر:
echo - تأكد من ملء النصوص
echo - تأكد من تفعيل الخيارات
echo - تحقق من Console للأخطاء
echo.
pause
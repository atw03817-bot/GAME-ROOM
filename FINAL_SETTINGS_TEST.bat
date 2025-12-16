@echo off
echo ========================================
echo   اختبار نهائي للإعدادات المبسطة
echo ========================================
echo.

echo تم تبسيط النظام:
echo ✅ إرسال الحقول الأساسية فقط
echo ✅ تجنب مشاكل validation
echo ✅ استخدام Boolean() لضمان القيم الصحيحة
echo ✅ تحديث محلي للـ state
echo.
echo خطوات الاختبار:
echo.
echo 1. تأكد من تسجيل الدخول كمدير:
start http://localhost:5173/login
echo    البريد: admin@ab-tw.com
echo    كلمة المرور: 123456
echo.
echo 2. اذهب لإعدادات الثيم:
timeout /t 3 /nobreak > nul
start http://localhost:5173/admin/theme-settings
echo.
echo 3. جرب تغيير هذه الإعدادات:
echo    - إظهار اسم المتجر في الجوال
echo    - إظهار الشعار في الجوال
echo    - اسم المتجر
echo    - الشعار
echo.
echo 4. اضغط "حفظ الإعدادات"
echo.
echo 5. تأكد من:
echo    - ظهور رسالة "تم حفظ إعدادات الموقع بنجاح"
echo    - عدم ظهور أخطاء في Console
echo    - بقاء الإعدادات بعد تحديث الصفحة
echo.
echo 6. اختبر النتيجة في الموقع:
timeout /t 2 /nobreak > nul
start http://localhost:5173
echo    - صغر الشاشة لترى الجوال
echo    - تأكد من ظهور/اختفاء اسم المتجر حسب الإعدادات
echo.
echo إذا لم يعمل، تحقق من:
echo - تسجيل الدخول كمدير
echo - وجود token في localStorage
echo - عدم وجود أخطاء في Console
echo.
pause
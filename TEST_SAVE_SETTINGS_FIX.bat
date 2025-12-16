@echo off
echo ========================================
echo   اختبار إصلاح حفظ الإعدادات
echo ========================================
echo.

echo تم إصلاح المشاكل التالية:
echo.
echo ✅ إصلاح خطأ 500 في الخادم
echo ✅ إضافة قيم افتراضية للحقول المفقودة
echo ✅ تنظيف البيانات قبل الإرسال
echo ✅ إضافة console.log لتتبع المشاكل
echo.
echo خطوات الاختبار:
echo.
echo 1. افتح Developer Tools (F12)
echo 2. اذهب إلى Console tab
echo 3. افتح صفحة إعدادات الثيم
start http://localhost:5173/admin/theme-settings
echo.
echo 4. جرب تغيير أي إعداد (مثل إظهار اسم المتجر في الجوال)
echo 5. اضغط "حفظ الإعدادات"
echo 6. تأكد من ظهور رسالة "تم حفظ إعدادات الموقع بنجاح"
echo 7. حدث الصفحة وتأكد من بقاء الإعدادات
echo.
echo ما يجب أن تراه في Console:
echo - "Changing header field: ..."
echo - "New settings: ..."
echo - "Sending clean settings: ..."
echo.
echo إذا لم تظهر أخطاء في Console والرسالة تظهر، فالمشكلة حُلت!
echo.
echo بيانات تسجيل الدخول:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
pause
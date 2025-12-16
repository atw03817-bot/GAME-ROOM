@echo off
echo ========================================
echo   اختبار الأزرار الجديدة
echo ========================================
echo.

echo تم إضافة نظام بسيط:
echo ✅ حفظ فوري في localStorage
echo ✅ تحديث مباشر للـ Navbar
echo ✅ لا حاجة لإعادة تحميل الصفحة
echo.
echo خطوات الاختبار:
echo.
echo 1. افتح صفحة إعدادات الثيم:
start http://localhost:5173/admin/theme-settings
echo.
echo 2. ابحث عن هذين الخيارين:
echo    - "إظهار اسم المتجر في الجوال"
echo    - "إظهار الشعار في الجوال"
echo.
echo 3. جرب تفعيل/إلغاء الخيارات
echo    (يجب أن تحفظ فوراً بدون ضغط زر الحفظ)
echo.
echo 4. افتح الموقع في تبويب جديد:
timeout /t 3 /nobreak > nul
start http://localhost:5173
echo.
echo 5. صغر الشاشة لترى الجوال وتأكد من:
echo    - ظهور/اختفاء اسم المتجر حسب الإعداد
echo    - ظهور/اختفاء النص التحتي حسب الإعداد
echo.
echo بيانات تسجيل الدخول للإدارة:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
pause
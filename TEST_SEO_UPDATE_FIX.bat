@echo off
echo ========================================
echo اختبار إصلاح تحديث SEO
echo ========================================
echo.
echo 1. تم إصلاح مشكلة slug الفارغ في النموذج
echo 2. تم إضافة sparse: true للسماح بقيم slug فارغة متعددة
echo 3. تم تحسين تنظيف البيانات في الـ frontend والـ backend
echo 4. تم إزالة required من حقل slug في الـ frontend
echo.
echo الآن يمكنك:
echo - فتح http://localhost:5174/admin/seo
echo - تجربة تحديث أي صفحة SEO
echo - ترك حقل slug فارغاً أو ملؤه
echo - يجب أن يعمل التحديث بدون أخطاء 400
echo.
echo إذا استمر الخطأ، تحقق من:
echo - رسائل الخطأ في console المتصفح
echo - رسائل الخطأ في terminal الـ backend
echo.
pause
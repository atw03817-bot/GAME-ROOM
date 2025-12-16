@echo off
echo ========================================
echo   اختبار النظام الكامل
echo ========================================
echo.

echo [1/4] إنشاء طلب تجريبي مع خيارات...
node backend/scripts/create-test-order-with-options.js

echo.
echo [2/4] إنشاء حساب إداري...
cd backend
node scripts/create-admin.js
cd ..

echo.
echo [3/4] فتح صفحة تسجيل الدخول...
start http://localhost:5173/login

echo.
echo [4/4] فتح صفحة الطلبات (بعد تسجيل الدخول)...
timeout /t 3 /nobreak > nul
start http://localhost:5173/admin/orders

echo.
echo ========================================
echo   ✅ تم الانتهاء!
echo ========================================
echo.
echo بيانات تسجيل الدخول:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
echo الميزات الجديدة:
echo ✅ عرض معلومات العميل كاملة
echo ✅ عرض بيانات المنتج مع الصور
echo ✅ عرض خيارات المنتج (لون، سعة)
echo ✅ تغيير حالة الدفع للدفع عند الاستلام
echo ✅ تاريخ تغيير الحالات
echo ✅ تحسين التصميم والواجهة
echo.
pause
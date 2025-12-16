@echo off
echo ========================================
echo   اختبار نهائي لصفحة تفاصيل الطلب
echo ========================================
echo.

echo [1/4] إنشاء طلب تجريبي جديد...
cd backend
node scripts/create-test-order-with-options.js
cd ..

echo.
echo [2/4] التأكد من حساب الإدارة...
cd backend
node scripts/create-admin.js
cd ..

echo.
echo [3/4] فتح صفحة تسجيل الدخول...
start http://localhost:5173/login

echo.
echo [4/4] انتظار 5 ثوان ثم فتح صفحة الطلبات...
timeout /t 5 /nobreak > nul
start http://localhost:5173/admin/orders

echo.
echo ========================================
echo   ✅ تم الانتهاء!
echo ========================================
echo.
echo تم إصلاح جميع المشاكل:
echo.
echo ✅ إصلاح خطأ 500 في الخادم
echo ✅ عرض بيانات المنتج كاملة (اسم، صورة، سعر)
echo ✅ عرض معلومات العميل الحقيقية
echo ✅ عرض خيارات المنتج (لون، سعة) بتصميم جميل
echo ✅ تغيير حالة الطلب والدفع
echo ✅ تصميم محسن ومنظم
echo.
echo بيانات تسجيل الدخول:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
echo خطوات الاختبار:
echo 1. سجل دخول بالبيانات أعلاه
echo 2. اذهب لصفحة الطلبات
echo 3. اضغط على أي طلب لرؤية التفاصيل
echo 4. تأكد من ظهور جميع البيانات بشكل صحيح
echo.
pause
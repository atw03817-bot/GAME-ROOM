@echo off
echo ========================================
echo   اختبار API تفاصيل الطلب مباشرة
echo ========================================
echo.

echo [1/2] إنشاء طلب تجريبي...
cd backend
node scripts/create-test-order-with-options.js
cd ..

echo.
echo [2/2] اختبار جلب البيانات...
cd backend
node test-order-api.js
cd ..

echo.
echo ========================================
echo   ✅ تم الانتهاء!
echo ========================================
echo.
echo الآن جرب فتح صفحة تفاصيل الطلب:
echo http://localhost:5173/admin/orders
echo.
echo تأكد من تسجيل الدخول أولاً:
echo البريد: admin@ab-tw.com
echo كلمة المرور: 123456
echo.
pause
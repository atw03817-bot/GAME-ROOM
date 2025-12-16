@echo off
echo 📱 إنشاء طلب تجريبي مع خيارات المنتج...
echo.

cd backend
node scripts/create-test-order-with-options.js

echo.
echo ✅ تم إنشاء الطلب التجريبي
echo 🌐 افتح لوحة الإدارة للتحقق من ظهور الخيارات
echo 📱 http://localhost:3000/admin/orders
pause
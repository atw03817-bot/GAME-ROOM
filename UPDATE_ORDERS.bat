@echo off
echo 🔄 تحديث الطلبات الموجودة لدعم خيارات المنتج...
echo.

cd backend
node scripts/update-existing-orders.js

echo.
echo ✅ انتهى التحديث
pause
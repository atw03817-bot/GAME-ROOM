@echo off
echo ========================================
echo   تهيئة شركات الشحن
echo ========================================
echo.

cd backend
node scripts/init-shipping-providers.js

echo.
echo ========================================
pause

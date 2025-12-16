@echo off
echo ========================================
echo    Creating Admin Account
echo ========================================
echo.

cd backend
node scripts/createAdmin.js

echo.
echo ========================================
echo    Done!
echo ========================================
echo.
echo Login at: http://localhost:5173/login
echo Email: admin@store.com
echo Password: admin123456
echo.
pause


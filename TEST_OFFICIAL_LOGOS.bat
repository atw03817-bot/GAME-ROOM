@echo off
echo ========================================
echo Testing Official Payment Logos
echo ========================================
echo.

echo 1. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"
timeout /t 5

echo.
echo 2. Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5

echo.
echo 3. Opening test page...
start http://localhost:5173

echo.
echo ========================================
echo Test Official Logos:
echo.
echo ✅ Tamara Logo: Official SVG from Tamara CDN
echo    - Arabic text logo (black)
echo    - Proper branding compliance
echo.
echo ✅ Tap Logo: Official SVG from Tap CDN  
echo    - Official Tap Payments logo
echo    - Proper branding compliance
echo.
echo Test Pages:
echo 1. Go to checkout page
echo 2. Check payment methods section
echo 3. Verify official logos are displayed
echo 4. Test payment flow with both methods
echo ========================================
echo.
echo Press any key to continue...
pause > nul
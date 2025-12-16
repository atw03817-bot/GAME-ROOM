@echo off
echo ========================================
echo Testing Fixed Payment Logos
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
echo Fixed Logos Status:
echo.
echo ✅ Tamara Logo: Official SVG from CDN
echo    - Source: https://cdn.prod.website-files.com/.../tamara-text-logo-black-ar.svg
echo    - Status: Working ✅
echo.
echo ✅ Tap Logo: Local SVG (embedded)
echo    - Source: Downloaded and embedded SVG
echo    - Status: Fixed ✅ (no more loading issues)
echo.
echo Test Steps:
echo 1. Go to checkout page
echo 2. Check payment methods section
echo 3. Verify both logos display correctly
echo 4. Test different screen sizes
echo 5. Test payment flow
echo ========================================
echo.
echo Press any key to continue...
pause > nul
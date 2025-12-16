@echo off
echo ========================================
echo Testing Unified Logo Sizes
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
echo Logo Sizes Now Unified:
echo.
echo 📏 Small:   60x24px (both logos)
echo 📏 Medium:  80x32px (both logos) 
echo 📏 Large:   100x40px (both logos)
echo 📏 XLarge:  120x48px (both logos)
echo.
echo ✅ Both Tamara and Tap logos now have identical sizes
echo ✅ Better visual balance in payment methods
echo ✅ Consistent user experience
echo.
echo Test Steps:
echo 1. Go to checkout page
echo 2. Check payment methods section  
echo 3. Verify both logos are same size
echo 4. Test on different screen sizes
echo ========================================
echo.
echo Press any key to continue...
pause > nul
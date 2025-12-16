@echo off
echo ========================================
echo Testing Tamara Payment Fix
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
echo Test Instructions:
echo 1. Go to a product page
echo 2. Add to cart
echo 3. Go to checkout
echo 4. Try Tamara payment
echo 5. Check console for errors
echo ========================================
echo.
echo Press any key to continue...
pause > nul
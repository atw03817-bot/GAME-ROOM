@echo off
echo ========================================
echo Testing Tamara Callback Fix
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
echo Test Flow:
echo 1. Add product to cart
echo 2. Go to checkout
echo 3. Select Tamara payment
echo 4. Complete payment on Tamara
echo 5. Check callback handling
echo.
echo Expected Flow:
echo Tamara → /tamara-callback → Processing → Redirect to correct page
echo.
echo Test Callback URLs directly:
echo - Success: http://localhost:5173/tamara-callback?orderId=TEST&status=success
echo - Failed: http://localhost:5173/tamara-callback?orderId=TEST&status=failed  
echo - Cancelled: http://localhost:5173/tamara-callback?orderId=TEST&status=cancelled
echo ========================================
echo.
echo Press any key to continue...
pause > nul
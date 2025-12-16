@echo off
echo ========================================
echo Testing Complete Tamara Payment Flow
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
echo Complete Test Instructions:
echo.
echo 1. Go to a product page and add to cart
echo 2. Go to checkout page
echo 3. Fill in shipping details with Saudi phone number
echo 4. Select Tamara payment method
echo 5. Complete payment flow
echo.
echo Expected Results:
echo - ✅ Tamara checkout opens successfully
echo - ✅ After payment: redirects to success page
echo - ✅ If cancelled: redirects to cancelled page  
echo - ✅ If failed: redirects to failed page
echo.
echo Test URLs:
echo - Success: http://localhost:5173/order-success?orderId=TEST&provider=tamara
echo - Failed: http://localhost:5173/order-failed?orderId=TEST&provider=tamara&reason=payment_failed
echo - Cancelled: http://localhost:5173/order-cancelled?orderId=TEST&provider=tamara&reason=user_cancelled
echo ========================================
echo.
echo Press any key to continue...
pause > nul
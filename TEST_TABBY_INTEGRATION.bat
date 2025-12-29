@echo off
echo ========================================
echo Testing Tabby Payment Integration
echo ========================================
echo.

echo 1. Testing Tabby API Connection...
curl -X POST "http://localhost:5000/api/payments/tabby/test" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d "{\"publicKey\":\"pk_test_01968174-594d-7042-be8f-f9d25036ec54\",\"secretKey\":\"sk_test_01968174-594d-7042-be8f-f9d2b3c79dce\",\"merchantCode\":\"top1\"}"

echo.
echo 2. Testing Tabby Settings Save...
curl -X PUT "http://localhost:5000/api/payments/settings/tabby" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d "{\"enabled\":true,\"config\":{\"publicKey\":\"pk_test_01968174-594d-7042-be8f-f9d25036ec54\",\"secretKey\":\"sk_test_01968174-594d-7042-be8f-f9d2b3c79dce\",\"apiUrl\":\"https://api.tabby.ai\",\"merchantCode\":\"top1\"}}"

echo.
echo 3. Testing Tabby Settings Fetch...
curl -X GET "http://localhost:5000/api/payments/settings/tabby" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

echo.
echo ========================================
echo Tabby Integration Test Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Replace YOUR_ADMIN_TOKEN with actual admin token
echo 2. Start the backend server (npm run dev)
echo 3. Run this script to test the integration
echo 4. Check the admin panel at /admin/tabby-payment-settings
echo 5. Test a checkout with Tabby payment method
echo.
pause
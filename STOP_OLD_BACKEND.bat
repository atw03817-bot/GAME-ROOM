@echo off
echo ========================================
echo   ايقاف Backend القديم
echo ========================================
echo.

echo جاري البحث عن العمليات على port 5000...
netstat -ano | findstr :5000

echo.
echo لايقاف العملية يدويا:
echo 1. انظر الى PID في السطر الاخير
echo 2. نفذ: taskkill /PID [رقم_PID] /F
echo.
echo مثال: taskkill /PID 12345 /F
echo.

pause

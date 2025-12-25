@echo off
echo Creating Test Maintenance Request with Real Diagnosis...
echo.
cd backend
node ../CREATE_TEST_MAINTENANCE_WITH_DIAGNOSIS.js
echo.
echo Test request created! 
echo Opening approval page...
start http://localhost:3000/maintenance/approval/MR-TEST-001
echo.
pause
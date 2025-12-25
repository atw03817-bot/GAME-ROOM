@echo off
echo Testing Controlled Inputs Fix...
echo.
echo 1. Testing customer maintenance request form (should have no React warnings)
start http://localhost:3000/maintenance/request
echo.
echo 2. Testing admin maintenance request form (should have no React warnings)
start http://localhost:3000/admin/maintenance/create
echo.
echo Check the browser console for React warnings about controlled/uncontrolled inputs.
echo The warnings should be gone now.
echo.
pause
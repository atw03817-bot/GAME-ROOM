@echo off
echo Testing Shipping System for Maintenance Requests...
echo.
echo 1. Testing maintenance request form with shipping options
start http://localhost:3000/maintenance/request
echo.
echo 2. Testing admin maintenance management
start http://localhost:3000/admin/maintenance
echo.
echo Test the following features:
echo - Customer can choose shipping provider (Aramex, SMSA, Naqel)
echo - Shipping costs are added to total cost
echo - Admin can see shipping information in request details
echo - Shipping status tracking
echo.
pause
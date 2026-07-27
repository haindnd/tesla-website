@echo off
echo Creating Tesla Motors database...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p dat_tesla_motors < database.sql
echo Done! Check MySQL for dat_tesla_motors database.
pause


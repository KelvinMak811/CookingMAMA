@echo off
cd /d "%~dp0"
echo SmartCook PHP — starting at http://127.0.0.1:8888/recipes.php
echo Press Ctrl+C to stop.
php -S 127.0.0.1:8888
pause

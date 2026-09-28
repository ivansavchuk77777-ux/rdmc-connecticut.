@echo off
setlocal
title RDMC Sol - Vivora Setup
echo RDMC Sol - Vivora setup
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-vivora.ps1"
echo.
echo If you see an error, take a screenshot and send it to Sol.
pause

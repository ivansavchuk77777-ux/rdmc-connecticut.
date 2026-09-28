@echo off
title RDMC Sol - Vivora Setup
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-vivora.ps1"
echo.
echo Press any key to close.
pause >nul

@echo off
title Organize Downloads
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Organize-Downloads.ps1" %*
echo.
pause

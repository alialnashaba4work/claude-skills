@echo off
title Organize Downloads - Preview
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Organize-Downloads.ps1" -Preview %*
echo.
pause

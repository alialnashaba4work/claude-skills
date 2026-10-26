@echo off
title Organize Downloads - Undo
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Organize-Downloads.ps1" -Undo %*
echo.
pause

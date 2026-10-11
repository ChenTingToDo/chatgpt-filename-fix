@echo off
setlocal
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Fix_Existing_Filenames.ps1" -Folder "%~1"
echo.
echo Finished. Press any key to close.
pause >nul

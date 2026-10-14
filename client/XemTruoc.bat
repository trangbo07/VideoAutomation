@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Xem truoc video
echo ============================================
echo   XEM TRUOC (ban nhanh, net thap de xem thu)
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Chua cai Node.js / chua chay "1-CaiDat.bat".
  pause
  exit /b 1
)
set "TAP=%~1"
if "%TAP%"=="" (
  echo Keo tha file tap.json vao cua so nay roi bam Enter:
  set /p TAP=^>
)
set TAP=%TAP:"=%
if "%TAP%"=="" (
  echo [!] Chua chon file tap.json.
  pause
  exit /b 1
)
echo.
node stls.mjs xem "%TAP%"
echo.
echo (Ung roi thi bam dup "3-TaoVideo.bat" de xuat ban chinh.)
echo.
pause

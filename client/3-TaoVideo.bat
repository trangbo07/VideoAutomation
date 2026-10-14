@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Tao video
echo ============================================
echo   TAO VIDEO
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
  echo Keo tha file tap.json vao cua so nay roi bam Enter,
  echo hoac go duong dan file tap.json:
  set /p TAP=^>
)
set TAP=%TAP:"=%
if "%TAP%"=="" (
  echo [!] Chua chon file tap.json.
  pause
  exit /b 1
)
echo.
for %%F in ("%TAP%") do set "TEN=%%~npF"
node stls.mjs render "%TAP%" "out\video.mp4"
echo.
echo (Neu thanh cong, video o: out\video.mp4)
echo.
pause

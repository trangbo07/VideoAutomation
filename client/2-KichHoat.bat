@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Kich hoat key
echo ============================================
echo   KICH HOAT KEY (lam 1 lan tren may nay)
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Chua cai Node.js / chua chay "1-CaiDat.bat".
  pause
  exit /b 1
)
set "KEY=%~1"
if "%KEY%"=="" set /p KEY=Dan KEY cua ban vao day roi bam Enter:
if "%KEY%"=="" (
  echo [!] Ban chua nhap key.
  pause
  exit /b 1
)
echo.
node stls.mjs activate %KEY%
echo.
echo (Neu bao "Da kich hoat" la thanh cong. Tiep theo: bam dup "3-TaoVideo.bat".)
echo.
pause

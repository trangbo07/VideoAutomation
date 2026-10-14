@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Cai dat stls
echo ============================================
echo   CAI DAT CONG CU TAO VIDEO (chi lam 1 lan)
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Chua cai Node.js.
  echo     Tai va cai tai: https://nodejs.org  roi chay lai file nay.
  echo.
  pause
  exit /b 1
)
echo Dang tai cac thanh phan can thiet (can mang Internet)...
echo.
call npm install
if errorlevel 1 (
  echo.
  echo [!] Cai dat that bai. Kiem tra mang roi chay lai.
  pause
  exit /b 1
)
echo.
echo [v] Cai dat xong! Tiep theo: bam dup "2-KichHoat.bat".
echo.
pause

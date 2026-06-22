@echo off
title Mematikan ERP System
color 0C

echo ===================================================
echo          MEMATIKAN APLIKASI ERP SYSTEM
echo ===================================================
echo.
echo Sedang menutup semua server yang berjalan...

:: Menutup proses PHP (Backend Laravel)
taskkill /F /IM php.exe /T 2>nul
echo - Backend API berhasil ditutup.

:: Menutup proses Node.js (Frontend Vite)
taskkill /F /IM node.exe /T 2>nul
echo - Frontend UI berhasil ditutup.

:: Mematikan MySQL (Hanya jika dijalankan via XAMPP)
IF EXIST "C:\xampp\mysql\bin\mysqladmin.exe" (
    echo - Sedang mematikan Database MySQL dengan aman...
    "C:\xampp\mysql\bin\mysqladmin.exe" -u root shutdown 2>nul
)

echo.
echo ===================================================
echo APLIKASI BERHASIL DIMATIKAN!
echo ===================================================
echo Anda sekarang bisa menutup jendela ini.
echo.
timeout /t 3 /nobreak > nul

@echo off
title ERP System Server
color 0A

echo ===================================================
echo          MEMULAI APLIKASI ERP SYSTEM
echo ===================================================
echo.

:: 1. Cek dan Jalankan Database
echo Mengecek status Database (Port 3306)...
netstat -an | find ":3306" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [INFO] Database MySQL sudah berjalan!
) else (
    echo [INFO] Database MySQL belum berjalan...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [INFO] Menemukan XAMPP, menyalakan MySQL otomatis...
        start "MySQL Database" /MIN cmd /c "C:\xampp\mysql\bin\mysqld.exe"
        timeout /t 3 /nobreak > nul
    ) else (
        echo [WARNING] MySQL tidak jalan dan XAMPP tidak ditemukan di C:\xampp.
        echo [PENTING] Karena Anda menggunakan LARAGON, silakan buka aplikasi Laragon lalu klik "Start All".
        echo [PENTING] Setelah MySQL menyala di Laragon, tekan tombol apa saja untuk lanjut...
        pause
    )
)

:: 2. Jalankan Backend Laravel (Port 8000) di jendela minimized
start "Backend API Server" /MIN cmd /c "cd backend && php artisan serve --port=8000"

:: 3. Jalankan Frontend React (Port 8080) di jendela minimized
start "Frontend UI Server" /MIN cmd /c "cd frontend.v2 && npm run dev"

:: 4. Tunggu 5 detik agar server siap
timeout /t 5 /nobreak > nul

:: 5. Buka aplikasi layaknya Desktop App menggunakan Google Chrome atau MS Edge
:: Ini akan menghilangkan URL bar dan tab, persis seperti software desktop.
echo.
echo Membuka aplikasi...

:: Coba buka via Chrome (mode App)
start chrome --app=http://localhost:8080 2>nul
if %errorlevel% neq 0 (
    :: Jika Chrome tidak ada, gunakan Edge (bawaan Windows)
    start msedge --app=http://localhost:8080 2>nul
)

echo.
echo ===================================================
echo APLIKASI BERHASIL DIJALANKAN!
echo ===================================================
echo INFO: 
echo - Ada 2 terminal tersembunyi di Taskbar (Backend ^& Frontend).
echo - Jangan tutup terminal tersebut selama aplikasi digunakan.
echo - Untuk mematikan sistem, tutup terminal tersebut.
echo.
pause

@echo off
title ERP System Server
color 0A

echo ===================================================
echo          MEMULAI APLIKASI ERP SYSTEM
echo ===================================================
echo.

:: Cek dan jalankan MySQL XAMPP otomatis (jika ada di lokasi standar C:\xampp)
IF EXIST "C:\xampp\mysql\bin\mysqld.exe" (
    echo Mengaktifkan Database MySQL...
    start "MySQL" /MIN "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone --console
    timeout /t 2 /nobreak > nul
) ELSE (
    echo [WARNING] XAMPP tidak terdeteksi di C:\xampp.
    echo Pastikan Database (MySQL) sudah menyala!
)

echo.
echo Sedang menyiapkan server aplikasi, mohon tunggu sebentar...

:: 1. Jalankan Backend Laravel (Port 8000) di jendela minimized
start "Backend API Server" /MIN cmd /c "cd backend && php artisan serve --port=8000"

:: 2. Jalankan Frontend React (Port 8083) di jendela minimized
start "Frontend UI Server" /MIN cmd /c "cd frontend.v2 && npm run dev"

:: 3. Tunggu 5 detik agar server siap
timeout /t 5 /nobreak > nul

:: 4. Buka aplikasi layaknya Desktop App menggunakan Google Chrome atau MS Edge
:: Ini akan menghilangkan URL bar dan tab, persis seperti software desktop.
echo.
echo Membuka aplikasi...

:: Coba buka via Chrome (mode App)
start chrome --app=http://localhost:8083 2>nul
if %errorlevel% neq 0 (
    :: Jika Chrome tidak ada, gunakan Edge (bawaan Windows)
    start msedge --app=http://localhost:8083 2>nul
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

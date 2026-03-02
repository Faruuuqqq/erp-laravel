# StoreMate Genie ERP - Local Development Setup

Development setup guide for StoreMate Genie ERP without Docker.

---

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

### Backend (Laravel)
- **PHP** 8.2 atau lebih tinggi
  - [Download PHP](https://www.php.net/downloads)
  - Extensions yang dibutuhkan: bcmath, ctype, fileinfo, mbstring, openssl, pdo, pdo_mysql, tokenizer, xml
- **Composer** 2.x
  - [Download Composer](https://getcomposer.org/download/)
- **MySQL** 8.0 atau lebih tinggi
  - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
  - Atau gunakan MariaDB, PostgreSQL, SQLite

### Frontend (React)
- **Node.js** 18.x atau lebih tinggi
  - [Download Node.js](https://nodejs.org/)
- **pnpm** (package manager)
  - Setelah install Node.js: `npm install -g pnpm`
- **Git** (untuk clone repository)
  - [Download Git](https://git-scm.com/downloads)

### Verifikasi Install

Cek apakah semua sudah terinstall dengan benar:

```bash
# Cek versi PHP
php -v
# Harusnya: PHP 8.2.x atau lebih

# Cek Composer
composer --version
# Harusnya: Composer version 2.x

# Cek Node.js
node -v
# Harusnya: v18.x atau lebih

# Cek pnpm
pnpm -v
# Harusnya: 8.x atau lebih

# Cek MySQL
mysql --version
# Harusnya: mysql Ver 8.x atau lebih
```

---

## 🚀 Quick Start (10 Menit)

### 1. Clone Repository

```bash
git clone <repository-url>
cd erp_laravel
```

### 2. Setup Backend (Laravel)

#### 2.1. Install Dependencies

```bash
cd backend
composer install
```

#### 2.2. Copy Environment File

```bash
cp .env.example .env
```

Atau jika `.env.example` tidak ada:

```bash
cp .env.production .env
```

#### 2.3. Generate Application Key

```bash
php artisan key:generate
```

#### 2.4. Konfigurasi Database

Edit file `.env` di folder `backend/`:

```env
# Database Connection
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tokosync_erp
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# atau jika pakai SQLite
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite
```

#### 2.5. Buat Database

**Untuk MySQL:**
```sql
-- Login ke MySQL
mysql -u root -p

-- Buat database
CREATE DATABASE tokosync_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Exit
EXIT;
```

**Atau pakai phpMyAdmin:**
- Buka phpMyAdmin (http://localhost/phpmyadmin)
- Buat database baru: `tokosync_erp`
- Collation: `utf8mb4_unicode_ci`

**Atau pakai SQLite (opsional):**
```bash
cd backend
touch database/database.sqlite
```

Lalu edit `.env`:
```env
DB_CONNECTION=sqlite
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD tidak perlu untuk SQLite
```

#### 2.6. Run Migrations

```bash
php artisan migrate
```

#### 2.7. Run Seeders

```bash
php artisan db:seed
```

Atau untuk fresh start (hapus semua data dulu):

```bash
php artisan migrate:fresh --seed
```

### 3. Setup Frontend (React)

#### 3.1. Install Dependencies

```bash
cd ../frontend
pnpm install
```

Jika `pnpm` belum terinstall:

```bash
npm install -g pnpm
pnpm install
```

#### 3.2. Setup Environment

Buat atau edit file `.env` di folder `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Jika file `.env` sudah ada, cek isinya sudah benar.

#### 3.3. Run Lint & Typecheck (Optional tapi disarankan)

```bash
pnpm typecheck
pnpm lint
```

### 4. Jalankan Aplikasi

#### 4.1. Start Backend (Laravel)

Buka terminal baru dan jalankan:

```bash
cd backend
php artisan serve
```

Backend akan berjalan di: **http://localhost:8000**

#### 4.2. Start Frontend (React)

Buka terminal baru dan jalankan:

```bash
cd frontend
pnpm dev
```

Frontend akan berjalan di: **http://localhost:5173**

### 5. Akses Aplikasi

Buka browser dan akses:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/api/docs (jika ada)

---

## 📁 Struktur Direktori

```
erp_laravel/
├── backend/                 # Laravel Backend
│   ├── app/                # Application logic
│   ├── config/             # Configuration files
│   ├── database/           # Migrations & Seeders
│   ├── public/             # Public files
│   ├── resources/          # Views & assets
│   ├── routes/             # API routes
│   ├── storage/            # Logs, cache, uploads
│   ├── tests/              # PHPUnit tests
│   ├── .env                # Environment variables
│   ├── composer.json       # PHP dependencies
│   └── artisan             # Laravel CLI
│
├── frontend/                # React Frontend
│   ├── src/                # Source code
│   │   ├── components/      # React components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API
│   │   ├── contexts/        # React contexts
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   ├── index.html          # HTML entry point
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.ts  # Tailwind CSS config
│   ├── .env                # Environment variables
│   ├── package.json        # Node.js dependencies
│   └── pnpm-lock.yaml     # Locked dependencies
│
├── .gitignore             # Git ignore patterns
├── AGENTS.md             # Developer guidelines
└── README.md             # This file
```

---

## 🔧 Commands Common

### Backend (Laravel)

```bash
cd backend

# Development server
php artisan serve                    # Start dev server (port 8000)

# Database
php artisan migrate                   # Run migrations
php artisan migrate:fresh               # Reset & re-run migrations
php artisan migrate:fresh --seed       # Reset + run seeders
php artisan db:seed                  # Run seeders only
php artisan make:migration create_table_name  # Create new migration
php artisan make:seeder TableSeeder   # Create new seeder

# Cache & Config
php artisan cache:clear               # Clear application cache
php artisan config:clear              # Clear config cache
php artisan route:clear               # Clear route cache
php artisan view:clear                # Clear view cache
php artisan optimize                  # Cache config & routes (production)

# Testing
php artisan test                       # Run all tests
php artisan test --filter testName      # Run specific test
php artisan migrate:fresh --seed      # Reset database for testing

# Code Quality
php artisan pint                     # Fix code style (Laravel Pint)

# Other useful commands
php artisan route:list               # List all routes
php artisan tinker                   # Interactive REPL
php artisan storage:link            # Create symbolic link for storage
```

### Frontend (React)

```bash
cd frontend

# Development
pnpm dev                          # Start dev server (port 5173)
pnpm build                         # Build for production
pnpm preview                       # Preview production build

# Code Quality
pnpm typecheck                     # TypeScript type checking
pnpm lint                          # Run ESLint
pnpm lint:fix                       # Auto-fix ESLint issues

# Testing
pnpm test                           # Run all tests
pnpm test:watch                    # Run tests in watch mode

# Dependency Management
pnpm install                        # Install dependencies
pnpm update                         # Update dependencies
pnpm outdated                       # Check for outdated packages
pnpm clean                          # Remove node_modules, dist, .vite
pnpm fresh                          # Clean install

# Single test
pnpm test src/components/ui/button.test.ts
```

---

## 🗄️ Database Management

### MySQL Command Line

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE tokosync_erp;

# Lihat semua tabel
SHOW TABLES;

# Lihat struktur tabel
DESCRIBE products;

# Jalankan query SQL
SELECT * FROM products LIMIT 10;

# Export database
mysqldump -u root -p tokosync_erp > backup.sql

# Import database
mysql -u root -p tokosync_erp < backup.sql

# Exit MySQL
EXIT;
```

### phpMyAdmin

Jika punya phpMyAdmin terinstall:
- Buka: http://localhost/phpmyadmin
- Login dengan root credentials
- Pilih database: `tokosync_erp`

### Database Seeders

Seeders ada di `backend/database/seeders/`:

```bash
# Jalankan semua seeders
php artisan db:seed

# Jalankan seeder spesifik
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=ProductSeeder

# Reset dan seed
php artisan migrate:fresh --seed
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "php: command not found"
**Solusi:**
- Windows: Pastikan PHP sudah diinstall dan di PATH
- Cek: `php -v`
- Jika tidak ada, install PHP dari [php.net](https://www.php.net/downloads)

#### Issue: "Composer not found"
**Solusi:**
- Install Composer: https://getcomposer.org/download/
- Cek: `composer --version`

#### Issue: "SQLSTATE[HY000] [2002] Connection refused"
**Solusi:**
1. Pastikan MySQL sedang berjalan
2. Cek kredensial di `.env` file
3. Pastikan database sudah dibuat
4. Cek port MySQL (default 3306)

#### Issue: "Database not found"
**Solusi:**
```bash
# Login MySQL
mysql -u root -p

# Buat database
CREATE DATABASE tokosync_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit
EXIT;
```

#### Issue: "Class not found" setelah install dependencies
**Solusi:**
```bash
composer dump-autoload
```

#### Issue: Storage permission denied
**Solusi:**
```bash
# Linux/Mac
chmod -R 777 backend/storage backend/bootstrap/cache

# Windows: Biasanya tidak ada issue permission
```

### Frontend Issues

#### Issue: "pnpm: command not found"
**Solusi:**
```bash
npm install -g pnpm
```

#### Issue: "VITE_API_BASE_URL is not defined"
**Solusi:**
1. Buat file `frontend/.env`
2. Isi dengan: `VITE_API_BASE_URL=http://localhost:8000/api`
3. Restart dev server: `Ctrl+C` lalu `pnpm dev`

#### Issue: "Module not found"
**Solusi:**
```bash
pnpm install
```

#### Issue: Port 5173 already in use
**Solusi:**
```bash
# Kill process menggunakan port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

#### Issue: Typecheck errors
**Solusi:**
```bash
# Fix linting issues
pnpm lint:fix

# Jika masih error, bisa diabaikan untuk development
# tapi sebaiknya diperbaiki sebelum commit
```

### Common Issues

#### Issue: CORS error di browser
**Solusi:**
Cek config CORS di Laravel:
- File: `backend/config/cors.php`
- Pastikan `FRONTEND_URL` sudah benar
- Pastikan `SANCTUM_STATEFUL_DOMAINS` sudah di-set di `.env`

#### Issue: Cannot access backend dari frontend
**Solusi:**
1. Pastikan backend sedang berjalan: `php artisan serve`
2. Buka http://localhost:8000 di browser
3. Cek file `frontend/.env`: `VITE_API_BASE_URL` harus `http://localhost:8000/api`

#### Issue: Hot reload tidak bekerja
**Solusi:**
1. Stop dev server: `Ctrl+C`
2. Hapus `.vite` cache folder
3. Restart: `pnpm dev`

---

## 💡 Tips & Best Practices

### Development Workflow

```bash
# 1. Start backend (Terminal 1)
cd backend
php artisan serve

# 2. Start frontend (Terminal 2)
cd frontend
pnpm dev

# 3. Coding!
#   - Edit file backend/ → auto-reload untuk PHP (tergantung config)
#   - Edit file frontend/ → auto-reload untuk React (Vite HMR)

# 4. Stop servers saat selesai
#   Ctrl+C di kedua terminal
```

### Quality Check Sebelum Commit

```bash
# Backend
cd backend
php artisan test              # Jalankan tests
php artisan pint              # Fix code style

# Frontend
cd frontend
pnpm typecheck            # TypeScript check
pnpm lint                 # ESLint check
pnpm test                 # Run tests
```

### Fresh Start

Jika ingin reset semuanya dari awal:

```bash
# Backend
cd backend
rm -rf vendor/
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed

# Frontend
cd frontend
rm -rf node_modules/ .vite/ dist/
pnpm install
```

---

## 🔒 Security Notes

### JANGAN commit ke Git:
- `backend/.env` - Environment variables dengan password
- `backend/storage/` - Bisa berisi data sensitif
- `frontend/.env` - API URLs dan config lainnya
- `node_modules/` - Dependencies terlalu besar
- `vendor/` - Dependencies terlalu besar

### Production Deployment

INI UNTUK DEVELOPMENT SAJA! Untuk production:
- Set `APP_ENV=production` di `.env`
- Set `APP_DEBUG=false`
- Gunakan web server (Nginx/Apache), bukan `php artisan serve`
- Gunakan `php artisan optimize`
- Setup SSL/HTTPS
- Setup firewall
- Backup database secara rutin

---

## 📚 Additional Resources

### Laravel
- [Official Documentation](https://laravel.com/docs)
- [Laravel Tutorials](https://laracasts.com/)

### React
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

### Tools
- [pnpm Documentation](https://pnpm.io)
- [Composer Documentation](https://getcomposer.org/doc/)

---

## ❓ FAQ

**Q: Apakah harus install PHP/MySQL di local?**  
A: Ya, untuk development manual (tanpa Docker). Atau gunakan Docker untuk environment yang terisolasi.

**Q: Bisa pakai database lain selain MySQL?**  
A: Ya! Laravel support: MySQL, PostgreSQL, SQLite, SQL Server. Ubah `DB_CONNECTION` di `.env`.

**Q: Apakah perlu install Laravel secara global?**  
A: Tidak perlu. Laravel terinstall otomatis saat `composer install` di project.

**Q: Apakah perlu install React secara global?**  
A: Tidak perlu. React terinstall saat `pnpm install` di project.

**Q: Apakah bisa pakai npm instead of pnpm?**  
A: Bisa, tapi file ini menggunakan pnpm. Jika mau pakai npm, ganti `pnpm` dengan `npm` di semua commands.

**Q: Bagaimana cara update dependencies?**  
A: 
- Backend: `composer update`
- Frontend: `pnpm update`

**Q: Bagaimana cara reset database?**  
A: `php artisan migrate:fresh --seed` akan mereset dan seed ulang.

**Q: Bisa pakai Docker instead?**  
A: Ya! Lihat file `DOCKER_READY.md` untuk setup Docker.

---

## 🆘 Butuh Bantuan?

Jika masih ada masalah:
1. Cek logs: `backend/storage/logs/laravel.log`
2. Cek error message di browser
3. Pastikan semua dependencies sudah terinstall
4. Pastikan MySQL sedang berjalan
5. Coba restart backend dan frontend

---

**Selamat coding! 🚀**

---

**Last Updated:** 2026-03-02
**Laravel Version:** 12.0
**React Version:** 18.3.1
**Node Version:** 18+
**PHP Version:** 8.2+

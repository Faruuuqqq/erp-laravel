# 🚀 Quick Setup - StoreMate Genie ERP

Setup cepat tanpa Docker - Copy paste dan jalankan!

---

## ⚡ Super Quick (5 Minutes)

```bash
# 1. Clone repo
git clone <repo-url> cd erp_laravel

# 2. Backend setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: DB_HOST=127.0.0.1, DB_DATABASE=tokosync_erp, DB_USERNAME=root, DB_PASSWORD=your_password
php artisan migrate
php artisan db:seed

# 3. Frontend setup
cd ../frontend
pnpm install
# Buat file .env dengan isi: VITE_API_BASE_URL=http://localhost:8000/api

# 4. Jalankan app (2 terminal)
# Terminal 1 - Backend:
cd backend && php artisan serve

# Terminal 2 - Frontend:
cd frontend && pnpm dev
```

**Buka browser:** http://localhost:5173

---

## 📋 Prerequisites (WAJIB)

Sebelum mulai, pastikan:

1. **PHP 8.2+**
   ```bash
   php -v
   # Harus PHP 8.2 atau lebih
   ```

2. **Composer 2.x**
   ```bash
   composer --version
   # Harus Composer 2.x
   ```

3. **Node.js 18+**
   ```bash
   node -v
   # Harus v18 atau lebih
   ```

4. **pnpm**
   ```bash
   npm install -g pnpm
   pnpm -v
   # Install global dulu kalau belum ada
   ```

5. **MySQL 8.0+**
   ```bash
   mysql --version
   # Harus MySQL 8.0 atau lebih
   # Atau buat database dulu:
   # mysql -u root -p
   # CREATE DATABASE tokosync_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Belum ada?**
- PHP: https://www.php.net/downloads
- Composer: https://getcomposer.org/download/
- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/mysql/

---

## 🔧 Detailed Setup

### 1. Backend Setup (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database (edit .env file)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=tokosync_erp
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Create database (MySQL CLI)
mysql -u root -p
CREATE DATABASE tokosync_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed
```

### 2. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
pnpm install

# Setup environment
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Optional: Check code quality
pnpm typecheck
pnpm lint
```

### 3. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
# Berjalan di http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
# Berjalan di http://localhost:5173
```

---

## 🎯 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Database:** localhost:3306 (user: root)

---

## 🔧 Common Commands

### Backend
```bash
cd backend

# Server
php artisan serve                    # Start backend

# Database
php artisan migrate                   # Run migrations
php artisan db:seed                  # Run seeders
php artisan migrate:fresh --seed       # Reset database + seed

# Other
php artisan cache:clear               # Clear cache
php artisan test                       # Run tests
```

### Frontend
```bash
cd frontend

# Server
pnpm dev                          # Start frontend

# Code quality
pnpm typecheck                     # Type checking
pnpm lint                          # Linting
pnpm test                          # Run tests

# Build
pnpm build                         # Build for production
```

---

## 🐛 Quick Fixes

### Database connection error
```bash
# 1. Cek MySQL running
mysql -u root -p

# 2. Buat database jika belum ada
CREATE DATABASE tokosync_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Cek .env settings
DB_HOST=127.0.0.1
DB_DATABASE=tokosync_erp
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Frontend can't connect to backend
```bash
# Cek frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api

# Restart frontend
# Ctrl+C lalu pnpm dev lagi
```

### Composer install failed
```bash
# Clear cache
composer clear-cache
composer install
```

### pnpm install failed
```bash
# Clear cache
pnpm store prune
pnpm install
```

---

## 🔄 Reset Everything

```bash
# Backend
cd backend
rm -rf vendor/
composer install
php artisan migrate:fresh --seed

# Frontend
cd frontend
rm -rf node_modules/ .vite/
pnpm install
```

---

## 💡 Tips

- ✅ Keep 2 terminal open (backend + frontend)
- ✅ Hot reload works automatically for frontend
- ✅ Restart backend after changing config
- ✅ Run `php artisan migrate` after new migrations
- ✅ Run `pnpm typecheck` before committing
- ✅ Use `php artisan tinker` for quick database operations

---

## 📖 Full Documentation

- **Complete setup:** `SETUP.md`
- **Docker setup:** `DOCKER_READY.md`
- **Developer guidelines:** `AGENTS.md`

---

## ❓ Stuck?

1. Check if prerequisites installed: `php -v`, `node -v`, `mysql --version`
2. Check if MySQL running: Try to connect with `mysql -u root -p`
3. Check logs: `backend/storage/logs/laravel.log`
4. Try fresh install: Follow "Reset Everything" section above

---

**Done in 5 minutes! 🎉**

---

**Created:** 2026-03-02
**Status:** ✅ Ready for use

# StoreMate Genie ERP

Sistem ERP lengkap untuk toko retail, grosir, dan distribusi dengan Laravel Backend dan React Frontend.

---

## 🎯 Tentang

StoreMate Genie ERP adalah aplikasi manajemen toko modern dengan fitur:
- ✅ **Inventory Management** - Kelola stok produk, kategori, gudang
- ✅ **Sales Management** - Penjualan tunai/kredit, invoice, surat jalan
- ✅ **Purchase Management** - Pembelian ke supplier, retur pembelian
- ✅ **Financial Management** - Piutang, utang, pembayaran
- ✅ **Customer & Supplier Management** - Database pelanggan dan supplier
- ✅ **Reporting** - Laporan harian, kartu stok, mutasi stok
- ✅ **Role-based Access** - Owner dan Admin dengan permission berbeda
- ✅ **Modern UI** - React + TypeScript + Shadcn UI
- ✅ **API First** - RESTful API dengan Laravel Sanctum

---

## 🚀 Quick Start

Pilih cara setup yang paling cocok untuk kamu:

### 🐳 Setup dengan Docker (Disarankan)
**Untuk:** Development team, environment konsisten, mudah onboarding

```bash
git clone <repo-url> cd erp_laravel
docker\setup.bat          # Windows
# atau
./docker/setup.sh          # Linux/Mac
```

📖 [Lihat Dokumentasi Docker →](DOCKER_READY.md)

### 💻 Setup Manual (Tanpa Docker)
**Untuk:** Local development, kontrol penuh, tanpa container

```bash
git clone <repo-url> cd erp_laravel

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# Frontend
cd ../frontend
pnpm install
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Jalankan (2 terminal)
cd backend && php artisan serve  # Terminal 1
cd frontend && pnpm dev          # Terminal 2
```

📖 [Lihat Dokumentasi Setup Manual →](SETUP.md)

---

## 📚 Dokumentasi

| Dokumentasi | Deskripsi |
|-------------|-----------|
| [**QUICK_SETUP.md**](QUICK_SETUP.md) | Setup super cepat (5 menit) |
| [**SETUP.md**](SETUP.md) | Setup manual lengkap dengan troubleshooting |
| [**DOCKER_READY.md**](DOCKER_READY.md) | Setup dengan Docker untuk development team |
| [**AGENTS.md**](AGENTS.md) | Guidelines untuk developer (code style, patterns) |
| [**QUICKSTART.md**](QUICKSTART.md) | Quick reference untuk Docker commands |

---

## 🏗️ Teknologi

### Backend
- **Framework:** Laravel 12.0
- **Language:** PHP 8.2+
- **Database:** MySQL 8.0+ (juga support SQLite, PostgreSQL)
- **Authentication:** Laravel Sanctum
- **PDF Generation:** Laravel DomPDF
- **Testing:** PHPUnit 11.x

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **UI Library:** Shadcn UI (Radix UI + Tailwind CSS)
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router DOM 6.30.1
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Testing:** Vitest + @testing-library/react

### Development Tools
- **Package Manager:** pnpm (frontend), Composer (backend)
- **Linting:** ESLint 9.32.0
- **Styling:** Tailwind CSS 3.4.17
- **Animations:** tailwindcss-animate

---

## 📁 Struktur Project

```
erp_laravel/
├── backend/                 # Laravel Backend API
│   ├── app/                # Application logic (Models, Controllers, etc)
│   ├── config/             # Configuration files
│   ├── database/           # Migrations & Seeders
│   ├── public/             # Public entry point
│   ├── resources/          # Views, assets
│   ├── routes/             # API routes
│   ├── storage/            # Logs, cache, uploads
│   ├── tests/              # PHPUnit tests
│   └── artisan             # Laravel CLI
│
├── frontend/                # React Frontend
│   ├── src/                # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API client
│   │   ├── contexts/        # React contexts
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   └── index.html          # HTML entry point
│
├── docker/                  # Docker setup scripts & docs
│   ├── setup.sh            # Linux/Mac setup script
│   ├── setup.bat           # Windows setup script
│   └── README.md           # Docker documentation
│
└── docs/                    # Project documentation
    ├── SETUP.md            # Manual setup guide
    ├── QUICK_SETUP.md      # Quick setup guide
    ├── AGENTS.md          # Developer guidelines
    └── DOCKER_READY.md    # Docker setup guide
```

---

## 🎯 Fitur Utama

### Inventory
- ✅ Produk dengan harga beli/jual, stok, kategori
- ✅ Multi-gudang support
- ✅ Stock movements & transfers
- ✅ Low stock alerts
- ✅ Kartu stok (stock history)

### Sales & Purchase
- ✅ Penjualan tunai & kredit
- ✅ Pembelian dari supplier
- ✅ Invoice & surat jalan
- ✅ Retur penjualan & pembelian
- ✅ Pembayaran piutang & utang

### Financial
- ✅ Tracking piutang customer
- ✅ Tracking utang supplier
- ✅ Pembayaran dengan berbagai metode
- ✅ Laporan kas masuk/keluar

### User Management
- ✅ Role-based access (Owner, Admin)
- ✅ Authentication dengan Sanctum
- ✅ Permission management

### Reporting
- ✅ Laporan harian
- ✅ Laporan penjualan
- ✅ Laporan stok
- ✅ Laporan keuangan

---

## 🔑 Default Credentials

Setelah menjalankan seeder:

### Backend API
- **Email:** `admin@example.com` (atau sesuai di seeder)
- **Password:** `password` (atau sesuai di seeder)

### Database
- **Database:** `tokosync_erp`
- **Username:** `root` (default MySQL)
- **Password:** (sesuai install MySQL)

---

## 🛠️ Development Commands

### Backend (Laravel)
```bash
cd backend

# Server
php artisan serve              # Start dev server (port 8000)

# Database
php artisan migrate            # Run migrations
php artisan db:seed           # Run seeders
php artisan migrate:fresh --seed  # Reset database + seed

# Code Quality
php artisan pint             # Fix code style
php artisan test             # Run tests

# Cache
php artisan cache:clear       # Clear all cache
php artisan optimize          # Cache for production
```

### Frontend (React)
```bash
cd frontend

# Server
pnpm dev                   # Start dev server (port 5173)

# Code Quality
pnpm typecheck             # TypeScript check
pnpm lint                  # ESLint check
pnpm test                  # Run tests

# Build
pnpm build                 # Build for production
pnpm preview               # Preview production build

# Dependencies
pnpm install              # Install dependencies
pnpm update               # Update dependencies
```

---

## 🐳 Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Access containers
docker-compose exec backend sh
docker-compose exec frontend sh

# Database
docker-compose exec backend php artisan migrate
docker-compose exec db mysql -u devuser -pdevpass
```

📖 [Lihat selengkapnya di DOCKER_READY.md](DOCKER_READY.md)

---

## 📋 Prerequisites

### Untuk Setup Manual
- PHP 8.2+
- Composer 2.x
- Node.js 18+
- pnpm (npm install -g pnpm)
- MySQL 8.0+ atau SQLite

### Untuk Setup Docker
- Docker Desktop atau Docker Engine
- Docker Compose (included)
- 4GB RAM minimum
- 10GB disk space

---

## 🧪 Testing

### Backend
```bash
cd backend
php artisan test              # Run all tests
php artisan test --filter testName  # Run specific test
```

### Frontend
```bash
cd frontend
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
```

---

## 🤝 Kontribusi

Untuk kontribusi ke project:
1. Fork repository
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m "Add nama fitur"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Open Pull Request

### Code Quality
- Ikuti guidelines di [AGENTS.md](AGENTS.md)
- Jalankan tests sebelum commit
- Follow Laravel & React best practices

---

## 📜 License

Project ini dilindungi oleh hak cipta. Lihat file LICENSE untuk detail.

---

## 📞 Support

### Dokumentasi
- [Setup Manual](SETUP.md)
- [Setup Docker](DOCKER_READY.md)
- [Developer Guidelines](AGENTS.md)
- [Quick Start](QUICK_SETUP.md)

### Issue & Bug
Buat issue di GitHub repository dengan:
- Deskripsi detail masalah
- Environment info (OS, PHP version, Node version)
- Steps to reproduce
- Screenshot/error log jika ada

---

## 🔗 Links

- **Laravel:** https://laravel.com
- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Shadcn UI:** https://ui.shadcn.com

---

## 🎉 Selamat Datang!

Terima kasih sudah menggunakan StoreMate Genie ERP!

Jika ada pertanyaan atau butuh bantuan:
- Cek dokumentasi di folder ini
- Baca [AGENTS.md](AGENTS.md) untuk developer guidelines
- Hubungi tim support

**Selamat mengembangkan! 🚀**

---

**Version:** 1.0.0
**Last Updated:** 2026-03-02
**Status:** ✅ Active Development

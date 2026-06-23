# Product Requirements Document (PRD)
## Sistem Manajemen Toko — Point of Sale & ERP

**Versi**: 1.0  
**Tanggal**: April 2026  
**Status**: Draft untuk Review  

---

## 1. Executive Summary

### Problem Statement

Toko/distributor yang beroperasi secara manual atau dengan sistem yang tidak terintegrasi menghadapi kesulitan dalam mengelola transaksi penjualan tunai/kredit, memantau stok secara real-time, melacak piutang dan utang, serta menghasilkan laporan harian yang akurat. Akibatnya, terjadi kebocoran data, selisih kas, dan sulitnya audit finansial.

### Proposed Solution

Sistem POS & ERP berbasis web yang terintegrasi penuh, mencakup manajemen master data (customer, supplier, produk, gudang, sales), siklus transaksi lengkap (pembelian, penjualan tunai/kredit, retur, pembayaran), serta laporan dan informasi real-time dengan kontrol akses berbasis role (Owner & Admin).

### Success Criteria

| KPI | Target |
|-----|--------|
| Waktu input transaksi | ≤ 2 menit per transaksi |
| Akurasi saldo stok | 100% sinkron real-time setelah transaksi |
| Waktu cetak dokumen (PDF) | ≤ 3 detik per dokumen |
| Ketersediaan sistem | ≥ 99.5% uptime |
| Akurasi laporan harian | Zero discrepancy vs. data transaksi |

---

## 2. User Personas & Access Control

### 2.1 Persona

**Owner**
- Pemilik toko/bisnis
- Kebutuhan: visibilitas penuh atas semua transaksi dan laporan, kontrol penuh atas sistem, kemampuan menyembunyikan transaksi tertentu dari histori admin, manajemen akun admin dan izinnya

**Admin**
- Staf operasional (kasir, gudang, admin keuangan)
- Kebutuhan: akses sesuai izin yang dikonfigurasi owner; menjalankan transaksi harian; mencetak dokumen

### 2.2 Role & Permission System

Owner memiliki akses penuh yang tidak dapat dibatasi. Owner dapat membuat akun admin dan mengatur izin granular per fitur, antara lain:

- Akses lihat / tambah / edit / hapus pada setiap modul
- Akses ke laporan keuangan dan informasi finansial
- Kemampuan melihat transaksi yang di-hide oleh owner
- Akses ke pengaturan sistem

**Aturan**: Permission admin dikonfigurasi oleh owner melalui halaman "Manajemen Admin". Perubahan izin langsung aktif tanpa perlu logout.

---

## 3. Modul & Fungsionalitas

### 3.1 Master Data

Semua halaman master data ditampilkan dalam bentuk tabel dengan fitur pencarian, filter, dan pagination.

---

#### 3.1.1 Supplier

**Skema Database:**

| Field | Tipe | Keterangan |
|-------|------|-----------|
| id_supplier | VARCHAR PK | Auto-generated |
| nama_supplier | VARCHAR(100) | Required |
| alamat | TEXT | |
| kota | VARCHAR(50) | |
| telepon_1 | VARCHAR(20) | |
| telepon_2 | VARCHAR(20) | |
| email | VARCHAR(100) | |
| no_rekening | VARCHAR(50) | |

**User Stories:**
- Sebagai admin, saya ingin melihat daftar supplier dalam bentuk tabel agar mudah mencari data.
- Sebagai admin, saya ingin menambahkan supplier baru dengan form terstruktur.
- Sebagai admin, saya ingin mengedit dan menghapus data supplier.

**Acceptance Criteria:**
- Tabel menampilkan kolom: ID, Nama, Kota, Telepon 1, Email, No. Rekening, Aksi
- Fitur pencarian real-time berdasarkan nama dan kota
- Validasi: Nama Supplier wajib diisi, Email harus format valid jika diisi
- Konfirmasi dialog sebelum penghapusan data

---

#### 3.1.2 Customer

**Skema Database:**

| Field | Tipe | Keterangan |
|-------|------|-----------|
| id_customer | VARCHAR PK | Auto-generated |
| nama_customer | VARCHAR(100) | Required |
| alamat | TEXT | |
| kota | VARCHAR(50) | |
| telepon_1 | VARCHAR(20) | |
| telepon_2 | VARCHAR(20) | |
| email | VARCHAR(100) | |
| limit_kredit | DECIMAL(15,2) | Default 0 |
| discount | DECIMAL(5,2) | Persentase, default 0 |
| gudang | VARCHAR FK | Referensi ke tabel Gudang |
| price_list | VARCHAR(50) | Nama price list yang berlaku |
| daerah | VARCHAR(50) | |
| keterangan | TEXT | |
| npwp | VARCHAR(20) | |

**User Stories:**
- Sebagai admin, saya ingin melihat daftar customer beserta informasi utang/piutang aktif.
- Sebagai admin, saya ingin menambahkan customer baru dengan data lengkap termasuk limit kredit.
- Sebagai owner, saya ingin melihat customer mana yang memiliki saldo piutang outstanding.

**Acceptance Criteria:**
- Tabel menampilkan: ID, Nama, Kota, Telepon 1, Limit Kredit, Saldo Piutang, Aksi
- Badge indikator berwarna pada kolom "Saldo Piutang" jika > 0
- Filter berdasarkan daerah dan kota
- Field NPWP divalidasi format (opsional, bisa dikosongkan)

---

#### 3.1.3 Produk

**Skema Database:**

| Field | Tipe | Keterangan |
|-------|------|-----------|
| kode_produk | VARCHAR PK | |
| nama_produk | VARCHAR(150) | Required |
| kategori | VARCHAR FK | Referensi ke tabel Kategori |
| harga_beli | DECIMAL(15,2) | |
| harga_jual | DECIMAL(15,2) | |
| satuan | VARCHAR(20) | |
| stok_minimum | INT | |
| keterangan | TEXT | |

**User Stories:**
- Sebagai admin, saya ingin melihat daftar produk beserta kategori dan harganya.
- Sebagai admin, saya ingin mengubah nama, harga, dan kategori produk langsung dari tabel.
- Sebagai admin, saya ingin mengelola kategori produk (tambah, ubah, hapus).

**Acceptance Criteria:**
- Tabel produk: Kode, Nama, Kategori, Harga Beli, Harga Jual, Satuan, Aksi
- Inline edit untuk nama dan harga dari tampilan tabel
- Sub-halaman "Kategori" untuk manajemen kategori produk
- Filter berdasarkan kategori

---

#### 3.1.4 Gudang

**User Stories:**
- Sebagai admin, saya ingin melihat daftar gudang yang tersedia.

**Acceptance Criteria:**
- Tabel menampilkan: ID Gudang, Nama Gudang, Lokasi/Alamat, Keterangan, Aksi
- Tambah, edit, dan hapus gudang

---

#### 3.1.5 Sales

**User Stories:**
- Sebagai admin, saya ingin melihat daftar sales beserta informasinya.
- Sebagai admin, saya ingin menambahkan data sales baru.

**Acceptance Criteria:**
- Tabel: ID, Nama Sales, Telepon, Email, Aksi
- Form tambah/edit sales

---

### 3.2 Transaksi

---

#### 3.2.1 Pembelian

Mencatat pembelian barang dari supplier/distributor.

**User Stories:**
- Sebagai admin, saya ingin membuat nota pembelian ke supplier agar stok bertambah dan utang tercatat.

**Acceptance Criteria:**
- Form pembelian: Tanggal, Nomor Nota, Pilih Supplier, Gudang tujuan
- Detail item: Pilih Produk, Qty, Harga Satuan, Diskon, Subtotal
- Tombol tambah/hapus baris item
- Pilihan: Bayar tunai (tidak membuat utang) atau kredit (mencatat utang)
- Setelah disimpan: stok bertambah, utang tercatat jika kredit
- Nomor nota otomatis dengan format yang dapat dikonfigurasi

---

#### 3.2.2 Penjualan Tunai

**User Stories:**
- Sebagai admin, saya ingin membuat transaksi penjualan tunai agar stok berkurang dan pendapatan tercatat.

**Acceptance Criteria:**
- Form: Tanggal, Nomor Nota (otomatis), Pilih Customer (opsional), Pilih Sales (opsional), Gudang
- Detail item: Produk, Qty, Harga Jual, Diskon, Subtotal
- Total otomatis dengan perhitungan diskon dan pajak (jika ada)
- Status pembayaran: Lunas langsung
- Setelah simpan: stok berkurang, pendapatan tercatat
- Dokumen dapat di-print sebagai PDF (surat tanpa harga = surat jalan, dengan harga = faktur)

---

#### 3.2.3 Penjualan Kredit

**User Stories:**
- Sebagai admin, saya ingin membuat transaksi penjualan kredit agar piutang customer tercatat.

**Acceptance Criteria:**
- Sama dengan penjualan tunai, dengan tambahan:
- Wajib pilih Customer
- Sistem mengecek limit kredit customer; warning jika melebihi limit
- Piutang otomatis terbuat setelah transaksi disimpan
- Field "Jatuh Tempo" wajib diisi
- Owner dapat menandai transaksi kredit tertentu sebagai "hidden" — transaksi tidak muncul di histori admin yang tidak punya izin melihat

---

#### 3.2.4 Pembayaran Utang

Mencatat pembayaran atas utang toko ke supplier.

**Acceptance Criteria:**
- Pilih Supplier → tampil daftar nota utang yang belum lunas
- Pilih nota yang akan dibayar (bisa partial payment)
- Input jumlah bayar, tanggal, metode pembayaran
- Saldo utang otomatis berkurang

---

#### 3.2.5 Pembayaran Piutang

Mencatat pembayaran yang diterima dari customer.

**Acceptance Criteria:**
- Pilih Customer → tampil daftar nota piutang yang belum lunas
- Pilih nota yang akan dilunasi (bisa partial)
- Input jumlah terima, tanggal, metode
- Saldo piutang customer otomatis berkurang

---

#### 3.2.6 Retur Pembelian

Surat retur barang yang dikembalikan ke distributor.

**Acceptance Criteria:**
- Referensi dari nota pembelian yang sudah ada
- Pilih item dan qty yang diretur
- Generate dokumen "Surat Retur ke Distributor" yang dapat di-print PDF
- Stok berkurang, utang berkurang (jika pembelian kredit)

---

#### 3.2.7 Retur Penjualan

Surat terima barang yang dikembalikan oleh pembeli.

**Acceptance Criteria:**
- Referensi dari nota penjualan yang sudah ada
- Pilih item dan qty yang diretur
- Generate dokumen "Surat Terima Retur dari Customer" yang dapat di-print PDF
- Stok bertambah, piutang berkurang (jika penjualan kredit)

---

#### 3.2.8 Surat Jalan

Dokumen pengiriman barang ke customer — **tanpa mencantumkan harga**.

**Acceptance Criteria:**
- Dapat dibuat mandiri atau berdasarkan transaksi penjualan
- Berisi: Nomor Surat Jalan, Tanggal, Customer, Alamat Pengiriman, Daftar Barang (Nama, Qty, Satuan) — **tanpa kolom harga**
- Print sebagai PDF — hanya surat jalan, bukan tampilan halaman browser
- Kolom tanda tangan pengirim dan penerima

---

#### 3.2.9 Kontra Bon

Daftar bon/faktur yang belum dilunasi, dipilah per customer dan tanggal.

**Acceptance Criteria:**
- Filter berdasarkan nama customer dan rentang tanggal
- Tampilkan: Nomor Faktur, Tanggal Faktur, Jatuh Tempo, Jumlah, Sisa Bayar
- Total outstanding per customer
- Dapat di-print atau export PDF

---

### 3.3 Informasi (Histori)

Semua halaman informasi menampilkan histori transaksi dengan filter tanggal dan kemampuan print/export PDF.

| Halaman | Isi |
|---------|-----|
| Pembelian | Histori pembelian ke supplier/distributor |
| Penjualan | Histori semua penjualan (dengan filter hide untuk admin non-izin) |
| Retur Pembelian | Histori barang yang diretur ke distributor |
| Retur Penjualan | Histori barang yang diretur oleh konsumen |
| Biaya/Jasa | Histori pengeluaran biaya di luar transaksi toko |
| Pembayaran Utang | Histori semua pembayaran utang |
| Pembayaran Piutang | Histori semua pembayaran piutang |

**Acceptance Criteria (berlaku untuk semua):**
- Filter: rentang tanggal (default: hari ini), supplier/customer (jika relevan)
- Pagination dengan 25/50/100 record per halaman
- Tombol "Print" dan "Export PDF" per halaman
- Klik pada nomor transaksi → buka detail transaksi tersebut

---

### 3.4 Informasi Tambahan (Laporan)

---

#### 3.4.1 Saldo Piutang

Daftar semua customer yang memiliki saldo piutang outstanding.

**Acceptance Criteria:**
- Tabel: Nama Customer, Total Transaksi, Total Bayar, Sisa Piutang
- Total keseluruhan di footer tabel
- Klik customer → detail nota per nota

---

#### 3.4.2 Saldo Utang

Daftar semua utang toko yang belum lunas.

**Acceptance Criteria:**
- Tabel: Nama Supplier, Total Utang, Total Bayar, Sisa Utang
- Total keseluruhan di footer
- Klik supplier → detail per nota

---

#### 3.4.3 Saldo Stok

Tampilan lengkap semua produk dengan stok dan nilai persediaan.

**Skema tampilan:**

| Kode Produk | Nama Produk | Kategori | Gudang | Saldo Stok |
|-------------|-------------|----------|--------|-----------|
| PRD001 | Nama Produk | Kategori A | Gudang Utama | 150 |

**Acceptance Criteria:**
- Filter berdasarkan kategori dan gudang
- Kolom nilai persediaan (Saldo Stok × Harga Beli)
- Total nilai persediaan di footer
- Export PDF dan Print
- Jika produk ada di beberapa gudang, muncul sebagai baris terpisah

---

#### 3.4.4 Kartu Stok

Histori pergerakan stok suatu produk.

**Acceptance Criteria:**
- Pilih produk dan periode
- Kolom: Tanggal, Keterangan, Masuk, Keluar, Saldo
- Saldo berjalan dikalkulasi setiap baris
- Print sebagai PDF

---

#### 3.4.5 Laporan Harian

Ringkasan transaksi per hari.

**Acceptance Criteria:**
- Pilih tanggal (default: hari ini)
- Tampilkan: Total Penjualan Tunai, Total Penjualan Kredit, Total Penerimaan Piutang, Total Pembelian, Total Pembayaran Utang, Biaya/Jasa, Saldo Kas Hari Ini
- Detail per transaksi dalam tabel di bawah ringkasan
- Print PDF = dokumen laporan harian, bukan tampilan browser

---

## 4. Spesifikasi Teknis

### 4.1 Arsitektur Umum

```
Frontend (Web App)
    │
    ├── Halaman Master Data (CRUD via REST API)
    ├── Halaman Transaksi (Form → API → DB update)
    ├── Halaman Informasi (Query + Filter → Render)
    └── Laporan (Query → PDF Generator)
         │
         ▼
   Backend (REST API)
         │
         ├── Auth Service (JWT, Role & Permission)
         ├── Transaction Service
         ├── Inventory Service (Stok update atomic)
         ├── Finance Service (Piutang, Utang, Kas)
         └── Report Service (PDF Generation)
              │
              ▼
        Database (Relational DB)
```

### 4.2 Database — Tabel Utama

| Tabel | Keterangan |
|-------|-----------|
| customers | Data customer (sesuai skema 3.1.2) |
| suppliers | Data supplier (sesuai skema 3.1.1) |
| products | Data produk |
| categories | Kategori produk |
| warehouses | Data gudang |
| sales_persons | Data sales |
| purchases | Header nota pembelian |
| purchase_items | Detail item pembelian |
| sales_orders | Header nota penjualan (tunai & kredit) |
| sales_order_items | Detail item penjualan |
| purchase_returns | Header retur pembelian |
| sales_returns | Header retur penjualan |
| payments_in | Penerimaan pembayaran piutang |
| payments_out | Pembayaran utang |
| delivery_orders | Surat jalan |
| stock_ledger | Kartu stok (setiap mutasi stok) |
| ar_balance | Saldo piutang per customer |
| ap_balance | Saldo utang per supplier |
| expenses | Biaya/jasa |
| users | Akun pengguna (owner & admin) |
| permissions | Konfigurasi izin per admin |

### 4.3 Fitur Print & PDF

**Best Practice yang Wajib Diikuti:**

- Semua dokumen di-generate sebagai PDF di sisi server (atau menggunakan browser Print API dengan CSS `@media print` yang terdedikasi)
- Tombol "Print" membuka jendela print browser **hanya untuk konten dokumen** — bukan seluruh halaman aplikasi
- Implementasi: buat komponen dokumen terpisah (PrintableDocument) yang di-render di hidden iframe atau jendela baru, lalu trigger `window.print()`
- CSS print stylesheet wajib mendefinisikan: ukuran kertas (A4 atau F4), margin, font, dan menyembunyikan elemen UI aplikasi (navbar, sidebar, tombol)
- Setiap dokumen (faktur, surat jalan, kontra bon, laporan) memiliki template print tersendiri
- Kualitas output: teks tajam, tabel tidak terpotong antar halaman, nomor halaman untuk dokumen multi-halaman

**Dokumen yang memerlukan print:**
- Faktur penjualan (dengan harga)
- Surat jalan (tanpa harga)
- Kontra bon
- Surat retur pembelian
- Surat retur penjualan
- Laporan harian
- Saldo stok
- Kartu stok

### 4.4 Autentikasi & Keamanan

- Login menggunakan username + password
- Session berbasis JWT dengan expiry yang dapat dikonfigurasi
- Owner login → akses penuh
- Admin login → akses sesuai permission yang dikonfigurasi owner
- Password di-hash dengan bcrypt (cost factor ≥ 12)
- Failed login: lockout setelah 5 percobaan gagal berturut-turut
- Semua API endpoint divalidasi token + permission sebelum eksekusi

### 4.5 Fitur Hide Transaksi (Owner Only)

- Owner dapat menandai transaksi penjualan tertentu sebagai `is_hidden = true`
- Transaksi hidden tidak muncul di histori yang dapat dilihat admin kecuali admin memiliki izin "Lihat Transaksi Hidden"
- Data tetap tersimpan di database dan masuk ke kalkulasi laporan owner
- Indikator visual khusus di sisi owner untuk membedakan transaksi hidden

---

## 5. Non-Goals (Tidak Dibangun dalam Scope Ini)

- Integrasi dengan marketplace (Tokopedia, Shopee, dll)
- Fitur loyalty/poin customer
- Modul payroll / penggajian karyawan
- Modul akuntansi lengkap (jurnal, neraca, laporan laba rugi)
- Aplikasi mobile native (Android/iOS)
- Integrasi payment gateway

---

## 6. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|---------|
| Stok tidak sinkron karena concurrent transaction | Tinggi | Implementasi optimistic locking / transaksi database ACID |
| Print PDF gagal atau tidak sesuai | Sedang | Dedicated print stylesheet + pengujian di berbagai browser dan ukuran kertas |
| Data permission admin tidak diperbarui real-time | Sedang | Refresh permission dari server setiap request, bukan hanya saat login |
| Kebocoran data transaksi hidden ke admin | Tinggi | API-level filtering — hidden transactions tidak pernah dikirim ke client admin non-izin |
| Performa lambat pada laporan data besar | Sedang | Indexing database yang tepat, pagination, dan async loading untuk laporan besar |

---

## 7. Roadmap

### MVP (Fase 1)
- Login & manajemen user (owner + admin dengan basic permission)
- Master data: Customer, Supplier, Produk, Gudang, Sales
- Transaksi: Penjualan Tunai, Penjualan Kredit, Pembayaran Piutang
- Laporan: Saldo Piutang, Saldo Stok

### v1.1 (Fase 2)
- Transaksi: Pembelian, Pembayaran Utang, Retur Pembelian, Retur Penjualan
- Surat Jalan, Kontra Bon
- Informasi histori (semua modul)
- Fitur hide transaksi oleh owner

### v2.0 (Fase 3)
- Sistem permission granular per admin
- Kartu Stok, Laporan Harian lengkap
- Print/PDF berkualitas produksi untuk semua dokumen
- Optimasi performa dan keamanan lanjutan

---

*Dokumen ini adalah living document. Setiap perubahan scope harus divalidasi dengan product owner dan diperbarui di sini.*
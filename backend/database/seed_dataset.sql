-- StoreMate ERP - Complete Seed Dataset
-- Generated: 2025-03-01
-- Description: 7 days of realistic ERP data (Feb 22-28, 2025)
-- Usage: Import directly via phpMyAdmin or MySQL client
-- Or use Laravel seeders for more control

-- Disable foreign key checks for faster imports
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (uncomment to reset database)
TRUNCATE TABLE delivery_notes;
TRUNCATE TABLE return_purchases;
TRUNCATE TABLE return_sale_items;
TRUNCATE TABLE return_purchases;
TRUNCATE TABLE return_purchase_items;
TRUNCATE TABLE stock_mutations;
TRUNCATE TABLE financial_ledgers;
TRUNCATE TABLE transaction_details;
TRUNCATE TABLE transactions;
TRUNCATE TABLE sales_reps;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE products;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, name, email, password, role, is_active, email_verified_at, created_at, updated_at) VALUES
(1, 'Pemilik Toko', 'owner@tokosync.local', '$2y$10$abcdefghijklmnopqrstuvwx', 'owner', 1, NOW(), NOW()),
(2, 'Admin Kasir', 'admin@tokosync.local', '$2y$10$abcdefghijklmnopqrstuvwx', 'admin', 1, NOW(), NOW());

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, created_at, updated_at) VALUES
(1, 'Makanan', NOW(), NOW()),
(2, 'Minuman', NOW(), NOW()),
(3, 'Sembako', NOW(), NOW()),
(4, 'Elektronik', NOW(), NOW()),
(5, 'Peralatan', NOW(), NOW()),
(6, 'Kebersihan', NOW(), NOW()),
(7, 'Kesehatan', NOW(), NOW()),
(8, 'Lain-lain', NOW(), NOW());

-- ============================================
-- WAREHOUSES
-- ============================================
INSERT INTO warehouses (id, name, address, total_products, status, created_at, updated_at) VALUES
(1, 'Gudang Utama', 'Jl. Industri No. 1, Jakarta Industrial Estate', 350, 'active', NOW(), NOW()),
(2, 'Gudang Cabang A', 'Jl. Raya Pahlawan No. 100, Bandung', 180, 'active', NOW(), NOW()),
(3, 'Gudang Cabang B', 'Jl. Karang Pilang No. 50, Surabaya', 220, 'active', NOW(), NOW());

-- ============================================
-- SUPPLIERS (15 suppliers)
-- ============================================
INSERT INTO suppliers (id, name, phone, email, address, balance, created_at, updated_at) VALUES
(1, 'PT. Distributor Jaya Abadi', '08123456789', 'info@distributorjaya.co.id', 'Jl. Sudirman No. 123, Jakarta', -2500000, NOW(), NOW()),
(2, 'CV. Sumber Makmur Sejahtera', '08234567890', 'sales@sumbermakmur.com', 'Jl. Gatot Subroto Kav. 5, Bandung', 1500000, NOW(), NOW()),
(3, 'UD. Berkah Barokah', '0856789012', 'order@berkahbarokah.id', 'Jl. Ahmad Yani No. 45, Surabaya', -1800000, NOW(), NOW()),
(4, 'PT. Grosir Utama Nusantara', '08789012345', 'supply@grosirnusantara.com', 'Jl. Pemuda No. 67, Semarang', 0, NOW(), NOW()),
(5, 'CV. Anugerah Sentosa', '08901234567', 'purchasing@anugerahsentosa.co.id', 'Jl. Merdeka No. 89, Yogyakarta', 3200000, NOW(), NOW()),
(6, 'PT. Pangan Berkah', '+62 811 2345 6789', 'info@panganberkah.com', 'Jl. Asia Afrika Kav. 10, Jakarta', -4500000, NOW(), NOW()),
(7, 'UD. Maju Jaya Mandiri', '+62 812 3456 7890', 'sales@majujaya.com', 'Jl. Soekarno Hatta No. 25, Bekasi', -1200000, NOW(), NOW()),
(8, 'CV. Harapan Baru', '08129876543', 'order@harapanbaru.id', 'Jl. Diponegoro No. 200, Jakarta', 500000, NOW(), NOW()),
(9, 'PT. Mitra Dagang Sejahtera', '08219876543', 'supply@mitradagang.com', 'Jl. Gatot Subroto Kav. 15, Jakarta', 2800000, NOW(), NOW()),
(10, 'UD. Sejahtera Sentosa', '08561234567', 'info@sejahterasentosa.id', 'Jl. Basuki Rahmat No. 78, Surabaya', -900000, NOW(), NOW()),
(11, 'PT. Berkah Abadi Jaya', '08761234567', 'purchasing@berkahabadi.com', 'Jl. Ahmad Yani No. 156, Semarang', 1500000, NOW(), NOW()),
(12, 'CV. Makmur Sentosa', '08919876543', 'sales@makmursentosa.co.id', 'Jl. Pemuda No. 234, Jakarta', -3800000, NOW(), NOW()),
(13, 'UD. Pangan Berkah', '08134567890', 'info@panganberkah.id', 'Jl. Merdeka No. 145, Yogyakarta', 950000, NOW(), NOW()),
(14, 'PT. Distributor Utama', '08234567891', 'sales@distributorutama.com', 'Jl. Gatot Subroto Kav. 20, Jakarta', -2100000, NOW(), NOW()),
(15, 'CV. Berkah Sejahtera', '08567890123', 'info@berkahsejahtera.id', 'Jl. Ahmad Yani No. 200, Semarang', 750000, NOW(), NOW());

-- ============================================
-- CUSTOMERS (15 customers)
-- ============================================
INSERT INTO customers (id, name, phone, email, address, balance, created_at, updated_at) VALUES
(1, 'Toko Makmur Jaya', '08123456789', 'makmurbintar@gmail.com', 'Jl. Diponegoro No. 45, Jakarta', 2500000, NOW(), NOW()),
(2, 'CV. Berkah Abadi', '08234567890', 'berkahabadi@yahoo.com', 'Jl. Gatot Subroto Kav. 12, Bandung', 1500000, NOW(), NOW()),
(3, 'Warung Bu Siti', '0856789012', 'warungbutsiti@gmail.com', 'Jl. Ahmad Yani No. 89, Surabaya', -850000, NOW(), NOW()),
(4, 'Pasar Gede Indah', '08789012345', 'info@pasargede.com', 'Jl. Pemuda No. 67, Semarang', -1200000, NOW(), NOW()),
(5, 'Toko Serba Ada', '08901234567', 'serbaada@yahoo.com', 'Jl. Merdeka No. 145, Yogyakarta', 0, NOW(), NOW()),
(6, 'Minimarket Sentosa', '08129876543', 'minimarket@gmail.com', 'Jl. Asia Afrika Kav. 23, Jakarta', -450000, NOW(), NOW()),
(7, 'UD. Maju Bersama', '08219876543', 'majubersama@gmail.com', 'Jl. Diponegoro No. 234, Jakarta', 750000, NOW(), NOW()),
(8, 'CV. Harapan Baru', '08561234567', 'harapanbaru@yahoo.com', 'Jl. Basuki Rahmat No. 67, Surabaya', -2800000, NOW(), NOW()),
(9, 'Pasar Tradisional Sejahtera', '08761234567', 'pasartadi@gmail.com', 'Jl. Ahmad Yani No. 234, Semarang', 500000, NOW(), NOW()),
(10, 'Toko Berkah Raya', '08919876543', 'berkahraya@yahoo.com', 'Jl. Pemuda No. 156, Jakarta', -650000, NOW(), NOW()),
(11, 'Indomaret Pusat', '08134567890', 'indomaret@gmail.com', 'Jl. Merdeka No. 289, Yogyakarta', 3200000, NOW(), NOW()),
(12, 'Alfamart Cabang', '08229876543', 'alfamart@gmail.com', 'Jl. Asia Afrika Kav. 45, Jakarta', -1800000, NOW(), NOW()),
(13, 'Warung Makan Jaya', '08562345678', 'warungmakanjaya@gmail.com', 'Jl. Basuki Rahmat No. 89, Surabaya', 120000, NOW(), NOW()),
(14, 'Pasar Swalayan Makmur', '08762345678', 'swalayanmakmur@yahoo.com', 'Jl. Ahmad Yani No. 345, Semarang', -950000, NOW(), NOW()),
(15, 'Toko Grosir Nusantara', '08962345678', 'grosirnusantara@gmail.com', 'Jl. Merdeka No. 234, Yogyakarta', 500000, NOW(), NOW());

-- ============================================
-- SALES REPS (8 sales reps)
-- ============================================
INSERT INTO sales_reps (id, name, phone, email, address, total_sales, status, created_at, updated_at) VALUES
(1, 'Budi Santoso', '08123456789', 'budi.santoso@tokosync.com', 'Jl. Merdeka No. 123, Jakarta', 15000000, 'active', NOW(), NOW()),
(2, 'Siti Aminah', '08234567890', 'siti.aminah@tokosync.com', 'Jl. Gatot Subroto Kav. 5, Bandung', 25000000, 'active', NOW(), NOW()),
(3, 'Ahmad Fauzi', '0856789012', 'ahmad.fauzi@tokosync.com', 'Jl. Ahmad Yani No. 45, Surabaya', 18500000, 'active', NOW(), NOW()),
(4, 'Rina Wati', '08789012345', 'rina.wati@tokosync.com', 'Jl. Pemuda No. 67, Semarang', 22000000, 'active', NOW(), NOW()),
(5, 'Dedi Kurniawan', '08901234567', 'dedi.kurniawan@tokosync.com', 'Jl. Merdeka No. 89, Yogyakarta', 12000000, 'active', NOW(), NOW()),
(6, 'Lestari Sari', '08129876543', 'lestari.sari@tokosync.com', 'Jl. Diponegoro No. 200, Jakarta', 30000000, 'active', NOW(), NOW()),
(7, 'Joko Susilo', '08219876543', 'joko.susilo@tokosync.com', 'Jl. Gatot Subroto Kav. 15, Jakarta', 18000000, 'active', NOW(), NOW()),
(8, 'Agus Setiawan', '08572345678', 'agus.setiawan@tokosync.com', 'Jl. Basuki Rahmat No. 67, Surabaya', 28000000, 'active', NOW(), NOW());

-- ============================================
-- PRODUCTS (28 products)
-- ============================================
INSERT INTO products (id, code, name, category_id, buy_price, sell_price, stock, min_stock, unit, warehouse_id, total_sales, avg_daily_sales, days_of_stock, created_at, updated_at) VALUES
(1, 'PRD001', 'Beras Premium 5kg', 1, 45000, 55000, 50, 10, 'pcs', 1, 250000, 25, 2, NOW(), NOW()),
(2, 'PRD002', 'Minyak Goreng 2L', 1, 28000, 35000, 35, 8, 'liter', 1, 180000, 15, 2, NOW(), NOW()),
(3, 'PRD003', 'Gula Pasir 1kg', 1, 12000, 15000, 80, 15, 'kg', 1, 320000, 40, 2, NOW(), NOW()),
(4, 'PRD004', 'Sabun Mandi 250ml', 7, 15000, 20000, 60, 12, 'pcs', 1, 150000, 20, 3, NOW(), NOW()),
(5, 'PRD005', 'Pasta Gigi 75g', 7, 8000, 12000, 45, 10, 'pcs', 1, 90000, 15, 3, NOW(), NOW()),
(6, 'PRD006', 'Shampo Botol 200ml', 7, 18000, 25000, 55, 10, 'pcs', 1, 210000, 22, 2, NOW(), NOW()),
(7, 'PRD007', 'Roti Tawar', 1, 15000, 20000, 40, 8, 'pcs', 1, 160000, 25, 1, NOW(), NOW()),
(8, 'PRD008', 'Telur Ayam 10pcs', 1, 25000, 35000, 70, 12, 'pcs', 1, 420000, 30, 2, NOW(), NOW()),
(9, 'PRD009', 'Susu UHT 1L', 2, 18000, 22000, 35, 8, 'liter', 1, 110000, 18, 1, NOW(), NOW()),
(10, 'PRD010', 'Mie Instan Goreng', 3, 3000, 4000, 4, 10, 'pcs', 1, 15000, 5, 0, NOW(), NOW()),
(11, 'PRD011', 'Kecap Botol 250ml', 3, 8000, 12000, 12, 8, 'pcs', 1, 50000, 10, 1, NOW(), NOW()),
(12, 'PRD012', 'Garam 500g', 3, 3000, 5000, 8, 6, 'pcs', 1, 8000, 8, 1, NOW(), NOW()),
(13, 'PRD013', 'Teh Kotak 25 Tea Bags', 2, 35000, 45000, 30, 8, 'pcs', 1, 180000, 20, 1, NOW(), NOW()),
(14, 'PRD014', 'Kopi Sachet Premium', 2, 5000, 7000, 100, 15, 'pcs', 1, 210000, 25, 4, NOW(), NOW()),
(15, 'PRD015', 'Air Mineral 600ml', 2, 3000, 5000, 150, 20, 'pcs', 1, 150000, 18, 8, NOW(), NOW()),
(16, 'PRD016', 'Biskuit Kaleng', 3, 8000, 12000, 25, 10, 'pcs', 1, 75000, 12, 2, NOW(), NOW()),
(17, 'PRD017', 'Wafer Coklat', 3, 5000, 8000, 18, 6, 'pcs', 1, 42000, 8, 2, NOW(), NOW()),
(18, 'PRD018', 'Keripik Pisang 100g', 3, 7000, 10000, 14, 5, 'pcs', 1, 35000, 10, 1, NOW(), NOW()),
(19, 'PRD019', 'Baterai AA', 4, 15000, 20000, 20, 5, 'pcs', 1, 80000, 10, 2, NOW(), NOW()),
(20, 'PRD020', 'Lampu LED 5W', 4, 12000, 18000, 15, 5, 'pcs', 1, 45000, 8, 1, NOW(), NOW()),
(21, 'PRD021', 'Charger HP Universal', 4, 25000, 35000, 10, 3, 'pcs', 1, 60000, 10, 1, NOW(), NOW()),
(22, 'PRD022', 'Kabel Roll 5m', 5, 8000, 12000, 30, 8, 'roll', 1, 75000, 15, 2, NOW(), NOW()),
(23, 'PRD023', 'Obeng Set', 5, 35000, 50000, 8, 2, 'set', 1, 18000, 5, 1, NOW(), NOW()),
(24, 'PRD024', 'Pemutih Pakaian 500ml', 6, 10000, 15000, 45, 10, 'liter', 1, 120000, 20, 2, NOW(), NOW()),
(25, 'PRD025', 'Pembersih Lantai 2L', 6, 25000, 35000, 20, 5, 'liter', 1, 95000, 12, 1, NOW(), NOW()),
(26, 'PRD026', 'Vitamin C 500mg', 7, 5000, 8000, 60, 10, 'pcs', 1, 120000, 22, 2, NOW(), NOW()),
(27, 'PRD027', 'Paracetamol Strip', 7, 3500, 6000, 80, 15, 'strip', 1, 85000, 15, 5, NOW(), NOW()),
(28, 'PRD028', 'Obat Batuk 100ml', 7, 12000, 18000, 35, 8, 'botol', 1, 68000, 12, 2, NOW(), NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

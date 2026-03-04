// ============================================================
// MOCK DATA STORE - Realistic Indonesian retail/wholesale data
// ============================================================

export type UserRole = 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Supplier {
  id: string;
  kode: string;
  nama: string;
  telepon: string;
  email: string;
  alamat: string;
  totalUtang: number;
  totalTransaksi: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  kode: string;
  nama: string;
  telepon: string;
  email: string;
  alamat: string;
  totalPiutang: number;
  limitKredit: number;
  totalTransaksi: number;
  createdAt: string;
}

export interface Category {
  id: string;
  nama: string;
}

export interface Product {
  id: string;
  kode: string;
  nama: string;
  kategoriId: string;
  kategoriNama: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimum: number;
  satuan: string;
  gudangId: string;
  gudangNama: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  pengelola: string;
  status: 'aktif' | 'nonaktif';
}

export interface SalesRep {
  id: string;
  kode: string;
  nama: string;
  telepon: string;
  email: string;
  area: string;
  status: 'aktif' | 'nonaktif';
  totalPenjualan: number;
}

export type TransactionType =
  | 'pembelian'
  | 'penjualan_tunai'
  | 'penjualan_kredit'
  | 'retur_pembelian'
  | 'retur_penjualan'
  | 'pembayaran_utang'
  | 'pembayaran_piutang';

export type TransactionStatus = 'lunas' | 'kredit' | 'sebagian' | 'selesai';

export interface TransactionItem {
  productId: string;
  productNama: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
  satuan: string;
}

export interface Transaction {
  id: string;
  noFaktur: string;
  tipe: TransactionType;
  tanggal: string;
  supplierId?: string;
  supplierNama?: string;
  customerId?: string;
  customerNama?: string;
  salesId?: string;
  salesNama?: string;
  gudangId?: string;
  gudangNama?: string;
  items: TransactionItem[];
  subtotal: number;
  diskon: number;
  total: number;
  bayar?: number;
  kembalian?: number;
  status: TransactionStatus;
  catatan?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  tanggal: string;
  productId: string;
  productNama: string;
  tipe: 'masuk' | 'keluar';
  qty: number;
  saldo: number;
  keterangan: string;
  referensi: string;
}

export interface Expense {
  id: string;
  noRef: string;
  tanggal: string;
  kategori: string;
  keterangan: string;
  jumlah: number;
  createdBy: string;
  createdAt: string;
}

// ============================================================
// SEED DATA
// ============================================================

export const USERS: User[] = [
  { id: 'u1', name: 'Budi Santoso', email: 'owner@tokosync.id', role: 'owner' },
  { id: 'u2', name: 'Sari Dewi', email: 'admin@tokosync.id', role: 'admin' },
];

export const CATEGORIES: Category[] = [
  { id: 'cat1', nama: 'Sembako' },
  { id: 'cat2', nama: 'Minuman' },
  { id: 'cat3', nama: 'Makanan Ringan' },
  { id: 'cat4', nama: 'Peralatan Rumah' },
  { id: 'cat5', nama: 'Kebersihan & Kecantikan' },
  { id: 'cat6', nama: 'Rokok & Tembakau' },
];

export const WAREHOUSES: Warehouse[] = [
  { id: 'g1', kode: 'GDG-001', nama: 'Gudang Utama', alamat: 'Jl. Industri Raya No. 12, Jakarta Utara', pengelola: 'Hendra', status: 'aktif' },
  { id: 'g2', kode: 'GDG-002', nama: 'Gudang Cabang Bekasi', alamat: 'Jl. Ahmad Yani No. 88, Bekasi', pengelola: 'Rizky', status: 'aktif' },
  { id: 'g3', kode: 'GDG-003', nama: 'Gudang Sementara', alamat: 'Jl. Hayam Wuruk No. 5, Jakarta Pusat', pengelola: '-', status: 'nonaktif' },
];

export const SALES_REPS: SalesRep[] = [
  { id: 's1', kode: 'SLS-001', nama: 'Ahmad Fauzi', telepon: '081234567890', email: 'ahmad@tokosync.id', area: 'Jakarta Utara & Pusat', status: 'aktif', totalPenjualan: 185_000_000 },
  { id: 's2', kode: 'SLS-002', nama: 'Dewi Rahmawati', telepon: '082345678901', email: 'dewi@tokosync.id', area: 'Jakarta Selatan & Timur', status: 'aktif', totalPenjualan: 142_500_000 },
  { id: 's3', kode: 'SLS-003', nama: 'Riko Prasetyo', telepon: '083456789012', email: 'riko@tokosync.id', area: 'Bekasi & Depok', status: 'aktif', totalPenjualan: 98_200_000 },
  { id: 's4', kode: 'SLS-004', nama: 'Nia Kurniasih', telepon: '084567890123', email: 'nia@tokosync.id', area: 'Tangerang', status: 'nonaktif', totalPenjualan: 55_800_000 },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', kode: 'SUP-001', nama: 'PT Indofood Sukses Makmur', telepon: '021-5551234', email: 'sales@indofood.co.id', alamat: 'Jl. Jend. Sudirman Kav. 76-78, Jakarta Selatan', totalUtang: 12_500_000, totalTransaksi: 285_000_000, createdAt: '2023-01-15' },
  { id: 'sup2', kode: 'SUP-002', nama: 'PT Mayora Indah Tbk', telepon: '021-6123456', email: 'order@mayora.co.id', alamat: 'Jl. Tomang Raya No. 21-23, Jakarta Barat', totalUtang: 0, totalTransaksi: 156_800_000, createdAt: '2023-02-20' },
  { id: 'sup3', kode: 'SUP-003', nama: 'CV Distributor Sembako Jaya', telepon: '021-4445678', email: 'sembakoJaya@gmail.com', alamat: 'Pasar Induk Kramat Jati, Jakarta Timur', totalUtang: 8_200_000, totalTransaksi: 412_000_000, createdAt: '2023-01-05' },
  { id: 'sup4', kode: 'SUP-004', nama: 'PT Wings Surya', telepon: '031-5553456', email: 'dist@wings.co.id', alamat: 'Jl. Rungkut Industri No. 5-11, Surabaya', totalUtang: 3_800_000, totalTransaksi: 98_500_000, createdAt: '2023-03-10' },
  { id: 'sup5', kode: 'SUP-005', nama: 'UD Berkah Abadi', telepon: '021-7778899', email: 'berkah.abadi88@gmail.com', alamat: 'Jl. Daan Mogot No. 100, Tangerang', totalUtang: 0, totalTransaksi: 67_200_000, createdAt: '2023-04-01' },
];

export const CUSTOMERS: Customer[] = [
  { id: 'cus1', kode: 'CUS-001', nama: 'Toko Makmur Jaya', telepon: '081234000001', email: 'makmur@gmail.com', alamat: 'Jl. Pasar Anyar No. 15, Tangerang', totalPiutang: 7_500_000, limitKredit: 20_000_000, totalTransaksi: 185_000_000, createdAt: '2023-01-20' },
  { id: 'cus2', kode: 'CUS-002', nama: 'Warung Pak Budi', telepon: '081234000002', email: '', alamat: 'Jl. Kemanggisan No. 22, Jakarta Barat', totalPiutang: 0, limitKredit: 5_000_000, totalTransaksi: 45_200_000, createdAt: '2023-02-14' },
  { id: 'cus3', kode: 'CUS-003', nama: 'CV Sumber Rejeki', telepon: '081234000003', email: 'sumberrejeki@gmail.com', alamat: 'Jl. Raya Bogor KM 35, Depok', totalPiutang: 15_800_000, limitKredit: 25_000_000, totalTransaksi: 320_000_000, createdAt: '2023-01-08' },
  { id: 'cus4', kode: 'CUS-004', nama: 'Toko Aneka Sembako', telepon: '081234000004', email: 'aneka.sembako@gmail.com', alamat: 'Pasar Senen Blok III, Jakarta Pusat', totalPiutang: 4_200_000, limitKredit: 15_000_000, totalTransaksi: 215_500_000, createdAt: '2023-02-28' },
  { id: 'cus5', kode: 'CUS-005', nama: 'UD Berkah Bersama', telepon: '081234000005', email: '', alamat: 'Jl. Pemuda No. 88, Bekasi', totalPiutang: 22_100_000, limitKredit: 20_000_000, totalTransaksi: 158_000_000, createdAt: '2023-03-15' },
  { id: 'cus6', kode: 'CUS-006', nama: 'Mini Market Sejahtera', telepon: '081234000006', email: 'sejahtera.mart@gmail.com', alamat: 'Jl. Margonda Raya No. 45, Depok', totalPiutang: 0, limitKredit: 10_000_000, totalTransaksi: 89_800_000, createdAt: '2023-04-20' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', kode: 'PRD-001', nama: 'Beras Sania Premium 5kg', kategoriId: 'cat1', kategoriNama: 'Sembako', hargaBeli: 68_000, hargaJual: 78_000, stok: 245, stokMinimum: 50, satuan: 'Karung', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-01-10' },
  { id: 'p2', kode: 'PRD-002', nama: 'Minyak Bimoli 2L', kategoriId: 'cat1', kategoriNama: 'Sembako', hargaBeli: 29_500, hargaJual: 34_000, stok: 18, stokMinimum: 30, satuan: 'Botol', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-01-10' },
  { id: 'p3', kode: 'PRD-003', nama: 'Indomie Goreng 85g', kategoriId: 'cat1', kategoriNama: 'Sembako', hargaBeli: 2_900, hargaJual: 3_500, stok: 1_200, stokMinimum: 200, satuan: 'Pcs', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-01-10' },
  { id: 'p4', kode: 'PRD-004', nama: 'Aqua Air Mineral 600ml', kategoriId: 'cat2', kategoriNama: 'Minuman', hargaBeli: 2_800, hargaJual: 3_500, stok: 350, stokMinimum: 100, satuan: 'Botol', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-01-15' },
  { id: 'p5', kode: 'PRD-005', nama: 'Gula Pasir Gulaku 1kg', kategoriId: 'cat1', kategoriNama: 'Sembako', hargaBeli: 14_500, hargaJual: 17_000, stok: 12, stokMinimum: 50, satuan: 'Pack', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-01-15' },
  { id: 'p6', kode: 'PRD-006', nama: 'Teh Botol Sosro 250ml', kategoriId: 'cat2', kategoriNama: 'Minuman', hargaBeli: 3_500, hargaJual: 5_000, stok: 480, stokMinimum: 100, satuan: 'Botol', gudangId: 'g2', gudangNama: 'Gudang Cabang Bekasi', createdAt: '2023-02-01' },
  { id: 'p7', kode: 'PRD-007', nama: 'Sabun Lifebuoy 90g', kategoriId: 'cat5', kategoriNama: 'Kebersihan & Kecantikan', hargaBeli: 3_800, hargaJual: 5_500, stok: 220, stokMinimum: 50, satuan: 'Pcs', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-02-10' },
  { id: 'p8', kode: 'PRD-008', nama: 'Chitato Original 68g', kategoriId: 'cat3', kategoriNama: 'Makanan Ringan', hargaBeli: 8_500, hargaJual: 11_000, stok: 8, stokMinimum: 30, satuan: 'Pcs', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-03-01' },
  { id: 'p9', kode: 'PRD-009', nama: 'Sunlight Cuci Piring 800ml', kategoriId: 'cat5', kategoriNama: 'Kebersihan & Kecantikan', hargaBeli: 12_000, hargaJual: 16_500, stok: 95, stokMinimum: 30, satuan: 'Botol', gudangId: 'g2', gudangNama: 'Gudang Cabang Bekasi', createdAt: '2023-03-05' },
  { id: 'p10', kode: 'PRD-010', nama: 'Gudang Garam Surya 12', kategoriId: 'cat6', kategoriNama: 'Rokok & Tembakau', hargaBeli: 22_000, hargaJual: 25_000, stok: 156, stokMinimum: 50, satuan: 'Bungkus', gudangId: 'g1', gudangNama: 'Gudang Utama', createdAt: '2023-03-10' },
];

// Sample transactions
export const TRANSACTIONS: Transaction[] = [
  {
    id: 'trx1', noFaktur: 'PJ-2025-027-001', tipe: 'penjualan_kredit', tanggal: '27-02-2025',
    customerId: 'cus3', customerNama: 'CV Sumber Rejeki', salesId: 's1', salesNama: 'Ahmad Fauzi',
    gudangId: 'g1', gudangNama: 'Gudang Utama',
    items: [
      { productId: 'p1', productNama: 'Beras Sania Premium 5kg', qty: 50, harga: 78_000, diskon: 0, subtotal: 3_900_000, satuan: 'Karung' },
      { productId: 'p3', productNama: 'Indomie Goreng 85g', qty: 200, harga: 3_500, diskon: 0, subtotal: 700_000, satuan: 'Pcs' },
    ],
    subtotal: 4_600_000, diskon: 0, total: 4_600_000, status: 'kredit',
    createdBy: 'admin', createdAt: '27-02-2025',
  },
  {
    id: 'trx2', noFaktur: 'PJ-2025-027-002', tipe: 'penjualan_tunai', tanggal: '27-02-2025',
    customerId: 'cus2', customerNama: 'Warung Pak Budi', salesId: 's2', salesNama: 'Dewi Rahmawati',
    gudangId: 'g1', gudangNama: 'Gudang Utama',
    items: [
      { productId: 'p4', productNama: 'Aqua Air Mineral 600ml', qty: 24, harga: 3_500, diskon: 0, subtotal: 84_000, satuan: 'Botol' },
      { productId: 'p7', productNama: 'Sabun Lifebuoy 90g', qty: 12, harga: 5_500, diskon: 0, subtotal: 66_000, satuan: 'Pcs' },
    ],
    subtotal: 150_000, diskon: 0, total: 150_000, bayar: 200_000, kembalian: 50_000, status: 'lunas',
    createdBy: 'admin', createdAt: '27-02-2025',
  },
  {
    id: 'trx3', noFaktur: 'PB-2025-027-001', tipe: 'pembelian', tanggal: '27-02-2025',
    supplierId: 'sup1', supplierNama: 'PT Indofood Sukses Makmur',
    gudangId: 'g1', gudangNama: 'Gudang Utama',
    items: [
      { productId: 'p3', productNama: 'Indomie Goreng 85g', qty: 500, harga: 2_900, diskon: 0, subtotal: 1_450_000, satuan: 'Pcs' },
    ],
    subtotal: 1_450_000, diskon: 0, total: 1_450_000, status: 'kredit',
    createdBy: 'owner', createdAt: '27-02-2025',
  },
  {
    id: 'trx4', noFaktur: 'PJ-2025-026-005', tipe: 'penjualan_kredit', tanggal: '26-02-2025',
    customerId: 'cus5', customerNama: 'UD Berkah Bersama', salesId: 's3', salesNama: 'Riko Prasetyo',
    gudangId: 'g2', gudangNama: 'Gudang Cabang Bekasi',
    items: [
      { productId: 'p2', productNama: 'Minyak Bimoli 2L', qty: 100, harga: 34_000, diskon: 0, subtotal: 3_400_000, satuan: 'Botol' },
      { productId: 'p5', productNama: 'Gula Pasir Gulaku 1kg', qty: 80, harga: 17_000, diskon: 0, subtotal: 1_360_000, satuan: 'Pack' },
    ],
    subtotal: 4_760_000, diskon: 200_000, total: 4_560_000, status: 'kredit',
    createdBy: 'admin', createdAt: '26-02-2025',
  },
  {
    id: 'trx5', noFaktur: 'PJ-2025-026-004', tipe: 'penjualan_tunai', tanggal: '26-02-2025',
    customerId: 'cus4', customerNama: 'Toko Aneka Sembako',
    items: [
      { productId: 'p6', productNama: 'Teh Botol Sosro 250ml', qty: 48, harga: 5_000, diskon: 0, subtotal: 240_000, satuan: 'Botol' },
      { productId: 'p10', productNama: 'Gudang Garam Surya 12', qty: 20, harga: 25_000, diskon: 0, subtotal: 500_000, satuan: 'Bungkus' },
    ],
    subtotal: 740_000, diskon: 0, total: 740_000, bayar: 800_000, kembalian: 60_000, status: 'lunas',
    createdBy: 'admin', createdAt: '26-02-2025',
  },
];

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'sm1', tanggal: '27-02-2025', productId: 'p3', productNama: 'Indomie Goreng 85g', tipe: 'masuk', qty: 500, saldo: 1200, keterangan: 'Pembelian dari PT Indofood', referensi: 'PB-2025-027-001' },
  { id: 'sm2', tanggal: '27-02-2025', productId: 'p3', productNama: 'Indomie Goreng 85g', tipe: 'keluar', qty: 200, saldo: 1000, keterangan: 'Penjualan ke CV Sumber Rejeki', referensi: 'PJ-2025-027-001' },
  { id: 'sm3', tanggal: '27-02-2025', productId: 'p1', productNama: 'Beras Sania Premium 5kg', tipe: 'keluar', qty: 50, saldo: 245, keterangan: 'Penjualan ke CV Sumber Rejeki', referensi: 'PJ-2025-027-001' },
  { id: 'sm4', tanggal: '26-02-2025', productId: 'p2', productNama: 'Minyak Bimoli 2L', tipe: 'keluar', qty: 100, saldo: 18, keterangan: 'Penjualan ke UD Berkah Bersama', referensi: 'PJ-2025-026-005' },
  { id: 'sm5', tanggal: '26-02-2025', productId: 'p5', productNama: 'Gula Pasir Gulaku 1kg', tipe: 'keluar', qty: 80, saldo: 12, keterangan: 'Penjualan ke UD Berkah Bersama', referensi: 'PJ-2025-026-005' },
  { id: 'sm6', tanggal: '25-02-2025', productId: 'p1', productNama: 'Beras Sania Premium 5kg', tipe: 'masuk', qty: 100, saldo: 295, keterangan: 'Pembelian dari CV Distributor Sembako', referensi: 'PB-2025-025-001' },
  { id: 'sm7', tanggal: '24-02-2025', productId: 'p8', productNama: 'Chitato Original 68g', tipe: 'keluar', qty: 24, saldo: 8, keterangan: 'Penjualan ke Toko Makmur Jaya', referensi: 'PJ-2025-024-003' },
];

export const EXPENSES: Expense[] = [
  { id: 'exp1', noRef: 'BOP-2025-027-001', tanggal: '27-02-2025', kategori: 'Transportasi', keterangan: 'Ongkos kirim ke Bekasi (2 armada)', jumlah: 850_000, createdBy: 'admin', createdAt: '27-02-2025' },
  { id: 'exp2', noRef: 'BOP-2025-026-001', tanggal: '26-02-2025', kategori: 'Listrik & Air', keterangan: 'Tagihan PLN Gudang Utama Februari', jumlah: 2_450_000, createdBy: 'owner', createdAt: '26-02-2025' },
  { id: 'exp3', noRef: 'BOP-2025-025-001', tanggal: '25-02-2025', kategori: 'Gaji Karyawan', keterangan: 'Gaji karyawan gudang minggu ke-4', jumlah: 8_000_000, createdBy: 'owner', createdAt: '25-02-2025' },
  { id: 'exp4', noRef: 'BOP-2025-024-001', tanggal: '24-02-2025', kategori: 'Pemeliharaan', keterangan: 'Service forklift gudang', jumlah: 1_200_000, createdBy: 'admin', createdAt: '24-02-2025' },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('id-ID').format(n);

export const getTodayID = (): string => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

export const TIPE_TRANSAKSI_LABELS: Record<TransactionType, string> = {
  pembelian: 'Pembelian',
  penjualan_tunai: 'Penjualan Tunai',
  penjualan_kredit: 'Penjualan Kredit',
  retur_pembelian: 'Retur Pembelian',
  retur_penjualan: 'Retur Penjualan',
  pembayaran_utang: 'Pembayaran Utang',
  pembayaran_piutang: 'Pembayaran Piutang',
};

// Dashboard stats
export const getDashboardStats = () => ({
  penjualanHariIni: 4_750_000,
  pembelianHariIni: 1_450_000,
  totalPiutang: CUSTOMERS.reduce((s, c) => s + c.totalPiutang, 0),
  totalUtang: SUPPLIERS.reduce((s, s2) => s + s2.totalUtang, 0),
  totalTransaksiHariIni: 5,
  kasHariIni: 890_000,
  produkStokRendah: PRODUCTS.filter(p => p.stok <= p.stokMinimum).length,
  customerMelebihiLimit: CUSTOMERS.filter(c => c.totalPiutang > c.limitKredit).length,
});

// Daily cashflow data for chart
export const CASHFLOW_DATA = [
  { hari: 'Sen', masuk: 8_200_000, keluar: 3_100_000 },
  { hari: 'Sel', masuk: 6_500_000, keluar: 1_800_000 },
  { hari: 'Rab', masuk: 9_100_000, keluar: 4_500_000 },
  { hari: 'Kam', masuk: 7_800_000, keluar: 2_200_000 },
  { hari: 'Jum', masuk: 11_200_000, keluar: 5_800_000 },
  { hari: 'Sab', masuk: 13_500_000, keluar: 2_900_000 },
  { hari: 'Min', masuk: 4_750_000, keluar: 1_450_000 },
];

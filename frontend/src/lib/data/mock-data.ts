import { Product, Supplier, Customer, Warehouse, Sales, Transaction, TransactionItem } from '@/types';

// Mock Data - Products
export const mockProducts: Product[] = [
  { id: 'PRD001', code: 'BR001', name: 'Beras Premium 5kg', category: 'Sembako', buyPrice: 65000, sellPrice: 75000, stock: 120, minStock: 50, unit: 'Karung', warehouseId: 'WH001', createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-02-10T14:30:00Z' },
  { id: 'PRD002', code: 'BR002', name: 'Beras Medium 5kg', category: 'Sembako', buyPrice: 55000, sellPrice: 65000, stock: 85, minStock: 50, unit: 'Karung', warehouseId: 'WH001', createdAt: '2024-01-16T09:00:00Z', updatedAt: '2024-02-12T11:20:00Z' },
  { id: 'PRD003', code: 'MG001', name: 'Minyak Goreng 2L', category: 'Sembako', buyPrice: 28000, sellPrice: 35000, stock: 8, minStock: 30, unit: 'Botol', warehouseId: 'WH001', createdAt: '2024-01-17T10:00:00Z', updatedAt: '2024-02-15T16:45:00Z' },
  { id: 'PRD004', code: 'MG002', name: 'Minyak Goreng 1L', category: 'Sembako', buyPrice: 14000, sellPrice: 18000, stock: 45, minStock: 25, unit: 'Botol', warehouseId: 'WH001', createdAt: '2024-01-18T11:00:00Z', updatedAt: '2024-02-14T09:30:00Z' },
  { id: 'PRD005', code: 'MK001', name: 'Indomie Goreng', category: 'Makanan', buyPrice: 2500, sellPrice: 3500, stock: 500, minStock: 100, unit: 'Pcs', warehouseId: 'WH002', createdAt: '2024-01-19T12:00:00Z', updatedAt: '2024-02-13T10:15:00Z' },
  { id: 'PRD006', code: 'MK002', name: 'Indomie Kari', category: 'Makanan', buyPrice: 2500, sellPrice: 3500, stock: 450, minStock: 100, unit: 'Pcs', warehouseId: 'WH002', createdAt: '2024-01-20T13:00:00Z', updatedAt: '2024-02-12T14:00:00Z' },
  { id: 'PRD007', code: 'MN001', name: 'Aqua 600ml', category: 'Minuman', buyPrice: 3000, sellPrice: 4000, stock: 200, minStock: 50, unit: 'Botol', warehouseId: 'WH002', createdAt: '2024-01-21T14:00:00Z', updatedAt: '2024-02-11T15:30:00Z' },
  { id: 'PRD008', code: 'MN002', name: 'Aqua 1500ml', category: 'Minuman', buyPrice: 4000, sellPrice: 5500, stock: 150, minStock: 40, unit: 'Botol', warehouseId: 'WH002', createdAt: '2024-01-22T15:00:00Z', updatedAt: '2024-02-10T16:00:00Z' },
  { id: 'PRD009', code: 'GP001', name: 'Gula Pasir 1kg', category: 'Sembako', buyPrice: 14000, sellPrice: 18000, stock: 15, minStock: 40, unit: 'Kg', warehouseId: 'WH001', createdAt: '2024-01-23T16:00:00Z', updatedAt: '2024-02-09T17:00:00Z' },
  { id: 'PRD010', code: 'GP002', name: 'Gula Merah 1kg', category: 'Sembako', buyPrice: 16000, sellPrice: 20000, stock: 30, minStock: 30, unit: 'Kg', warehouseId: 'WH001', createdAt: '2024-01-24T17:00:00Z', updatedAt: '2024-02-08T18:00:00Z' },
  { id: 'PRD011', code: 'TB001', name: 'Teh Botol Sosro', category: 'Minuman', buyPrice: 4500, sellPrice: 6000, stock: 180, minStock: 40, unit: 'Botol', warehouseId: 'WH002', createdAt: '2024-01-25T18:00:00Z', updatedAt: '2024-02-07T19:00:00Z' },
  { id: 'PRD012', code: 'SB001', name: 'Sabun Lifebuoy', category: 'Peralatan', buyPrice: 3500, sellPrice: 5000, stock: 90, minStock: 25, unit: 'Pcs', warehouseId: 'WH003', createdAt: '2024-01-26T19:00:00Z', updatedAt: '2024-02-06T20:00:00Z' },
  { id: 'PRD013', code: 'SB002', name: 'Sabun Lux', category: 'Peralatan', buyPrice: 3000, sellPrice: 4500, stock: 85, minStock: 25, unit: 'Pcs', warehouseId: 'WH003', createdAt: '2024-01-27T20:00:00Z', updatedAt: '2024-02-05T21:00:00Z' },
  { id: 'PRD014', code: 'TP001', name: 'Tepung Terigu 1kg', category: 'Sembako', buyPrice: 10000, sellPrice: 13000, stock: 5, minStock: 25, unit: 'Kg', warehouseId: 'WH001', createdAt: '2024-01-28T21:00:00Z', updatedAt: '2024-02-04T22:00:00Z' },
  { id: 'PRD015', code: 'TP002', name: 'Tepung Beras 1kg', category: 'Sembako', buyPrice: 12000, sellPrice: 15000, stock: 40, minStock: 25, unit: 'Kg', warehouseId: 'WH001', createdAt: '2024-01-29T22:00:00Z', updatedAt: '2024-02-03T23:00:00Z' },
  { id: 'PRD016', code: 'KL001', name: 'Keju Prochiz', category: 'Makanan', buyPrice: 25000, sellPrice: 30000, stock: 25, minStock: 15, unit: 'Pack', warehouseId: 'WH002', createdAt: '2024-02-01T07:00:00Z', updatedAt: '2024-02-10T08:00:00Z' },
  { id: 'PRD017', code: 'KL002', name: 'Keju Kraft', category: 'Makanan', buyPrice: 22000, sellPrice: 28000, stock: 20, minStock: 15, unit: 'Pack', warehouseId: 'WH002', createdAt: '2024-02-02T08:00:00Z', updatedAt: '2024-02-09T09:00:00Z' },
  { id: 'PRD018', code: 'SK001', name: 'Susu UHT 1L', category: 'Minuman', buyPrice: 15000, sellPrice: 18000, stock: 35, minStock: 20, unit: 'Botol', warehouseId: 'WH002', createdAt: '2024-02-03T09:00:00Z', updatedAt: '2024-02-08T10:00:00Z' },
  { id: 'PRD019', code: 'SK002', name: 'Susu Kental Manis', category: 'Minuman', buyPrice: 12000, sellPrice: 15000, stock: 50, minStock: 20, unit: 'Kaleng', warehouseId: 'WH002', createdAt: '2024-02-04T10:00:00Z', updatedAt: '2024-02-07T11:00:00Z' },
  { id: 'PRD020', code: 'MI001', name: 'Mie Instan Goreng', category: 'Makanan', buyPrice: 2800, sellPrice: 3800, stock: 380, minStock: 80, unit: 'Pcs', warehouseId: 'WH002', createdAt: '2024-02-05T11:00:00Z', updatedAt: '2024-02-06T12:00:00Z' },
];

// Mock Data - Suppliers
export const mockSuppliers: Supplier[] = [
  { id: 'SUP001', name: 'PT Sumber Makmur', phone: '021-5551234', email: 'info@sumbermakmur.com', address: 'Jl. Industri No. 45, Jakarta', balance: 15000000, totalTransactions: 125000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'SUP002', name: 'CV Berkah Jaya', phone: '022-4445678', email: 'berkah@jaya.id', address: 'Jl. Raya Bandung No. 12', balance: 5000000, totalTransactions: 85500000, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-02-02T00:00:00Z' },
  { id: 'SUP003', name: 'UD Sentosa Abadi', phone: '031-3334567', email: 'sentosa@abadi.com', address: 'Jl. Pasar Baru No. 8, Surabaya', balance: 8000000, totalTransactions: 67200000, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-02-03T00:00:00Z' },
  { id: 'SUP004', name: 'PT Indo Distributor', phone: '021-7778899', email: 'sales@indodist.com', address: 'Jl. Gatot Subroto No. 100', balance: 25000000, totalTransactions: 210800000, createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-02-04T00:00:00Z' },
  { id: 'SUP005', name: 'CV Makmur Sejahtera', phone: '061-4456789', email: 'makmur@sejahtera.com', address: 'Jl. Zainul Arifin No. 23, Medan', balance: 10000000, totalTransactions: 95000000, createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z' },
  { id: 'SUP006', name: 'PT Food Mandiri', phone: '021-6667788', email: 'contact@foodmandiri.com', address: 'Jl. Sudirman No. 50, Jakarta', balance: 12000000, totalTransactions: 118000000, createdAt: '2024-01-06T00:00:00Z', updatedAt: '2024-02-06T00:00:00Z' },
];

// Mock Data - Customers
export const mockCustomers: Customer[] = [
  { id: 'CUS001', name: 'Toko Makmur', phone: '081234567890', email: 'makmur@toko.com', address: 'Jl. Pasar No. 15, Jakarta', balance: 5500000, totalTransactions: 45000000, createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-02-10T00:00:00Z' },
  { id: 'CUS002', name: 'CV Sejahtera', phone: '082345678901', email: 'sejahtera@cv.id', address: 'Jl. Raya Bogor No. 88', balance: 0, totalTransactions: 78500000, createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-02-11T00:00:00Z' },
  { id: 'CUS003', name: 'UD Bahagia', phone: '083456789012', email: 'bahagia@ud.com', address: 'Jl. Sudirman No. 45, Bandung', balance: 12000000, totalTransactions: 120200000, createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-02-12T00:00:00Z' },
  { id: 'CUS004', name: 'PT Sentosa', phone: '084567890123', email: 'sentosa@pt.com', address: 'Jl. Gatot Subroto No. 200', balance: 3200000, totalTransactions: 65800000, createdAt: '2024-01-13T00:00:00Z', updatedAt: '2024-02-13T00:00:00Z' },
  { id: 'CUS005', name: 'Toko Jaya', phone: '085678901234', email: 'jaya@toko.id', address: 'Jl. Merdeka No. 10, Surabaya', balance: 0, totalTransactions: 32100000, createdAt: '2024-01-14T00:00:00Z', updatedAt: '2024-02-14T00:00:00Z' },
  { id: 'CUS006', name: 'Warung Berkah', phone: '086789012345', email: 'berkah@warung.com', address: 'Jl. Pemuda No. 25, Semarang', balance: 7800000, totalTransactions: 89000000, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-02-15T00:00:00Z' },
  { id: 'CUS007', name: 'Toko Amanah', phone: '087890123456', email: 'amanah@toko.com', address: 'Jl. Ahmad Yani No. 33, Yogyakarta', balance: 4500000, totalTransactions: 54000000, createdAt: '2024-01-16T00:00:00Z', updatedAt: '2024-02-16T00:00:00Z' },
  { id: 'CUS008', name: 'CV Barokah', phone: '088901234567', email: 'barokah@cv.id', address: 'Jl. Diponegoro No. 55, Solo', balance: 0, totalTransactions: 28700000, createdAt: '2024-01-17T00:00:00Z', updatedAt: '2024-02-17T00:00:00Z' },
];

// Mock Data - Warehouses
export const mockWarehouses: Warehouse[] = [
  { id: 'WH001', name: 'Gudang Utama', address: 'Jl. Industri No. 45, Jakarta', totalProducts: 150, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'WH002', name: 'Gudang Makanan', address: 'Jl. Raya No. 12, Jakarta', totalProducts: 120, status: 'active', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-02-02T00:00:00Z' },
  { id: 'WH003', name: 'Gudang Peralatan', address: 'Jl. Pasar No. 8, Jakarta', totalProducts: 50, status: 'active', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-02-03T00:00:00Z' },
];

// Mock Data - Sales
export const mockSales: Sales[] = [
  { id: 'SLS001', name: 'Ahmad Sulaiman', phone: '081122334455', email: 'ahmad@storemate.com', address: 'Jl. Melati No. 10, Jakarta', totalSales: 250000000, totalTransactions: 125, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'SLS002', name: 'Dewi Kartika', phone: '081223344556', email: 'dewi@storemate.com', address: 'Jl. Anggrek No. 20, Jakarta', totalSales: 185000000, totalTransactions: 98, status: 'active', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-02-02T00:00:00Z' },
  { id: 'SLS003', name: 'Budi Santoso', phone: '081234455667', email: 'budi@storemate.com', address: 'Jl. Mawar No. 30, Jakarta', totalSales: 210000000, totalTransactions: 112, status: 'active', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-02-03T00:00:00Z' },
  { id: 'SLS004', name: 'Siti Aminah', phone: '081345566778', email: 'siti@storemate.com', address: 'Jl. Kenanga No. 40, Jakarta', totalSales: 175000000, totalTransactions: 85, status: 'active', createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-02-04T00:00:00Z' },
  { id: 'SLS005', name: 'Rudi Hermawan', phone: '081456677889', email: 'rudi@storemate.com', address: 'Jl. Tulip No. 50, Jakarta', totalSales: 190000000, totalTransactions: 95, status: 'inactive', createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z' },
];

// Mock Data - Transactions (Sample for demo)
export const mockTransactions: Transaction[] = [
  {
    id: 'TRX001',
    invoiceNumber: 'PJ-2024-001',
    date: '2024-02-27',
    type: 'penjualan_tunai',
    customerId: 'CUS001',
    customerName: 'Toko Makmur',
    salesId: 'SLS001',
    salesName: 'Ahmad Sulaiman',
    items: [
      { id: 'TRX001-001', productId: 'PRD001', productName: 'Beras Premium 5kg', quantity: 10, price: 75000, discount: 0, subtotal: 750000 },
      { id: 'TRX001-002', productId: 'PRD003', productName: 'Minyak Goreng 2L', quantity: 20, price: 35000, discount: 5, subtotal: 665000 },
    ],
    subtotal: 1415000,
    discount: 35000,
    tax: 0,
    total: 1380000,
    paid: 1500000,
    remaining: 0,
    status: 'completed',
    createdAt: '2024-02-27T08:15:00Z',
  },
  {
    id: 'TRX002',
    invoiceNumber: 'PK-2024-001',
    date: '2024-02-27',
    type: 'penjualan_kredit',
    customerId: 'CUS003',
    customerName: 'UD Bahagia',
    salesId: 'SLS002',
    salesName: 'Dewi Kartika',
    items: [
      { id: 'TRX002-001', productId: 'PRD001', productName: 'Beras Premium 5kg', quantity: 30, price: 75000, discount: 0, subtotal: 2250000 },
      { id: 'TRX002-002', productId: 'PRD004', productName: 'Minyak Goreng 1L', quantity: 50, price: 18000, discount: 0, subtotal: 900000 },
    ],
    subtotal: 3150000,
    discount: 0,
    tax: 0,
    total: 3150000,
    paid: 1000000,
    remaining: 2150000,
    status: 'completed',
    createdAt: '2024-02-27T09:30:00Z',
  },
  {
    id: 'TRX003',
    invoiceNumber: 'PB-2024-001',
    date: '2024-02-27',
    type: 'pembelian',
    supplierId: 'SUP001',
    supplierName: 'PT Sumber Makmur',
    items: [
      { id: 'TRX003-001', productId: 'PRD001', productName: 'Beras Premium 5kg', quantity: 50, price: 65000, discount: 0, subtotal: 3250000 },
    ],
    subtotal: 3250000,
    discount: 50000,
    tax: 0,
    total: 3200000,
    paid: 3200000,
    remaining: 0,
    status: 'completed',
    createdAt: '2024-02-27T11:20:00Z',
  },
  {
    id: 'TRX004',
    invoiceNumber: 'PJ-2024-002',
    date: '2024-02-27',
    type: 'penjualan_tunai',
    customerId: 'CUS004',
    customerName: 'PT Sentosa',
    items: [
      { id: 'TRX004-001', productId: 'PRD005', productName: 'Indomie Goreng', quantity: 100, price: 3500, discount: 0, subtotal: 350000 },
    ],
    subtotal: 350000,
    discount: 0,
    tax: 0,
    total: 350000,
    paid: 350000,
    remaining: 0,
    status: 'completed',
    createdAt: '2024-02-27T13:00:00Z',
  },
  {
    id: 'TRX005',
    invoiceNumber: 'BP-2024-001',
    date: '2024-02-27',
    type: 'pembayaran_piutang',
    customerId: 'CUS003',
    customerName: 'UD Bahagia',
    items: [],
    subtotal: 1500000,
    discount: 0,
    tax: 0,
    total: 1500000,
    paid: 1500000,
    remaining: 0,
    status: 'completed',
    createdAt: '2024-02-27T14:30:00Z',
  },
];

// Mock Categories
export const mockCategories = ['Makanan', 'Minuman', 'Sembako', 'Elektronik', 'Peralatan'];

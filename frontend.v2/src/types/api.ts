export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  warehouseId?: string;
  warehouse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';
}

export interface SalesRep {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  status: 'aktif' | 'nonaktif';
  totalSales: number;
}

export interface Category {
  id: string;
  name: string;
}

export type TransactionType =
  | 'pembelian'
  | 'penjualan_tunai'
  | 'penjualan_kredit'
  | 'retur_pembelian'
  | 'retur_penjualan'
  | 'pembayaran_utang'
  | 'pembayaran_piutang';

export type TransactionStatus = 'draft' | 'completed' | 'cancelled';

export interface TransactionDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  type: TransactionType;
  supplierId?: string;
  supplier?: string;
  customerId?: string;
  customer?: string;
  salesId?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  status: TransactionStatus;
  paymentStatus: 'lunas' | 'belum_lunas';
  notes?: string;
  items?: TransactionDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSalesToday: number;
  salesGrowth: number;
  totalPurchasesToday: number;
  purchasesGrowth: number;
  totalProducts: number;
  stockValue: number;
  activeCustomers: number;
  customersGrowth: number;
  totalTransactionsToday: number;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'masuk' | 'keluar';
  quantity: number;
  balance: number;
  description: string;
  reference: string;
}

export interface StoreSettings {
  name: string;
  phone: string;
  address: string;
  npwp?: string;
  siup?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

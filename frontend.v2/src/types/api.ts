export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  avatar?: string;
  permissions?: Record<string, Record<string, boolean>>;
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
  // snake_case (Laravel default)
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  // camelCase aliases (used by frontend pages)
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
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
  code?: string;
  name: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  buyPrice?: number;
  sellPrice?: number;
  stock?: number;
  minStock?: number;
  minimumStock?: number;
  unit?: string;
  warehouseId?: string;
  warehouseName?: string;
  warehouse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone: string;
  phone2?: string;
  email?: string;
  creditLimit: number;
  discount?: string;
  warehouse?: string;
  priceList?: string;
  area?: string;
  notes?: string;
  npwp?: string;
  balance: number;
  totalTransactions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  code?: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  noRekening?: string;
  balance?: number;
  totalTransactions?: number;
  createdAt?: string;
}

export interface Warehouse {
  id: string;
  code?: string;
  name: string;
  address?: string;
  manager?: string;
  status: 'aktif' | 'nonaktif';
  totalProducts?: number;
}

export interface SalesRep {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  status?: 'aktif' | 'nonaktif';
  totalSales?: number;
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
  isHidden?: boolean;
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

export interface StockMutation {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  stockAfter: number;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface StockMutationResponse {
  data: {
    product: { openingStock?: number };
    mutations: StockMutation[];
  };
}

export interface QueryParams {
  product_id?: string;
  from?: string;
  to?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface StoreSettings {
  store_name: string;
  phone: string;
  address: string;
  npwp?: string;
  siup?: string;
  email?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  billing_due_days?: number;
  billing_payment_terms?: string;
  billing_approver_name?: string;
  billing_approver_title?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

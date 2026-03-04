// ─── User & Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  warehouseId?: string;
  warehouse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  code: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  warehouseId?: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalTransactions: number;
  createdAt?: string;
  updatedAt?: string;
  kode?: string;
}

export interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalTransactions: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// ─── Warehouses ───────────────────────────────────────────────────────────────
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  totalProducts: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseFormData {
  name: string;
  address: string;
}

// ─── Sales Reps ───────────────────────────────────────────────────────────────
export interface Sales {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalSales: number;
  totalTransactions?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export type TransactionType =
  | 'pembelian'
  | 'penjualan_tunai'
  | 'penjualan_kredit'
  | 'retur_pembelian'
  | 'retur_penjualan'
  | 'pembayaran_utang'
  | 'pembayaran_piutang'
  | 'surat_jalan'
  | 'kontra_bon';

export type TransactionStatus = 'draft' | 'completed' | 'cancelled';
export type PaymentStatus = 'lunas' | 'belum_lunas';

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface TransactionItemFormData {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  type: TransactionType;
  supplierId?: string | null;
  supplier?: string | null;
  customerId?: string | null;
  customer?: string | null;
  salesId?: string | null;
  items?: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  status: TransactionStatus;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Return Purchases (Retur Pembelian) ─────────────────────────────────────────────
export interface ReturnPurchase extends Transaction {
  returnNumber: string;
  transactionId?: string | null;
  supplierId?: string | null;
  reason: string;
  notes?: string | null;
}

export interface ReturnPurchaseItem {
  id: string;
  returnPurchaseId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

// ─── Delivery Notes (Surat Jalan) ─────────────────────────────────────
export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  date: string;
  transactionId: string;
  customerId?: string | null;
  driver?: string | null;
  vehiclePlate?: string | null;
  notes?: string | null;
  status: 'pending' | 'delivered' | 'cancelled';
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Return Sales (Retur Penjualan) ─────────────────────────────────
export interface ReturnSale extends Transaction {
  returnNumber: string;
  transactionId?: string | null;
  reason: string;
}

export interface ReturnSaleItem {
  id: string;
  returnSaleId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface TransactionFormData {
  date: string;
  type: TransactionType;
  supplierId?: string;
  customerId?: string;
  salesId?: string;
  items: TransactionItemFormData[];
  discount: number;
  tax: number;
  paid: number;
  notes?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
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

export interface FinancialSummary {
  totalReceivables: number;
  overdueReceivables: number;
  totalPayables: number;
  pendingPayments: number;
}

export interface SalesTrendData {
  name: string;
  sales: number;
  purchases: number;
}

// RecentTransaction = same shape as Transaction (from TransactionResource)
export type RecentTransaction = Transaction;

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category?: string;
  daysRemaining?: number | null;
  urgency?: 'critical' | 'warning' | 'moderate';
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface DailyReport {
  date: string;
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  salesCount: number;
  purchasesCount: number;
  transactions: Transaction[];
}

export interface StockReportItem {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stockValue: number;
}

export interface StockReport {
  items: StockReportItem[];
  totalValue: number;
}

export interface BalanceReport {
  from: string;
  to: string;
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
}

// ─── Info (Owner-only) ────────────────────────────────────────────────────────
export interface SaldoEntry {
  id: string;
  name: string;
  phone?: string;
  balance: number;
}

export interface StockMutationEntry {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface KartuStok {
  product: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  mutations: StockMutationEntry[];
}

export interface LaporanHarian {
  date: string;
  totalIn: number;
  totalOut: number;
  transactionCount: number;
  byType: Record<string, { count: number; total: number }>;
}

export interface ReturPembelianEntry {
  id: string;
  invoiceNumber: string;
  date: string;
  supplier: string;
  itemsCount: number;
  total: number;
  status: 'completed' | 'partial' | 'cancelled';
}

export interface ReturPenjualanEntry {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  itemsCount: number;
  total: number;
  status: 'completed' | 'partial' | 'cancelled';
}

export interface BiayaJasaEntry {
  id: string;
  date: string;
  category: 'delivery' | 'service' | 'other';
  description: string;
  amount: number;
  notes?: string;
}

export interface PembayaranUtangEntry {
  id: string;
  invoiceNumber: string;
  supplier: string;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface PembayaranPiutangEntry {
  id: string;
  invoiceNumber: string;
  customer: string;
  paymentDate: string;
  amount: number;
  reference?: string;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────
// Laravel returns { data: T, message?: string }
// For paginated: { data: T[], links: {...}, meta: { current_page, last_page, per_page, total } }
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface LaravelPagination<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// Legacy aliases (for backward compat if any page uses these)
export type PaginatedResponse<T> = LaravelPagination<T>;

export interface PaginatedParams {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Makanan',
  'Minuman',
  'Sembako',
  'Elektronik',
  'Peralatan',
  'Kebersihan',
  'Kesehatan',
  'Lain-lain',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// ─── Utility Types ────────────────────────────────────────────────────────────
export type SelectOption = {
  value: string;
  label: string;
};

export type TableColumn<T> = {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export interface DailyReport {
  date: string;
  totalSales: number;
  totalPurchases: number;
  totalReceipts: number;
  totalTransactions: number;
  transactions: Transaction[];
}

export interface StockReportItem {
  productId: string;
  productName: string;
  category: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
  stockValue: number;
}

export interface BalanceReportItem {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  balance: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface ProfileSettings {
  name: string;
  email: string;
  role: UserRole;
}

export interface StoreSettings {
  store_name: string;
  phone: string;
  address: string;
  npwp: string;
  siup: string;
}

export interface NotificationSettings {
  low_stock_alert: boolean;
  receivable_due_alert: boolean;
  daily_report: boolean;
}

export interface Settings {
  profile: ProfileSettings;
  store: StoreSettings;
  notifications: NotificationSettings;
}

export interface ProfileFormData {
  name: string;
  email: string;
}

export interface PasswordFormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

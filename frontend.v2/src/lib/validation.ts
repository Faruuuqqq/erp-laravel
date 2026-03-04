import { z } from 'zod';
import { formatRupiah } from '../data/mockData';

// ------------------------------
// Global Validation Schemas
// ------------------------------
export const ProductSchema = z.object({
  code: z.string().min(3, { message: 'Kode produk minimal 3 karakter' }).max(50, { message: 'Kode produk maksimal 50 karakter' }),
  name: z.string().min(3, { message: 'Nama produk minimal 3 karakter' }).max(255, { message: 'Nama produk maksimal 255 karakter' }),
  categoryId: z.string().optional(),
  buyPrice: z.number().min(0, { message: 'Harga beli tidak boleh negatif' }),
  sellPrice: z.number().min(0, { message: 'Harga jual tidak boleh negatif' }),
  stock: z.number().int().min(0, { message: 'Stok tidak boleh negatif' }),
  minStock: z.number().int().min(0, { message: 'Stok minimum tidak boleh negatif' }),
  unit: z.string().min(1, { message: 'Satuan produk harus diisi' }),
  warehouseId: z.string().optional(),
  description: z.string().optional(),
});

export const CustomerSchema = z.object({
  code: z.string().min(3, { message: 'Kode customer minimal 3 karakter' }).max(50, { message: 'Kode customer maksimal 50 karakter' }),
  name: z.string().min(3, { message: 'Nama customer minimal 3 karakter' }).max(255, { message: 'Nama customer maksimal 255 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }).optional(),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 karakter' }).max(20, { message: 'Nomor telepon maksimal 20 karakter' }).optional(),
  address: z.string().optional(),
  creditLimit: z.number().min(0, { message: 'Limit kredit tidak boleh negatif' }),
  balance: z.number().optional(),
});

export const SupplierSchema = z.object({
  code: z.string().min(3, { message: 'Kode supplier minimal 3 karakter' }).max(50, { message: 'Kode supplier maksimal 50 karakter' }),
  name: z.string().min(3, { message: 'Nama supplier minimal 3 karakter' }).max(255, { message: 'Nama supplier maksimal 255 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }).optional(),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 karakter' }).max(20, { message: 'Nomor telepon maksimal 20 karakter' }).optional(),
  address: z.string().optional(),
  balance: z.number().optional(),
});

export const TransactionSchema = z.object({
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  warehouseId: z.string().min(1, { message: 'Gudang harus dipilih' }),
  salesRepId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, { message: 'Tanggal harus diisi' }),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['lunas', 'kredit', 'sebagian']).default('lunas'),
  total: z.number().min(0.01, { message: 'Total transaksi harus lebih dari 0' }),
  paid: z.number().min(0, { message: 'Jumlah bayar tidak boleh negatif' }),
  items: z.array(z.object({
    productId: z.string().min(1, { message: 'Produk harus dipilih' }),
    qty: z.number().int().min(1, { message: 'Jumlah produk minimal 1' }),
    price: z.number().min(0, { message: 'Harga produk tidak boleh negatif' }),
    subtotal: z.number().min(0, { message: 'Subtotal tidak boleh negatif' }),
  })).min(1, { message: 'Minimal 1 produk harus ditambahkan' }),
});

export const ExpenseSchema = z.object({
  date: z.string().min(1, { message: 'Tanggal harus diisi' }),
  category: z.string().min(1, { message: 'Kategori harus dipilih' }),
  description: z.string().min(3, { message: 'Keterangan minimal 3 karakter' }).max(255, { message: 'Keterangan maksimal 255 karakter' }),
  amount: z.number().min(0.01, { message: 'Jumlah biaya harus lebih dari 0' }),
});

export const UserSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }).max(255, { message: 'Nama maksimal 255 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['admin', 'owner', 'user']).default('user'),
});

// ------------------------------
// Error Message Utilities
// ------------------------------
export const getErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { message?: string; error?: string | string[] } }; message?: string };
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.response?.data?.error) {
    if (typeof err.response.data.error === 'string') {
      return err.response.data.error;
    }
    if (Array.isArray(err.response.data.error)) {
      return err.response.data.error[0]?.message || 'Terjadi kesalahan';
    }
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) {
      return errors[firstKey][0];
    }
  }
  return error.message || 'Terjadi kesalahan tidak terduga';
};

// ------------------------------
// Formatter Utilities
// ------------------------------
export const formatCurrencyInput = (value: string): string => {
  // Remove non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  // Format as IDR currency
  return formatRupiah(parseInt(numericValue));
};

export const parseCurrencyInput = (value: string): number => {
  // Remove non-numeric characters and parse to number
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
};
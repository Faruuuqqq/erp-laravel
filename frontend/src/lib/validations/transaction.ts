/**
 * TokoSync ERP – Transaction Validation Schemas (Zod v4)
 *
 * z.coerce.number() digunakan pada field numerik karena HTML input
 * mengirimkan string, bukan number.
 *
 * Zod v4: gunakan `.min()` / `.max()` dengan pesan langsung sebagai string,
 * BUKAN object { invalid_type_error, required_error }.
 */
import { z } from 'zod';

export const transactionItemSchema = z.object({
  productId: z.string().min(1, 'Produk wajib dipilih'),
  productName: z.string().min(1, 'Nama produk wajib diisi'),
  quantity: z.coerce
    .number({ error: 'Qty harus berupa angka' })
    .int('Qty harus berupa bilangan bulat')
    .min(1, 'Qty harus lebih dari 0')
    .max(999999, 'Qty terlalu besar'),
  price: z.coerce
    .number({ error: 'Harga harus berupa angka' })
    .min(0, 'Harga tidak boleh negatif')
    .max(999999999, 'Harga terlalu besar'),
  discount: z.coerce
    .number({ error: 'Diskon harus berupa angka' })
    .min(0, 'Diskon tidak boleh negatif')
    .max(100, 'Diskon maksimal 100%')
    .default(0),
});

export type TransactionItemFormData = z.infer<typeof transactionItemSchema>;

export const baseTransactionSchema = z.object({
  invoiceNumber: z.string().min(1, 'No. faktur wajib diisi').optional(),
  date: z
    .string()
    .min(1, 'Tanggal wajib diisi')
    .refine(
      (val) => {
        try {
          const date = new Date(val);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      },
      { message: 'Format tanggal tidak valid' },
    ),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const date = new Date(val);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      },
      { message: 'Format tanggal jatuh tempo tidak valid' },
    ),
  type: z.enum([
    'pembelian',
    'penjualan_tunai',
    'penjualan_kredit',
    'retur_pembelian',
    'retur_penjualan',
    'pembayaran_utang',
    'pembayaran_piutang',
    'surat_jalan',
    'kontra_bon',
  ]),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  salesId: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, 'Minimal 1 produk harus ditambahkan'),
  discount: z.coerce
    .number({ error: 'Diskon harus berupa angka' })
    .min(0, 'Diskon tidak boleh negatif')
    .max(999999999, 'Diskon terlalu besar')
    .default(0),
  tax: z.coerce
    .number({ error: 'Pajak harus berupa angka' })
    .min(0, 'Pajak tidak boleh negatif')
    .max(999999999, 'Pajak terlalu besar')
    .default(0),
  paid: z.coerce
    .number({ error: 'Pembayaran harus berupa angka' })
    .min(0, 'Pembayaran tidak boleh negatif')
    .max(999999999, 'Pembayaran terlalu besar')
    .default(0),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

export const transactionSchema = baseTransactionSchema
  .refine(
    (data) => {
      if (data.type === 'penjualan_kredit' || data.type === 'pembayaran_piutang') {
        return !!data.customerId;
      }
      return true;
    },
    {
      message: 'Customer wajib dipilih untuk transaksi kredit/pembayaran piutang',
      path: ['customerId'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'pembelian' || data.type === 'pembayaran_utang') {
        return !!data.supplierId;
      }
      return true;
    },
    {
      message: 'Supplier wajib dipilih untuk transaksi pembelian/pembayaran utang',
      path: ['supplierId'],
    },
  );

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const returnSchema = baseTransactionSchema.extend({
  reason: z.string().min(1, 'Alasan retur wajib dipilih'),
  purchaseInvoiceId: z.string().optional(),
  salesInvoiceId: z.string().optional(),
});

export type ReturnFormData = z.infer<typeof returnSchema>;

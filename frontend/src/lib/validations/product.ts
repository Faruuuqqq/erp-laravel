/**
 * TokoSync ERP – Product Validation Schema (Zod v4)
 *
 * Zod v4: gunakan { error: '...' } bukan { invalid_type_error, required_error }
 */
import { z } from 'zod';

export const productSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Kode produk wajib diisi')
      .min(3, 'Kode produk minimal 3 karakter')
      .max(20, 'Kode produk maksimal 20 karakter')
      .regex(/^[A-Z0-9-]+$/, 'Kode produk hanya boleh huruf kapital, angka, dan tanda strip'),
    name: z
      .string()
      .min(1, 'Nama produk wajib diisi')
      .min(3, 'Nama produk minimal 3 karakter')
      .max(100, 'Nama produk maksimal 100 karakter'),
    category: z.string().min(1, 'Kategori wajib dipilih'),
    buyPrice: z.coerce
      .number({ error: 'Harga beli harus berupa angka' })
      .min(0, 'Harga beli tidak boleh negatif')
      .max(999999999, 'Harga beli terlalu besar'),
    sellPrice: z.coerce
      .number({ error: 'Harga jual harus berupa angka' })
      .min(0.01, 'Harga jual harus lebih dari 0')
      .max(999999999, 'Harga jual terlalu besar'),
    stock: z.coerce
      .number({ error: 'Stok harus berupa angka' })
      .int('Stok harus berupa bilangan bulat')
      .min(0, 'Stok tidak boleh negatif')
      .max(999999999, 'Stok terlalu besar'),
    minStock: z.coerce
      .number({ error: 'Min stok harus berupa angka' })
      .int('Min stok harus berupa bilangan bulat')
      .min(0, 'Min stok tidak boleh negatif')
      .max(999999999, 'Min stok terlalu besar'),
    unit: z.string().min(1, 'Satuan wajib diisi').max(20, 'Satuan maksimal 20 karakter'),
    warehouseId: z.string().optional(),
  })
  .refine((data) => data.sellPrice > data.buyPrice, {
    message: 'Harga jual harus lebih besar dari harga beli',
    path: ['sellPrice'],
  });

export type ProductFormData = z.infer<typeof productSchema>;

import { z } from 'zod';

export const paymentSchema = z.object({
  transactionId: z.string()
    .min(1, 'ID transaksi wajib diisi'),
  amount: z.coerce.number({
    invalid_type_error: 'Jumlah pembayaran harus berupa angka',
    required_error: 'Jumlah pembayaran wajib diisi',
  })
    .min(0.01, 'Jumlah pembayaran harus lebih dari 0')
    .max(999999999, 'Jumlah pembayaran terlalu besar'),
  paymentDate: z.string()
    .min(1, 'Tanggal pembayaran wajib diisi')
    .refine(
      (val) => {
        try {
          const date = new Date(val);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      },
      { message: 'Format tanggal pembayaran tidak valid' }
    ),
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

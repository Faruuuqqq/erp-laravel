import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string()
    .min(1, 'Nama customer wajib diisi')
    .min(3, 'Nama customer minimal 3 karakter')
    .max(100, 'Nama customer maksimal 100 karakter'),
  phone: z.string()
    .min(1, 'No. telepon wajib diisi')
    .regex(/^[0-9+\-\s()]+$/, 'Format no. telepon tidak valid (hanya angka, +, -, spasi, (, dan )')
    .min(10, 'No. telepon minimal 10 digit')
    .max(20, 'No. telepon maksimal 20 karakter'),
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter')
    .optional(),
  address: z.string()
    .min(1, 'Alamat wajib diisi')
    .min(10, 'Alamat minimal 10 karakter')
    .max(255, 'Alamat maksimal 255 karakter')
    .optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

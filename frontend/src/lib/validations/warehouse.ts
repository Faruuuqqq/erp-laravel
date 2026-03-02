import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string()
    .min(1, 'Nama gudang wajib diisi')
    .min(3, 'Nama gudang minimal 3 karakter')
    .max(50, 'Nama gudang maksimal 50 karakter'),
  address: z.string()
    .min(1, 'Alamat wajib diisi')
    .min(10, 'Alamat minimal 10 karakter')
    .max(255, 'Alamat maksimal 255 karakter')
    .optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useSaldoPiutang = (params?: { search?: string; status?: string }) => {
  return useQuery({
    queryKey: ['info', 'saldo-piutang', params],
    queryFn: () => api.get('/info/saldo-piutang', params),
  });
};

export const useSaldoUtang = (params?: { search?: string; status?: string }) => {
  return useQuery({
    queryKey: ['info', 'saldo-utang', params],
    queryFn: () => api.get('/info/saldo-utang', params),
  });
};

export const useSaldoStok = () => {
  return useQuery({
    queryKey: ['info', 'saldo-stok'],
    queryFn: () => api.get('/info/saldo-stok'),
  });
};

interface KartuStokParams extends Record<string, unknown> {
  page?: number;
  per_page?: number;
}

export const useKartuStok = (productId: string, params?: KartuStokParams) => {
  return useQuery({
    queryKey: ['info', 'kartu-stok', productId, params],
    queryFn: () => api.get(`/info/kartu-stok?product_id=${productId}`, params),
    enabled: !!productId,
  });
};

export const useLaporanHarian = (date?: string) => {
  return useQuery({
    queryKey: ['info', 'laporan-harian', date],
    queryFn: () => api.get('/info/laporan-harian', { date }),
  });
};

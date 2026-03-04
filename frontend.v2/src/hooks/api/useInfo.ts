import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useSaldoPiutang = () => {
  return useQuery({
    queryKey: ['info', 'saldo-piutang'],
    queryFn: () => api.get('/info/saldo-piutang'),
  });
};

export const useSaldoUtang = () => {
  return useQuery({
    queryKey: ['info', 'saldo-utang'],
    queryFn: () => api.get('/info/saldo-utang'),
  });
};

export const useSaldoStok = () => {
  return useQuery({
    queryKey: ['info', 'saldo-stok'],
    queryFn: () => api.get('/info/saldo-stok'),
  });
};

interface KartuStokParams {
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

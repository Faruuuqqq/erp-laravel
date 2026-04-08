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

// ========== Print Functions ==========

/**
 * Print Saldo Piutang PDF
 * @returns Promise<void> - Opens PDF in new tab
 */
export const printSaldoPiutang = async (): Promise<void> => {
  try {
    const response = await api.get('/info/saldo-piutang/print');
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to print saldo piutang:', error);
    throw error;
  }
};

/**
 * Print Saldo Utang PDF
 * @returns Promise<void> - Opens PDF in new tab
 */
export const printSaldoUtang = async (): Promise<void> => {
  try {
    const response = await api.get('/info/saldo-utang/print');
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to print saldo utang:', error);
    throw error;
  }
};

/**
 * Print Kartu Stok PDF
 * @param productId - Product ID
 * @param from - Optional start date
 * @param to - Optional end date
 * @returns Promise<void> - Opens PDF in new tab
 */
export const printKartuStok = async (
  productId: string,
  from?: string,
  to?: string
): Promise<void> => {
  try {
    const params = new URLSearchParams({ product_id: productId });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await api.get(`/info/kartu-stok/print?${params.toString()}`);
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to print kartu stok:', error);
    throw error;
  }
};

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useDailyReport = (date?: string) => {
  return useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: () => api.get('/reports/daily', { date }),
  });
};

export const useStockReport = (params?: { page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'stock', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/stock', params),
  });
};

export const useBalanceReport = (params?: any) => {
  return useQuery({
    queryKey: ['reports', 'balance', params],
    queryFn: () => api.get('/reports/balance', params),
  });
};

export const useHistoryPembelian = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembelian', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembelian', params),
  });
};

export const useHistoryPenjualan = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'penjualan', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/penjualan', params),
  });
};

export const useHistoryReturPenjualan = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'retur-penjualan', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/retur-penjualan', params),
  });
};

export const useHistoryReturPembelian = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'retur-pembelian', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/retur-pembelian', params),
  });
};

export const useHistoryPembayaranPiutang = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembayaran-piutang', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembayaran-piutang', params),
  });
};

export const useHistoryPembayaranUtang = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembayaran-utang', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembayaran-utang', params),
  });
};

export const useReports = () => {
  return {
    daily: useDailyReport(),
    stock: useStockReport(),
    balance: useBalanceReport(),
    historyPembelian: useHistoryPembelian(),
    historyPenjualan: useHistoryPenjualan(),
    historyReturPenjualan: useHistoryReturPenjualan(),
    historyReturPembelian: useHistoryReturPembelian(),
    historyPembayaranPiutang: useHistoryPembayaranPiutang(),
    historyPembayaranUtang: useHistoryPembayaranUtang(),
  };
};

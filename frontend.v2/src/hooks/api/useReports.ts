import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';

const STALE_TIME = 5 * 60 * 1000;

export const useDailyReport = (date?: string) => {
  return useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: () => api.get('/reports/daily', { date }),
    staleTime: STALE_TIME,
  });
};

export const useLaporanHarian = useDailyReport;

export const useStockReport = () => {
  return useQuery({
    queryKey: ['reports', 'stock'],
    queryFn: () => api.get<{ data: { items: any[]; totalValue: number } }>('/reports/stock'),
    staleTime: STALE_TIME,
  });
};

export const useBalanceReport = (params?: { from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['reports', 'balance', params],
    queryFn: () => api.get('/reports/balance', params),
    staleTime: STALE_TIME,
  });
};

export const printStockReport = async (): Promise<string> => {
  const response = await apiClient.get<{ url: string; filename: string }>('/reports/stock/print');
  return response.data.url;
};

export const printDailyReport = async (date?: string): Promise<string> => {
  const response = await apiClient.get<{ url: string; filename: string }>('/reports/daily/print', { params: { date } });
  return response.data.url;
};

export const printBalanceReport = async (from?: string, to?: string): Promise<string> => {
  const response = await apiClient.get<{ url: string; filename: string }>('/reports/balance/print', { params: { from, to } });
  return response.data.url;
};

export const useHistoryPembelian = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembelian', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembelian', params),
    staleTime: STALE_TIME,
  });
};

export const useHistoryPenjualan = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'penjualan', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/penjualan', params),
    staleTime: STALE_TIME,
  });
};

export const useHistoryReturPenjualan = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'retur-penjualan', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/retur-penjualan', params),
    staleTime: STALE_TIME,
  });
};

export const useHistoryReturPembelian = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'retur-pembelian', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/retur-pembelian', params),
    staleTime: STALE_TIME,
  });
};

export const useHistoryPembayaranPiutang = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembayaran-piutang', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembayaran-piutang', params),
    staleTime: STALE_TIME,
  });
};

export const useHistoryPembayaranUtang = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembayaran-utang', params],
    queryFn: () => api.get<{ data: any; meta: any }>('/reports/history/pembayaran-utang', params),
    staleTime: STALE_TIME,
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

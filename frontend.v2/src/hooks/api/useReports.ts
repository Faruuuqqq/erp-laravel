/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';

export const useDailyReport = (date?: string) => {
  return useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: () => api.get('/reports/daily', { date }),
  });
};

export const useStockReport = (params?: { page?: number; perPage?: number; search?: string; category?: string }) => {
  return useQuery({
    queryKey: ['reports', 'stock', params],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => api.get<{ data: any[]; meta?: any; totalValue?: number }>('/reports/stock', params),
  });
};

export const useBalanceReport = (params?: { from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['reports', 'balance', params],
    queryFn: () => api.get('/reports/balance', params),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useHistoryPembelian = (params?: { from?: string; to?: string; page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['reports', 'history', 'pembelian', params],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardStats, Transaction } from '@/types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

export const useDashboardStats = (range: string = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'stats', range],
    queryFn: () => api.get<DashboardStats>(`/dashboard/stats?range=${range}`),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useRecentTransactions = (type: string = 'all') => {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', type],
    queryFn: () => api.get<Transaction[]>(`/dashboard/recent-transactions?type=${type}`),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: () => api.get('/dashboard/low-stock'),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useFinancialSummary = (range: string = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'financial-summary', range],
    queryFn: () => api.get(`/dashboard/financial-summary?range=${range}`),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useSalesTrend = (range: string = 'week') => {
  return useQuery({
    queryKey: ['dashboard', 'sales-trend', range],
    queryFn: () => api.get(`/dashboard/sales-trend?range=${range}`),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  total_jumlah: number;
  total_nilai: number;
}

export const useTopProducts = (range: string = 'week') => {
  return useQuery({
    queryKey: ['dashboard', 'top-products', range],
    queryFn: () => api.get<{ data: TopProduct[] }>(`/dashboard/top-products?range=${range}`),
  });
};

export interface CategoryDistribution {
  category: string;
  count: number;
}

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'category-distribution'],
    queryFn: () => api.get<{ data: CategoryDistribution[] }>('/dashboard/category-distribution'),
  });
};

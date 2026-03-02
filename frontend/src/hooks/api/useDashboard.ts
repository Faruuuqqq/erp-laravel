/**
 * TokoSync ERP – Dashboard API Hooks
 */
import { useApiQuery, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { DashboardStats, RecentTransaction, LowStockItem, ApiResponse, FinancialSummary, SalesTrendData } from '@/types';

export const useDashboardStats = (range?: 'today' | 'week' | 'month') => {
  return useApiQuery<DashboardStats>(
    ['dashboard', 'stats', range],
    async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(`/dashboard/stats?range=${range || 'today'}`);
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useFinancialSummary = (range?: 'today' | 'week' | 'month') => {
  return useApiQuery<FinancialSummary>(
    ['dashboard', 'financial-summary', range],
    async () => {
      const response = await apiClient.get<ApiResponse<FinancialSummary>>(`/dashboard/financial-summary?range=${range || 'today'}`);
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useSalesTrend = (range?: 'week' | 'month') => {
  return useApiQuery<SalesTrendData>(
    ['dashboard', 'sales-trend', range],
    async () => {
      const response = await apiClient.get<ApiResponse<SalesTrendData>>(`/dashboard/sales-trend?range=${range || 'week'}`);
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useRecentTransactions = (type?: 'all' | 'sales' | 'purchases', limit?: number = 5) => {
  return useApiQuery<RecentTransaction[]>(
    ['dashboard', 'recent-transactions', 'type', 'limit'],
    async () => {
      const response = await apiClient.get<ApiResponse<RecentTransaction[]>>(`/dashboard/recent-transactions?type=${type || 'all'}&limit=${limit || 5}`);
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useLowStock = () => {
  return useApiQuery<LowStockItem[]>(
    ['dashboard', 'low-stock'],
    async () => {
      const response = await apiClient.get<ApiResponse<LowStockItem[]>>('/dashboard/low-stock');
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardStats, Transaction } from '@/types';

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minStock?: number;
  unit?: string;
  category?: string;
  daysRemaining?: number | null;
  urgency: 'critical' | 'warning' | 'moderate';
}

export interface FinancialSummary {
  totalReceivables: number;
  overdueReceivables: number;
  totalPayables: number;
  pendingPayments: number;
}

export interface SalesTrendItem {
  name: string;
  sales: number;
  purchases: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  total_jumlah: number;
  total_nilai: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface ExpenseStats {
  totalExpensesToday: number;
  totalExpensesMonth: number;
  topExpenseCategory?: string;
  topExpenseCategoryAmount?: number;
}

export const useDashboardStats = (range: string = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'stats', range],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardStats }>(`/dashboard/stats?range=${range}`);
      return response.data;
    },
  });
};

export const useRecentTransactions = (type: string = 'all') => {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', type],
    queryFn: async () => {
      const response = await api.get<{ data: Transaction[] }>(`/dashboard/recent-transactions?type=${type}`);
      return response.data;
    },
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: async () => {
      const response = await api.get<{ data: LowStockItem[] }>('/dashboard/low-stock');
      return response.data;
    },
  });
};

export const useFinancialSummary = (range: string = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'financial-summary', range],
    queryFn: async () => {
      const response = await api.get<{ data: FinancialSummary }>(`/dashboard/financial-summary?range=${range}`);
      return response.data;
    },
  });
};

export const useSalesTrend = (range: string = 'week') => {
  return useQuery({
    queryKey: ['dashboard', 'sales-trend', range],
    queryFn: async () => {
      const response = await api.get<{ data: SalesTrendItem[] }>(`/dashboard/sales-trend?range=${range}`);
      return response.data;
    },
  });
};

export const useTopProducts = (range: string = 'week') => {
  return useQuery({
    queryKey: ['dashboard', 'top-products', range],
    queryFn: async () => {
      const response = await api.get<{ data: TopProduct[] }>(`/dashboard/top-products?range=${range}`);
      return response.data;
    },
  });
};

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'category-distribution'],
    queryFn: async () => {
      const response = await api.get<{ data: CategoryDistribution[] }>('/dashboard/category-distribution');
      return response.data;
    },
  });
};

export const useExpensesStats = (range: string = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'expenses-stats', range],
    queryFn: async () => {
      const response = await api.get<{ data: ExpenseStats }>(`/dashboard/expenses-stats?range=${range}`);
      return response.data;
    },
  });
};

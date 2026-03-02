import { useApiQuery, MASTER_DATA_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';

interface UsePaginatedParams<T> {
  queryKey: string[];
  fetchFn: (params?: Record<string, unknown>) => Promise<T>;
  params?: Record<string, unknown>;
}

export const usePaginated = <T>({ queryKey, fetchFn, params }: UsePaginatedParams<T>) => {
  return useApiQuery<T>(
    [...queryKey, params],
    () => fetchFn(params),
    {
      staleTime: MASTER_DATA_STALE_TIME,
    },
  );
};

export const usePaginatedCustomers = (params?: {
  search?: string;
  withBalance?: boolean;
  page?: number;
  perPage?: number;
}) => {
  return usePaginated({
    queryKey: ['customers'],
    fetchFn: async (params?: Record<string, unknown>) => {
      const response = await apiClient.get('/customers', { params });
      return response.data;
    },
    params,
  });
};

export const usePaginatedSuppliers = (params?: {
  search?: string;
  page?: number;
  perPage?: number;
}) => {
  return usePaginated({
    queryKey: ['suppliers'],
    fetchFn: async (params?: Record<string, unknown>) => {
      const response = await apiClient.get('/suppliers', { params });
      return response.data;
    },
    params,
  });
};

export const usePaginatedProducts = (params?: {
  search?: string;
  category?: string;
  warehouseId?: string;
  page?: number;
  perPage?: number;
}) => {
  return usePaginated({
    queryKey: ['products'],
    fetchFn: async (params?: Record<string, unknown>) => {
      const response = await apiClient.get('/products', { params });
      return response.data;
    },
    params,
  });
};

export const usePaginatedTransactions = (params?: {
  type?: string;
  from?: string;
  to?: string;
  customer_id?: number;
  supplier_id?: number;
  status?: string;
  page?: number;
  perPage?: number;
}) => {
  return usePaginated({
    queryKey: ['transactions'],
    fetchFn: async (params?: Record<string, unknown>) => {
      const response = await apiClient.get('/transactions', { params });
      return response.data;
    },
    params,
  });
};

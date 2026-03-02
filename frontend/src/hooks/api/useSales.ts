/**
 * TokoSync ERP – Sales API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, MASTER_DATA_STALE_TIME, optimisticDeleteFromList } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Sales, SalesFormData, ApiResponse } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = 'sales';

export const useSales = (params?: { search?: string }) => {
  return useApiQuery<Sales[]>(
    [QUERY_KEY, params],
    async () => {
      const response = await apiClient.get<ApiResponse<Sales[]>>('/sales', { params });
      return response.data.data;
    },
    { staleTime: MASTER_DATA_STALE_TIME },
  );
};

export const useSalesById = (id: string) => {
  return useApiQuery<Sales>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Sales>>(`/sales/${id}`);
      return response.data.data;
    },
    { enabled: !!id },
  );
};

export const useCreateSales = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Sales, SalesFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Sales>>('/sales', data);
      return response.data.data;
    },
    {
      successMessage: 'Sales berhasil ditambahkan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useUpdateSales = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Sales, { id: string; data: Partial<SalesFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Sales>>(`/sales/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Sales berhasil diperbarui.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useDeleteSales = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    async (id) => { await apiClient.delete(`/sales/${id}`); },
    {
      successMessage: 'Sales berhasil dihapus.',
      onMutate: async (id) => {
        const { snapshot } = await optimisticDeleteFromList<Sales>(queryClient, [QUERY_KEY], id);
        return { snapshot };
      },
      onError: (_e, _id, context) => {
        const ctx = context as { snapshot?: Sales[] } | undefined;
        if (ctx?.snapshot) queryClient.setQueryData([QUERY_KEY], ctx.snapshot);
        toast.error('Gagal menghapus sales.');
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

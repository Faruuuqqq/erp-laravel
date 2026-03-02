/**
 * TokoSync ERP – Warehouses API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, MASTER_DATA_STALE_TIME, optimisticDeleteFromList } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Warehouse, WarehouseFormData, ApiResponse } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = 'warehouses';

export const useWarehouses = () => {
  return useApiQuery<Warehouse[]>(
    [QUERY_KEY],
    async () => {
      const response = await apiClient.get<ApiResponse<Warehouse[]>>('/warehouses');
      return response.data.data;
    },
    { staleTime: MASTER_DATA_STALE_TIME },
  );
};

export const useWarehouse = (id: string) => {
  return useApiQuery<Warehouse>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
      return response.data.data;
    },
    { enabled: !!id },
  );
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Warehouse, WarehouseFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', data);
      return response.data.data;
    },
    {
      successMessage: 'Gudang berhasil ditambahkan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Warehouse, { id: string; data: Partial<WarehouseFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Gudang berhasil diperbarui.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    async (id) => { await apiClient.delete(`/warehouses/${id}`); },
    {
      successMessage: 'Gudang berhasil dihapus.',
      onMutate: async (id) => {
        const { snapshot } = await optimisticDeleteFromList<Warehouse>(queryClient, [QUERY_KEY], id);
        return { snapshot };
      },
      onError: (_e, _id, context) => {
        const ctx = context as { snapshot?: Warehouse[] } | undefined;
        if (ctx?.snapshot) queryClient.setQueryData([QUERY_KEY], ctx.snapshot);
        toast.error('Gagal menghapus gudang.');
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

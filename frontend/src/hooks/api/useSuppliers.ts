/**
 * TokoSync ERP – Suppliers API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, MASTER_DATA_STALE_TIME, optimisticDeleteFromList } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Supplier, SupplierFormData, ApiResponse } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = 'suppliers';

export const useSuppliers = (params?: { search?: string }) => {
  return useApiQuery<Supplier[]>(
    [QUERY_KEY, params],
    async () => {
      const response = await apiClient.get<ApiResponse<Supplier[]>>('/suppliers', { params });
      return response.data.data;
    },
    { staleTime: MASTER_DATA_STALE_TIME },
  );
};

export const useSupplier = (id: string) => {
  return useApiQuery<Supplier>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
      return response.data.data;
    },
    { enabled: !!id },
  );
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Supplier, SupplierFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', data);
      return response.data.data;
    },
    {
      successMessage: 'Supplier berhasil ditambahkan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Supplier, { id: string; data: Partial<SupplierFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Supplier berhasil diperbarui.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    async (id) => { await apiClient.delete(`/suppliers/${id}`); },
    {
      successMessage: 'Supplier berhasil dihapus.',
      onMutate: async (id) => {
        const { snapshot } = await optimisticDeleteFromList<Supplier>(queryClient, [QUERY_KEY], id);
        return { snapshot };
      },
      onError: (_e, _id, context) => {
        const ctx = context as { snapshot?: Supplier[] } | undefined;
        if (ctx?.snapshot) queryClient.setQueryData([QUERY_KEY], ctx.snapshot);
        toast.error('Gagal menghapus supplier.');
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

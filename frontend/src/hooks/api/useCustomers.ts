/**
 * TokoSync ERP – Customers API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, MASTER_DATA_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Customer, CustomerFormData, ApiResponse } from '@/types';
import { toast } from 'sonner';
import { optimisticDeleteFromList } from '@/hooks/api/base';

const QUERY_KEY = 'customers';

export const useCustomers = (params?: { search?: string; withBalance?: boolean }) => {
  return useApiQuery<Customer[]>(
    [QUERY_KEY, params],
    async () => {
      const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });
      return response.data.data;
    },
    { staleTime: MASTER_DATA_STALE_TIME },
  );
};

export const useCustomer = (id: string) => {
  return useApiQuery<Customer>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
      return response.data.data;
    },
    { enabled: !!id },
  );
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Customer, CustomerFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
      return response.data.data;
    },
    {
      successMessage: 'Customer berhasil ditambahkan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Customer, { id: string; data: Partial<CustomerFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Customer berhasil diperbarui.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    async (id) => { await apiClient.delete(`/customers/${id}`); },
    {
      successMessage: 'Customer berhasil dihapus.',
      onMutate: async (id) => {
        const { snapshot } = await optimisticDeleteFromList<Customer>(queryClient, [QUERY_KEY], id);
        return { snapshot };
      },
      onError: (_e, _id, context) => {
        const ctx = context as { snapshot?: Customer[] } | undefined;
        if (ctx?.snapshot) queryClient.setQueryData([QUERY_KEY], ctx.snapshot);
        toast.error('Gagal menghapus customer.');
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    },
  );
};

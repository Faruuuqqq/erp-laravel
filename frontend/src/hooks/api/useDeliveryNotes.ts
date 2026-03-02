/**
 * TokoSync ERP – Delivery Notes (Surat Jalan) API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { DeliveryNote, ApiResponse } from '@/types';

const QUERY_KEY = 'delivery-notes';

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useDeliveryNotes = () => {
  return useApiQuery<DeliveryNote[]>(
    [QUERY_KEY],
    async () => {
      const response = await apiClient.get<ApiResponse<DeliveryNote[]>>('/delivery-notes');
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useDeliveryNote = (id: string) => {
  return useApiQuery<DeliveryNote>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<DeliveryNote>>(`/delivery-notes/${id}`);
      return response.data.data;
    },
    {
      enabled: !!id,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateDeliveryNote = () => {
  const queryClient = useQueryClient();

  return useApiMutation<DeliveryNote, {
    date: string;
    transactionId?: string;
    customerId?: string;
    driver?: string;
    vehiclePlate?: string;
    address?: string;
    notes?: string;
  }>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<DeliveryNote>>('/delivery-notes', data);
      return response.data.data;
    },
    {
      successMessage: 'Surat jalan berhasil dibuat.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

export const useUpdateDeliveryNote = () => {
  const queryClient = useQueryClient();

  return useApiMutation<DeliveryNote, {
    id: string;
    status?: 'pending' | 'delivered' | 'cancelled';
  }>(
    async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<DeliveryNote>>(`/delivery-notes/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Status surat jalan berhasil diperbarui.',
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      },
    },
  );
};

export const useDeleteDeliveryNote = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    async (id) => {
      await apiClient.delete(`/delivery-notes/${id}`);
    },
    {
      successMessage: 'Surat jalan berhasil dihapus.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

export const usePrintDeliveryNote = () => {
  return useApiMutation<{ url: string; filename: string }, string>(
    async (id) => {
      const response = await apiClient.get<{ url: string; filename: string }>(`/delivery-notes/${id}/print`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        window.open(data.url, '_blank');
      },
    },
  );
};

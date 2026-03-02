import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { ReturnPurchase, ApiResponse } from '@/types';

// ─── Return Purchases (Retur Pembelian) ─────────────────────────────────────
export const useReturnPurchases = () => {
  return useApiQuery<ReturnPurchase[]>(
    ['return-purchases'],
    async () => {
      const response = await apiClient.get<ApiResponse<ReturnPurchase[]>>('/return-purchases');
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useCreateReturnPurchase = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ReturnPurchase, {
    reason: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      discount?: number;
    }>;
  }>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<ReturnPurchase>>('/return-purchases', {
        ...data,
        items: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          subtotal: item.price * item.quantity * (1 - (item.discount || 0) / 100),
        })),
      });
      return response.data.data;
    },
    {
      successMessage: 'Retur pembelian berhasil disimpan.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    },
  );
};

export const useUpdateReturnPurchase = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ReturnPurchase, { id: string; data: { notes?: string; status?: 'draft' | 'processed' | 'cancelled' } }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<ReturnPurchase>>(`/return-purchases/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Retur pembelian berhasil diperbarui.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
      },
    },
  );
};

export const useDeleteReturnPurchase = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    async (id) => {
      await apiClient.delete(`/return-purchases/${id}`);
    },
    {
      successMessage: 'Retur pembelian berhasil dihapus.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
      },
    },
  );
};

export const usePrintReturnPurchase = () => {
  return useApiMutation<{ url: string; filename: string }, string>(
    async (id) => {
      const response = await apiClient.get<{ url: string; filename: string }>(`/return-purchases/${id}/print`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        window.open(data.url, '_blank');
      },
    },
  );
};

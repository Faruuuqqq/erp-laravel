/**
 * TokoSync ERP – Transactions API Hooks
 * staleTime: 0 – transaksi harus selalu fresh untuk POS kasir.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Transaction, TransactionFormData, ApiResponse } from '@/types';

const QUERY_KEY = 'transactions';

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useTransactions = (params?: { type?: string; from?: string; to?: string }) => {
  return useApiQuery<Transaction[]>(
    [QUERY_KEY, params],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME, // 0 = selalu refetch
      refetchOnWindowFocus: true,         // aktifkan untuk transaksi saja
    },
  );
};

export const useTransaction = (id: string) => {
  return useApiQuery<Transaction>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      return response.data.data;
    },
    {
      enabled: !!id,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, TransactionFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', data);
      return response.data.data;
    },
    {
      successMessage: 'Transaksi berhasil disimpan.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        // Juga invalidate dashboard dan stok setelah transaksi
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    },
  );
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, { id: string; data: Partial<TransactionFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Transaksi berhasil diperbarui.',
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    },
  );
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, { id: string; paid: number }>(
    async ({ id, paid }) => {
      const response = await apiClient.patch<ApiResponse<Transaction>>(
        `/transactions/${id}/payment`,
        { paid },
      );
      return response.data.data;
    },
    {
      successMessage: 'Status pembayaran berhasil diperbarui.',
      // ── Optimistic Update: update saldo langsung di UI ────────────────────
      onMutate: async ({ id, paid }) => {
        await queryClient.cancelQueries({ queryKey: [QUERY_KEY, id] });
        const snapshot = queryClient.getQueryData<Transaction>([QUERY_KEY, id]);

        if (snapshot) {
          queryClient.setQueryData<Transaction>([QUERY_KEY, id], {
            ...snapshot,
            paid,
            remaining: snapshot.total - paid,
          });
        }
        return { snapshot };
      },
      onError: (_error, { id }, context) => {
        const ctx = context as { snapshot?: Transaction } | undefined;
        if (ctx?.snapshot) {
          queryClient.setQueryData([QUERY_KEY, id], ctx.snapshot);
        }
      },
      onSettled: (_data, _error, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    async (id) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    {
      successMessage: 'Transaksi berhasil dihapus.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    },
  );
};

// ─── Return Sales (Retur Penjualan) ─────────────────────────────────────────────────
export const useReturnSales = () => {
  return useApiQuery<Transaction[]>(
    ['return-sales'],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/return-sales');
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useCreateReturnSale = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, Omit<TransactionFormData, 'type' | 'invoiceNumber' | 'date' | 'total' | 'remaining' | 'subtotal' | 'discount' | 'tax' | 'paid' | 'notes' | 'status'> & {
  transactionId?: string;
  customerId?: string;
  salesId?: string;
  reason: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
}>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Transaction>>('/return-sales', data);
      return response.data.data;
    },
    {
      successMessage: 'Retur penjualan berhasil disimpan.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-sales'] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    },
  );
};

export const useUpdateReturnSale = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, { id: string; notes?: string; status?: 'draft' | 'processed' | 'cancelled' }>(
    async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<Transaction>>(`/return-sales/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Retur penjualan berhasil diperbarui.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-sales'] });
      },
    },
  );
};

export const useDeleteReturnSale = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    async (id) => {
      await apiClient.delete(`/return-sales/${id}`);
    },
    {
      successMessage: 'Retur penjualan berhasil dihapus.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-sales'] });
      },
    },
  );
};

export const usePrintReturnSale = () => {
  return useApiMutation<{ url: string; filename: string }, string>(
    async (id) => {
      const response = await apiClient.get<{ url: string; filename: string }>(`/return-sales/${id}/print`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        window.open(data.url, '_blank');
      },
    },
  );
};

// ─── Return Purchases (Retur Pembelian) ─────────────────────────────────────────
export const useReturnPurchases = () => {
  return useApiQuery<Transaction[]>(
    ['return-purchases'],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/return-purchases');
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useCreateReturnPurchase = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, Omit<TransactionFormData, 'type' | 'invoiceNumber' | 'date' | 'total' | 'remaining' | 'subtotal' | 'discount' | 'tax' | 'paid' | 'notes' | 'status'> & {
  transactionId?: string;
  supplierId?: string;
  reason: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
}>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Transaction>>('/return-purchases', data);
      return response.data.data;
    },
    {
      successMessage: 'Retur pembelian berhasil disimpan.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    },
  );
};

export const useUpdateReturnPurchase = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Transaction, { id: string; notes?: string; status?: 'draft' | 'processed' | 'cancelled' }>(
    async ({ id, ...data }) => {
      const response = await apiClient.put<ApiResponse<Transaction>>(`/return-purchases/${id}`, data);
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

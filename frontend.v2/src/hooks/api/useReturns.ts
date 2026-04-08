import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ========== Return Purchase (Retur Pembelian) ==========

export interface ReturnPurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface CreateReturnPurchasePayload {
  transaction_id?: string;
  supplier_id?: string;
  date: string;
  reason: string;
  notes?: string;
  items: ReturnPurchaseItem[];
}

export const useReturnPurchases = (params?: any) => {
  return useQuery({
    queryKey: ['return-purchases', params],
    queryFn: () => api.get('/return-purchases', params),
  });
};

export const useReturnPurchase = (id: string) => {
  return useQuery({
    queryKey: ['return-purchases', id],
    queryFn: () => api.get(`/return-purchases/${id}`),
    enabled: !!id,
  });
};

export const useCreateReturnPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnPurchasePayload) => api.post('/return-purchases', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock changes
      queryClient.invalidateQueries({ queryKey: ['suppliers'] }); // Balance changes
    },
  });
};

export const useUpdateReturnPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReturnPurchasePayload> }) =>
      api.put(`/return-purchases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
    },
  });
};

export const useDeleteReturnPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/return-purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-purchases'] });
    },
  });
};

// ========== Return Sale (Retur Penjualan) ==========

export interface ReturnSaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface CreateReturnSalePayload {
  transaction_id?: string;
  customer_id?: string;
  date: string;
  reason: string;
  refund_method: string; // 'tunai' | 'potong_piutang' | 'tukar_barang' | 'kredit_nota'
  notes?: string;
  items: ReturnSaleItem[];
}

export const useReturnSales = (params?: any) => {
  return useQuery({
    queryKey: ['return-sales', params],
    queryFn: () => api.get('/return-sales', params),
  });
};

export const useReturnSale = (id: string) => {
  return useQuery({
    queryKey: ['return-sales', id],
    queryFn: () => api.get(`/return-sales/${id}`),
    enabled: !!id,
  });
};

export const useCreateReturnSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnSalePayload) => api.post('/return-sales', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock changes
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Balance changes
    },
  });
};

export const useUpdateReturnSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReturnSalePayload> }) =>
      api.put(`/return-sales/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-sales'] });
    },
  });
};

export const useDeleteReturnSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/return-sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-sales'] });
    },
  });
};

// ========== Print Functions ==========

/**
 * Print Return Purchase PDF
 * @param id - Return Purchase ID
 * @returns Promise<void> - Opens PDF in new tab
 */
export const printReturnPurchase = async (id: string): Promise<void> => {
  try {
    const response = await api.get(`/return-purchases/${id}/print`);
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to print return purchase:', error);
    throw error;
  }
};

/**
 * Print Return Sale PDF
 * @param id - Return Sale ID
 * @returns Promise<void> - Opens PDF in new tab
 */
export const printReturnSale = async (id: string): Promise<void> => {
  try {
    const response = await api.get(`/return-sales/${id}/print`);
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to print return sale:', error);
    throw error;
  }
};

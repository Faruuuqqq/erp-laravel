import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, PaginatedResponse } from '@/types';

interface TransactionQueryParams {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  perPage?: number;
  page?: number;
}

export const useTransactions = (params?: TransactionQueryParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get<PaginatedResponse<Transaction>>('/transactions', params as Record<string, unknown>),
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put(`/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/transactions/${id}/payment`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useToggleHideTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/transactions/${id}/toggle-hidden`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const usePrintInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => api.get(`/transactions/${id}/print/invoice`),
  });
};

export const usePrintReceipt = () => {
  return useMutation({
    mutationFn: (id: string) => api.get(`/transactions/${id}/print/receipt`),
  });
};

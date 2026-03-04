import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, PaginatedResponse } from '@/types';

export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get<PaginatedResponse<Transaction>>('/transactions', params),
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
  return useMutation({
    mutationFn: (data: any) => api.post('/transactions', data),
  });
};

export const useUpdateTransaction = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/transactions/${id}`, data),
  });
};

export const useDeleteTransaction = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
  });
};

export const useUpdatePayment = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/transactions/${id}/payment`, data),
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

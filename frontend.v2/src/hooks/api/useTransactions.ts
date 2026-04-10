import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';
import type { Transaction, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get<PaginatedResponse<Transaction>>('/transactions', params),
    staleTime: STALE_TIME,
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: !!id,
    staleTime: STALE_TIME,
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
    mutationFn: async (id: string) => {
      const response = await apiClient.get<{ url: string }>(`/transactions/${id}/print/invoice`);
      return response.data;
    },
  });
};

export const usePrintReceipt = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.get<{ url: string }>(`/transactions/${id}/print/receipt`);
      return response.data;
    },
  });
};

export const printInvoice = async (id: string) => {
  const response = await apiClient.get<{ url: string }>(`/transactions/${id}/print/invoice`);
  if (response.data.url) {
    window.open(response.data.url, '_blank');
  }
};

export const printReceipt = async (id: string) => {
  const response = await apiClient.get<{ url: string }>(`/transactions/${id}/print/receipt`);
  if (response.data.url) {
    window.open(response.data.url, '_blank');
  }
};

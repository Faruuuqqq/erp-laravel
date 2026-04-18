import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';
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

interface DownloadPrintPdfPayload {
  transactionId: string;
  filename: string;
  documentType: 'invoice' | 'receipt' | 'document';
}

interface DownloadKontraBonPdfPayload {
  customerId: string;
  transactionIds: string[];
  filename: string;
  interestRate?: number;
}

export const useDownloadTransactionPdf = () => {
  return useMutation({
    mutationFn: async ({ transactionId, filename, documentType }: DownloadPrintPdfPayload) => {
      const endpoint =
        documentType === 'invoice'
          ? 'invoice'
          : documentType === 'receipt'
            ? 'receipt'
            : 'document';
      const response = await apiClient.getClient().get<Blob>(
        `/transactions/${transactionId}/print/${endpoint}`,
        {
          params: { download: 1, filename },
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    },
  });
};

export const useDownloadKontraBonPdf = () => {
  return useMutation({
    mutationFn: async ({ customerId, transactionIds, filename, interestRate }: DownloadKontraBonPdfPayload) => {
      const response = await apiClient.getClient().post<Blob>(
        '/kontra-bon/print',
        {
          customer_id: customerId,
          transaction_ids: transactionIds,
          interest_rate: interestRate ?? 0,
          download: true,
          filename,
        },
        {
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    },
  });
};

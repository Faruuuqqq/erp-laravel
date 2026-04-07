import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';

export const useKontraBon = (params?: { customer_id?: string; from?: string; to?: string; perPage?: number }) => {
  return useQuery({
    queryKey: ['kontra-bon', params],
    queryFn: () => api.get('/kontra-bon', params),
  });
};

export const useKontraBonAging = (customerId: string) => {
  return useQuery({
    queryKey: ['kontra-bon', 'aging', customerId],
    queryFn: () => api.post('/kontra-bon/aging', { customer_id: customerId }),
    enabled: !!customerId,
  });
};

export const printKontraBon = async (data: {
  customer_id: string;
  transaction_ids: string[];
  interest_rate?: number;
}): Promise<{ url: string; filename: string; billing_number: string }> => {
  const response = await apiClient.post('/kontra-bon/print', data);
  return response.data;
};

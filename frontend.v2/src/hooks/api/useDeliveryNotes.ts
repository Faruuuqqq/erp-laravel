import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import apiClient from '@/lib/api-client';

export const useDeliveryNotes = (params?: { page?: number; per_page?: number }) => {
  return useQuery({
    queryKey: ['delivery-notes', params],
    queryFn: () => api.get('/delivery-notes', params),
  });
};

export const useDeliveryNote = (id: string) => {
  return useQuery({
    queryKey: ['delivery-notes', id],
    queryFn: () => api.get(`/delivery-notes/${id}`),
    enabled: !!id,
  });
};

export const useCreateDeliveryNote = () => {
  return useMutation({
    mutationFn: (data: any) => api.post('/delivery-notes', data),
  });
};

export const useUpdateDeliveryNote = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/delivery-notes/${id}`, data),
  });
};

export const useDeleteDeliveryNote = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/delivery-notes/${id}`),
  });
};

export const printDeliveryNote = async (id: string): Promise<string> => {
  const response = await apiClient.get<{ url: string; filename: string }>(`/delivery-notes/${id}/print`);
  return response.data.url;
};

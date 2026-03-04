import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Supplier, PaginatedResponse } from '@/types';

export const useSuppliers = (params?: any) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => api.get<PaginatedResponse<Supplier>>('/suppliers', params),
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => api.get<Supplier>(`/suppliers/${id}`),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
  });
};

export const useUpdateSupplier = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/suppliers/${id}`, data),
  });
};

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
  });
};

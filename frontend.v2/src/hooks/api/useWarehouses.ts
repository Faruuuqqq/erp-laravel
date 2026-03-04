import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Warehouse, PaginatedResponse } from '@/types';

export const useWarehouses = (params?: any) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => api.get<PaginatedResponse<Warehouse>>('/warehouses', params),
  });
};

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => api.get<Warehouse>(`/warehouses/${id}`),
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
  return useMutation({
    mutationFn: (data: any) => api.post('/warehouses', data),
  });
};

export const useUpdateWarehouse = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/warehouses/${id}`, data),
  });
};

export const useDeleteWarehouse = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/warehouses/${id}`),
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Warehouse, PaginatedResponse } from '@/types';

interface WarehouseParams {
  perPage?: number;
  page?: number;
  search?: string;
}

export const useWarehouses = (params?: WarehouseParams) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => api.get<PaginatedResponse<Warehouse>>('/warehouses', params as Record<string, unknown>),
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/warehouses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put(`/warehouses/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/warehouses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });
};

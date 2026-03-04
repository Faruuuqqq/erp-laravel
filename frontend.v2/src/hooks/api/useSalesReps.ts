import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SalesRep, PaginatedResponse } from '@/types';

export const useSalesReps = (params?: any) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => api.get<PaginatedResponse<SalesRep>>('/sales', params),
  });
};

export const useSalesRep = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get<SalesRep>(`/sales/${id}`),
    enabled: !!id,
  });
};

export const useCreateSalesRep = () => {
  return useMutation({
    mutationFn: (data: any) => api.post('/sales', data),
  });
};

export const useUpdateSalesRep = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/sales/${id}`, data),
  });
};

export const useDeleteSalesRep = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sales/${id}`),
  });
};

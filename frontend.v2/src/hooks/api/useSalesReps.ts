import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SalesRep, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

export const useSalesReps = (params?: any) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => api.get<PaginatedResponse<SalesRep>>('/sales', params),
    staleTime: STALE_TIME,
  });
};

export const useSalesRep = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get<SalesRep>(`/sales/${id}`),
    enabled: !!id,
    staleTime: STALE_TIME,
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

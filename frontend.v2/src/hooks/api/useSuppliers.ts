import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Supplier, PaginatedResponse } from '@/types';

// Query key factory for type-safe and consistent query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters?: { page?: number; perPage?: number; search?: string }) =>
    [...supplierKeys.lists(), { page: filters?.page ?? 1, perPage: filters?.perPage ?? 20, search: filters?.search ?? '' }] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export const useSuppliers = (params?: any) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Supplier>>('/suppliers', params),
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => api.get<Supplier>(`/suppliers/${id}`),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
    onMutate: async (newSupplier) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: supplierKeys.lists() });
      
      // Snapshot previous data
      const previousSuppliers = queryClient.getQueryData(supplierKeys.lists());
      
      // Generate temp ID
      const tempId = 'temp-' + Date.now();
      
      // Optimistically update cache for the current list query
      queryClient.setQueryData(supplierKeys.lists(), (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newSupplier, id: tempId }],
      }));
      
      return { previousSuppliers, tempId };
    },
    onSuccess: (result, newSupplier, context) => {
      // Replace optimistic data with real data
      queryClient.setQueryData(supplierKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((s: any) =>
          s.id === context?.tempId ? result.data : s
        ),
      }));
    },
    onError: (err, newSupplier, context) => {
      // Rollback on error
      if (context?.previousSuppliers) {
        queryClient.setQueryData(supplierKeys.lists(), context.previousSuppliers);
      }
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/suppliers/${id}`, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: supplierKeys.detail(id) });
      
      // Snapshot previous data
      const previousSupplier = queryClient.getQueryData(supplierKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(supplierKeys.detail(id), { ...previousSupplier, ...data });
      
      // Also update in list view
      queryClient.setQueryData(supplierKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((s: any) =>
          s.id === id ? { ...s, ...data } : s
        ),
      }));
      
      return { previousSupplier };
    },
    onError: (err, { id }, context) => {
      if (context?.previousSupplier) {
        queryClient.setQueryData(supplierKeys.detail(id), context.previousSupplier);
      }
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: supplierKeys.lists() });
      
      // Snapshot previous data
      const previousSuppliers = queryClient.getQueryData(supplierKeys.lists());
      
      // Optimistically remove from list
      queryClient.setQueryData(supplierKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).filter((s: any) => s.id !== id),
      }));
      
      return { previousSuppliers };
    },
    onError: (err, id, context) => {
      if (context?.previousSuppliers) {
        queryClient.setQueryData(supplierKeys.lists(), context.previousSuppliers);
      }
    },
  });
};

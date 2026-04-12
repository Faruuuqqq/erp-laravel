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

interface SupplierQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
}

interface CreateSupplierRequest {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  noRekening?: string;
}

interface UpdateSupplierRequest {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  noRekening?: string;
}

export const useSuppliers = (params?: SupplierQueryParams) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Supplier>>('/suppliers', params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
     mutationFn: (data: CreateSupplierRequest) => api.post('/suppliers', data),
     onMutate: async (newSupplier) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries({ queryKey: supplierKeys.lists() });
       
       // Snapshot previous data
       const previousSuppliers = queryClient.getQueryData(supplierKeys.lists());
       
       // Generate temp ID
       const tempId = 'temp-' + Date.now();
       
       // Optimistically update cache for the current list query
       queryClient.setQueryData(supplierKeys.lists(), (old: PaginatedResponse<Supplier> | undefined) => ({
         ...old,
         data: [...(old?.data || []), { ...newSupplier, id: tempId }],
       }));
       
       return { previousSuppliers, tempId };
     },
     onSuccess: (result, newSupplier, context) => {
       // Replace optimistic data with real data
       queryClient.setQueryData(supplierKeys.lists(), (old: PaginatedResponse<Supplier> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: Supplier) =>
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
     mutationFn: ({ id, data }: { id: string; data: UpdateSupplierRequest }) =>
       api.put(`/suppliers/${id}`, data),
     onMutate: async ({ id, data }) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries({ queryKey: supplierKeys.detail(id) });
       
       // Snapshot previous data
       const previousSupplier = queryClient.getQueryData(supplierKeys.detail(id));
       
       // Optimistically update
       queryClient.setQueryData(supplierKeys.detail(id), { ...previousSupplier, ...data });
       
       // Also update in list view
       queryClient.setQueryData(supplierKeys.lists(), (old: PaginatedResponse<Supplier> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: Supplier) =>
           s.id === id ? { ...s, ...data } : s
         ),
       }));
       
       return { previousSupplier };
     },
     onSuccess: (result, { id }, context) => {
       queryClient.setQueryData(supplierKeys.detail(id), result.data);
       queryClient.setQueryData(supplierKeys.lists(), (old: PaginatedResponse<Supplier> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: Supplier) =>
           s.id === id ? result.data : s
         ),
       }));
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
       queryClient.setQueryData(supplierKeys.lists(), (old: PaginatedResponse<Supplier> | undefined) => ({
         ...old,
         data: (old?.data || []).filter((s: Supplier) => s.id !== id),
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

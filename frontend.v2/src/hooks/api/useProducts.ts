import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

// Query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: { page?: number; perPage?: number; search?: string }) =>
    [...productKeys.lists(), { page: filters?.page ?? 1, perPage: filters?.perPage ?? 20, search: filters?.search ?? '' }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Product>>('/products', params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.post('/products', data),
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      
      // Snapshot previous data
      const previousProducts = queryClient.getQueryData(productKeys.lists());
      
      // Generate temp ID for optimistic update
      const tempId = 'temp-' + Date.now();
      
      // Optimistically update cache
      queryClient.setQueryData(productKeys.lists(), (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newProduct, id: tempId }],
      }));
      
      return { previousProducts, tempId };
    },
    onSuccess: (result, newProduct, context) => {
      // Replace optimistic data dengan real data dari server
      queryClient.setQueryData(productKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((p: any) => 
          p.id === context?.tempId ? result.data : p
        ),
      }));
    },
    onError: (err, newProduct, context) => {
      // Rollback ke previous data jika gagal
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/products/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      const previousProduct = queryClient.getQueryData(productKeys.detail(id));
      queryClient.setQueryData(productKeys.detail(id), { ...previousProduct, ...data });
      
      // Also update in list view
      queryClient.setQueryData(productKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((p: any) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
      
      return { previousProduct };
    },
    onError: (err, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct);
      }
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      const previousProducts = queryClient.getQueryData(productKeys.lists());
      queryClient.setQueryData(productKeys.lists(), (old: any) => ({
        ...old,
        data: old?.data?.filter((p: any) => p.id !== id) || [],
      }));
      return { previousProducts };
    },
    onError: (err, id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/products/${id}/stock`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      const previousProduct = queryClient.getQueryData(productKeys.detail(id));
      queryClient.setQueryData(productKeys.detail(id), { ...previousProduct, stock: data.stock });
      
      // Also update in list view
      queryClient.setQueryData(productKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((p: any) =>
          p.id === id ? { ...p, stock: data.stock } : p
        ),
      }));
      
      return { previousProduct };
    },
    onError: (err, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct);
      }
    },
  });
};

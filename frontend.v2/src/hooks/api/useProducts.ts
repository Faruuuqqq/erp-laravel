import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<PaginatedResponse<Product>>('/products', params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
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
      await queryClient.cancelQueries({ queryKey: ['products'] });
      
      // Snapshot previous data
      const previousProducts = queryClient.getQueryData(['products']);
      
      // Optimistically update cache
      queryClient.setQueryData(['products'], (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newProduct, id: 'temp-' + Date.now() }],
      }));
      
      return { previousProducts };
    },
    onSuccess: (result, newProduct, context) => {
      // Replace optimistic data dengan real data dari server
      queryClient.setQueryData(['products'], (old: any) => ({
        ...old,
        data: (old?.data || []).map((p: any) => 
          p.id === 'temp-' + newProduct.timestamp ? result.data : p
        ),
      }));
    },
    onError: (err, newProduct, context) => {
      // Rollback ke previous data jika gagal
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      // Refetch untuk ensure data up-to-date
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/products/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProduct = queryClient.getQueryData(['products', id]);
      queryClient.setQueryData(['products', id], { ...previousProduct, ...data });
      return { previousProduct };
    },
    onError: (err, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(['products', id], context.previousProduct);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData(['products']);
      queryClient.setQueryData(['products'], (old: any) => ({
        ...old,
        data: old?.data?.filter((p: any) => p.id !== id) || [],
      }));
      return { previousProducts };
    },
    onError: (err, id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/products/${id}/stock`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProduct = queryClient.getQueryData(['products', id]);
      queryClient.setQueryData(['products', id], { ...previousProduct, stock: data.stock });
      return { previousProduct };
    },
    onError: (err, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(['products', id], context.previousProduct);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

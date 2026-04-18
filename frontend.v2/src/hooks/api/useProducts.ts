import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

interface ProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  warehouse_id?: number;
}

// Query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductQueryParams) =>
    [...productKeys.lists(), { page: filters?.page ?? 1, per_page: filters?.per_page ?? 20, search: filters?.search ?? '', category_id: filters?.category_id, warehouse_id: filters?.warehouse_id }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Product>>('/products', {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 20,
      search: params?.search,
      category_id: params?.category_id,
      warehouse_id: params?.warehouse_id,
    }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
};

interface CreateProductRequest {
  name: string;
  code: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  warehouseId?: string;
}

export const useCreateProduct = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: (data: CreateProductRequest) => api.post('/products', data),
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      
      // Snapshot previous data
      const previousProducts = queryClient.getQueryData(productKeys.lists());
      
      // Generate temp ID for optimistic update - fixed timestamp issue
      const tempId = `temp_${Date.now()}`;
      
       // Optimistically update cache
       if (previousProducts) {
         queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
           ...old,
           data: [...(old?.data || []), { ...newProduct, id: tempId }],
           meta: { ...old?.meta, total: (old?.meta?.total ?? 0) + 1 },
         }));
       }
      
      return { previousProducts, tempId };
    },
    onSuccess: (result, newProduct, context) => {
       // Replace optimistic data with real data from server
       if (context?.previousProducts) {
         queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
           ...old,
           data: (old?.data || []).map((p: Product) => 
             p.id === context?.tempId ? result.data : p
           ),
         }));
       }
       // Add to detail cache
       queryClient.setQueryData(productKeys.detail(result.data.id), result.data);
     },
    onError: (err, newProduct, context) => {
      // Rollback to previous data if failed
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },
    // NO onSettled - let optimistic update work properly
  });
};

interface UpdateProductRequest {
  code?: string;
  name?: string;
  category?: string;
  buyPrice?: number;
  sellPrice?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  warehouseId?: string;
}

export const useUpdateProduct = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
       api.put(`/products/${id}`, data),
     onMutate: async ({ id, data }) => {
       await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
       const previousProduct = queryClient.getQueryData(productKeys.detail(id));
       queryClient.setQueryData(productKeys.detail(id), { ...previousProduct, ...data });
       
       // Also update in list view
       queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
         ...old,
         data: (old?.data || []).map((p: Product) =>
           p.id === id ? { ...p, ...data } : p
         ),
       }));
       
       return { previousProduct };
     },
     onSuccess: (result, { id }, context) => {
       queryClient.setQueryData(productKeys.detail(id), result.data);
       queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
         ...old,
         data: (old?.data || []).map((p: Product) =>
           p.id === id ? result.data : p
         ),
       }));
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
       queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
         ...old,
         data: old?.data?.filter((p: Product) => p.id !== id) || [],
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
     mutationFn: ({ id, data }: { id: string; data: { stock: number } }) =>
       api.patch(`/products/${id}/stock`, data),
     onMutate: async ({ id, data }) => {
       await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
       const previousProduct = queryClient.getQueryData(productKeys.detail(id));
       queryClient.setQueryData(productKeys.detail(id), { ...previousProduct, stock: data.stock });
       
       // Also update in list view
       queryClient.setQueryData(productKeys.lists(), (old: PaginatedResponse<Product> | undefined) => ({
         ...old,
         data: (old?.data || []).map((p: Product) =>
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

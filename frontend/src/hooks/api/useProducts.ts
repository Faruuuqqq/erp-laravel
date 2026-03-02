/**
 * TokoSync ERP – Products API Hooks
 * Menggunakan Axios client nyata (bukan mock-api).
 * Optimistic delete: produk langsung hilang dari UI sebelum server konfirmasi.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, MASTER_DATA_STALE_TIME } from '@/hooks/api/base';
import { optimisticDeleteFromList } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type { Product, ProductFormData, ApiResponse, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = 'products';

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export const useProducts = (params?: { search?: string; category?: string }) => {
  return useApiQuery<Product[]>(
    [QUERY_KEY, params],
    async () => {
      const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
      return response.data.data;
    },
    { staleTime: MASTER_DATA_STALE_TIME },
  );
};

export const useProduct = (id: string) => {
  return useApiQuery<Product>(
    [QUERY_KEY, id],
    async () => {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data;
    },
    { enabled: !!id },
  );
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Product, ProductFormData>(
    async (data) => {
      const response = await apiClient.post<ApiResponse<Product>>('/products', data);
      return response.data.data;
    },
    {
      successMessage: 'Produk berhasil ditambahkan.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Product, { id: string; data: Partial<ProductFormData> }>(
    async ({ id, data }) => {
      const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
      return response.data.data;
    },
    {
      successMessage: 'Produk berhasil diperbarui.',
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      },
    },
  );
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useApiMutation<Product, { id: string; stock: number; type: 'add' | 'set' }>(
    async ({ id, stock, type }) => {
      const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, {
        stock,
        type,
      });
      return response.data.data;
    },
    {
      successMessage: 'Stok berhasil diperbarui.',
      onSuccess: (updatedProduct) => {
        // Optimistic: langsung update cache produk yang diubah
        queryClient.setQueryData<Product>([QUERY_KEY, updatedProduct.id], updatedProduct);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    async (id) => {
      await apiClient.delete(`/products/${id}`);
    },
    {
      successMessage: 'Produk berhasil dihapus.',
      // ── Optimistic Delete ──────────────────────────────────────────────────
      onMutate: async (id) => {
        const { snapshot } = await optimisticDeleteFromList<Product>(
          queryClient,
          [QUERY_KEY],
          id,
        );
        return { snapshot };
      },
      onError: (_error, _id, context) => {
        const ctx = context as { snapshot?: Product[] } | undefined;
        if (ctx?.snapshot) {
          queryClient.setQueryData([QUERY_KEY], ctx.snapshot);
        }
        toast.error('Gagal menghapus produk. Data telah dikembalikan.');
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      },
    },
  );
};

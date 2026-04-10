import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

interface UseSearchProductsOptions {
  search?: string;
  enabled?: boolean;
}

export const useSearchProducts = ({ search = '', enabled = true }: UseSearchProductsOptions = {}) => {
  return useQuery({
    queryKey: ['products', 'search', search],
    queryFn: () => api.get<PaginatedResponse<Product>>('/products', { 
      search: search || undefined,
      per_page: 50, // Limit results for search
    }),
    staleTime: STALE_TIME,
    enabled: enabled && search.length > 0, // Only fetch when search has value
  });
};

export const useProductsMinimal = (perPage: number = 50) => {
  return useQuery({
    queryKey: ['products', 'minimal', perPage],
    queryFn: () => api.get<PaginatedResponse<Product>>('/products', { per_page: perPage }),
    staleTime: STALE_TIME,
  });
};
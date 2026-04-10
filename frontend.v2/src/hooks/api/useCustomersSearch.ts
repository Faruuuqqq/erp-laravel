import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

interface UseSearchCustomersOptions {
  search?: string;
  enabled?: boolean;
}

export const useSearchCustomers = ({ search = '', enabled = true }: UseSearchCustomersOptions = {}) => {
  return useQuery({
    queryKey: ['customers', 'search', search],
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', { 
      search: search || undefined,
      per_page: 50,
    }),
    staleTime: STALE_TIME,
    enabled: enabled && search.length > 0,
  });
};

export const useCustomersMinimal = (perPage: number = 50) => {
  return useQuery({
    queryKey: ['customers', 'minimal', perPage],
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', { per_page: perPage }),
    staleTime: STALE_TIME,
  });
};
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Warehouse, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

export const useWarehousesMinimal = (perPage: number = 50) => {
  return useQuery({
    queryKey: ['warehouses', 'minimal', perPage],
    queryFn: () => api.get<PaginatedResponse<Warehouse>>('/warehouses', { per_page: perPage }),
    staleTime: STALE_TIME,
  });
};
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SalesRep, PaginatedResponse } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

export const useSalesRepsMinimal = (perPage: number = 50) => {
  return useQuery({
    queryKey: ['sales-reps', 'minimal', perPage],
    queryFn: () => api.get<PaginatedResponse<SalesRep>>('/sales-reps', { per_page: perPage }),
    staleTime: STALE_TIME,
  });
};
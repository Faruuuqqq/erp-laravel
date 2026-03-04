import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, PaginatedResponse } from '@/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => api.get<Category>(`/categories/${id}`),
    enabled: !!id,
  });
};

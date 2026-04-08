import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types';

interface CategoriesResponse {
  data: Category[];
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<CategoriesResponse>('/categories');
      return response.data;
    },
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

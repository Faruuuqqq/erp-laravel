import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Expense, PaginatedResponse } from '@/types';

interface ExpenseQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

interface CreateExpenseRequest {
  code?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface UpdateExpenseRequest {
  code?: string;
  date?: string;
  category?: string;
  description?: string;
  amount?: number;
}

export const useExpenses = (params?: ExpenseQueryParams) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => api.get<PaginatedResponse<Expense>>('/expenses', params),
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => api.get<Expense>(`/expenses/${id}`),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => api.post('/expenses', data),
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      api.put(`/expenses/${id}`, data),
  });
};

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
  });
};

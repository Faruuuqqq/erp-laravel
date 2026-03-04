import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/types';

interface CustomerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => api.post('/customers', data),
  });
};

export const useUpdateCustomer = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      api.put(`/customers/${id}`, data),
  });
};

export const useDeleteCustomer = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  credit_limit?: number;
}

interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  credit_limit?: number;
}

// Query key factory
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: CustomerQueryParams) =>
    [...customerKeys.lists(), { page: filters?.page ?? 1, perPage: filters?.per_page ?? 20, search: filters?.search ?? '' }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => api.post('/customers', data),
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const previousCustomers = queryClient.getQueryData(customerKeys.lists());
      const tempId = 'temp-' + Date.now();
      
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newCustomer, id: tempId }],
      }));
      
      return { previousCustomers, tempId };
    },
    onSuccess: (result, newCustomer, context) => {
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((c: any) =>
          c.id === context?.tempId ? result.data : c
        ),
      }));
    },
    onError: (err, newCustomer, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(customerKeys.lists(), context.previousCustomers);
      }
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      api.put(`/customers/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.detail(id) });
      const previousCustomer = queryClient.getQueryData(customerKeys.detail(id));
      
      queryClient.setQueryData(customerKeys.detail(id), { ...previousCustomer, ...data });
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((c: any) =>
          c.id === id ? { ...c, ...data } : c
        ),
      }));
      
      return { previousCustomer };
    },
    onSuccess: (result, { id }, context) => {
      queryClient.setQueryData(customerKeys.detail(id), result.data);
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).map((c: any) =>
          c.id === id ? result.data : c
        ),
      }));
    },
    onError: (err, { id }, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(customerKeys.detail(id), context.previousCustomer);
      }
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const previousCustomers = queryClient.getQueryData(customerKeys.lists());
      
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: (old?.data || []).filter((c: any) => c.id !== id),
      }));
      
      return { previousCustomers };
    },
    onError: (err, id, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(customerKeys.lists(), context.previousCustomers);
      }
    },
  });
};

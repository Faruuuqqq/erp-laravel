import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SalesRep, PaginatedResponse } from '@/types';

// Transform status values: Frontend ('aktif'/'nonaktif') ↔ Backend ('active'/'inactive')
const toBackendStatus = (status?: string): string | undefined => {
  if (!status) return undefined;
  return status === 'aktif' ? 'active' : status === 'nonaktif' ? 'inactive' : status;
};

const toFrontendStatus = (status?: string): 'aktif' | 'nonaktif' | undefined => {
  if (!status) return undefined;
  return status === 'active' ? 'aktif' : status === 'inactive' ? 'nonaktif' : undefined;
};

const transformToBackend = (data: CreateUpdateSalesRepRequest) => ({
  ...data,
  status: toBackendStatus(data.status),
});

interface CreateUpdateSalesRepRequest {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  area?: string;
  address?: string;
  status?: 'aktif' | 'nonaktif';
}

const transformToFrontend = (salesRep: SalesRep): SalesRep => ({
  ...salesRep,
  status: toFrontendStatus(salesRep.status),
});

const transformListToFrontend = (response: PaginatedResponse<SalesRep>): PaginatedResponse<SalesRep> => ({
  ...response,
  data: response.data.map(transformToFrontend),
});

interface SalesRepQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
}

// Query key factory
export const salesRepKeys = {
  all: ['sales'] as const,
  lists: () => [...salesRepKeys.all, 'list'] as const,
  list: (filters?: SalesRepQueryParams) =>
    [...salesRepKeys.lists(), { page: filters?.page ?? 1, per_page: filters?.per_page ?? 20, search: filters?.search ?? '', status: filters?.status }] as const,
  details: () => [...salesRepKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesRepKeys.details(), id] as const,
};

export const useSalesReps = (params?: SalesRepQueryParams) => {
  return useQuery({
    queryKey: salesRepKeys.list(params),
    queryFn: async () => {
      const apiParams = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 20,
        search: params?.search,
        status: toBackendStatus(params?.status),  // Transform frontend status to backend
      };
      const response = await api.get<PaginatedResponse<SalesRep>>('/sales', apiParams);
      return transformListToFrontend(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSalesRep = (id: string) => {
  return useQuery({
    queryKey: salesRepKeys.detail(id),
    queryFn: () => api.get<SalesRep>(`/sales/${id}`),
    enabled: !!id,
  });
};

export const useCreateSalesRep = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: (data: CreateUpdateSalesRepRequest) => api.post('/sales', transformToBackend(data)),
     onMutate: async (newSalesRep) => {
       await queryClient.cancelQueries({ queryKey: salesRepKeys.lists() });
       const previousSalesReps = queryClient.getQueryData(salesRepKeys.lists());
       const tempId = 'temp-' + Date.now();
       
       queryClient.setQueryData(salesRepKeys.lists(), (old: PaginatedResponse<SalesRep> | undefined) => ({
         ...old,
         data: [...(old?.data || []), { ...newSalesRep, id: tempId }],
       }));
       
       return { previousSalesReps, tempId };
     },
     onSuccess: (result, newSalesRep, context) => {
       queryClient.setQueryData(salesRepKeys.lists(), (old: PaginatedResponse<SalesRep> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: SalesRep) =>
           s.id === context?.tempId ? result.data : s
         ),
       }));
     },
    onError: (err, newSalesRep, context) => {
      if (context?.previousSalesReps) {
        queryClient.setQueryData(salesRepKeys.lists(), context.previousSalesReps);
      }
    },
  });
};

export const useUpdateSalesRep = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: ({ id, data }: { id: string; data: CreateUpdateSalesRepRequest }) =>
       api.put(`/sales/${id}`, transformToBackend(data)),
     onMutate: async ({ id, data }) => {
       await queryClient.cancelQueries({ queryKey: salesRepKeys.detail(id) });
       const previousSalesRep = queryClient.getQueryData(salesRepKeys.detail(id));
       
       queryClient.setQueryData(salesRepKeys.detail(id), { ...previousSalesRep, ...data });
       queryClient.setQueryData(salesRepKeys.lists(), (old: PaginatedResponse<SalesRep> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: SalesRep) =>
           s.id === id ? { ...s, ...data } : s
         ),
       }));
       
       return { previousSalesRep };
     },
     onSuccess: (result, { id }, context) => {
       const transformedResult = transformToFrontend(result.data);
       queryClient.setQueryData(salesRepKeys.detail(id), transformedResult);
       queryClient.setQueryData(salesRepKeys.lists(), (old: PaginatedResponse<SalesRep> | undefined) => ({
         ...old,
         data: (old?.data || []).map((s: SalesRep) =>
           s.id === id ? transformedResult : s
         ),
       }));
     },
    onError: (err, { id }, context) => {
      if (context?.previousSalesRep) {
        queryClient.setQueryData(salesRepKeys.detail(id), context.previousSalesRep);
      }
    },
  });
};

export const useDeleteSalesRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sales/${id}`),
     onMutate: async (id) => {
       await queryClient.cancelQueries({ queryKey: salesRepKeys.lists() });
       const previousSalesReps = queryClient.getQueryData(salesRepKeys.lists());
       
       queryClient.setQueryData(salesRepKeys.lists(), (old: PaginatedResponse<SalesRep> | undefined) => ({
         ...old,
         data: (old?.data || []).filter((s: SalesRep) => s.id !== id),
       }));
       
       return { previousSalesReps };
     },
    onError: (err, id, context) => {
      if (context?.previousSalesReps) {
        queryClient.setQueryData(salesRepKeys.lists(), context.previousSalesReps);
      }
    },
  });
};

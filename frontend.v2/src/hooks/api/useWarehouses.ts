import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Warehouse, PaginatedResponse } from '@/types';

interface WarehouseParams {
  per_page?: number;
  page?: number;
  search?: string;
  status?: 'aktif' | 'nonaktif';
}

interface CreateUpdateWarehouseRequest {
  code: string;
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';
}

// Transform status values: Frontend ('aktif'/'nonaktif') ↔ Backend ('active'/'inactive')
const toBackendStatus = (status?: string): string | undefined => {
  if (!status) return undefined;
  return status === 'aktif' ? 'active' : status === 'nonaktif' ? 'inactive' : status;
};

const toFrontendStatus = (status?: string): 'aktif' | 'nonaktif' | undefined => {
  if (!status) return undefined;
  return status === 'active' ? 'aktif' : status === 'inactive' ? 'nonaktif' : undefined;
};

const transformToBackend = (data: CreateUpdateWarehouseRequest) => ({
  ...data,
  status: toBackendStatus(data.status),
});

const transformToFrontend = (warehouse: Warehouse): Warehouse => ({
  ...warehouse,
  status: toFrontendStatus(warehouse.status) as 'aktif' | 'nonaktif',
});

const transformListToFrontend = (response: PaginatedResponse<Warehouse>): PaginatedResponse<Warehouse> => ({
  ...response,
  data: response.data.map(transformToFrontend),
});

// Query key factory
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (filters?: WarehouseParams) => {
    const key = [...warehouseKeys.lists(), { page: filters?.page ?? 1, per_page: filters?.per_page ?? 20 }];
    if (filters?.search) key.push({ search: filters.search });
    if (filters?.status) key.push({ status: filters.status });
    return key as const;
  },
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

export const useWarehouses = (params?: WarehouseParams) => {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: async () => {
      const apiParams = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 20,
        search: params?.search,
        status: toBackendStatus(params?.status),  // Transform frontend status to backend
      };
      const response = await api.get<PaginatedResponse<Warehouse>>('/warehouses', apiParams as Record<string, unknown>);
      return transformListToFrontend(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => api.get<Warehouse>(`/warehouses/${id}`),
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: (data: CreateUpdateWarehouseRequest) => api.post('/warehouses', transformToBackend(data)),
     onMutate: async (newWarehouse) => {
       await queryClient.cancelQueries({ queryKey: warehouseKeys.lists() });
       const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists());
       const tempId = 'temp-' + Date.now();
       
       queryClient.setQueryData(warehouseKeys.lists(), (old: PaginatedResponse<Warehouse> | undefined) => ({
         ...old,
         data: [...(old?.data || []), { ...newWarehouse, id: tempId }],
       }));
       
       return { previousWarehouses, tempId };
     },
     onSuccess: (result, newWarehouse, context) => {
       queryClient.setQueryData(warehouseKeys.lists(), (old: PaginatedResponse<Warehouse> | undefined) => ({
         ...old,
         data: (old?.data || []).map((w: Warehouse) =>
           w.id === context?.tempId ? result.data : w
         ),
       }));
     },
    onError: (err, newWarehouse, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData(warehouseKeys.lists(), context.previousWarehouses);
      }
    },
  });
};

export const useUpdateWarehouse = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: ({ id, data }: { id: string; data: CreateUpdateWarehouseRequest }) =>
       api.put(`/warehouses/${id}`, transformToBackend(data)),
     onMutate: async ({ id, data }) => {
       await queryClient.cancelQueries({ queryKey: warehouseKeys.detail(id) });
       const previousWarehouse = queryClient.getQueryData(warehouseKeys.detail(id));
       
       queryClient.setQueryData(warehouseKeys.detail(id), { ...previousWarehouse, ...data });
       queryClient.setQueryData(warehouseKeys.lists(), (old: PaginatedResponse<Warehouse> | undefined) => ({
         ...old,
         data: (old?.data || []).map((w: Warehouse) =>
           w.id === id ? { ...w, ...data } : w
         ),
       }));
       
       return { previousWarehouse };
     },
     onSuccess: (result, { id }, context) => {
       const transformedResult = transformToFrontend(result.data);
       queryClient.setQueryData(warehouseKeys.detail(id), transformedResult);
       queryClient.setQueryData(warehouseKeys.lists(), (old: PaginatedResponse<Warehouse> | undefined) => ({
         ...old,
         data: (old?.data || []).map((w: Warehouse) =>
           w.id === id ? transformedResult : w
         ),
       }));
     },
    onError: (err, { id }, context) => {
      if (context?.previousWarehouse) {
        queryClient.setQueryData(warehouseKeys.detail(id), context.previousWarehouse);
      }
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/warehouses/${id}`),
     onMutate: async (id) => {
       await queryClient.cancelQueries({ queryKey: warehouseKeys.lists() });
       const previousWarehouses = queryClient.getQueryData(warehouseKeys.lists());
       
       queryClient.setQueryData(warehouseKeys.lists(), (old: PaginatedResponse<Warehouse> | undefined) => ({
         ...old,
         data: (old?.data || []).filter((w: Warehouse) => w.id !== id),
       }));
       
       return { previousWarehouses };
     },
    onError: (err, id, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData(warehouseKeys.lists(), context.previousWarehouses);
      }
    },
  });
};

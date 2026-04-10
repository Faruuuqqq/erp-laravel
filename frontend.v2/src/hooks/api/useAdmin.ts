import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STALE_TIME = 5 * 60 * 1000;

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  permissions?: Record<string, boolean>;
}

interface UpdateAdminPayload {
  name?: string;
  email?: string;
}

export const useAdmins = (params?: { search?: string; active?: boolean; per_page?: number }) => {
  return useQuery({
    queryKey: ['admins', params],
    queryFn: () => api.get<{ data: { data: Admin[] }; meta: any }>('/admins', params),
    staleTime: STALE_TIME,
  });
};

export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: ['admins', id],
    queryFn: () => api.get<{ data: Admin }>(`/admins/${id}`),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminPayload) => api.post('/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminPayload }) =>
      api.put(`/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useUpdateAdminPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: Record<string, boolean> }) =>
      api.put(`/admins/${id}/permissions`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useToggleAdminActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admins/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};
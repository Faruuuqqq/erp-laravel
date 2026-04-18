import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StoreSettings } from '@/types';

interface UpdateProfileRequest {
  name: string;
  email: string;
}

interface UpdatePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface UpdateNotificationsRequest {
  low_stock_alert: boolean;
  receivable_due_alert: boolean;
  daily_report: boolean;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => api.patch('/settings/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StoreSettings>) => api.patch('/settings/store', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => api.patch('/settings/password', data),
  });
};

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationsRequest) => api.patch('/settings/notifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StoreSettings } from '@/types';

const STALE_TIME = 5 * 60 * 1000;

interface UpdateProfileRequest {
  name: string;
  email: string;
}

interface UpdatePasswordRequest {
  current_password: string;
  password: string;
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
    staleTime: STALE_TIME,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => api.patch('/settings/profile', data),
  });
};

export const useUpdateStore = () => {
  return useMutation({
    mutationFn: (data: Partial<StoreSettings>) => api.patch('/settings/store', data),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => api.patch('/settings/password', data),
  });
};

export const useUpdateNotifications = () => {
  return useMutation({
    mutationFn: (data: UpdateNotificationsRequest) => api.patch('/settings/notifications', data),
  });
};

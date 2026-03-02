/**
 * TokoSync ERP – Settings API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

const QUERY_KEY = 'settings';
const STORE_SETTINGS_KEY = ['settings', 'store'];
const NOTIFICATION_SETTINGS_KEY = ['settings', 'notification'];

export const useSettings = () => {
  return useApiQuery<{
    profile: { name: string; email: string; role: string };
    store: { store_name: string; phone: string; address: string; npwp: string; siup: string };
    notifications: { low_stock: boolean; overdue_receivable: boolean; daily_report: boolean };
  }>(
    [QUERY_KEY],
    async () => {
      const response = await apiClient.get('/settings');
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  );
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useApiMutation<
    { store_name: string; phone: string; address: string; npwp?: string; siup?: string },
    { store_name: string; phone: string; address: string; npwp?: string; siup?: string }
  >(
    async (data) => {
      await apiClient.patch('/settings/store', data);
      return response.data.data;
    },
    {
      successMessage: 'Pengaturan toko berhasil disimpan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
      onError: (error) => {
        const errorMsg = error.response?.data?.errors?.email?.[0] || 'Gagal memperbarui profile.';
        toast.error(errorMsg);
      },
    },
  );
};

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();
  return useApiMutation<
    { low_stock: boolean; overdue_receivable: boolean; daily_report: boolean },
    { low_stock: boolean; overdue_receivable: boolean; daily_report: boolean }
  >(
    async (data) => {
      await apiClient.patch('/settings/notifications', data);
      return response.data.data;
    },
    {
      successMessage: 'Pengaturan notifikasi berhasil disimpan.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
      onError: (error) => {
        const errorMsg = error.response?.data?.message || 'Gagal memperbarui notifikasi.';
        toast.error(errorMsg);
      },
    },
  );
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useApiMutation<ProfileFormData, ProfileFormData>(
    async (data) => {
      await apiClient.patch('/settings/profile', data);
      return response.data.data;
    },
    {
      successMessage: 'Profil berhasil diperbarui.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
      },
    },
  );
};

export const useUpdatePassword = () => {
  return useApiMutation<PasswordFormData, PasswordFormData>(
    async (data) => {
      await apiClient.patch('/settings/password', data);
      return response.data;
    },
    {
      successMessage: 'Password berhasil diubah.',
      onError: (error) => {
        const errorMsg = error.response?.data?.errors?.current_password?.[0] || 'Gagal mengubah password.';
        toast.error(errorMsg);
      },
    },
  );
};
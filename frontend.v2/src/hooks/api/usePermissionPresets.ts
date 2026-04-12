import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface PermissionPreset {
  name: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
}

interface PermissionPresetsData {
  [key: string]: PermissionPreset;
}

export const usePermissionPresets = () => {
  return useQuery({
    queryKey: ['permission-presets'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-presets');
      return res.data.data as PermissionPresetsData;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BackupFile {
  filename: string;
  size: number;
  size_formatted: string;
  created_at: string;
  timestamp: number;
}

export interface BackupResponse {
  data: BackupFile[];
  count: number;
  message: string;
}

export interface CreateBackupResponse {
  data: BackupFile;
  message: string;
}

/**
 * Fetch list of backup files
 */
export const useBackups = () => {
  return useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const response = await api.get<BackupResponse>('/backup');
      return response.data;
    },
  });
};

/**
 * Create a new database backup
 */
export const useCreateBackup = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<CreateBackupResponse>('/backup');
      return response.data;
    },
  });
};

/**
 * Download a backup file
 */
export const useDownloadBackup = () => {
  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await api.get(`/backup/${filename}/download`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

/**
 * Delete a backup file
 */
export const useDeleteBackup = () => {
  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await api.delete(`/backup/${filename}`);
      return response.data;
    },
  });
};

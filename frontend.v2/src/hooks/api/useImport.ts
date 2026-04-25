import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface ImportResponse {
  message: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export function useImport(resource: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rows: any[]) => {
      const data = await api.post<ImportResponse>(`/${resource}/import`, { rows });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate queries so tables refresh
      queryClient.invalidateQueries({ queryKey: [resource] });
      
      // We don't show a generic toast here because the ImportDataDialog 
      // will handle showing a more detailed summary
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Gagal mengimpor data';
      toast({
        title: 'Error Import',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

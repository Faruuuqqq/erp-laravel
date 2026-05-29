import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BATCH_SIZE } from '@/components/dialogs/import/types';

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
    mutationFn: async (rows: Record<string, unknown>[]) => {
      // Small dataset, simple request
      if (rows.length <= BATCH_SIZE) {
        const data = await api.post<ImportResponse>(`/${resource}/import`, { rows });
        return data;
      }

      // Large dataset, chunk into batches
      const results: ImportResponse = { 
        message: '', 
        imported: 0, 
        skipped: 0, 
        errors: [] 
      };

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        const res = await api.post<ImportResponse>(`/${resource}/import`, { rows: chunk });
        
        results.imported += res.imported;
        results.skipped += res.skipped;
        results.errors.push(...(res.errors || []));
      }
      
      results.message = `Import selesai: ${results.imported} berhasil, ${results.skipped} dilewati`;
      return results;
    },
    onSuccess: () => {
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

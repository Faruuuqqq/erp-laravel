import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportToXlsx, type ColumnConfig, type ExportOptions } from '@/lib/xlsx-export';

/**
 * Options untuk export data
 */
export interface UseExportDataOptions<T = Record<string, unknown>> {
  /**
   * Nama file tanpa ekstensi (akan ditambahkan .xlsx)
   */
  filename: string;

  /**
   * Data yang akan di-export
   */
  data: T[];

  /**
   * Konfigurasi kolom untuk XLSX
   */
  columns: ColumnConfig<T>[];

  /**
   * Opsi tambahan untuk export
   */
  exportOptions?: ExportOptions;

  /**
   * Pesan sukses (default: "{count} data diunduh")
   */
  successMessage?: string;

  /**
   * Pesan error (default: "Gagal mengunduh file")
   */
  errorMessage?: string;
}

/**
 * Hook untuk export data dengan loading & error handling
 * Mendukung XLSX export dengan notifikasi toast
 *
 * @example
 * const { exportXlsx, isExporting } = useExportData();
 *
 * const handleExport = () => {
 *   exportXlsx({
 *     filename: 'produk',
 *     data: products,
 *     columns: productColumns,
 *     successMessage: `${products.length} produk diunduh`,
 *   });
 * };
 */
export function useExportData() {
  const { toast } = useToast();

  /**
   * Export data ke XLSX
   */
  const exportXlsx = useCallback(async <T = Record<string, unknown>>({
    filename,
    data,
    columns,
    exportOptions,
    successMessage,
    errorMessage = 'Gagal mengunduh file',
  }: UseExportDataOptions<T>) => {
    try {
      // Validate
      if (!filename.trim()) {
        throw new Error('Filename cannot be empty');
      }

      if (data.length === 0) {
        throw new Error('Tidak ada data untuk diunduh');
      }

      // Export to XLSX
      exportToXlsx(data, filename, columns, exportOptions);

      // Show success toast
      toast({
        title: 'Berhasil',
        description: successMessage ?? `${data.length} data diunduh`,
      });
    } catch (error) {
      console.error('Export error:', error);

      // Show error toast
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      toast({
        title: 'Gagal',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  }, [toast]);

  return { exportXlsx };
}

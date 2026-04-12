import * as XLSX from 'xlsx';
import { formatCurrency } from './utils';

/**
 * Column configuration for XLSX export
 */
export interface ColumnConfig<T> {
  header: string;
  key: keyof T;
  format?: (value: unknown) => string | number;
  width?: number;
}

/**
 * Options for XLSX export
 */
export interface ExportOptions {
  sheetName?: string;
  autoWidth?: boolean;
  headerStyle?: boolean;
}

/**
 * Export data to XLSX file with custom column configuration
 * Type-safe, handles special characters, currency formatting, etc.
 *
 * @example
 * const columns: ColumnConfig<Supplier>[] = [
 *   { header: 'Kode', key: 'code', width: 12 },
 *   { header: 'Nama', key: 'name', width: 30 },
 *   { header: 'Total Utang', key: 'balance', format: (v) => formatCurrency(v as number) },
 * ];
 * exportToXlsx(suppliers, 'supplier.xlsx', columns);
 */
export function exportToXlsx<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ColumnConfig<T>[],
  options?: ExportOptions
): void {
  try {
    // Validate inputs
    if (!filename.trim()) {
      throw new Error('Filename cannot be empty');
    }

    // Handle empty data
    if (data.length === 0) {
      console.warn('No data to export');
      // Still create a file with headers only
      const headers = columns.map(col => col.header);
      const ws = XLSX.utils.json_to_sheet([]);
      ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
      
      // Add headers manually
      headers.forEach((header, idx) => {
        const cell = XLSX.utils.encode_cell({ r: 0, c: idx });
        ws[cell] = { t: 's', v: header };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Data');
      XLSX.writeFile(wb, `${filename}`);
      return;
    }

    // Transform data according to column configuration
    const transformedData = data.map(item => {
      const row: Record<string, unknown> = {};
      columns.forEach(col => {
        const value = item[col.key];
        row[col.header] = col.format ? col.format(value) : value ?? '';
      });
      return row;
    });

    // Create worksheet from transformed data
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Set column widths
    if (options?.autoWidth !== false) {
      ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
    }

    // Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Data');

    // Write file
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Export to XLSX failed:', error);
    throw error;
  }
}

/**
 * Format value for currency display in Excel
 * Keeps as number type for proper Excel numeric formatting
 */
export const formatCurrencyForExcel = (value: unknown): number => {
  const num = typeof value === 'number' ? value : Number(value) || 0;
  return num;
};

/**
 * Format value as string (safe for special characters)
 */
export const formatString = (value: unknown): string => {
  return String(value ?? '').trim();
};

/**
 * Format value as status badge text
 */
export const formatStatus = (value: unknown): string => {
  const status = String(value ?? '').toLowerCase();
  return status === 'aktif' || status === 'active' ? 'Aktif' : 'Nonaktif';
};

/**
 * Format numeric value with thousand separator (as string for Excel)
 */
export const formatNumber = (value: unknown): string => {
  const num = typeof value === 'number' ? value : Number(value) || 0;
  return num.toLocaleString('id-ID');
};

/**
 * Generate filename with date suffix (YYYYMMDD format)
 * @example getFilenameWithDate('supplier') => 'supplier_20260412.xlsx'
 */
export function getFilenameWithDate(baseName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Remove .xlsx if already present
  const name = baseName.replace(/\.xlsx$/i, '');
  return `${name}_${dateStr}.xlsx`;
}

/**
 * Helper function to trigger download
 * Useful for testing or custom implementations
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

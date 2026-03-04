import * as XLSX from 'xlsx';

export function exportToExcel<T>(
  data: T[],
  filename: string,
  options?: {
    sheetName?: string;
    headers?: Record<keyof T, string>;
  }
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function formatDateRange(from: string, to: string): string {
  return `${from}_s_d_${to}`;
}

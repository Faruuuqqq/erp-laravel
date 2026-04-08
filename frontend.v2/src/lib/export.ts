import * as XLSX from 'xlsx';

/**
 * Formatting utilities for professional Excel exports
 */

// Export options interface
export interface ExcelExportOptions<T> {
  sheetName?: string;
  headers?: Record<keyof T, string>;
  columnWidths?: Record<keyof T, number>;
  currency?: string;
  currencyFormat?: string;
  showSummary?: boolean;
  summaryFields?: (keyof T)[];
}

/**
 * Format currency value for display
 * @param value - Numeric value
 * @param currency - Currency code (default: IDR)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'IDR'): string {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

/**
 * Format date to readable format
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Format date range for filename
 * @param from - Start date
 * @param to - End date
 * @returns Formatted string suitable for filename
 */
export function formatDateRange(from: string, to: string): string {
  return `${from}_s_d_${to}`;
}

/**
 * Apply column formatting to worksheet
 * @param ws - XLSX worksheet
 * @param columnWidths - Column width mapping
 */
function applyColumnFormatting(
  ws: XLSX.WorkSheet,
  columnWidths?: Record<string, number>
): void {
  if (!columnWidths) return;

  ws['!cols'] = Object.values(columnWidths).map(width => ({ wch: width }));
}

/**
 * Add summary row to data
 * @param data - Original data array
 * @param summaryFields - Fields to sum
 * @param summaryLabel - Label for summary row
 * @returns Enhanced data with summary row
 */
function addSummaryRow<T extends Record<string, any>>(
  data: T[],
  summaryFields: (keyof T)[],
  summaryLabel = 'TOTAL'
): (T | Record<string, any>)[] {
  if (data.length === 0) return data;

  const summary: Record<string, any> = {};
  const firstItem = data[0];

  // Initialize summary with field names
  Object.keys(firstItem).forEach(key => {
    summary[key] = '';
  });

  // Set label for first column
  const firstKey = Object.keys(firstItem)[0];
  summary[firstKey] = summaryLabel;

  // Sum numeric fields
  summaryFields.forEach(field => {
    const sum = data.reduce((acc, item) => {
      const value = item[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);
    summary[String(field)] = sum;
  });

  return [...data, summary];
}

/**
 * Enhanced Excel export with formatting
 * @param data - Data to export
 * @param filename - Output filename
 * @param options - Export options
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: ExcelExportOptions<T>
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Add summary row if requested
  let exportData = data;
  if (options?.showSummary && options?.summaryFields) {
    exportData = addSummaryRow(data, options.summaryFields) as T[];
  }

  // Create worksheet with headers if provided
  const ws = XLSX.utils.json_to_sheet(exportData);

  if (options?.headers) {
    // Apply custom headers
    const headerRow: Record<string, any> = {};
    Object.entries(options.headers).forEach(([key, value]) => {
      headerRow[key] = value;
    });
    
    const headerSheet = XLSX.utils.json_to_sheet([headerRow]);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: 1 });
  }

  // Apply column formatting
  applyColumnFormatting(ws, options?.columnWidths as any);

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Data');

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data as CSV
 * @param data - Data to export
 * @param filename - Output filename
 * @param options - Export options
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: {
    headers?: Record<keyof T, string>;
    delimiter?: string;
  }
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const delimiter = options?.delimiter || ',';
  const headers = options?.headers || ({} as Record<keyof T, string>);

  // Build header row
  const headerKeys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = headerKeys
    .map(key => headers[key] || String(key))
    .map(h => `"${h}"`)
    .join(delimiter);

  // Build data rows
  const dataRows = data.map(row =>
    headerKeys
      .map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string' && value.includes(delimiter)) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return `"${value}"`;
      })
      .join(delimiter)
  );

  // Combine all rows
  const csv = [headerRow, ...dataRows].join('\n');

  // Create and download blob
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data with metadata and branding
 * @param data - Data to export
 * @param filename - Output filename
 * @param metadata - Export metadata (title, subtitle, exported date)
 * @param options - Export options
 */
export function exportToExcelWithMetadata<T extends Record<string, any>>(
  data: T[],
  filename: string,
  metadata?: {
    title?: string;
    subtitle?: string;
    exportedBy?: string;
  },
  options?: ExcelExportOptions<T>
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Add metadata rows at the beginning
  let exportData = data;
  const metadataRows: Record<string, any>[] = [];

  if (metadata?.title) {
    metadataRows.push({ [Object.keys(data[0])[0]]: metadata.title });
  }
  if (metadata?.subtitle) {
    metadataRows.push({ [Object.keys(data[0])[0]]: metadata.subtitle });
  }
  metadataRows.push({ [Object.keys(data[0])[0]]: `Diekspor: ${new Date().toLocaleString('id-ID')}` });
  if (metadata?.exportedBy) {
    metadataRows.push({ [Object.keys(data[0])[0]]: `Oleh: ${metadata.exportedBy}` });
  }

  // Add summary if requested
  if (options?.showSummary && options?.summaryFields) {
    exportData = addSummaryRow(data, options.summaryFields) as T[];
  }

  // Create worksheets for metadata and data
  const ws = XLSX.utils.json_to_sheet([...metadataRows, {}, ...exportData]);

  // Apply column formatting
  applyColumnFormatting(ws, options?.columnWidths as any);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Laporan');

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

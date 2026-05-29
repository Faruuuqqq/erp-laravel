export interface ImportColumnDef {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
  type?: 'text' | 'number';
}

export interface ColumnMapping {
  fileHeader: string;
  systemField: string;
  autoMatched: boolean;
}

export interface ParsedFileData {
  headers: string[];
  rows: unknown[][];
  fileName: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResultData {
  imported: number;
  skipped: number;
  errors: string[];
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'result';

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const BATCH_SIZE = 500;
export const PREVIEW_PAGE_SIZE = 20;

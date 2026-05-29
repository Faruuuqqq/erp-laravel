import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import type { ImportColumnDef, ValidationError } from './types';
import { PREVIEW_PAGE_SIZE } from './types';

interface ImportStepPreviewProps {
  columns: ImportColumnDef[];
  mappedData: Record<string, unknown>[];
  onNext: () => void;
  onBack: () => void;
  isPending: boolean;
}

function validateData(
  data: Record<string, unknown>[],
  columns: ImportColumnDef[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    for (const col of columns) {
      const value = row[col.key];
      const strValue = value?.toString().trim() ?? '';

      // Required field check
      if (col.required && !strValue) {
        errors.push({
          row: i,
          field: col.key,
          message: `${col.label} wajib diisi`,
        });
      }

      // Numeric type check
      if (col.type === 'number' && strValue && isNaN(Number(strValue))) {
        errors.push({
          row: i,
          field: col.key,
          message: `${col.label} harus berupa angka`,
        });
      }
    }
  }

  return errors;
}

function findDuplicates(
  data: Record<string, unknown>[],
  columns: ImportColumnDef[]
): Set<number> {
  const duplicateRows = new Set<number>();
  const requiredKeys = columns.filter(c => c.required).map(c => c.key);

  if (requiredKeys.length === 0) return duplicateRows;

  const seen = new Map<string, number>();

  for (let i = 0; i < data.length; i++) {
    const fingerprint = requiredKeys
      .map(key => (data[i][key]?.toString().trim().toLowerCase() ?? ''))
      .join('|||');

    if (seen.has(fingerprint)) {
      duplicateRows.add(i);
      duplicateRows.add(seen.get(fingerprint)!);
    } else {
      seen.set(fingerprint, i);
    }
  }

  return duplicateRows;
}

export function ImportStepPreview({
  columns,
  mappedData,
  onNext,
  onBack,
  isPending,
}: ImportStepPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const validationErrors = useMemo(() => validateData(mappedData, columns), [mappedData, columns]);
  const duplicateRows = useMemo(() => findDuplicates(mappedData, columns), [mappedData, columns]);

  const errorsByRow = useMemo(() => {
    const map = new Map<number, Map<string, string>>();
    for (const err of validationErrors) {
      if (!map.has(err.row)) map.set(err.row, new Map());
      map.get(err.row)!.set(err.field, err.message);
    }
    return map;
  }, [validationErrors]);

  const rowsWithErrors = errorsByRow.size;
  const validRows = mappedData.length - rowsWithErrors;
  const needsConfirmation = mappedData.length > 100;

  const totalPages = Math.ceil(mappedData.length / PREVIEW_PAGE_SIZE);
  const pageData = useMemo(() => {
    const start = currentPage * PREVIEW_PAGE_SIZE;
    return mappedData.slice(start, start + PREVIEW_PAGE_SIZE);
  }, [mappedData, currentPage]);

  const pageStartIndex = currentPage * PREVIEW_PAGE_SIZE;

  const getCellClassName = useCallback(
    (rowIndex: number, fieldKey: string) => {
      const globalIndex = pageStartIndex + rowIndex;
      const hasError = errorsByRow.get(globalIndex)?.has(fieldKey);
      const isDuplicate = duplicateRows.has(globalIndex);

      if (hasError) return 'bg-red-50 text-red-900';
      if (isDuplicate) return 'bg-yellow-50 text-yellow-900';
      return '';
    },
    [errorsByRow, duplicateRows, pageStartIndex]
  );

  const getCellTooltip = useCallback(
    (rowIndex: number, fieldKey: string) => {
      const globalIndex = pageStartIndex + rowIndex;
      return errorsByRow.get(globalIndex)?.get(fieldKey) ?? '';
    },
    [errorsByRow, pageStartIndex]
  );

  const handleImport = useCallback(() => {
    if (needsConfirmation && !confirmed) {
      setConfirmed(true);
      return;
    }
    onNext();
  }, [needsConfirmation, confirmed, onNext]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Preview Data</h3>
          <p className="text-sm text-muted-foreground">
            Periksa data sebelum mengimport
          </p>
        </div>
        <div className="flex items-center gap-2">
          {validRows > 0 && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              {validRows} valid
            </Badge>
          )}
          {rowsWithErrors > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {rowsWithErrors} error
            </Badge>
          )}
          {duplicateRows.size > 0 && (
            <Badge variant="outline" className="gap-1 text-yellow-700 border-yellow-300">
              {duplicateRows.size} duplikat
            </Badge>
          )}
        </div>
      </div>

      {rowsWithErrors > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {rowsWithErrors} baris memiliki error validasi. Baris dengan error akan tetap dikirim ke server dan diproses oleh backend.
          </AlertDescription>
        </Alert>
      )}

      {confirmed && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda akan mengimport <strong>{mappedData.length}</strong> baris data. Klik "Mulai Import" sekali lagi untuk konfirmasi.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <ScrollArea className="max-h-[300px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                {columns.map(col => (
                  <TableHead key={col.key} className="whitespace-nowrap">
                    {col.label}
                    {col.required && <span className="text-destructive ml-1">*</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row, i) => {
                const globalIndex = pageStartIndex + i;
                const isDuplicate = duplicateRows.has(globalIndex);
                return (
                  <TableRow
                    key={globalIndex}
                    className={isDuplicate ? 'bg-yellow-50/50' : ''}
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {globalIndex + 1}
                    </TableCell>
                    {columns.map(col => (
                      <TableCell
                        key={col.key}
                        className={`whitespace-nowrap max-w-[200px] truncate text-sm ${getCellClassName(i, col.key)}`}
                        title={getCellTooltip(i, col.key) || String(row[col.key] ?? '')}
                      >
                        {row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== ''
                          ? String(row[col.key])
                          : <span className="text-muted-foreground/50">-</span>
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage + 1} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Button onClick={handleImport} disabled={isPending}>
          {isPending ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Mengimport...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {confirmed ? 'Konfirmasi Import' : `Mulai Import (${mappedData.length} baris)`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

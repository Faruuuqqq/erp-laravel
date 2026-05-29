import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import type { ImportColumnDef, ColumnMapping, ParsedFileData } from './types';

interface ImportStepMappingProps {
  columns: ImportColumnDef[];
  fileData: ParsedFileData;
  onNext: (mappings: ColumnMapping[], mappedData: Record<string, unknown>[]) => void;
  onBack: () => void;
}

function autoMatchColumns(
  fileHeaders: string[],
  columns: ImportColumnDef[]
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedSystemFields = new Set<string>();

  for (const header of fileHeaders) {
    const normalizedHeader = header.toLowerCase().trim();
    let matched = false;

    for (const col of columns) {
      if (usedSystemFields.has(col.key)) continue;

      const possibleNames = [
        col.label.toLowerCase(),
        ...(col.aliases || []).map(a => a.toLowerCase()),
      ];

      if (possibleNames.includes(normalizedHeader)) {
        mappings.push({
          fileHeader: header,
          systemField: col.key,
          autoMatched: true,
        });
        usedSystemFields.add(col.key);
        matched = true;
        break;
      }
    }

    if (!matched) {
      mappings.push({
        fileHeader: header,
        systemField: '',
        autoMatched: false,
      });
    }
  }

  return mappings;
}

function applyMappings(
  rows: unknown[][],
  headers: string[],
  mappings: ColumnMapping[]
): Record<string, unknown>[] {
  return rows.map(row => {
    const rowData: Record<string, unknown> = {};

    for (const mapping of mappings) {
      if (!mapping.systemField) continue;

      const headerIndex = headers.indexOf(mapping.fileHeader);
      if (headerIndex !== -1 && headerIndex < (row as unknown[]).length) {
        rowData[mapping.systemField] = (row as unknown[])[headerIndex];
      } else {
        rowData[mapping.systemField] = '';
      }
    }

    return rowData;
  });
}

export function ImportStepMapping({ columns, fileData, onNext, onBack }: ImportStepMappingProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(() =>
    autoMatchColumns(fileData.headers, columns)
  );

  const usedSystemFields = useMemo(() => {
    const used = new Set<string>();
    for (const m of mappings) {
      if (m.systemField) used.add(m.systemField);
    }
    return used;
  }, [mappings]);

  const unmappedRequired = useMemo(() => {
    return columns.filter(c => c.required && !usedSystemFields.has(c.key));
  }, [columns, usedSystemFields]);

  const canProceed = unmappedRequired.length === 0;

  const handleMappingChange = useCallback((fileHeader: string, newSystemField: string) => {
    setMappings(prev =>
      prev.map(m => {
        if (m.fileHeader === fileHeader) {
          return {
            ...m,
            systemField: newSystemField === '__none__' ? '' : newSystemField,
            autoMatched: false,
          };
        }
        return m;
      })
    );
  }, []);

  const handleNext = useCallback(() => {
    const mappedData = applyMappings(fileData.rows, fileData.headers, mappings);
    onNext(mappings, mappedData);
  }, [mappings, fileData, onNext]);

  const getStatusIcon = (mapping: ColumnMapping) => {
    if (mapping.systemField) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusLabel = (mapping: ColumnMapping) => {
    if (mapping.systemField) {
      const col = columns.find(c => c.key === mapping.systemField);
      return (
        <Badge variant="secondary" className="text-xs">
          {mapping.autoMatched ? 'Otomatis' : 'Manual'}
          {col?.required && <span className="text-destructive ml-1">*</span>}
        </Badge>
      );
    }
    return (
      <span className="text-xs text-muted-foreground">Tidak digunakan</span>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-1">Pemetaan Kolom</h3>
        <p className="text-sm text-muted-foreground">
          Cocokkan kolom di file dengan field yang sesuai. Kolom dengan tanda <span className="text-destructive font-medium">*</span> wajib diisi.
        </p>
      </div>

      {unmappedRequired.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Field wajib belum dipetakan: <strong>{unmappedRequired.map(c => c.label).join(', ')}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <ScrollArea className="max-h-[350px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[200px]">Kolom di File</TableHead>
                <TableHead className="w-[250px]">Field Sistem</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.fileHeader}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(mapping)}
                      <span className="truncate max-w-[160px]">{mapping.fileHeader}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.systemField || '__none__'}
                      onValueChange={(val) => handleMappingChange(mapping.fileHeader, val)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">
                          <span className="text-muted-foreground">-- Tidak digunakan --</span>
                        </SelectItem>
                        {columns.map(col => {
                          const isUsed = usedSystemFields.has(col.key) && mapping.systemField !== col.key;
                          return (
                            <SelectItem
                              key={col.key}
                              value={col.key}
                              disabled={isUsed}
                            >
                              {col.label}
                              {col.required && ' *'}
                              {isUsed && ' (sudah digunakan)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getStatusLabel(mapping)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {mappings.filter(m => m.systemField).length} dari {fileData.headers.length} kolom dipetakan
        </span>
        <span>
          {fileData.rows.length} baris data
        </span>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          Lanjut Preview
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

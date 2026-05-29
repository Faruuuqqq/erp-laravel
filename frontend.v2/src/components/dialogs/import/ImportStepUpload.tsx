import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadCloud, FileSpreadsheet, AlertCircle, Loader2, X } from 'lucide-react';

import type { ImportColumnDef, ParsedFileData } from './types';
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from './types';

interface ImportStepUploadProps {
  columns: ImportColumnDef[];
  title: string;
  onNext: (data: ParsedFileData) => void;
}

export function ImportStepUpload({ columns, title, onNext }: ImportStepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFile = useCallback(() => {
    setFile(null);
    setError(null);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFile = useCallback((selectedFile: File) => {
    setError(null);

    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError('Hanya file .csv, .xlsx, atau .xls yang diperbolehkan');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB. Silakan gunakan file yang lebih kecil.`);
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          setError('Gagal membaca file.');
          setIsParsing(false);
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (rawData.length < 2) {
          setError('File kosong atau tidak memiliki baris data.');
          setIsParsing(false);
          return;
        }

        const headers = (rawData[0] as string[]).map(h =>
          h?.toString().trim() ?? ''
        );

        // Filter out completely empty rows
        const rows = rawData.slice(1).filter(row =>
          row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        );

        if (rows.length === 0) {
          setError('Tidak ada baris data yang ditemukan setelah header.');
          setIsParsing(false);
          return;
        }

        setIsParsing(false);
        onNext({ headers, rows, fileName: selectedFile.name });
      } catch {
        setError('Gagal membaca file. Pastikan formatnya benar.');
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError('Gagal membaca file.');
      setIsParsing(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  }, [onNext]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const handleDownloadTemplate = useCallback(() => {
    const headerRow = columns.map(c => c.required ? `${c.label} *` : c.label);
    const sampleRow = columns.map(c => {
      if (c.type === 'number') return 0;
      return `Contoh ${c.label}`;
    });

    const wsData = [headerRow, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit column widths
    ws['!cols'] = columns.map(c => ({
      wch: Math.max(c.label.length + 4, 18),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Template_Import_${title}.xlsx`);
  }, [columns, title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Pilih file yang ingin diimport, atau download template berikut:
        </p>
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {isParsing ? (
        <div className="border-2 border-dashed rounded-lg p-10 text-center border-primary/30 bg-primary/5">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-medium mb-1">Membaca file...</h3>
          <p className="text-sm text-muted-foreground">
            {file?.name}
          </p>
        </div>
      ) : file ? (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={resetFile} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Pilih file untuk import"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
          />
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Pilih atau letakkan file di sini</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Mendukung format CSV, XLSX, dan XLS
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Maksimal {MAX_FILE_SIZE_MB}MB
          </p>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Cari File
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

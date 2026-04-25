import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useImport } from '@/hooks/api/useImport';
import { Download, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface ImportColumnDef {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
}

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: 'customers' | 'products' | 'suppliers' | 'sales' | 'warehouses';
  title: string;
  columns: ImportColumnDef[];
  onSuccess?: () => void;
}

export function ImportDataDialog({ open, onOpenChange, resource, title, columns, onSuccess }: ImportDataDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImport(resource);

  const resetState = useCallback(() => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(resetState, 200); // reset after animation
    }
    onOpenChange(newOpen);
  };

  const processFile = (selectedFile: File) => {
    setError(null);
    setImportResult(null);
    
    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError('Hanya file .csv, .xlsx, atau .xls yang diperbolehkan');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Raw array of arrays
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rawData.length < 2) {
          setError('File kosong atau tidak memiliki baris data.');
          return;
        }

        const headers = (rawData[0] as string[]).map(h => h?.toString().trim().toLowerCase());
        
        // Map raw data to desired JSON format
        const mappedData = [];
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0 || row.every(cell => !cell)) continue; // skip empty rows
          
          const rowData: Record<string, any> = {};
          
          columns.forEach(col => {
            // Find which index in `headers` matches the column label or aliases
            const possibleNames = [col.label.toLowerCase(), ...(col.aliases || []).map(a => a.toLowerCase())];
            const headerIndex = headers.findIndex(h => possibleNames.includes(h));
            
            if (headerIndex !== -1) {
              rowData[col.key] = row[headerIndex];
            } else {
              rowData[col.key] = ''; // fallback
            }
          });
          
          // Verify required fields
          const missingRequired = columns.filter(c => c.required && !rowData[c.key]);
          if (missingRequired.length > 0) {
            console.warn(`Baris ${i + 1} dilewati karena kurang data wajib:`, missingRequired.map(c => c.label).join(', '));
            // Just let backend fail validation or handle it
          }
          
          mappedData.push(rowData);
        }

        if (mappedData.length === 0) {
          setError('Tidak ada data yang valid ditemukan setelah dicocokkan dengan kolom.');
          return;
        }

        setPreviewData(mappedData);
      } catch (err) {
        setError('Gagal membaca file. Pastikan formatnya benar.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const wsData = [columns.map(c => c.label)]; // Only header
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Template_Import_${title}.xlsx`);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    try {
      const result = await importMutation.mutateAsync(previewData);
      setImportResult({
        imported: result.imported || 0,
        skipped: result.skipped || 0,
        errors: result.errors || []
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Import Data {title}
          </DialogTitle>
          <DialogDescription>
            Upload file CSV atau XLSX untuk mengimpor data secara massal. Data dengan nama yang sama akan dilewati.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {importResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Import Selesai</h4>
                  <p className="text-green-700 mt-1">
                    Berhasil import <strong>{importResult.imported}</strong> baris data. 
                    {importResult.skipped > 0 && ` Dilewati ${importResult.skipped} baris (duplikat/error).`}
                  </p>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Log Error:
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-red-700 max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Pilih file yang ingin diimport, atau download template berikut:</p>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {!file && (
                <div 
                  className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
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
                  <p className="text-sm text-muted-foreground mb-4">Mendukung format CSV dan XLSX</p>
                  <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
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

              {previewData.length > 0 && !importResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      Preview Data ({previewData.length} baris)
                    </h3>
                    <Button variant="ghost" size="sm" onClick={resetState} className="text-destructive h-8">
                      Batal
                    </Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <ScrollArea className="max-h-[250px]">
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                          <TableRow>
                            {columns.map(col => (
                              <TableHead key={col.key} className="whitespace-nowrap">
                                {col.label} {col.required && <span className="text-destructive">*</span>}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.slice(0, 5).map((row, i) => (
                            <TableRow key={i}>
                              {columns.map(col => (
                                <TableCell key={col.key} className="whitespace-nowrap max-w-[200px] truncate">
                                  {row[col.key] || <span className="text-muted-foreground/50">-</span>}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                  {previewData.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      Menampilkan 5 baris pertama dari {previewData.length} baris.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Tutup
          </Button>
          {!importResult && previewData.length > 0 && (
            <Button onClick={handleImport} disabled={importMutation.isPending}>
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengimpor...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Mulai Import
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

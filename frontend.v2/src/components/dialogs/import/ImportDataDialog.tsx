import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useImport } from '@/hooks/api/useImport';

import type { ImportColumnDef, ParsedFileData, ColumnMapping, ImportResultData, ImportStep } from './types';
import { ImportStepUpload } from './ImportStepUpload';
import { ImportStepMapping } from './ImportStepMapping';
import { ImportStepPreview } from './ImportStepPreview';
import { ImportStepResult } from './ImportStepResult';

export type { ImportColumnDef } from './types';

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: 'customers' | 'products' | 'suppliers' | 'sales' | 'warehouses';
  title: string;
  columns: ImportColumnDef[];
  onSuccess?: () => void;
}

export function ImportDataDialog({ 
  open, 
  onOpenChange, 
  resource, 
  title, 
  columns, 
  onSuccess 
}: ImportDataDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  
  // Data states across steps
  const [fileData, setFileData] = useState<ParsedFileData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [mappedData, setMappedData] = useState<Record<string, unknown>[]>([]);
  const [result, setResult] = useState<ImportResultData | null>(null);

  const importMutation = useImport(resource);

  const resetState = useCallback(() => {
    setStep('upload');
    setFileData(null);
    setMappings([]);
    setMappedData([]);
    setResult(null);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Prevent closing during import
    if (importMutation.isPending) return;

    if (!newOpen) {
      setTimeout(resetState, 200);
    }
    onOpenChange(newOpen);
  }, [importMutation.isPending, onOpenChange, resetState]);

  // Step Handlers
  const handleUploadNext = useCallback((data: ParsedFileData) => {
    setFileData(data);
    setStep('mapping');
  }, []);

  const handleMappingNext = useCallback((newMappings: ColumnMapping[], newMappedData: Record<string, unknown>[]) => {
    setMappings(newMappings);
    setMappedData(newMappedData);
    setStep('preview');
  }, []);

  const handlePreviewNext = useCallback(async () => {
    if (mappedData.length === 0) return;

    try {
      const res = await importMutation.mutateAsync(mappedData);
      setResult({
        imported: res.imported || 0,
        skipped: res.skipped || 0,
        errors: res.errors || []
      });
      setStep('result');
      if (onSuccess) onSuccess();
    } catch (err) {
      // API errors are handled by useImport toast
      // But we can reset to mapping or preview if needed.
      // Leaving it on preview so user can check data again
    }
  }, [mappedData, importMutation, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
        onInteractOutside={(e) => {
          if (importMutation.isPending) e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              Import Data {title}
            </div>
            {step !== 'result' && (
              <span className="text-sm font-normal text-muted-foreground">
                Langkah {step === 'upload' ? 1 : step === 'mapping' ? 2 : 3} dari 3
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload file CSV atau XLSX untuk mengimpor data secara massal.'}
            {step === 'mapping' && 'Cocokkan kolom dari file dengan field di sistem.'}
            {step === 'preview' && 'Periksa data sebelum dimasukkan ke database.'}
            {step === 'result' && 'Hasil proses import data.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'upload' && (
            <ImportStepUpload 
              columns={columns} 
              title={title} 
              onNext={handleUploadNext} 
            />
          )}

          {step === 'mapping' && fileData && (
            <ImportStepMapping
              columns={columns}
              fileData={fileData}
              onNext={handleMappingNext}
              onBack={() => setStep('upload')}
            />
          )}

          {step === 'preview' && mappedData && (
            <ImportStepPreview
              columns={columns}
              mappedData={mappedData}
              isPending={importMutation.isPending}
              onNext={handlePreviewNext}
              onBack={() => setStep('mapping')}
            />
          )}

          {step === 'result' && result && (
            <ImportStepResult
              result={result}
              title={title}
              onReset={resetState}
            />
          )}
        </div>

        {/* Footer actions only for close/cancel, step-specific buttons are in their components */}
        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end shrink-0">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={importMutation.isPending}
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

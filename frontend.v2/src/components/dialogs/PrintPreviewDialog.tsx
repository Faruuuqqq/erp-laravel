import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, FileDown } from 'lucide-react';
import { useLazyPdfExport } from '@/hooks/useLazyPdfExport';
import { useToast } from '@/hooks/use-toast';
import { usePrint } from '@/contexts/usePrint';
import { useDownloadTransactionPdf } from '@/hooks/api/useTransactions';

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  documentId: string;
  filename?: string;
  printContent?: ReactNode;
  backendPdf?: {
    transactionId: string;
    documentType: 'invoice' | 'receipt' | 'document';
  };
}

export const PrintPreviewDialog = ({
  isOpen,
  onClose,
  title,
  children,
  documentId,
  filename = 'document',
  printContent,
  backendPdf,
}: PrintPreviewDialogProps) => {
  const { toast } = useToast();
  const { printDocument } = usePrint();
  const { exportToPdf } = useLazyPdfExport();
  const downloadTransactionPdf = useDownloadTransactionPdf();
  const [isExporting, setIsExporting] = useState(false);
  const [customFilename, setCustomFilename] = useState(filename);
  const exportTargetId = useMemo(() => `${documentId}-export-root`, [documentId]);

  useEffect(() => {
    if (isOpen) {
      setCustomFilename(filename);
    }
  }, [filename, isOpen]);

  const handlePrint = useCallback(() => {
    try {
      printDocument(printContent || children);
      toast({
        title: 'Berhasil',
        description: 'Halaman dicetak',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal mencetak',
        variant: 'destructive',
      });
    }
  }, [printDocument, children, printContent, toast]);

  const handleExportPdf = useCallback(async () => {
    try {
      setIsExporting(true);
      const trimmedFilename = customFilename.trim();
      const pdfFilename = trimmedFilename.endsWith('.pdf')
        ? trimmedFilename
        : `${trimmedFilename}.pdf`;

      if (backendPdf) {
        await downloadTransactionPdf.mutateAsync({
          transactionId: backendPdf.transactionId,
          filename: pdfFilename,
          documentType: backendPdf.documentType,
        });
      } else {
        await exportToPdf(exportTargetId, {
          filename: pdfFilename,
          title: title,
        });
      }
      
      toast({
        title: 'Berhasil',
        description: `${pdfFilename} berhasil diunduh`,
      });
      onClose();
    } catch (err) {
      console.error('PDF export error:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [backendPdf, customFilename, downloadTransactionPdf, exportTargetId, title, exportToPdf, toast, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(state) => {
      if (!state) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview - {title}</DialogTitle>
        </DialogHeader>

        {/* Print Preview Area */}
        <div
          id={exportTargetId}
          className="border rounded-lg p-6 bg-white text-black overflow-auto max-h-[500px]"
        >
          {children}
        </div>

        {/* Filename Input */}
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="filename" className="text-sm font-medium">
            Nama File PDF
          </Label>
          <div className="flex gap-2">
            <Input
              id="filename"
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="Nama file tanpa .pdf"
              className="text-sm"
            />
            <span className="text-sm text-muted-foreground pt-2">.pdf</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-sm"
          >
            Tutup
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-9 text-sm"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Cetak
          </Button>
          <Button
            onClick={handleExportPdf}
            disabled={isExporting || !customFilename.trim()}
            className="h-9 text-sm"
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            {isExporting ? 'Mengekspor...' : 'Ekspor PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewDialog;

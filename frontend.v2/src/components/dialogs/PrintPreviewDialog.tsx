import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PrintPreviewDialogProps, DocumentType } from '@/types/print';
import { SuratJalanTemplate } from '@/components/print/SuratJalanTemplate';
import { PenjualanTunaiTemplate } from '@/components/print/PenjualanTunaiTemplate';
import { PenjualanKreditTemplate } from '@/components/print/PenjualanKreditTemplate';
import { PembelianTemplate } from '@/components/print/PembelianTemplate';
import { ReturPenjualanTemplate } from '@/components/print/ReturPenjualanTemplate';
import { ReturPembelianTemplate } from '@/components/print/ReturPembelianTemplate';
import apiClient from '@/lib/api-client';

const API_ENDPOINTS: Record<DocumentType, (id: number) => string> = {
  'sj': (id) => `/api/delivery-notes/${id}/print`,
  'penjualan_tunai': (id) => `/api/transactions/${id}/printInvoice`,
  'penjualan_kredit': (id) => `/api/transactions/${id}/printInvoice`,
  'pembelian': (id) => `/api/transactions/${id}/print/purchase`,
  'retur_penjualan': (id) => `/api/return-sales/${id}/print`,
  'retur_pembelian': (id) => `/api/return-purchases/${id}/print`,
};

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  'sj': 'Surat Jalan',
  'penjualan_tunai': 'Penjualan Tunai',
  'penjualan_kredit': 'Penjualan Kredit',
  'pembelian': 'Pembelian',
  'retur_penjualan': 'Retur Penjualan',
  'retur_pembelian': 'Retur Pembelian',
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const PrintPreviewDialog = ({
  isOpen,
  onOpenChange,
  data,
  documentType,
  onPrint,
  onExportPDF,
  className,
}: PrintPreviewDialogProps) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isLoading = isPrinting || isExporting;

  const getDocumentTemplate = () => {
    switch (documentType) {
      case 'sj':
        return <SuratJalanTemplate data={data} showDraftBadge={!data.isSaved} />;
      case 'penjualan_tunai':
        return <PenjualanTunaiTemplate data={data} showDraftBadge={!data.isSaved} />;
      case 'penjualan_kredit':
        return <PenjualanKreditTemplate data={data} showDraftBadge={!data.isSaved} />;
      case 'pembelian':
        return <PembelianTemplate data={data} showDraftBadge={!data.isSaved} />;
      case 'retur_penjualan':
        return <ReturPenjualanTemplate data={data} showDraftBadge={!data.isSaved} />;
      case 'retur_pembelian':
        return <ReturPembelianTemplate data={data} showDraftBadge={!data.isSaved} />;
      default:
        return <div>Unknown document type</div>;
    }
  };

  const handleBackendPrint = async (action: 'print' | 'export') => {
    const documentId = data.savedDocumentId;
    
    if (!documentId || documentId === 0) {
      toast({
        title: 'Tidak Bisa ' + (action === 'print' ? 'Mencetak' : 'Mengekspor'),
        description: 'Simpan dokumen terlebih dahulu untuk mencetak.',
        variant: 'destructive',
      });
      return;
    }

    if (action === 'print') {
      setIsPrinting(true);
    } else {
      setIsExporting(true);
    }

    try {
      const endpoint = API_ENDPOINTS[documentType]?.(documentId);
      if (!endpoint) {
        throw new Error('Unknown document type: ' + documentType);
      }

      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers?.['content-disposition'];
      const filename = data.documentNumber 
        ? `${DOCUMENT_LABELS[documentType]}-${data.documentNumber}.pdf`
        : `${DOCUMENT_LABELS[documentType]}-${new Date().toISOString().split('T')[0]}.pdf`;

      const blob = response.data as Blob;

      if (action === 'print') {
        // Print: Create blob URL and open in new window for printing
        const printUrl = window.URL.createObjectURL(blob);
        const printWindow = window.open(printUrl, '_blank');
        
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            window.URL.revokeObjectURL(printUrl);
          };
        } else {
          // Fallback if popup blocked: download instead
          downloadBlob(blob, filename);
        }
        
        toast({
          title: 'Berhasil',
          description: 'Dokumen berhasil dibuka untuk dicetak.',
        });
        onPrint?.();
      } else {
        // Export: Direct download
        downloadBlob(blob, filename);
        
        toast({
          title: 'Berhasil',
          description: 'PDF berhasil diunduh.',
        });
        onExportPDF?.();
      }
    } catch (error: unknown) {
      console.error('Print error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError?.response?.data?.message || (error as Error)?.message || 'Gagal memproses dokumen';
      
      toast({
        title: 'Error',
        description: errMsg + '. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
      setIsExporting(false);
    }
  };

  const handlePrintClick = () => handleBackendPrint('print');
  const handleExportClick = () => handleBackendPrint('export');

  const isDisabled = !data.isSaved || isLoading;

  const dialogDescription = !data.isSaved 
    ? 'Simpan dokumen terlebih dahulu untuk Mencetak atau Mengekspor PDF.'
    : 'Klik "Cetak" untuk langsung mencetak, atau "Ekspor PDF" untuk mengunduh.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${className || ''}`}>
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Preview Dokumen
            {!data.isSaved && (
              <span className="draft-badge">DRAFT</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div
          id="document-print-container"
          className="document-print bg-white text-black p-6 rounded border overflow-auto max-h-[60vh]"
        >
          {getDocumentTemplate()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Tutup
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrintClick}
              disabled={isDisabled}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {isPrinting ? 'Membuka...' : 'Cetak'}
            </Button>
            <Button
              onClick={handleExportClick}
              disabled={isDisabled}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Mengunduh...' : 'Ekspor PDF'}
            </Button>
          </div>
        </div>

        {!data.isSaved && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Simpan dokumen terlebih dahulu untuk Mencetak atau Mengekspor PDF.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewDialog;
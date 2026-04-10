import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentType } from '@/types/print';

/**
 * Hook for handling print and export to PDF functionality
 * Uses browser's native print dialog for both print and export
 */
export const usePrintExport = () => {
  const { toast } = useToast();

  /**
   * Generate formal filename for PDF export
   */
  const generateFilename = useCallback((documentType: DocumentType, documentNumber?: string) => {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const typeMap: Record<DocumentType, string> = {
      'sj': 'SuratJalan',
      'penjualan_tunai': 'PenjualanTunai',
      'penjualan_kredit': 'PenjualanKredit',
      'pembelian': 'Pembelian',
      'retur_penjualan': 'ReturPenjualan',
      'retur_pembelian': 'ReturPembelian',
    };

    const typeLabel = typeMap[documentType] || 'Dokumen';
    
    if (documentNumber) {
      return `${typeLabel}-${documentNumber}-${timestamp}.pdf`;
    }
    
    return `${typeLabel}-Draft-${timestamp}.pdf`;
  }, []);

  /**
   * Open browser print dialog
   * User can choose to print or save as PDF
   */
  const handlePrint = useCallback((elementId?: string) => {
    try {
      // If specific element provided, scroll to it
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuka dialog cetak',
        variant: 'destructive',
      });
    }
  }, [toast]);

  /**
   * Open browser print dialog with focus on saving as PDF
   * Functionally same as print, but user context expects file download
   */
  const handleExportPDF = useCallback((elementId?: string, filename?: string) => {
    try {
      // Log filename for browser to use as suggestion
      if (filename) {
        console.log(`[PDF Export] Suggested filename: ${filename}`);
      }

      // If specific element provided, scroll to it
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 100);

      toast({
        title: 'Info',
        description: 'Pilih "Simpan sebagai PDF" di dialog cetak',
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuka dialog ekspor PDF',
        variant: 'destructive',
      });
    }
  }, [toast]);

  /**
   * Get document type label in Indonesian
   */
  const getDocumentTypeLabel = useCallback((documentType: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      'sj': 'Surat Jalan',
      'penjualan_tunai': 'Penjualan Tunai',
      'penjualan_kredit': 'Penjualan Kredit',
      'pembelian': 'Pembelian',
      'retur_penjualan': 'Retur Penjualan',
      'retur_pembelian': 'Retur Pembelian',
    };

    return labels[documentType] || 'Dokumen';
  }, []);

  /**
   * Format currency for display
   */
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  /**
   * Format date to Indonesian format
   */
  const formatDate = useCallback((date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  /**
   * Format date and time
   */
  const formatDateTime = useCallback((date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return {
    handlePrint,
    handleExportPDF,
    generateFilename,
    getDocumentTypeLabel,
    formatCurrency,
    formatDate,
    formatDateTime,
  };
};

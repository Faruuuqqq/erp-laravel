/**
 * TokoSync ERP – PDF Export Hooks
 */
import { useState } from 'react';

export interface PdfResponse {
  url: string;
  filename: string;
  billing_number?: string;
}

export const usePrintInvoice = (transactionId: string | undefined) => {
  const [data, setData] = useState<PdfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printInvoice = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/print/invoice`);
      const result: PdfResponse = await response.json();
      
      setData(result);
      window.open(result.url, '_blank');
    } catch (err) {
      setError('Gagal memuat invoice PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    if (data?.url) {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    data,
    loading,
    error,
    printInvoice,
    downloadInvoice,
  };
};

export const usePrintReceipt = (transactionId: string | undefined) => {
  const [data, setData] = useState<PdfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printReceipt = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/print/receipt`);
      const result: PdfResponse = await response.json();
      
      setData(result);
      window.open(result.url, '_blank');
    } catch (err) {
      setError('Gagal memuat struk PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (data?.url) {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    data,
    loading,
    error,
    printReceipt,
    downloadReceipt,
  };
};

export const downloadPdf = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

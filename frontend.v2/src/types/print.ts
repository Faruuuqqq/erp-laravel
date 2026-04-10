/**
 * Print/Export functionality types
 */

export type DocumentType = 'sj' | 'penjualan_tunai' | 'penjualan_kredit' | 'pembelian' | 'retur_penjualan' | 'retur_pembelian';

/**
 * Common transaction item structure
 */
export interface PrintItem {
  no?: number;
  nama: string;
  qty: number;
  satuan: string;
  keterangan?: string;
  harga?: number;
  subtotal?: number;
}

/**
 * Common transaction data for printing
 */
export interface TransactionPrintData {
  documentType: DocumentType;
  documentNumber?: string; // e.g., 'SJ-2024-001'
  savedDocumentId?: number; // ID of saved document for backend API call
  date: string;
  isSaved: boolean; // true if from saved data
  
  // Party information
  customer?: {
    name: string;
    address?: string;
    phone?: string;
  };
  
  supplier?: {
    name: string;
    address?: string;
    phone?: string;
  };
  
  // Transaction info
  items: PrintItem[];
  totalQty: number;
  totalItems: number;
  notes?: string;
  
  // Additional fields by type
  warehouse?: {
    name: string;
    address?: string;
  };
  
  salesRep?: {
    name: string;
  };
  
  driver?: string;
  destination?: string;
  
  // Financial
  subtotal?: number;
  discount?: number;
  tax?: number;
  grandTotal?: number;
  
  // Status
  status?: string;
  createdAt?: string;
  createdBy?: string;
}

/**
 * Print preview dialog props
 */
export interface PrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  
  data: TransactionPrintData;
  documentType: DocumentType;
  
  onPrint?: () => void;
  onExportPDF?: () => void;
  
  className?: string;
}

/**
 * Document template props
 */
export interface DocumentTemplateProps {
  data: TransactionPrintData;
  showDraftBadge?: boolean;
  className?: string;
}

/**
 * Print export utilities
 */
export interface PrintExportUtility {
  generateFilename: (documentType: DocumentType, documentNumber?: string) => string;
  handlePrint: (elementId: string) => void;
  handleExportPDF: (elementId: string, filename: string) => void;
}

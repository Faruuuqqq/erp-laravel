import { Button } from './button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel } from '@/lib/export';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { useState } from 'react';

interface ExportButtonProps<T = Record<string, unknown>> {
  data: T[];
  filename: string;
  onPrint?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ExportButton<T = Record<string, unknown>>({
  data,
  filename,
  onPrint,
  disabled = false,
  isLoading = false,
}: ExportButtonProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExportExcel = () => {
    if (data.length === 0) return;
    exportToExcel(data, filename);
    setIsDialogOpen(false);
  };

  const handlePrint = () => {
    setIsDialogOpen(false);
    onPrint?.();
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Pilih format export untuk data ini
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleExportExcel} disabled={disabled || isLoading}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Export PDF (Print)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="outline" size="sm" disabled={disabled || isLoading} onClick={() => setIsDialogOpen(true)}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </>
  );
}

export default ExportButton;

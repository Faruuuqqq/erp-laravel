import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileDown, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SuccessScreenProps {
  title: string;
  subtitle?: string;
  iconColor?: 'success' | 'warning' | 'primary';
  invoiceNumber?: string;
  invoiceLabel?: string;
  total?: number;
  totalLabel?: string;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  onReset: () => void;
  canPrint?: boolean;
  extra?: ReactNode;
}

export const SuccessScreen = ({
  title,
  subtitle = 'Transaksi berhasil disimpan',
  iconColor = 'success',
  invoiceNumber,
  invoiceLabel = 'No. Faktur',
  total,
  totalLabel = 'Total',
  onDownloadPdf,
  isDownloadingPdf,
  onReset,
  canPrint,
  extra,
}: SuccessScreenProps) => {
  const iconBgColor =
    iconColor === 'success'
      ? 'bg-success/10'
      : iconColor === 'warning'
        ? 'bg-warning/10'
        : 'bg-primary/10';

  const textColor =
    iconColor === 'success'
      ? 'text-success'
      : iconColor === 'warning'
        ? 'text-warning'
        : 'text-primary';

  return (
    <MainLayout title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${iconBgColor}`}>
          <CheckCircle2 className={`h-10 w-10 ${textColor}`} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          {invoiceNumber && (
            <p className="text-muted-foreground mt-1">
              {invoiceLabel}: <span className="font-mono font-semibold text-primary">{invoiceNumber}</span>
            </p>
          )}
          {total !== undefined && (
            <p className={`text-3xl font-bold ${textColor} mt-3`}>
              {total > 999 ? formatCurrency(total) : total}
            </p>
          )}
          {extra}
        </div>
        <div className="flex gap-3">
          {canPrint && onDownloadPdf && (
            <Button variant="outline" onClick={onDownloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Unduh PDF
                </>
              )}
            </Button>
          )}
          <Button onClick={onReset}>Transaksi Baru</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SuccessScreen;

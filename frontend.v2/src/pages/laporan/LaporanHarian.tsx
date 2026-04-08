import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, StatusBadge, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { TrendingUp, TrendingDown, Banknote, ShoppingCart, Printer, Download, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLaporanHarian, printDailyReport } from '@/hooks/api/useReports';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const TIPE_LABEL: Record<string, string> = {
  pembelian: 'Pembelian',
  penjualan_tunai: 'Penjualan Tunai',
  penjualan_kredit: 'Penjualan Kredit',
  pembayaran_utang: 'Pembayaran Utang',
  pembayaran_piutang: 'Pembayaran Piutang',
  retur_pembelian: 'Retur Pembelian',
  retur_penjualan: 'Retur Penjualan',
};

const LaporanHarian = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const date = selectedDate || new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useLaporanHarian(date);
  const report = data?.data?.data;

  const totalPenjualan = report?.totalIn || 0;
  const totalPembelian = report?.totalOut || 0;
  const transactionCount = report?.transactionCount || 0;
  const kasBersih = totalPenjualan - totalPembelian;

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const url = await printDailyReport(date);
      window.open(url, '_blank');
      toast({ title: 'PDF berhasil dibuat', description: 'Laporan harian telah dibuka di tab baru.' });
    } catch {
      toast({ title: 'Error', description: 'Gagal membuat PDF laporan harian.', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    const content = `LAPORAN HARIAN - TOKOSYNC ERP\nTanggal: ${date}\nTotal Penjualan: ${totalPenjualan}\nTotal Pembelian: ${totalPembelian}\nKas Bersih: ${kasBersih}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `laporan-harian-${date}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Laporan Harian" subtitle={`Ringkasan transaksi harian`}>
      <PageHeader
        title="Laporan Harian"
        description={`Tanggal: ${date}`}
        actions={
          <>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-2.5 py-1.5 bg-background">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                className="bg-transparent text-sm outline-none cursor-pointer"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-1.5" />{isPrinting ? 'Generating...' : 'Cetak'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" />Export
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-16" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
          </>
        ) : (
          <>
            <StatCard title="Total Penjualan" value={totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="success" />
            <StatCard title="Total Pembelian" value={totalPembelian} icon={<ShoppingCart className="h-5 w-5" />} color="primary" />
            <StatCard title="Total Transaksi" value={`${transactionCount}`} icon={<FileText className="h-5 w-5" />} color="info" />
            <StatCard title="Kas Bersih" value={kasBersih} icon={<Banknote className="h-5 w-5" />} color={kasBersih >= 0 ? 'success' : 'destructive'} />
          </>
        )}
      </div>

      {isLoading ? (
        <DataTableContainer>
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 px-4 py-3 border-b">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </DataTableContainer>
      ) : (
        <DataTableContainer>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ringkasan per Tipe</span>
            </div>
          </div>
          {report?.byType && Object.keys(report.byType).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">Tipe Transaksi</th>
                    <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.byType).map(([type, info]: [string, any]) => (
                    <tr key={type} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{TIPE_LABEL[type] || type}</td>
                      <td className="px-4 py-3 text-right">{info.count}</td>
                      <td className="px-4 py-3 text-right"><CurrencyCell value={info.total} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Belum ada transaksi pada tanggal ini.</p>
            </div>
          )}
        </DataTableContainer>
      )}
    </MainLayout>
  );
};
export default LaporanHarian;

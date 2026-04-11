import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell, StatusBadge } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Banknote, ShoppingCart, Printer, Download, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLaporanHarian } from '@/hooks/api/useInfo';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface DailyReport {
  date: string;
  summary: {
    totalPenjualan: number;
    totalPembelian: number;
    totalBiaya: number;
    kasBersih: number;
    penjualanTunai: number;
    penjualanKredit: number;
  };
  transactions: Transaction[];
  expenses: { id: string; category: string; description: string; amount: number }[];
}

const TIPE_LABELS: Record<string, string> = {
  penjualan_tunai: 'Penjualan Tunai',
  penjualan_kredit: 'Penjualan Kredit',
  pembelian: 'Pembelian',
  pembayaran_piutang: 'Pembayaran Piutang',
  pembayaran_utang: 'Pembayaran Utang',
  retur_penjualan: 'Retur Penjualan',
  retur_pembelian: 'Retur Pembelian',
};

const LaporanHarian = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data, isLoading } = useLaporanHarian(selectedDate);
  const report = data as { data?: DailyReport } | undefined;
  const d = report?.data;

  const summary = useMemo(() => d?.summary ?? { totalPenjualan: 0, totalPembelian: 0, totalBiaya: 0, kasBersih: 0, penjualanTunai: 0, penjualanKredit: 0 }, [d]);
  const displayTx: Transaction[] = useMemo(() => d?.transactions ?? [], [d]);
  const displayExp = useMemo(() => d?.expenses ?? [], [d]);

  const handleExportPDF = useCallback(() => {
    const content = `LAPORAN HARIAN - TOKOSYNC ERP\nTanggal: ${selectedDate}\n${'='.repeat(70)}\nTotal Penjualan  : ${formatCurrency(summary.totalPenjualan)}\nTotal Pembelian  : ${formatCurrency(summary.totalPembelian)}\nBiaya Operasional: ${formatCurrency(summary.totalBiaya)}\nKas Bersih       : ${formatCurrency(summary.kasBersih)}\n${'='.repeat(70)}\n${displayTx.map(tx => `${tx.invoiceNumber}\t${tx.type}\t${tx.customer || tx.supplier || '-'}\t${formatCurrency(tx.total)}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `laporan-harian-${selectedDate}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [selectedDate, summary, displayTx]);

  return (
    <MainLayout title="Laporan Harian" subtitle="Ringkasan transaksi harian">
      <PageHeader
        title="Laporan Harian"
        description={`Tanggal: ${selectedDate}`}
        actions={
          <>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-2.5 py-1.5 bg-background">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                className="bg-transparent text-sm outline-none cursor-pointer"
                value={selectedDate}
                max={today}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Cetak</Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1.5" />Export</Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Penjualan" value={isLoading ? '...' : summary.totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Pembelian" value={isLoading ? '...' : summary.totalPembelian} icon={<ShoppingCart className="h-5 w-5" />} color="primary" />
        <StatCard title="Biaya Operasional" value={isLoading ? '...' : summary.totalBiaya} icon={<TrendingDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Kas Bersih (Tunai)" value={isLoading ? '...' : summary.kasBersih} icon={<Banknote className="h-5 w-5" />} color={summary.kasBersih >= 0 ? 'success' : 'destructive'} />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Komposisi Penjualan</p>
          {[
            { label: 'Penjualan Tunai', value: summary.penjualanTunai },
            { label: 'Penjualan Kredit', value: summary.penjualanKredit },
          ].filter(i => i.value > 0).map(i => (
            <div key={i.label} className="flex justify-between items-center py-1 border-b last:border-0">
              <span className="text-sm">{i.label}</span>
              <span className="text-sm font-medium text-success">{formatCurrency(i.value)}</span>
            </div>
          ))}
          {summary.totalPenjualan === 0 && <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Biaya Operasional</p>
          {isLoading ? <Skeleton className="h-20 w-full" /> : displayExp.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada biaya hari ini.</p>
          ) : displayExp.map(e => (
            <div key={e.id} className="flex justify-between items-center py-1 border-b last:border-0">
              <span className="text-xs text-muted-foreground truncate max-w-28">{e.description}</span>
              <span className="text-sm font-medium text-destructive">{formatCurrency(e.amount)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Status Transaksi</p>
          {isLoading ? <Skeleton className="h-20 w-full" /> : (['lunas', 'kredit', 'sebagian'] as const).map(status => {
            const count = displayTx.filter(t => (t.remaining === 0 ? 'lunas' : (t.paid ?? 0) > 0 ? 'sebagian' : 'kredit') === status).length;
            return count > 0 ? (
              <div key={status} className="flex justify-between items-center py-1 border-b last:border-0">
                <StatusBadge status={status.charAt(0).toUpperCase() + status.slice(1)} variant={status} />
                <span className="text-sm font-bold">{count} transaksi</span>
              </div>
            ) : null;
          })}
          {displayTx.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
        </div>
      </div>

      <DataTableContainer>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Daftar Transaksi — {selectedDate}</span>
            <Badge variant="secondary" className="text-xs">{displayTx.length} transaksi</Badge>
          </div>
          <span className="text-sm font-bold">Total: <CurrencyCell value={displayTx.reduce((s, t) => s + t.total, 0)} /></span>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : displayTx.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Belum ada transaksi pada tanggal ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['No. Faktur', 'Tipe Transaksi', 'Customer / Supplier', 'Total', 'Bayar', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayTx.map(tx => {
                  const txStatus = tx.remaining === 0 ? 'lunas' : (tx.paid ?? 0) > 0 ? 'sebagian' : 'kredit';
                  return (
                    <tr key={tx.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{tx.invoiceNumber}</td>
                      <td className="px-4 py-3"><span className="text-xs font-medium">{TIPE_LABELS[tx.type] ?? tx.type}</span></td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{tx.customer || tx.supplier || '—'}</div>
                      </td>
                      <td className="px-4 py-3"><CurrencyCell value={tx.total} /></td>
                      <td className="px-4 py-3"><CurrencyCell value={tx.paid} /></td>
                      <td className="px-4 py-3">
                        <StatusBadge status={txStatus.charAt(0).toUpperCase() + txStatus.slice(1)} variant={txStatus} />
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/40 border-t-2 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-sm">TOTAL</td>
                  <td className="px-4 py-3"><CurrencyCell value={displayTx.reduce((s, t) => s + t.total, 0)} /></td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DataTableContainer>
    </MainLayout>
  );
};

export default LaporanHarian;

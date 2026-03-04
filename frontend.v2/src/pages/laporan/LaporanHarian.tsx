import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, StatusBadge, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { TRANSACTIONS, EXPENSES, getDashboardStats, TIPE_TRANSAKSI_LABELS, getTodayID, formatRupiah } from '@/data/mockData';
import { TrendingUp, TrendingDown, Banknote, ShoppingCart, Printer, Download, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const LaporanHarian = () => {
  const stats = getDashboardStats();
  const today = getTodayID();
  const [selectedDate, setSelectedDate] = useState('');

  // Filter by date — default to today's data, allow selecting from available dates
  const availableDates = [...new Set(TRANSACTIONS.map(t => t.tanggal))].sort().reverse();

  const activeDate = selectedDate || today;
  const txFiltered = TRANSACTIONS.filter(t => t.tanggal === activeDate);
  const expFiltered = EXPENSES.filter(e => e.tanggal === activeDate);

  // Fallback: if no transactions for today, show most recent date
  const displayTx = txFiltered.length > 0 ? txFiltered : TRANSACTIONS.filter(t => t.tanggal === availableDates[0]);
  const displayExp = expFiltered.length > 0 ? expFiltered : EXPENSES.filter(e => e.tanggal === availableDates[0]);
  const displayDate = txFiltered.length > 0 ? activeDate : availableDates[0];

  const totalPenjualan = displayTx
    .filter(t => t.tipe === 'penjualan_tunai' || t.tipe === 'penjualan_kredit')
    .reduce((s, t) => s + t.total, 0);
  const totalPembelian = displayTx
    .filter(t => t.tipe === 'pembelian')
    .reduce((s, t) => s + t.total, 0);
  const totalBiaya = displayExp.reduce((s, e) => s + e.jumlah, 0);
  const kasmasuk = displayTx
    .filter(t => t.tipe === 'penjualan_tunai')
    .reduce((s, t) => s + t.total, 0);
  const kasBersih = kasmasuk - totalBiaya;

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = `
LAPORAN HARIAN - TOKOSYNC ERP
Tanggal : ${displayDate}
Dicetak : ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${'='.repeat(70)}

RINGKASAN:
Total Penjualan  : ${formatRupiah(totalPenjualan)}
Total Pembelian  : ${formatRupiah(totalPembelian)}
Biaya Operasional: ${formatRupiah(totalBiaya)}
Kas Bersih       : ${formatRupiah(kasBersih)}

${'='.repeat(70)}
DAFTAR TRANSAKSI (${displayTx.length} transaksi):
${['No. Faktur', 'Tipe', 'Customer/Supplier', 'Total', 'Status'].join('\t')}
${'-'.repeat(70)}
${displayTx.map(tx =>
      [tx.noFaktur, TIPE_TRANSAKSI_LABELS[tx.tipe],
        tx.customerNama || tx.supplierNama || '-',
        formatRupiah(tx.total), tx.status.toUpperCase()].join('\t')
    ).join('\n')}

${'='.repeat(70)}
BIAYA OPERASIONAL (${displayExp.length} item):
${displayExp.map(e => `${e.kategori}: ${e.keterangan} — ${formatRupiah(e.jumlah)}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-harian-${displayDate.replace(/-/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Laporan Harian" subtitle={`Ringkasan transaksi harian`}>
      <PageHeader
        title="Laporan Harian"
        description={`Tanggal: ${displayDate}`}
        actions={
          <>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-2.5 py-1.5 bg-background">
              <Calendar className="h-4 w-4" />
              <select
                className="bg-transparent text-sm outline-none cursor-pointer"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              >
                <option value="">Hari ini ({today})</option>
                {availableDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />Cetak
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1.5" />Export PDF
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Penjualan" value={totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Pembelian" value={totalPembelian} icon={<ShoppingCart className="h-5 w-5" />} color="primary" />
        <StatCard title="Biaya Operasional" value={totalBiaya} icon={<TrendingDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Kas Bersih (Tunai)" value={kasBersih} icon={<Banknote className="h-5 w-5" />} color={kasBersih >= 0 ? 'success' : 'destructive'} />
      </div>

      {/* Summary breakdown */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Komposisi Penjualan</p>
          {['penjualan_tunai', 'penjualan_kredit'].map(tipe => {
            const items = displayTx.filter(t => t.tipe === tipe);
            const total = items.reduce((s, t) => s + t.total, 0);
            return total > 0 ? (
              <div key={tipe} className="flex justify-between items-center py-1 border-b last:border-0">
                <span className="text-sm">{TIPE_TRANSAKSI_LABELS[tipe as keyof typeof TIPE_TRANSAKSI_LABELS]}</span>
                <span className="text-sm font-medium text-success">{formatRupiah(total)}</span>
              </div>
            ) : null;
          })}
          {totalPenjualan === 0 && <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Biaya Operasional</p>
          {displayExp.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada biaya hari ini.</p>
          ) : displayExp.map(e => (
            <div key={e.id} className="flex justify-between items-center py-1 border-b last:border-0">
              <span className="text-xs text-muted-foreground truncate max-w-28">{e.keterangan}</span>
              <span className="text-sm font-medium text-destructive">{formatRupiah(e.jumlah)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Status Transaksi</p>
          {(['lunas', 'kredit', 'sebagian'] as const).map(status => {
            const count = displayTx.filter(t => t.status === status).length;
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

      {/* Transaction Table */}
      <DataTableContainer>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Daftar Transaksi — {displayDate}
            </span>
            <Badge variant="secondary" className="text-xs">{displayTx.length} transaksi</Badge>
          </div>
          <span className="text-sm font-bold text-foreground">
            Total: <CurrencyCell value={displayTx.reduce((s, t) => s + t.total, 0)} />
          </span>
        </div>
        {displayTx.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Belum ada transaksi pada tanggal ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['No. Faktur', 'Tipe Transaksi', 'Customer / Supplier', 'Gudang', 'Total', 'Bayar', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayTx.map(tx => (
                  <tr key={tx.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{tx.noFaktur}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{TIPE_TRANSAKSI_LABELS[tx.tipe]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{tx.customerNama || tx.supplierNama || '—'}</div>
                      {tx.salesNama && <div className="text-xs text-muted-foreground">Sales: {tx.salesNama}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{tx.gudangNama || '—'}</td>
                    <td className="px-4 py-3"><CurrencyCell value={tx.total} /></td>
                    <td className="px-4 py-3">
                      {tx.bayar ? <CurrencyCell value={tx.bayar} /> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={tx.status === 'lunas' ? 'Lunas' : tx.status === 'kredit' ? 'Kredit' : 'Sebagian'}
                        variant={tx.status}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 border-t-2 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm">TOTAL</td>
                  <td className="px-4 py-3">
                    <CurrencyCell value={displayTx.reduce((s, t) => s + t.total, 0)} />
                  </td>
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

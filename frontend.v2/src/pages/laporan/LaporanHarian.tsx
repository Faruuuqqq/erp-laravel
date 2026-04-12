import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell, StatusBadge } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Banknote, ShoppingCart, Printer, Download, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrint } from '@/contexts/usePrint';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useLaporanHarian } from '@/hooks/api/useInfo';
import { useLazyPdfExport } from '@/hooks/useLazyPdfExport';
import { LaporanHarianPrint } from '@/components/print/LaporanHarianPrint';
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
  const [isExporting, setIsExporting] = useState(false);
  const { isOwner, canPrint } = usePermissions();
  const { user } = useAuth();
  const { printDocument } = usePrint();
  const { exportToPdf } = useLazyPdfExport();

  const { data, isLoading } = useLaporanHarian(selectedDate);
  const report = data?.data as DailyReport | undefined;
  const d = report;

  const summary = useMemo(() => d?.summary ?? { totalPenjualan: 0, totalPembelian: 0, totalBiaya: 0, kasBersih: 0, penjualanTunai: 0, penjualanKredit: 0 }, [d]);
  const displayTx: Transaction[] = useMemo(() => d?.transactions ?? [], [d]);
  const displayExp = useMemo(() => d?.expenses ?? [], [d]);

  const handlePrint = useCallback(() => {
    printDocument(
      <LaporanHarianPrint
        date={selectedDate}
        printedBy={user?.name}
        summary={{
          penjualanTunai: summary.penjualanTunai,
          penjualanKredit: summary.penjualanKredit,
          penerimaanPiutang: 0, // populated from pembayaran_piutang if available
          totalPembelian: summary.totalPembelian,
          pembayaranUtang: 0,
          biayaJasa: summary.totalBiaya,
          saldoKas: summary.kasBersih,
        }}
        transactions={displayTx.map(t => ({ invoiceNumber: t.invoiceNumber, type: t.type, description: t.customer || t.supplier || '-', amount: t.total }))}
      />
    );
  }, [printDocument, selectedDate, user?.name, summary, displayTx]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <div style="background: white; padding: 24px; font-family: Arial, sans-serif; font-size: 12px;">
          <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #333;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Ringkasan Laporan Harian</h3>
            <p style="margin: 0; font-size: 11px; color: #666;">Tanggal: ${selectedDate}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left; width: 50%;">Total Penjualan Tunai</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(summary.penjualanTunai)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left;">Total Penjualan Kredit</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(summary.penjualanKredit)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left;">Total Pembelian</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(summary.totalPembelian)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left;">Biaya Operasional</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(summary.totalBiaya)}</td>
                </tr>
                <tr style="border-top: 2px solid #333; background-color: #f5f5f5;">
                  <td style="padding: 8px; text-align: left; font-weight: bold;">Kas Bersih (Tunai)</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 13px;">${formatCurrency(summary.kasBersih)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #333;">
            <h3 style="margin: 0; font-size: 13px; font-weight: bold;">Daftar Transaksi</h3>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #333;">
                <th style="padding: 8px; text-align: left; font-weight: bold;">No. Faktur</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Tipe</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Customer / Supplier</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${displayTx.map(tx => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left; font-family: monospace; font-size: 11px;">${tx.invoiceNumber}</td>
                  <td style="padding: 8px; text-align: left; font-size: 11px;">${TIPE_LABELS[tx.type] ?? tx.type}</td>
                  <td style="padding: 8px; text-align: left;">${tx.customer || tx.supplier || '—'}</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(tx.total)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f5f5f5;">
                <td colspan="3" style="padding: 8px; text-align: right;">TOTAL TRANSAKSI:</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(displayTx.reduce((s, t) => s + t.total, 0))}</td>
              </tr>
            </tfoot>
          </table>

          ${displayExp.length > 0 ? `
            <div style="margin-top: 20px; padding-top: 12px; padding-bottom: 12px; border-bottom: 2px solid #333;">
              <h3 style="margin: 0; font-size: 13px; font-weight: bold;">Daftar Biaya Operasional</h3>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #333;">
                  <th style="padding: 8px; text-align: left; font-weight: bold;">Kategori</th>
                  <th style="padding: 8px; text-align: left; font-weight: bold;">Deskripsi</th>
                  <th style="padding: 8px; text-align: right; font-weight: bold;">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${displayExp.map(e => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; text-align: left; font-size: 11px;">${e.category}</td>
                    <td style="padding: 8px; text-align: left; font-size: 11px;">${e.description}</td>
                    <td style="padding: 8px; text-align: right;">${formatCurrency(e.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f5f5f5;">
                  <td colspan="2" style="padding: 8px; text-align: right;">TOTAL BIAYA:</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(displayExp.reduce((s, e) => s + e.amount, 0))}</td>
                </tr>
              </tfoot>
            </table>
          ` : ''}
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.id = 'pdf-export-content';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      await exportToPdf('pdf-export-content', {
        filename: `laporan-harian-${selectedDate}.pdf`,
        title: 'Laporan Harian',
        subtitle: `${selectedDate} - ${displayTx.length} transaksi`,
        companyName: 'Toko ABC',
        companyPhone: '(021) 1234-5678',
        companyAddress: 'Jl. Jalan Raya No. 123, Jakarta 12345',
      });

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedDate, summary, displayTx, displayExp, exportToPdf]);

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
            {canPrint('__owner_only__') && (
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1.5" />Cetak</Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}><Download className="h-4 w-4 mr-1.5" />{isExporting ? 'Generating...' : 'Export PDF'}</Button>
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

import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePdfExport } from '@/hooks/usePdfExport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Eye, EyeOff, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions, useToggleHideTransaction } from '@/hooks/api/useTransactions';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const HistoriPembayaranUtang = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('visible');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const toggleHideMutation = useToggleHideTransaction();

  const { exportToPdf } = usePdfExport();
  const { data, isLoading } = useTransactions({
    type: 'pembayaran_utang',
    search: searchTerm || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    perPage: 25,
  });

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  
  const filtered = transactions
    .filter(t => {
      if (filterHidden === 'visible') return !t.isHidden;
      if (filterHidden === 'hidden') return t.isHidden;
      return true;
    });

  const hiddenCount = transactions.filter(t => t.isHidden).length;
  const totalNilai = filtered.reduce((s, t) => s + t.paid, 0);

  const handleToggleHide = useCallback(async (id: string) => {
    setTogglingId(id);
    try {
      await toggleHideMutation.mutateAsync(id);
      toast({ title: 'Berhasil', description: 'Status transaksi diperbarui' });
    } catch {
      toast({ title: 'Error', description: 'Gagal mengubah status transaksi', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
}, [toggleHideMutation, toast]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <div style="background: white; padding: 24px; font-family: Arial, sans-serif; font-size: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #333;">
                <th style="padding: 8px; text-align: left; font-weight: bold;">No. Bukti</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Tanggal</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Supplier</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Nilai</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(t => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left; font-family: monospace;">${t.invoiceNumber}</td>
                  <td style="padding: 8px; text-align: left;">${t.date}</td>
                  <td style="padding: 8px; text-align: left;">${t.supplier || '-'}</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(t.paid)}</td>
                  <td style="padding: 8px; text-align: left;">${t.isHidden ? 'Tersembunyi' : 'Ditampilkan'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #333; font-weight: bold;">
                <td colspan="3" style="padding: 8px; text-align: right;">TOTAL:</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(totalNilai)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.id = 'pdf-export-content';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const dateRange = dateFrom || dateTo ? ` (${dateFrom || '-'} s/d ${dateTo || '-'})` : '';
      await exportToPdf('pdf-export-content', {
        filename: `histori-pembayaran-utang-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: 'Histori Pembayaran Utang',
        subtitle: `${filtered.length} transaksi${dateRange}`,
        companyName: 'Toko ABC',
        companyPhone: '(021) 1234-5678',
        companyAddress: 'Jl. Jalan Raya No. 123, Jakarta 12345',
      });

      document.body.removeChild(tempDiv);
      toast({ title: 'Export berhasil', description: `${filtered.length} transaksi diekspor ke PDF` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengekspor ke PDF', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [filtered, totalNilai, dateFrom, dateTo, exportToPdf, toast]);

  return (
    <MainLayout title="Histori Pembayaran Utang" subtitle="Riwayat pembayaran utang ke supplier">
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Transaksi</p><p className="text-lg font-bold">{meta?.total ?? '-'}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Dibayar</p><p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(totalNilai)}</p></CardContent></Card>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari supplier..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <Input type="date" className="text-xs h-8 w-36" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <Input type="date" className="text-xs h-8 w-36" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport} disabled={isExporting}><FileDown className="h-3.5 w-3.5" />{isExporting ? 'Exporting...' : 'Export PDF'}</Button>
      </div>

      <Card>
         <CardContent className="p-0">
           <div className="border-b">
             <Tabs value={filterHidden} onValueChange={(v) => setFilterHidden(v as 'all' | 'visible' | 'hidden')}>
               <TabsList className="w-full justify-start rounded-none h-10 bg-transparent border-b">
                 <TabsTrigger value="visible" className="text-xs">Ditampilkan ({transactions.filter(t => !t.isHidden).length})</TabsTrigger>
                 <TabsTrigger value="hidden" className="text-xs">Tersembunyi ({hiddenCount})</TabsTrigger>
                 <TabsTrigger value="all" className="text-xs">Semua ({transactions.length})</TabsTrigger>
               </TabsList>
             </Tabs>
           </div>
           <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow className="bg-muted/50">
                   <TableHead className="w-8 text-xs">#</TableHead>
                   <TableHead className="text-xs">No. Bukti</TableHead>
                   <TableHead className="text-xs">Tanggal</TableHead>
                   <TableHead className="text-xs">Supplier</TableHead>
                   <TableHead className="text-xs text-right">Jumlah Dibayar</TableHead>
                   <TableHead className="text-xs">Catatan</TableHead>
                   <TableHead className="w-16" />
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading ? (
                   Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                 ) : filtered.length === 0 ? (
                   <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Tidak ada data pembayaran utang</TableCell></TableRow>
                 ) : filtered.map(t => (
                   <TableRow key={t.id} className={`text-sm hover:bg-muted/30 ${t.isHidden ? 'opacity-60' : ''}`}>
                     <TableCell className="text-xs text-muted-foreground">
                       {t.isHidden ? <Badge variant="outline" className="text-xs">🔒</Badge> : ''}
                     </TableCell>
                     <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                     <TableCell className="text-xs">{t.date}</TableCell>
                     <TableCell className="font-medium max-w-[160px] truncate">{t.supplier || '-'}</TableCell>
                     <TableCell className="text-right font-bold tabular-nums text-primary">{formatCurrency(t.paid)}</TableCell>
                     <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{t.notes || '-'}</TableCell>
                     <TableCell>
                       <div className="flex gap-0.5">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}><Eye className="h-3.5 w-3.5" /></Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                           title={t.isHidden ? 'Tampilkan' : 'Sembunyikan'}
                           onClick={() => handleToggleHide(t.id)}
                           disabled={togglingId === t.id}
                         >
                           {t.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
           {meta && meta.last_page > 1 && (
             <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
               <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)</span>
               <div className="flex gap-1">
                 <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                 <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
               </div>
             </div>
           )}
         </CardContent>
       </Card>

      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" />Detail Pembayaran Utang</DialogTitle></DialogHeader>
          {selectedTrx && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">No. Bukti</p><p className="font-mono font-semibold text-primary">{selectedTrx.invoiceNumber}</p></div>
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedTrx.supplier || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Jumlah</p><p className="font-bold text-primary">{formatCurrency(selectedTrx.paid)}</p></div>
              </div>
              {selectedTrx.notes && <div className="rounded-lg bg-muted/30 p-3 text-xs"><p className="text-muted-foreground mb-1">Catatan</p><p>{selectedTrx.notes}</p></div>}
              <div className="flex justify-end"><Button size="sm" onClick={() => setSelectedTrx(null)}>Tutup</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default HistoriPembayaranUtang;

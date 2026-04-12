import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Eye, EyeOff, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions, useToggleHideTransaction } from '@/hooks/api/useTransactions';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { usePermissions } from '@/hooks/usePermissions';
import { useLazyPdfExport } from '@/hooks/useLazyPdfExport';
import { exportTransactionsToXlsx, getFilenameWithDate } from '@/lib/xlsx-export';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const paymentStatusVariant = (t: Transaction) => {
  if (t.remaining === 0) return 'default';
  if ((t.paid ?? 0) > 0) return 'secondary';
  return 'destructive';
};
const paymentStatusLabel = (t: Transaction) => {
  if (t.remaining === 0) return 'Lunas';
  if ((t.paid ?? 0) > 0) return 'Sebagian';
  return 'Kredit';
};

const HistoriPembelian = () => {
  const { toast } = useToast();
  const { canHideTransactions } = usePermissions();
  const { exportToPdf } = useLazyPdfExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('visible');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);

  const toggleHideMutation = useToggleHideTransaction();

  const { data, isLoading } = useTransactions({
    type: 'pembelian',
    search: searchTerm || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    perPage: 25,
  });
  const { data: suppliersData } = useSuppliers({ perPage: 200 });

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const suppliers = suppliersData?.data ?? [];

  const filtered = filterSupplier === 'all'
    ? transactions
    : transactions.filter(t => t.supplierId === filterSupplier);

  const filteredByHidden = filtered
    .filter(t => {
      if (filterHidden === 'visible') return !t.isHidden;
      if (filterHidden === 'hidden') return t.isHidden;
      return true;
    });

  const hiddenCount = filtered.filter(t => t.isHidden).length;
  const totalNilai = filteredByHidden.reduce((s, t) => s + t.total, 0);

  const handleToggleHide = useCallback(async (id: string, currentlyHidden: boolean) => {
    setTogglingId(id);
    try {
      await toggleHideMutation.mutateAsync(id);
      toast({ 
        title: 'Berhasil', 
        description: currentlyHidden ? 'Transaksi ditampilkan kembali' : 'Transaksi disembunyikan' 
      });
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
                <th style="padding: 8px; text-align: left; font-weight: bold;">No. Faktur</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Tanggal</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Supplier</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Total</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Terbayar</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Sisa</th>
                <th style="padding: 8px; text-align: left; font-weight: bold;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredByHidden.map(t => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; text-align: left; font-family: monospace;">${t.invoiceNumber}</td>
                  <td style="padding: 8px; text-align: left;">${t.date}</td>
                  <td style="padding: 8px; text-align: left;">${t.supplier || '-'}</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(t.total)}</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(t.paid)}</td>
                  <td style="padding: 8px; text-align: right;">${formatCurrency(t.remaining ?? 0)}</td>
                  <td style="padding: 8px; text-align: left;">${paymentStatusLabel(t)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #333; font-weight: bold;">
                <td colspan="3" style="padding: 8px; text-align: right;">TOTAL:</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(totalNilai)}</td>
                <td colspan="3"></td>
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
        filename: `histori-pembelian-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: 'Histori Pembelian',
        subtitle: `${filteredByHidden.length} transaksi${dateRange}`,
        companyName: 'Toko ABC',
        companyPhone: '(021) 1234-5678',
        companyAddress: 'Jl. Jalan Raya No. 123, Jakarta 12345',
      });

      document.body.removeChild(tempDiv);
      toast({ title: 'Export berhasil', description: `${filteredByHidden.length} transaksi diekspor ke PDF` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengekspor ke PDF', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [filteredByHidden, totalNilai, dateFrom, dateTo, exportToPdf, toast]);

  const handleExportXlsx = useCallback(async () => {
    setIsExportingXlsx(true);
    try {
      const dataForExport = filteredByHidden.map(t => ({
        'No. Faktur': t.invoiceNumber,
        'Tanggal': t.date,
        'Supplier': t.supplier || '-',
        'Total': t.total,
        'Terbayar': t.paid,
        'Sisa': t.remaining ?? 0,
        'Status': paymentStatusLabel(t),
      }));

      exportTransactionsToXlsx(
        dataForExport,
        ['No. Faktur', 'Tanggal', 'Supplier', 'Total', 'Terbayar', 'Sisa', 'Status'],
        {
          filename: `HistoriPembelian_${getFilenameWithDate('')}`,
          sheetName: 'Histori Pembelian',
          currencyColumns: [3, 4, 5],
          rightAlignColumns: [3, 4, 5],
        }
      );

      toast({
        title: 'Export berhasil',
        description: `${filteredByHidden.length} transaksi diekspor ke XLSX`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal export XLSX',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsExportingXlsx(false);
    }
  }, [filteredByHidden, toast]);

  return (
    <MainLayout title="Histori Pembelian" subtitle="Riwayat pembelian barang dari supplier">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
         {[
           { label: 'Total Transaksi', value: String(meta?.total ?? '-') },
           { label: 'Nilai Ditampilkan', value: formatCurrency(totalNilai), color: 'text-primary' },
           { label: 'Kredit / Belum Lunas', value: String(filteredByHidden.filter(t => (t.remaining ?? 0) > 0).length), color: 'text-warning' },
         ].map(s => (
           <Card key={s.label}><CardContent className="p-3">
             <p className="text-xs text-muted-foreground">{s.label}</p>
             <p className={`text-lg font-bold tabular-nums ${s.color ?? ''}`}>{s.value}</p>
           </CardContent></Card>
         ))}
       </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari faktur/supplier..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <Input type="date" className="text-xs h-8 w-36" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} placeholder="Dari tanggal" />
          <Input type="date" className="text-xs h-8 w-36" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          <Select value={filterSupplier} onValueChange={v => { setFilterSupplier(v); setPage(1); }}>
            <SelectTrigger className="w-44 text-xs h-8"><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Supplier</SelectItem>
              {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
         <div className="flex gap-1.5">
           <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExportXlsx} disabled={isExportingXlsx}>
             <FileDown className="h-3.5 w-3.5" />{isExportingXlsx ? 'Generating...' : 'Export XLSX'}
           </Button>
           <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport} disabled={isExporting}>
             <FileDown className="h-3.5 w-3.5" />{isExporting ? 'Generating...' : 'Export PDF'}
           </Button>
         </div>
      </div>

      <Card>
         <CardContent className="p-0">
           <div className="border-b">
             <Tabs value={filterHidden} onValueChange={(v) => setFilterHidden(v as 'all' | 'visible' | 'hidden')}>
               <TabsList className="w-full justify-start rounded-none h-10 bg-transparent border-b">
                 <TabsTrigger value="visible" className="text-xs">Ditampilkan ({filtered.filter(t => !t.isHidden).length})</TabsTrigger>
                 <TabsTrigger value="hidden" className="text-xs">Tersembunyi ({hiddenCount})</TabsTrigger>
                 <TabsTrigger value="all" className="text-xs">Semua ({filtered.length})</TabsTrigger>
               </TabsList>
             </Tabs>
           </div>
           <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow className="bg-muted/50">
                   <TableHead className="w-8 text-xs">#</TableHead>
                   <TableHead className="text-xs">No. Faktur</TableHead>
                   <TableHead className="text-xs">Tanggal</TableHead>
                   <TableHead className="text-xs">Supplier</TableHead>
                   <TableHead className="text-xs text-right">Total</TableHead>
                   <TableHead className="text-xs text-right">Terbayar</TableHead>
                   <TableHead className="text-xs text-right">Sisa</TableHead>
                   <TableHead className="text-xs">Status</TableHead>
                   <TableHead className="w-16" />
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                   ))
                 ) : filteredByHidden.length === 0 ? (
                   <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                 ) : filteredByHidden.map(t => (
                   <TableRow key={t.id} className={`text-sm hover:bg-muted/30 ${t.isHidden ? 'opacity-60' : ''}`}>
                     <TableCell className="text-xs text-muted-foreground">
                       {t.isHidden ? <Badge variant="outline" className="text-xs">🔒</Badge> : ''}
                     </TableCell>
                     <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                     <TableCell className="text-xs">{t.date}</TableCell>
                     <TableCell className="font-medium max-w-[160px] truncate">{t.supplier || '-'}</TableCell>
                     <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.total)}</TableCell>
                     <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(t.paid)}</TableCell>
                     <TableCell className="text-right tabular-nums text-xs text-destructive">{formatCurrency(t.remaining ?? 0)}</TableCell>
                     <TableCell><Badge variant={paymentStatusVariant(t)} className="text-xs">{paymentStatusLabel(t)}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}><Eye className="h-3.5 w-3.5" /></Button>
                          {canHideTransactions() && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                              title={t.isHidden ? 'Tampilkan' : 'Sembunyikan'}
                              onClick={() => handleToggleHide(t.id, t.isHidden ?? false)}
                              disabled={togglingId === t.id}
                            >
                              {t.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
           {/* Pagination */}
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />Detail Pembelian â€” {selectedTrx?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedTrx.supplier || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-primary">{formatCurrency(selectedTrx.total)}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={paymentStatusVariant(selectedTrx)} className="text-xs">{paymentStatusLabel(selectedTrx)}</Badge></div>
              </div>
              {selectedTrx.items && selectedTrx.items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Harga</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTrx.items.map((item, i) => (
                      <TableRow key={i} className="text-sm">
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">{formatCurrency(selectedTrx.total)}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
                <Button size="sm" onClick={() => setSelectedTrx(null)}>Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default HistoriPembelian;

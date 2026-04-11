import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Eye, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useSuppliers } from '@/hooks/api/useSuppliers';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

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

  const totalNilai = filtered.reduce((s, t) => s + t.total, 0);

  const handleExport = useCallback(() => toast({ title: 'Mengekspor PDF...' }), [toast]);

  return (
    <MainLayout title="Histori Pembelian" subtitle="Riwayat pembelian barang dari supplier">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          { label: 'Total Transaksi', value: String(meta?.total ?? '-') },
          { label: 'Nilai Ditampilkan', value: formatCurrency(totalNilai), color: 'text-primary' },
          { label: 'Kredit / Belum Lunas', value: String(filtered.filter(t => (t.remaining ?? 0) > 0).length), color: 'text-warning' },
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
        <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport}>
          <FileDown className="h-3.5 w-3.5" />Export PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">No. Faktur</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Supplier</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-right">Terbayar</TableHead>
                  <TableHead className="text-xs text-right">Sisa</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                ) : filtered.map(t => (
                  <TableRow key={t.id} className="text-sm hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{t.date}</TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate">{t.supplier || '-'}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.total)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(t.paid)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-destructive">{formatCurrency(t.remaining ?? 0)}</TableCell>
                    <TableCell><Badge variant={paymentStatusVariant(t)} className="text-xs">{paymentStatusLabel(t)}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
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

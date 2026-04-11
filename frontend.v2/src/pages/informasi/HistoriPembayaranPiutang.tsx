import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Eye, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/api/useTransactions';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const HistoriPembayaranPiutang = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions({
    type: 'pembayaran_piutang',
    search: searchTerm || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    perPage: 25,
  });

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const totalNilai = transactions.reduce((s, t) => s + t.total, 0);

  const handleExport = useCallback(() => toast({ title: 'Mengekspor PDF...' }), [toast]);

  return (
    <MainLayout title="Histori Pembayaran Piutang" subtitle="Riwayat penerimaan pembayaran piutang customer">
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Transaksi</p><p className="text-lg font-bold">{meta?.total ?? '-'}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Diterima</p><p className="text-lg font-bold text-success tabular-nums">{formatCurrency(totalNilai)}</p></CardContent></Card>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari customer..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <Input type="date" className="text-xs h-8 w-36" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <Input type="date" className="text-xs h-8 w-36" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
        </div>
        <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport}><FileDown className="h-3.5 w-3.5" />Export PDF</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">No. Kwitansi</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs text-right">Jumlah Diterima</TableHead>
                  <TableHead className="text-xs">Catatan</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                ) : transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Tidak ada data pembayaran piutang</TableCell></TableRow>
                ) : transactions.map(t => (
                  <TableRow key={t.id} className="text-sm hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{t.date}</TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate">{t.customer || '-'}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-success">{formatCurrency(t.paid)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{t.notes || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}><Eye className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" />Detail Pembayaran</DialogTitle></DialogHeader>
          {selectedTrx && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">No. Kwitansi</p><p className="font-mono font-semibold text-primary">{selectedTrx.invoiceNumber}</p></div>
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{selectedTrx.customer || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Jumlah</p><p className="font-bold text-success">{formatCurrency(selectedTrx.paid)}</p></div>
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

export default HistoriPembayaranPiutang;

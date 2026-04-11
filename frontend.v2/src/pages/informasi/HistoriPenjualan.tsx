import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, Eye, EyeOff, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions, useToggleHideTransaction } from '@/hooks/api/useTransactions';
import { useCustomers } from '@/hooks/api/useCustomers';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const HistoriPenjualan = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('visible');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [showLunasOnly, setShowLunasOnly] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleHideMutation = useToggleHideTransaction();

  const typeParam = filterType === 'kredit' ? 'penjualan_kredit' : filterType === 'tunai' ? 'penjualan_tunai' : undefined;

  const { data: tunaiData, isLoading: l1 } = useTransactions({
    type: 'penjualan_tunai',
    search: searchTerm || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    perPage: 15,
  });
  const { data: kreditData, isLoading: l2 } = useTransactions({
    type: 'penjualan_kredit',
    search: searchTerm || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    perPage: 15,
  });

  const { data: customersData } = useCustomers({ perPage: 200 });
  const customers = customersData?.data ?? [];

  const tunai = filterType !== 'kredit' ? (tunaiData?.data ?? []) : [];
  const kredit = filterType !== 'tunai' ? (kreditData?.data ?? []) : [];
  const allTrx = [...tunai, ...kredit].sort((a, b) => b.date.localeCompare(a.date));
  const isLoading = l1 || l2;

  const filtered = allTrx
    .filter(t => filterCustomer === 'all' || t.customerId === filterCustomer)
    .filter(t => !showLunasOnly || (t.remaining ?? 0) === 0)
    .filter(t => {
      if (filterHidden === 'visible') return !t.isHidden;
      if (filterHidden === 'hidden') return t.isHidden;
      return true;
    });

  const hiddenCount = allTrx.filter(t => t.isHidden).length;
  const totalNilai = filtered.reduce((s, t) => s + t.total, 0);
  const totalKredit = allTrx.filter(t => (t.remaining ?? 0) > 0).length;

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

  const handleExport = useCallback(() => {
    const rows = filtered.map(t =>
      `${t.invoiceNumber}\t${t.date}\t${t.customer || 'Walk-in'}\t${t.type === 'penjualan_kredit' ? 'Kredit' : 'Tunai'}\t${formatCurrency(t.total)}\t${formatCurrency(t.paid)}\t${formatCurrency(t.remaining ?? 0)}`
    );
    const content = `HISTORI PENJUALAN\nDari: ${dateFrom || '-'} s/d ${dateTo || '-'}\n${'='.repeat(80)}\nFaktur\tTanggal\tCustomer\tTipe\tTotal\tTerbayar\tSisa\n${rows.join('\n')}\n${'='.repeat(80)}\nGRAND TOTAL: ${formatCurrency(totalNilai)}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `histori-penjualan-${new Date().toISOString().slice(0,10)}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export berhasil', description: `${filtered.length} transaksi diekspor` });
  }, [filtered, dateFrom, dateTo, totalNilai, toast]);

  return (
    <MainLayout title="Histori Penjualan" subtitle="Riwayat transaksi penjualan tunai dan kredit">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          { label: 'Total Transaksi', value: String(allTrx.length) },
          { label: 'Nilai Ditampilkan', value: formatCurrency(totalNilai), color: 'text-primary' },
          { label: 'Piutang Belum Lunas', value: String(totalKredit), color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold tabular-nums ${s.color ?? ''}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari faktur..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <Input type="date" className="text-xs h-8 w-36" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <Input type="date" className="text-xs h-8 w-36" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
            <SelectTrigger className="w-36 text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tunai + Kredit</SelectItem>
              <SelectItem value="tunai">Tunai</SelectItem>
              <SelectItem value="kredit">Kredit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCustomer} onValueChange={v => { setFilterCustomer(v); setPage(1); }}>
            <SelectTrigger className="w-44 text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Customer</SelectItem>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Switch id="show-lunas" checked={showLunasOnly} onCheckedChange={setShowLunasOnly} />
            <Label htmlFor="show-lunas" className="text-xs text-muted-foreground cursor-pointer">Lunas saja</Label>
          </div>
          <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExport}><FileDown className="h-3.5 w-3.5" />Export</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b">
            <Tabs value={filterHidden} onValueChange={(v) => setFilterHidden(v as 'all' | 'visible' | 'hidden')}>
              <TabsList className="w-full justify-start rounded-none h-10 bg-transparent border-b">
                <TabsTrigger value="visible" className="text-xs">Ditampilkan ({allTrx.filter(t => !t.isHidden).length})</TabsTrigger>
                <TabsTrigger value="hidden" className="text-xs">Tersembunyi ({hiddenCount})</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">Semua ({allTrx.length})</TabsTrigger>
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
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Tipe</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-right">Terbayar</TableHead>
                  <TableHead className="text-xs text-right">Sisa</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-10 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                ) : filtered.map((t, idx) => {
                  const isLunas = (t.remaining ?? 0) === 0;
                  return (
                    <TableRow key={t.id} className={`text-sm hover:bg-muted/30 ${t.isHidden ? 'opacity-60' : ''}`}>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.isHidden ? <Badge variant="outline" className="text-xs">🔒</Badge> : ''}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">{t.date}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{t.customer || 'Walk-in'}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'penjualan_kredit' ? 'outline' : 'secondary'} className="text-xs">
                          {t.type === 'penjualan_kredit' ? 'Kredit' : 'Tunai'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.total)}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(t.paid)}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs text-warning">{formatCurrency(t.remaining ?? 0)}</TableCell>
                      <TableCell>
                        {isLunas
                          ? <Badge variant="default" className="text-xs">Lunas</Badge>
                          : <Badge variant="destructive" className="text-xs">Piutang</Badge>}
                      </TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" />Detail Penjualan – {selectedTrx?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{selectedTrx.customer || 'Walk-in'}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-primary">{formatCurrency(selectedTrx.total)}</p></div>
                <div><p className="text-xs text-muted-foreground">Sisa Piutang</p><p className="font-bold text-warning">{formatCurrency(selectedTrx.remaining ?? 0)}</p></div>
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

export default HistoriPenjualan;

import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Search, Eye, EyeOff, Printer, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTransactions, useToggleHideTransaction } from '@/hooks/api/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import PrintLayout from '@/components/print/PrintLayout';
import { FakturPenjualan } from '@/components/print/FakturPenjualan';
import type { Transaction } from '@/types';

const HistoriPenjualan = () => {
  const { toast } = useToast();
  const { isOwner } = usePermissions();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const params = {
    search: search || undefined,
    type: filterType || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    page,
    perPage,
  };

  const { data, isLoading } = useTransactions(params);
  const toggleHide = useToggleHideTransaction();

  const transactions = data?.data ?? [];
  const meta = data?.meta;

  const handleToggleHide = useCallback(async (trx: Transaction) => {
    try {
      await toggleHide.mutateAsync(trx.id);
      toast({
        title: trx.isHidden ? 'Transaksi ditampilkan' : 'Transaksi disembunyikan',
        description: `${trx.invoiceNumber} berhasil diubah`,
      });
    } catch {
      toast({ title: 'Gagal', description: 'Tidak dapat mengubah status transaksi', variant: 'destructive' });
    }
  }, [toggleHide, toast]);

  const totalNilai = transactions.reduce((s, t) => s + t.total, 0);
  const tunaiCount = transactions.filter(t => t.type === 'penjualan_tunai').length;
  const kreditCount = transactions.filter(t => t.type === 'penjualan_kredit').length;

  const statusVariant = (t: Transaction) =>
    t.paymentStatus === 'lunas' ? 'default' : 'destructive';

  return (
    <MainLayout title="Histori Penjualan" subtitle="Riwayat penjualan barang ke customer">
      {/* Summary Cards */}
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Total Transaksi</p></div>
          <p className="text-lg font-bold">{meta?.total ?? transactions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Nilai (Halaman)</p></div>
          <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(totalNilai)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Penjualan Tunai</p>
          <p className="text-lg font-bold text-green-600">{tunaiCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Penjualan Kredit</p>
          <p className="text-lg font-bold text-orange-500"><CreditCard className="inline h-4 w-4 mr-1" />{kreditCount}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari faktur/customer..." className="pl-8 text-xs h-8"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 text-xs h-8"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Tipe</SelectItem>
              <SelectItem value="penjualan_tunai">Tunai</SelectItem>
              <SelectItem value="penjualan_kredit">Kredit</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-auto h-8 text-xs" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <span className="self-center text-muted-foreground text-xs">–</span>
          <Input type="date" className="w-auto h-8 text-xs" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Daftar Transaksi Penjualan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">No. Faktur</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Tipe</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {isOwner && <TableHead className="text-xs text-center">Hidden</TableHead>}
                  <TableHead className="w-20 text-xs text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={isOwner ? 8 : 7} className="text-center py-10 text-muted-foreground">Memuat data...</TableCell></TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={isOwner ? 8 : 7} className="text-center py-10 text-muted-foreground">Tidak ada data penjualan</TableCell></TableRow>
                ) : (
                  transactions.map(t => (
                    <TableRow key={t.id} className={`text-sm hover:bg-muted/30 ${t.isHidden ? 'opacity-60 bg-muted/10' : ''}`}>
                      <TableCell className="font-mono text-xs text-primary font-semibold">{t.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">{new Date(t.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium max-w-[140px] truncate">{t.customer ?? <span className="text-muted-foreground italic">Umum</span>}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'penjualan_tunai' ? 'secondary' : 'outline'} className="text-xs">
                          {t.type === 'penjualan_tunai' ? 'Tunai' : 'Kredit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(t.total)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(t)} className="text-xs">
                          {t.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                        </Badge>
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-center">
                          {t.isHidden ? (
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">Hidden</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {isOwner && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleToggleHide(t)}
                              disabled={toggleHide.isPending}
                              title={t.isHidden ? 'Tampilkan transaksi ini' : 'Sembunyikan dari admin'}
                            >
                              {t.isHidden ? <Eye className="h-3.5 w-3.5 text-orange-500" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {meta && (
            <div className="p-4">
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                totalItems={meta.total}
                itemsPerPage={perPage}
                onPageChange={setPage}
                onItemsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detail Penjualan — {selectedTrx?.invoiceNumber}
              {selectedTrx?.isHidden && isOwner && (
                <Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">Hidden</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{new Date(selectedTrx.date).toLocaleDateString('id-ID')}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{selectedTrx.customer ?? 'Umum'}</p></div>
                <div><p className="text-xs text-muted-foreground">Tipe</p><Badge variant="outline" className="text-xs">{selectedTrx.type === 'penjualan_tunai' ? 'Tunai' : 'Kredit'}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Status Bayar</p><Badge variant={statusVariant(selectedTrx)} className="text-xs">{selectedTrx.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-primary tabular-nums">{formatCurrency(selectedTrx.total)}</p></div>
                <div><p className="text-xs text-muted-foreground">Sisa</p><p className="font-semibold text-destructive tabular-nums">{formatCurrency(selectedTrx.remaining)}</p></div>
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
                    {selectedTrx.items.map((item) => (
                      <TableRow key={item.id} className="text-sm">
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
                <PrintLayout buttonLabel="Cetak Faktur" buttonSize="sm" buttonVariant="outline">
                  <FakturPenjualan transaction={selectedTrx} />
                </PrintLayout>
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

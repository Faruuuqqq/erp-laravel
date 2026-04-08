import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, FileDown, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { useHistoryPenjualan } from '@/hooks/api/useReports';
import { printInvoice } from '@/hooks/api/useTransactions';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const TIPE_LABEL: Record<string, string> = {
  penjualan_tunai: 'Tunai',
  penjualan_kredit: 'Kredit',
};

const HistoriPenjualan = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTipe, setFilterTipe] = useState('all');
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useHistoryPenjualan({ from, to, perPage: 100 });
  const allSales = data?.data?.data?.data ?? [];

  const filtered = allSales.filter((t: any) => {
    const customerName = t.customer?.name || '';
    const matchSearch = t.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchTipe = filterTipe === 'all' || t.type === filterTipe;
    return matchSearch && matchStatus && matchTipe;
  });

  const totalNilai = filtered.reduce((s: number, t: any) => s + (t.total || 0), 0);
  const statusVariant = (s: string) => s === 'lunas' ? 'default' : s === 'kredit' ? 'destructive' : 'secondary';
  const statusLabel = (s: string) => s === 'lunas' ? 'Lunas' : s === 'kredit' ? 'Kredit' : 'Sebagian';

  return (
    <MainLayout title="Histori Penjualan" subtitle="Riwayat penjualan barang ke customer">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {[
          { label: 'Total Transaksi', value: String(allSales.length) },
          { label: 'Nilai Ditampilkan', value: formatRupiah(totalNilai), cls: 'text-primary' },
          { label: 'Tunai', value: String(allSales.filter((t: any) => t.type === 'penjualan_tunai').length), cls: 'text-success' },
          { label: 'Kredit', value: String(allSales.filter((t: any) => t.type === 'penjualan_kredit').length), cls: 'text-warning' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-lg font-bold tabular-nums ${s.cls || ''}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari faktur/customer..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterTipe} onValueChange={setFilterTipe}>
            <SelectTrigger className="w-36 text-xs h-8"><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="penjualan_tunai">Tunai</SelectItem>
              <SelectItem value="penjualan_kredit">Kredit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 text-xs h-8"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
              <SelectItem value="kredit">Belum Bayar</SelectItem>
              <SelectItem value="sebagian">Sebagian</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="text-xs h-8 w-36" value={from} onChange={e => setFrom(e.target.value)} />
          <Input type="date" className="text-xs h-8 w-36" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">No. Faktur</th>
                  <th className="px-4 py-2.5 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                  <th className="px-4 py-2.5 text-left font-medium">Sales</th>
                  <th className="px-4 py-2.5 text-left font-medium">Tipe</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
               <tbody>
                 {isLoading ? (
                   <>
                     {[...Array(5)].map((_, i) => (
                       <tr key={i}>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-20" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-32" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-20" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-24" /></td>
                         <td className="px-4 py-2.5"><Skeleton className="h-4 w-16" /></td>
                       </tr>
                     ))}
                   </>
                 ) : filtered.length === 0 ? (
                   <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Tidak ada data</td></tr>
                 ) : (
                   filtered.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 text-sm">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{t.invoice_number}</td>
                      <td className="px-4 py-2.5 text-xs">{t.date}</td>
                      <td className="px-4 py-2.5 font-medium max-w-[140px] truncate">{t.customer?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.sales_rep?.name || '-'}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={t.type === 'penjualan_tunai' ? 'secondary' : 'outline'} className="text-xs">
                          {TIPE_LABEL[t.type] || t.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-2.5"><Badge variant={statusVariant(t.status)} className="text-xs">{statusLabel(t.status)}</Badge></td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Detail Penjualan - {selectedTrx?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{selectedTrx.customer?.name || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Sales</p><p className="font-medium">{selectedTrx.sales_rep?.name || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={statusVariant(selectedTrx.status)} className="text-xs">{statusLabel(selectedTrx.status)}</Badge></div>
                {selectedTrx.paid > 0 && <div><p className="text-xs text-muted-foreground">Bayar</p><p className="font-semibold text-success tabular-nums">{formatRupiah(selectedTrx.paid)}</p></div>}
                {selectedTrx.remaining > 0 && <div><p className="text-xs text-muted-foreground">Sisa</p><p className="font-semibold text-warning tabular-nums">{formatRupiah(selectedTrx.remaining)}</p></div>}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Produk</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Harga</th>
                    <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTrx.details || []).map((item: any, i: number) => (
                    <tr key={i} className="border-b text-sm">
                      <td className="px-3 py-2">{item.product?.name || '-'}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.quantity} {item.product?.unit || ''}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.price)}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedTrx.discount > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon</span><span className="text-destructive">-{formatRupiah(selectedTrx.discount)}</span></div>
              )}
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">{formatRupiah(selectedTrx.total)}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => printInvoice(selectedTrx.id)}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
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

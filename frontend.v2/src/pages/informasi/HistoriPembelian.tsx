import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, History, Eye, FileDown, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useHistoryPembelian } from '@/hooks/api/useReports';
import { useSuppliers } from '@/hooks/api/useSuppliers';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const HistoriPembelian = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useHistoryPembelian({ from, to, perPage: 100 });
  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const allPurchases = data?.data?.data?.data ?? [];
  const suppliers = suppliersData?.data?.data ?? [];

  const filtered = allPurchases.filter((t: any) => {
    const supplierName = t.supplier?.name || '';
    const matchSearch = t.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSupplier = filterSupplier === 'all' || t.supplier_id === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  const totalNilai = filtered.reduce((s: number, t: any) => s + (t.total || 0), 0);
  const statusVariant = (s: string) => s === 'lunas' ? 'default' : s === 'kredit' ? 'destructive' : 'secondary';
  const statusLabel = (s: string) => s === 'lunas' ? 'Lunas' : s === 'kredit' ? 'Kredit' : 'Sebagian';

  return (
    <MainLayout title="Histori Pembelian" subtitle="Riwayat pembelian barang dari supplier">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          { label: 'Total Transaksi', value: String(allPurchases.length), color: '' },
          { label: 'Nilai Ditampilkan', value: formatRupiah(totalNilai), color: 'text-primary' },
          { label: 'Kredit / Belum Lunas', value: String(allPurchases.filter((t: any) => t.status !== 'lunas').length), color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari faktur/supplier..." className="pl-8 text-xs h-8 w-60" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 text-xs h-8"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
              <SelectItem value="kredit">Kredit</SelectItem>
              <SelectItem value="sebagian">Sebagian</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSupplier} onValueChange={setFilterSupplier}>
            <SelectTrigger className="w-44 text-xs h-8"><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Supplier</SelectItem>
              {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" className="text-xs h-8 w-36" value={from} onChange={e => setFrom(e.target.value)} />
          <Input type="date" className="text-xs h-8 w-36" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => window.print()}>
          <FileDown className="h-3.5 w-3.5" />Export PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">No. Faktur</th>
                  <th className="px-4 py-2.5 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 text-left font-medium">Supplier</th>
                  <th className="px-4 py-2.5 text-left font-medium">Gudang</th>
                  <th className="px-4 py-2.5 text-right font-medium">Items</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Oleh</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Tidak ada data</td></tr>
                ) : (
                  filtered.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 text-sm">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{t.invoice_number}</td>
                      <td className="px-4 py-2.5 text-xs">{t.date}</td>
                      <td className="px-4 py-2.5 font-medium max-w-[160px] truncate">{t.supplier?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.warehouse?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-xs">{(t.details || []).length} item</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-2.5"><Badge variant={statusVariant(t.status)} className="text-xs">{statusLabel(t.status)}</Badge></td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">{t.created_by || '-'}</td>
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
              Detail Pembelian - {selectedTrx?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedTrx.supplier?.name || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Gudang</p><p className="font-medium">{selectedTrx.warehouse?.name || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={statusVariant(selectedTrx.status)} className="text-xs">{statusLabel(selectedTrx.status)}</Badge></div>
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
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">{formatRupiah(selectedTrx.total)}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => window.print()}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
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

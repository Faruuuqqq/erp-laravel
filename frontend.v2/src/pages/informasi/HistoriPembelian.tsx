import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, History, Eye, FileDown, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TRANSACTIONS, SUPPLIERS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const HistoriPembelian = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [selectedTrx, setSelectedTrx] = useState<typeof TRANSACTIONS[0] | null>(null);

  const purchases = TRANSACTIONS.filter(t => t.tipe === 'pembelian');
  const allPurchases = [
    ...purchases,
    { id: 'ph1', noFaktur: 'PB-2025-025-001', tipe: 'pembelian' as const, tanggal: '25-02-2025', supplierId: 'sup3', supplierNama: 'CV Distributor Sembako Jaya', gudangId: 'g1', gudangNama: 'Gudang Utama', items: [{ productId: 'p1', productNama: 'Beras Sania Premium 5kg', qty: 100, harga: 68_000, diskon: 0, subtotal: 6_800_000, satuan: 'Karung' }], subtotal: 6_800_000, diskon: 0, total: 6_800_000, status: 'lunas' as const, createdBy: 'owner', createdAt: '25-02-2025' },
    { id: 'ph2', noFaktur: 'PB-2025-020-001', tipe: 'pembelian' as const, tanggal: '20-02-2025', supplierId: 'sup4', supplierNama: 'PT Wings Surya', gudangId: 'g1', gudangNama: 'Gudang Utama', items: [{ productId: 'p7', productNama: 'Sabun Lifebuoy 90g', qty: 200, harga: 3_800, diskon: 0, subtotal: 760_000, satuan: 'Pcs' }, { productId: 'p9', productNama: 'Sunlight Cuci Piring 800ml', qty: 120, harga: 12_000, diskon: 0, subtotal: 1_440_000, satuan: 'Botol' }], subtotal: 2_200_000, diskon: 0, total: 2_200_000, status: 'kredit' as const, createdBy: 'admin', createdAt: '20-02-2025' },
    { id: 'ph3', noFaktur: 'PB-2025-015-001', tipe: 'pembelian' as const, tanggal: '15-02-2025', supplierId: 'sup1', supplierNama: 'PT Indofood Sukses Makmur', gudangId: 'g1', gudangNama: 'Gudang Utama', items: [{ productId: 'p3', productNama: 'Indomie Goreng 85g', qty: 1000, harga: 2_900, diskon: 0, subtotal: 2_900_000, satuan: 'Pcs' }], subtotal: 2_900_000, diskon: 0, total: 2_900_000, status: 'sebagian' as const, createdBy: 'owner', createdAt: '15-02-2025' },
  ];

  const filtered = allPurchases.filter(t => {
    const matchSearch = t.noFaktur.toLowerCase().includes(searchTerm.toLowerCase()) || (t.supplierNama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSupplier = filterSupplier === 'all' || t.supplierId === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  const totalNilai = filtered.reduce((s, t) => s + t.total, 0);

  const statusVariant = (s: string) => s === 'lunas' ? 'default' : s === 'kredit' ? 'destructive' : 'secondary';
  const statusLabel = (s: string) => s === 'lunas' ? 'Lunas' : s === 'kredit' ? 'Kredit' : 'Sebagian';

  return (
    <MainLayout title="Histori Pembelian" subtitle="Riwayat pembelian barang dari supplier">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          { label: 'Total Transaksi', value: String(allPurchases.length), color: '' },
          { label: 'Nilai Ditampilkan', value: formatRupiah(totalNilai), color: 'text-primary' },
          { label: 'Kredit / Belum Lunas', value: String(allPurchases.filter(t => t.status !== 'lunas').length), color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
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
              {SUPPLIERS.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => toast({ title: 'Mengekspor PDF...' })}>
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
                  <TableHead className="text-xs">Gudang</TableHead>
                  <TableHead className="text-xs text-right">Items</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Oleh</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                ) : (
                  filtered.map(t => (
                    <TableRow key={t.id} className="text-sm hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-primary font-semibold">{t.noFaktur}</TableCell>
                      <TableCell className="text-xs">{t.tanggal}</TableCell>
                      <TableCell className="font-medium max-w-[160px] truncate">{t.supplierNama}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.gudangNama || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs">{t.items.length} item</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(t.total)}</TableCell>
                      <TableCell><Badge variant={statusVariant(t.status)} className="text-xs">{statusLabel(t.status)}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{t.createdBy}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTrx(t)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Detail Pembelian - {selectedTrx?.noFaktur}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.tanggal}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedTrx.supplierNama}</p></div>
                <div><p className="text-xs text-muted-foreground">Gudang</p><p className="font-medium">{selectedTrx.gudangNama || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={statusVariant(selectedTrx.status)} className="text-xs">{statusLabel(selectedTrx.status)}</Badge></div>
              </div>
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
                      <TableCell>{item.productNama}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.qty} {item.satuan}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs">{formatRupiah(item.harga)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">{formatRupiah(selectedTrx.total)}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Mengekspor PDF...' })}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
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

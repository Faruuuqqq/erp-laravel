import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, FileDown, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TRANSACTIONS, CUSTOMERS, SALES_REPS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const HistoriPenjualan = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTipe, setFilterTipe] = useState('all');
  const [selectedTrx, setSelectedTrx] = useState<typeof TRANSACTIONS[0] | null>(null);

  const penjualanTrx = TRANSACTIONS.filter(t => t.tipe === 'penjualan_tunai' || t.tipe === 'penjualan_kredit');
  const extraSales = [
    { id: 'sh1', noFaktur: 'PJ-2025-024-003', tipe: 'penjualan_tunai' as const, tanggal: '24-02-2025', customerId: 'cus1', customerNama: 'Toko Makmur Jaya', salesId: 's1', salesNama: 'Ahmad Fauzi', gudangId: 'g1', gudangNama: 'Gudang Utama', items: [{ productId: 'p8', productNama: 'Chitato Original 68g', qty: 24, harga: 11_000, diskon: 0, subtotal: 264_000, satuan: 'Pcs' }], subtotal: 264_000, diskon: 0, total: 264_000, bayar: 300_000, kembalian: 36_000, status: 'lunas' as const, createdBy: 'admin', createdAt: '24-02-2025' },
    { id: 'sh2', noFaktur: 'PK-2025-022-001', tipe: 'penjualan_kredit' as const, tanggal: '22-02-2025', customerId: 'cus3', customerNama: 'CV Sumber Rejeki', salesId: 's2', salesNama: 'Dewi Rahmawati', gudangId: 'g2', gudangNama: 'Gudang Cabang Bekasi', items: [{ productId: 'p6', productNama: 'Teh Botol Sosro 250ml', qty: 240, harga: 5_000, diskon: 0, subtotal: 1_200_000, satuan: 'Botol' }], subtotal: 1_200_000, diskon: 0, total: 1_200_000, status: 'kredit' as const, createdBy: 'admin', createdAt: '22-02-2025' },
    { id: 'sh3', noFaktur: 'PJ-2025-021-002', tipe: 'penjualan_tunai' as const, tanggal: '21-02-2025', customerId: 'cus6', customerNama: 'Mini Market Sejahtera', salesId: 's3', salesNama: 'Riko Prasetyo', gudangId: 'g1', gudangNama: 'Gudang Utama', items: [{ productId: 'p4', productNama: 'Aqua Air Mineral 600ml', qty: 48, harga: 3_500, diskon: 0, subtotal: 168_000, satuan: 'Botol' }, { productId: 'p10', productNama: 'Gudang Garam Surya 12', qty: 30, harga: 25_000, diskon: 0, subtotal: 750_000, satuan: 'Bungkus' }], subtotal: 918_000, diskon: 0, total: 918_000, bayar: 1_000_000, kembalian: 82_000, status: 'lunas' as const, createdBy: 'admin', createdAt: '21-02-2025' },
  ];
  const allSales = [...penjualanTrx, ...extraSales];

  const filtered = allSales.filter(t => {
    const matchSearch = t.noFaktur.toLowerCase().includes(searchTerm.toLowerCase()) || (t.customerNama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchTipe = filterTipe === 'all' || t.tipe === filterTipe;
    return matchSearch && matchStatus && matchTipe;
  });

  const totalNilai = filtered.reduce((s, t) => s + t.total, 0);
  const statusVariant = (s: string) => s === 'lunas' ? 'default' : s === 'kredit' ? 'destructive' : 'secondary';
  const statusLabel = (s: string) => s === 'lunas' ? 'Lunas' : s === 'kredit' ? 'Kredit' : 'Sebagian';

  return (
    <MainLayout title="Histori Penjualan" subtitle="Riwayat penjualan barang ke customer">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {[
          { label: 'Total Transaksi', value: String(allSales.length) },
          { label: 'Nilai Ditampilkan', value: formatRupiah(totalNilai), cls: 'text-primary' },
          { label: 'Tunai', value: String(allSales.filter(t => t.tipe === 'penjualan_tunai').length), cls: 'text-success' },
          { label: 'Kredit', value: String(allSales.filter(t => t.tipe === 'penjualan_kredit').length), cls: 'text-warning' },
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
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Sales</TableHead>
                  <TableHead className="text-xs">Tipe</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                ) : (
                  filtered.map(t => (
                    <TableRow key={t.id} className="text-sm hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-primary font-semibold">{t.noFaktur}</TableCell>
                      <TableCell className="text-xs">{t.tanggal}</TableCell>
                      <TableCell className="font-medium max-w-[140px] truncate">{t.customerNama}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.salesNama || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={t.tipe === 'penjualan_tunai' ? 'secondary' : 'outline'} className="text-xs">
                          {t.tipe === 'penjualan_tunai' ? 'Tunai' : 'Kredit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(t.total)}</TableCell>
                      <TableCell><Badge variant={statusVariant(t.status)} className="text-xs">{statusLabel(t.status)}</Badge></TableCell>
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

      <Dialog open={!!selectedTrx} onOpenChange={() => setSelectedTrx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Detail Penjualan - {selectedTrx?.noFaktur}
            </DialogTitle>
          </DialogHeader>
          {selectedTrx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium">{selectedTrx.tanggal}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{selectedTrx.customerNama}</p></div>
                <div><p className="text-xs text-muted-foreground">Sales</p><p className="font-medium">{selectedTrx.salesNama || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={statusVariant(selectedTrx.status)} className="text-xs">{statusLabel(selectedTrx.status)}</Badge></div>
                {selectedTrx.bayar && <div><p className="text-xs text-muted-foreground">Bayar</p><p className="font-semibold text-success tabular-nums">{formatRupiah(selectedTrx.bayar)}</p></div>}
                {selectedTrx.kembalian && <div><p className="text-xs text-muted-foreground">Kembalian</p><p className="font-semibold tabular-nums">{formatRupiah(selectedTrx.kembalian)}</p></div>}
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
              {selectedTrx.diskon > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon</span><span className="text-destructive">-{formatRupiah(selectedTrx.diskon)}</span></div>
              )}
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

export default HistoriPenjualan;

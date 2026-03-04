import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Banknote, Calculator, Printer, FileDown, CheckCircle2, Search } from 'lucide-react';
import { PRODUCTS, CUSTOMERS, SALES_REPS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

const PenjualanTunai = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [diskon, setDiskon] = useState('0');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [bayar, setBayar] = useState('');
  const [diskonTotal, setDiskonTotal] = useState('0');
  const [searchProduct, setSearchProduct] = useState('');
  const [saved, setSaved] = useState(false);

  const noFaktur = `PJ-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;

  const filteredProducts = PRODUCTS.filter(p =>
    p.nama.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.kode.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const addToCart = () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    if (qtyNum > product.stok) return toast({ title: `Stok tidak cukup. Stok tersedia: ${product.stok} ${product.satuan}`, variant: 'destructive' });

    const diskonNum = parseFloat(diskon) || 0;
    const subtotal = product.hargaJual * qtyNum * (1 - diskonNum / 100);

    const existing = cart.findIndex(c => c.productId === selectedProduct);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing].qty += qtyNum;
      updated[existing].subtotal = updated[existing].harga * updated[existing].qty * (1 - updated[existing].diskon / 100);
      setCart(updated);
    } else {
      setCart([...cart, {
        productId: product.id, nama: product.nama, satuan: product.satuan,
        qty: qtyNum, harga: product.hargaJual, diskon: diskonNum, subtotal,
      }]);
    }
    setSelectedProduct(''); setQty('1'); setDiskon('0'); setSearchProduct('');
    toast({ title: `${product.nama} ditambahkan ke keranjang` });
  };

  const removeItem = (idx: number) => setCart(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonTotalNum = parseFloat(diskonTotal) || 0;
  const grandTotal = subtotal - diskonTotalNum;
  const kembalian = (parseFloat(bayar) || 0) - grandTotal;

  const handleSave = () => {
    if (cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
    if (!selectedCustomer) return toast({ title: 'Pilih customer terlebih dahulu', variant: 'destructive' });
    setSaved(true);
    toast({ title: 'Transaksi berhasil disimpan', description: `No. Faktur: ${noFaktur}` });
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Mencetak struk...' });
  };

  const handleExportPdf = () => {
    toast({ title: 'Mengekspor ke PDF...', description: `${noFaktur}.pdf` });
  };

  if (saved) {
    return (
      <MainLayout title="Penjualan Tunai" subtitle="Transaksi berhasil disimpan">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Transaksi Berhasil</h2>
            <p className="text-muted-foreground mt-1">No. Faktur: <span className="font-mono font-semibold text-primary">{noFaktur}</span></p>
            <p className="text-3xl font-bold text-success mt-3">{formatRupiah(grandTotal)}</p>
            {kembalian > 0 && <p className="text-muted-foreground mt-1">Kembalian: <span className="font-semibold text-success">{formatRupiah(kembalian)}</span></p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Cetak Struk</Button>
            <Button variant="outline" onClick={handleExportPdf}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={() => { setCart([]); setSaved(false); setBayar(''); setDiskonTotal('0'); setSelectedCustomer(''); setSelectedSales(''); }}>
              Transaksi Baru
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Penjualan Tunai" subtitle="Buat transaksi penjualan tunai">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="h-4 w-4" />
                Form Penjualan Tunai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur</Label>
                  <Input value={noFaktur} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                      {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sales</Label>
                  <Select value={selectedSales} onValueChange={setSelectedSales}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih sales" /></SelectTrigger>
                    <SelectContent>
                      {SALES_REPS.filter(s => s.status === 'aktif').map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Product */}
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Produk</p>
                <div className="grid gap-2 md:grid-cols-6">
                  <div className="md:col-span-3 space-y-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchProduct}
                        onChange={e => setSearchProduct(e.target.value)}
                        className="pl-8 text-xs h-8"
                      />
                    </div>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <span>{p.nama}</span>
                            <span className="ml-2 text-muted-foreground">{formatRupiah(p.hargaJual)}</span>
                            <Badge variant={p.stok <= p.stokMinimum ? 'destructive' : 'secondary'} className="ml-2 text-[9px] h-3.5 px-1">
                              Stok: {p.stok}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" value={qty} onChange={e => setQty(e.target.value)} className="text-xs h-8" min="1" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Diskon (%)</Label>
                    <Input type="number" value={diskon} onChange={e => setDiskon(e.target.value)} className="text-xs h-8" min="0" max="100" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addToCart} size="sm" className="w-full h-8 text-xs">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />Tambah
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cart Table */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Harga</TableHead>
                      <TableHead className="text-xs text-right">Disc%</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          Keranjang masih kosong. Tambahkan produk di atas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item, idx) => (
                        <TableRow key={item.productId} className="text-sm">
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{item.nama}</p>
                            <p className="text-xs text-muted-foreground">{item.satuan}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs">{formatRupiah(item.harga)}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs">{item.diskon > 0 ? `${item.diskon}%` : '-'}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
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
        </div>

        {/* Right: Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cart.length} item)</span>
                <span className="tabular-nums">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground flex-1">Diskon</span>
                <Input
                  type="number"
                  value={diskonTotal}
                  onChange={e => setDiskonTotal(e.target.value)}
                  className="w-32 h-7 text-right text-xs"
                  min="0"
                  placeholder="0"
                />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatRupiah(grandTotal)}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">Jumlah Bayar (Rp)</Label>
                <Input
                  type="number"
                  value={bayar}
                  onChange={e => setBayar(e.target.value)}
                  placeholder="0"
                  className="text-right text-lg font-bold h-10"
                />
              </div>

              {parseFloat(bayar) > 0 && (
                <div className={cn(
                  'flex justify-between rounded-lg p-3',
                  kembalian >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                )}>
                  <span className={cn('font-medium text-sm', kembalian >= 0 ? 'text-success' : 'text-destructive')}>
                    {kembalian >= 0 ? 'Kembalian' : 'Kurang'}
                  </span>
                  <span className={cn('font-bold tabular-nums', kembalian >= 0 ? 'text-success' : 'text-destructive')}>
                    {formatRupiah(Math.abs(kembalian))}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setCart([]); setBayar(''); setDiskonTotal('0'); }}>
                  Reset
                </Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={cart.length === 0}>
                  Simpan
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full h-8 text-xs" onClick={handlePrint}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" />Cetak Struk
                </Button>
                <Button variant="outline" className="w-full h-8 text-xs" onClick={handleExportPdf}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default PenjualanTunai;

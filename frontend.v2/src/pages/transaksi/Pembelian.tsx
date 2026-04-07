import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ShoppingCart, Calculator, FileDown, CheckCircle2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/api/useProducts';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import type { Product, Supplier, Warehouse } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  subtotal: number;
}

const Pembelian = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [harga, setHarga] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedGudang, setSelectedGudang] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [diskon, setDiskon] = useState('0');
  const [searchProduct, setSearchProduct] = useState('');
  const [saved, setSaved] = useState(false);
  const [lastInvoice, setLastInvoice] = useState('');

  const { data: productsData } = useProducts({ per_page: 200 });
  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const { data: warehousesData } = useWarehouses({ per_page: 100 });
  const createMutation = useCreateTransaction();

  const products = (productsData?.data?.data ?? []) as Product[];
  const suppliers = (suppliersData?.data?.data ?? []) as Supplier[];
  const warehouses = (warehousesData?.data?.data ?? []) as Warehouse[];

  const noFaktur = `PB-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;
  const supplier = suppliers.find(s => s.id === selectedSupplier);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const addToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    const hargaNum = parseFloat(harga) || product.buyPrice;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    const subtotal = hargaNum * qtyNum;
    const existing = cart.findIndex(c => c.productId === selectedProduct);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing].qty += qtyNum;
      updated[existing].subtotal = updated[existing].harga * updated[existing].qty;
      setCart(updated);
    } else {
      setCart([...cart, { productId: product.id, nama: product.name, satuan: product.unit, qty: qtyNum, harga: hargaNum, subtotal }]);
    }
    setSelectedProduct(''); setQty('1'); setHarga(''); setSearchProduct('');
    toast({ title: `${product.name} ditambahkan` });
  };

  const removeItem = (idx: number) => setCart(cart.filter((_, i) => i !== idx));
  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonNum = parseFloat(diskon) || 0;
  const grandTotal = subtotal - diskonNum;

  const handleSave = async () => {
    if (cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
    if (!selectedSupplier) return toast({ title: 'Pilih supplier terlebih dahulu', variant: 'destructive' });

    try {
      const payload = {
        type: 'pembelian',
        invoiceNumber: noFaktur,
        date: new Date().toISOString().slice(0, 10),
        supplierId: selectedSupplier,
        warehouseId: selectedGudang || null,
        subtotal,
        discount: diskonNum,
        tax: 0,
        total: grandTotal,
        paid: metodePembayaran === 'tunai' || metodePembayaran === 'transfer' ? grandTotal : 0,
        remaining: metodePembayaran === 'kredit' ? grandTotal : 0,
        status: 'completed',
        notes: metodePembayaran === 'kredit' ? 'Dicatat sebagai utang' : '',
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.qty,
          price: item.harga,
          discount: 0,
        })),
      };

      await createMutation.mutateAsync(payload);
      setLastInvoice(noFaktur);
      setSaved(true);
      toast({ title: 'Pembelian berhasil disimpan', description: `No. Faktur: ${noFaktur}` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan pembelian';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (saved) {
    const isKredit = metodePembayaran === 'kredit';
    return (
      <MainLayout title="Transaksi Pembelian" subtitle="Transaksi berhasil disimpan">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pembelian Berhasil Disimpan</h2>
            <p className="text-muted-foreground mt-1">No. Faktur: <span className="font-mono font-semibold text-primary">{lastInvoice}</span></p>
            <p className="text-3xl font-bold text-primary mt-3">{formatRupiah(grandTotal)}</p>
            {isKredit && <Badge variant="outline" className="mt-2 text-warning border-warning">Dicatat sebagai Utang</Badge>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={() => { setCart([]); setSaved(false); setDiskon('0'); setSelectedSupplier(''); setSelectedGudang(''); setMetodePembayaran(''); }}>Pembelian Baru</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Transaksi Pembelian" subtitle="Buat transaksi pembelian barang dari supplier">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Form Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur</Label>
                  <Input value={noFaktur} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Supplier *</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <span>{s.name}</span>
                          {(s.balance || 0) > 0 && <Badge variant="outline" className="ml-2 text-[9px] h-3.5 px-1 text-warning border-warning">Utang: {formatRupiah(s.balance || 0)}</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {supplier && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs grid grid-cols-3 gap-3">
                  <div><p className="text-muted-foreground">Total Utang</p><p className="font-semibold text-warning">{formatRupiah(supplier.balance || 0)}</p></div>
                  <div><p className="text-muted-foreground">Telepon</p><p className="font-semibold">{supplier.phone || '-'}</p></div>
                  <div><p className="text-muted-foreground">Total Transaksi</p><p className="font-semibold text-success">{supplier.totalTransactions || 0}</p></div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Gudang Tujuan</Label>
                <Select value={selectedGudang} onValueChange={setSelectedGudang}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(w => w.status === 'aktif').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Produk</p>
                <div className="grid gap-2 md:grid-cols-6">
                  <div className="md:col-span-3 space-y-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Cari produk..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} className="pl-8 text-xs h-8" />
                    </div>
                    <Select value={selectedProduct} onValueChange={(v) => {
                      setSelectedProduct(v);
                      const p = products.find(p => p.id === v);
                      if (p) setHarga(String(p.buyPrice));
                    }}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.name}
                            <Badge variant="secondary" className="ml-2 text-[9px] h-3.5 px-1">Stok: {p.stock}</Badge>
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
                    <Label className="text-xs">Harga Beli</Label>
                    <Input type="number" value={harga} onChange={e => setHarga(e.target.value)} className="text-xs h-8" placeholder="0" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addToCart} size="sm" className="w-full h-8 text-xs"><Plus className="mr-1.5 h-3.5 w-3.5" />Tambah</Button>
                  </div>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left w-8">No</th>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Harga Beli</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Keranjang kosong</td></tr>
                    ) : (
                      cart.map((item, idx) => (
                        <tr key={item.productId} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2"><p className="font-medium">{item.nama}</p><p className="text-xs text-muted-foreground">{item.satuan}</p></td>
                          <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.harga)}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatRupiah(item.subtotal)}</td>
                          <td className="px-3 py-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
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
        </div>

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
                <span className="text-muted-foreground flex-1">Diskon (Rp)</span>
                <Input type="number" value={diskon} onChange={e => setDiskon(e.target.value)} className="w-32 h-7 text-right text-xs" min="0" />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatRupiah(grandTotal)}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="kredit">Kredit (Utang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodePembayaran === 'kredit' && (
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-2.5 text-xs text-warning">
                  Transaksi akan dicatat sebagai utang ke supplier
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setCart([]); setDiskon('0'); setSelectedSupplier(''); setSelectedGudang(''); setMetodePembayaran(''); }}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={cart.length === 0 || createMutation.isPending}>Simpan</Button>
              </div>
              <Button variant="outline" className="w-full h-8 text-xs" onClick={() => toast({ title: 'Mengekspor ke PDF...' })}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pembelian;

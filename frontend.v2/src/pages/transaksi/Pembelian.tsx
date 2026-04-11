import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ShoppingCart, Calculator, FileDown, CheckCircle2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  subtotal: number;
}

const BLANK_STATE = () => ({
  cart: [] as CartItem[],
  selectedProduct: '',
  qty: '1',
  harga: '',
  selectedSupplier: '',
  selectedGudang: '',
  metodePembayaran: '',
  diskon: '0',
  catatan: '',
  tanggal: new Date().toISOString().split('T')[0],
  searchProduct: '',
});

const Pembelian = () => {
  const { toast } = useToast();
  const { canCreate } = usePermissions();
  const createTx = useCreateTransaction();

  const [state, setState] = useState(BLANK_STATE());
  const [saved, setSaved] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState('');
  const [savedTotal, setSavedTotal] = useState(0);

  const { data: productsData } = useProducts({ perPage: 500 });
  const { data: suppliersData } = useSuppliers({ perPage: 200 });
  const { data: warehousesData } = useWarehouses({ perPage: 100 });

  const products = productsData?.data ?? [];
  const suppliers = suppliersData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];

  const set = useCallback(<K extends keyof ReturnType<typeof BLANK_STATE>>(key: K, val: ReturnType<typeof BLANK_STATE>[K]) =>
    setState(p => ({ ...p, [key]: val })), []);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(state.searchProduct.toLowerCase()) ||
      (p.code ?? '').toLowerCase().includes(state.searchProduct.toLowerCase())
    ), [products, state.searchProduct]);

  const supplier = suppliers.find(s => s.id === state.selectedSupplier);

  const addToCart = useCallback(() => {
    const product = products.find(p => p.id === state.selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(state.qty) || 1;
    const hargaNum = parseFloat(state.harga) || product.buyPrice ?? 0;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    setState(prev => {
      const existing = prev.cart.findIndex(c => c.productId === state.selectedProduct);
      const newCart = [...prev.cart];
      if (existing >= 0) {
        newCart[existing] = { ...newCart[existing], qty: newCart[existing].qty + qtyNum, subtotal: newCart[existing].harga * (newCart[existing].qty + qtyNum) };
      } else {
        newCart.push({ productId: product.id, nama: product.name, satuan: product.unit ?? 'pcs', qty: qtyNum, harga: hargaNum, subtotal: hargaNum * qtyNum });
      }
      return { ...prev, cart: newCart, selectedProduct: '', qty: '1', harga: '', searchProduct: '' };
    });
    toast({ title: `${product.name} ditambahkan` });
  }, [products, state.selectedProduct, state.qty, state.harga, toast]);

  const removeItem = useCallback((idx: number) =>
    setState(p => ({ ...p, cart: p.cart.filter((_, i) => i !== idx) })), []);

  const subtotal = state.cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonNum = parseFloat(state.diskon) || 0;
  const grandTotal = subtotal - diskonNum;
  const isKredit = state.metodePembayaran === 'kredit';
  const paid = isKredit ? 0 : grandTotal;

  const handleSave = useCallback(async () => {
    if (state.cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
    if (!state.selectedSupplier) return toast({ title: 'Pilih supplier terlebih dahulu', variant: 'destructive' });
    try {
      const result = await createTx.mutateAsync({
        type: 'pembelian',
        date: state.tanggal,
        supplierId: state.selectedSupplier,
        warehouseId: state.selectedGudang || null,
        discount: diskonNum,
        paid,
        notes: state.catatan,
        items: state.cart.map(i => ({ productId: i.productId, quantity: i.qty, price: i.harga, discount: 0 })),
      });
      setSavedInvoice((result as Transaction).invoiceNumber ?? '');
      setSavedTotal(grandTotal);
      setSaved(true);
      toast({ title: 'Pembelian berhasil disimpan', description: (result as Transaction).invoiceNumber });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [state, createTx, diskonNum, paid, grandTotal, toast]);

  const reset = useCallback(() => { setState(BLANK_STATE()); setSaved(false); }, []);

  if (saved) {
    return (
      <MainLayout title="Transaksi Pembelian" subtitle="Transaksi berhasil disimpan">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pembelian Berhasil Disimpan</h2>
            <p className="text-muted-foreground mt-1">No. Faktur: <span className="font-mono font-semibold text-primary">{savedInvoice}</span></p>
            <p className="text-3xl font-bold text-primary mt-3">{formatCurrency(savedTotal)}</p>
            {isKredit && <Badge variant="outline" className="mt-2 text-warning border-warning">Dicatat sebagai Utang</Badge>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={reset}>Pembelian Baru</Button>
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
              <CardTitle className="flex items-center gap-2 text-base"><ShoppingCart className="h-4 w-4" />Form Pembelian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={state.tanggal} onChange={e => set('tanggal', e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Supplier *</Label>
                  <Select value={state.selectedSupplier} onValueChange={v => set('selectedSupplier', v)}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {Number(s.balance) > 0 && <Badge variant="outline" className="ml-2 text-[9px] h-3.5 px-1 text-warning border-warning">Utang: {formatCurrency(Number(s.balance))}</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {supplier && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Saldo Utang</p><p className="font-semibold text-warning">{formatCurrency(Number(supplier.balance))}</p></div>
                  <div><p className="text-muted-foreground">Telepon</p><p className="font-semibold">{supplier.phone || '-'}</p></div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Gudang Tujuan</Label>
                <Select value={state.selectedGudang} onValueChange={v => set('selectedGudang', v)}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih gudang (opsional)" /></SelectTrigger>
                  <SelectContent>{warehouses.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Add product */}
              {canCreate('transactions.purchase') && (
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Produk</p>
                  <div className="grid gap-2 md:grid-cols-6">
                    <div className="md:col-span-3 space-y-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Cari produk..." value={state.searchProduct} onChange={e => set('searchProduct', e.target.value)} className="pl-8 text-xs h-8" />
                      </div>
                      <Select value={state.selectedProduct} onValueChange={v => {
                        const p = products.find(p => p.id === v);
                        setState(prev => ({ ...prev, selectedProduct: v, harga: String(p?.buyPrice ?? '') }));
                      }}>
                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                        <SelectContent>
                          {filteredProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.code && `${p.code} - `}{p.name}
                              <Badge variant="secondary" className="ml-2 text-[9px] h-3.5 px-1">Stok: {p.stock ?? 0}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" value={state.qty} onChange={e => set('qty', e.target.value)} className="text-xs h-8" min="1" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Harga Beli</Label>
                      <Input type="number" value={state.harga} onChange={e => set('harga', e.target.value)} className="text-xs h-8" placeholder="0" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addToCart} size="sm" className="w-full h-8 text-xs"><Plus className="mr-1.5 h-3.5 w-3.5" />Tambah</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Harga Beli</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.cart.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Keranjang kosong</TableCell></TableRow>
                    ) : state.cart.map((item, idx) => (
                      <TableRow key={item.productId} className="text-sm">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell><p className="font-medium">{item.nama}</p><p className="text-xs text-muted-foreground">{item.satuan}</p></TableCell>
                        <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.harga)}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(item.subtotal)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Calculator className="h-4 w-4" />Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({state.cart.length} item)</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground flex-1">Diskon (Rp)</span>
                <Input type="number" value={state.diskon} onChange={e => set('diskon', e.target.value)} className="w-32 h-7 text-right text-xs" min="0" />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={state.metodePembayaran} onValueChange={v => set('metodePembayaran', v)}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="kredit">Kredit (Utang)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isKredit && (
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-2.5 text-xs text-warning">
                  Transaksi akan dicatat sebagai utang ke supplier
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={state.catatan} onChange={e => set('catatan', e.target.value)} placeholder="Catatan..." className="text-xs h-8" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={reset}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={state.cart.length === 0 || createTx.isPending}>
                  {createTx.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pembelian;

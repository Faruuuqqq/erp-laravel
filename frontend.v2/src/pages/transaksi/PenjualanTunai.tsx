import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Banknote, Calculator, Eye, CheckCircle2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSalesReps } from '@/hooks/api/useSalesReps';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { FakturPenjualan } from '@/components/print/FakturPenjualan';
import type { Transaction } from '@/types';

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

const BLANK = () => ({
  cart: [] as CartItem[],
  selectedProduct: '',
  qty: '1',
  diskonItem: '0',
  selectedCustomer: '',
  selectedSales: '',
  bayar: '',
  diskonTotal: '0',
  catatan: '',
  tanggal: new Date().toISOString().split('T')[0],
  searchProduct: '',
});

const PenjualanTunai = () => {
  const { toast } = useToast();
  const { canCreate, canPrint } = usePermissions();
  const createTx = useCreateTransaction();

  const [state, setState] = useState(BLANK());
  const [saved, setSaved] = useState(false);
  const [savedTrx, setSavedTrx] = useState<Transaction | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

   const { data: productsData } = useProducts({ perPage: 500 });
   const { data: customersData } = useCustomers({ perPage: 500 });
   const { data: salesData } = useSalesReps({ perPage: 100 });

   // Wrap data arrays in useMemo to stabilize references
   const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
   const customers = useMemo(() => customersData?.data ?? [], [customersData?.data]);
   const salesReps = useMemo(() => salesData?.data ?? [], [salesData?.data]);

  const set = useCallback(<K extends keyof ReturnType<typeof BLANK>>(key: K, val: ReturnType<typeof BLANK>[K]) =>
    setState(p => ({ ...p, [key]: val })), []);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(state.searchProduct.toLowerCase()) ||
      (p.code ?? '').toLowerCase().includes(state.searchProduct.toLowerCase())
    ), [products, state.searchProduct]);

  const addToCart = useCallback(() => {
    const product = products.find(p => p.id === state.selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(state.qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus > 0', variant: 'destructive' });
    if (qtyNum > (product.stock ?? 0)) return toast({ title: `Stok tidak cukup. Tersedia: ${product.stock ?? 0}`, variant: 'destructive' });
    const diskonNum = parseFloat(state.diskonItem) || 0;
    const subtotal = product.sellPrice * qtyNum * (1 - diskonNum / 100);
    setState(prev => {
      const existing = prev.cart.findIndex(c => c.productId === state.selectedProduct);
      const newCart = [...prev.cart];
      if (existing >= 0) {
        const it = newCart[existing];
        newCart[existing] = { ...it, qty: it.qty + qtyNum, subtotal: it.harga * (it.qty + qtyNum) * (1 - it.diskon / 100) };
      } else {
        newCart.push({ productId: product.id, nama: product.name, satuan: product.unit ?? 'pcs', qty: qtyNum, harga: product.sellPrice, diskon: diskonNum, subtotal });
      }
      return { ...prev, cart: newCart, selectedProduct: '', qty: '1', diskonItem: '0', searchProduct: '' };
    });
    toast({ title: `${product.name} ditambahkan ke keranjang` });
  }, [products, state.selectedProduct, state.qty, state.diskonItem, toast]);

  const removeItem = useCallback((idx: number) =>
    setState(p => ({ ...p, cart: p.cart.filter((_, i) => i !== idx) })), []);

  const subtotal = state.cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonTotalNum = parseFloat(state.diskonTotal) || 0;
  const grandTotal = subtotal - diskonTotalNum;
  const bayarNum = parseFloat(state.bayar) || 0;
  const kembalian = bayarNum - grandTotal;

   const handleSave = useCallback(async () => {
     if (state.cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
     try {
       const result = await createTx.mutateAsync({
         type: 'penjualan_tunai',
         date: state.tanggal,
         customerId: state.selectedCustomer || null,
         salesId: state.selectedSales || null,
         discount: diskonTotalNum,
         paid: grandTotal,
         notes: state.catatan,
         items: state.cart.map(i => ({ productId: i.productId, quantity: i.qty, price: i.harga, discount: i.diskon })),
       });
       setSavedTrx(result as Transaction);
       setSaved(true);
       toast({ title: 'Transaksi berhasil disimpan', description: (result as Transaction).invoiceNumber });
     } catch (err: unknown) {
       const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
       toast({ title: 'Error', description: msg, variant: 'destructive' });
     }
   }, [state, createTx, diskonTotalNum, grandTotal, toast]);

   const reset = useCallback(() => { setState(BLANK()); setSaved(false); setSavedTrx(null); setIsPreviewOpen(false); }, []);

  if (saved && savedTrx) {
    return (
      <MainLayout title="Penjualan Tunai" subtitle="Transaksi berhasil disimpan">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Transaksi Berhasil</h2>
            <p className="text-muted-foreground mt-1">No. Faktur: <span className="font-mono font-semibold text-primary">{savedTrx.invoiceNumber}</span></p>
            <p className="text-3xl font-bold text-success mt-3">{formatCurrency(savedTrx.total)}</p>
            {kembalian > 0 && <p className="text-muted-foreground mt-1">Kembalian: <span className="font-semibold text-success">{formatCurrency(kembalian)}</span></p>}
          </div>
           <div className="flex gap-3">
             {canPrint('transactions.cash_sale') && (
               <Button onClick={() => setIsPreviewOpen(true)}>
                 <Eye className="mr-2 h-4 w-4" />Preview & Cetak
               </Button>
             )}
             <Button onClick={reset}>Transaksi Baru</Button>
           </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Penjualan Tunai" subtitle="Buat transaksi penjualan tunai">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Banknote className="h-4 w-4" />Form Penjualan Tunai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={state.tanggal} onChange={e => set('tanggal', e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Customer</Label>
                  <Select value={state.selectedCustomer} onValueChange={v => set('selectedCustomer', v)}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Walk-in Customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sales</Label>
                  <Select value={state.selectedSales} onValueChange={v => set('selectedSales', v)}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih sales" /></SelectTrigger>
                    <SelectContent>{salesReps.filter(s => s.status === 'aktif').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {canCreate('transactions.cash_sale') && (
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Produk</p>
                  <div className="grid gap-2 md:grid-cols-6">
                    <div className="md:col-span-3 space-y-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Cari produk..." value={state.searchProduct} onChange={e => set('searchProduct', e.target.value)} className="pl-8 text-xs h-8" />
                      </div>
                      <Select value={state.selectedProduct} onValueChange={v => set('selectedProduct', v)}>
                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                        <SelectContent>
                          {filteredProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <span>{p.name}</span>
                              <span className="ml-2 text-muted-foreground">{formatCurrency(p.sellPrice)}</span>
                              <Badge variant={(p.stock ?? 0) <= (p.minimumStock ?? 0) ? 'destructive' : 'secondary'} className="ml-2 text-[9px] h-3.5 px-1">Stok: {p.stock ?? 0}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Qty</Label><Input type="number" value={state.qty} onChange={e => set('qty', e.target.value)} className="text-xs h-8" min="1" /></div>
                    <div className="space-y-1"><Label className="text-xs">Diskon (%)</Label><Input type="number" value={state.diskonItem} onChange={e => set('diskonItem', e.target.value)} className="text-xs h-8" min="0" max="100" /></div>
                    <div className="flex items-end"><Button onClick={addToCart} size="sm" className="w-full h-8 text-xs"><Plus className="mr-1.5 h-3.5 w-3.5" />Tambah</Button></div>
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
                      <TableHead className="text-xs text-right">Harga</TableHead>
                      <TableHead className="text-xs text-right">Disc%</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.cart.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Keranjang masih kosong. Tambahkan produk di atas.</TableCell></TableRow>
                    ) : state.cart.map((item, idx) => (
                      <TableRow key={item.productId} className="text-sm">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell><p className="font-medium text-sm">{item.nama}</p><p className="text-xs text-muted-foreground">{item.satuan}</p></TableCell>
                        <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.harga)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{item.diskon > 0 ? `${item.diskon}%` : '-'}</TableCell>
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
                <span className="text-muted-foreground flex-1">Diskon</span>
                <Input type="number" value={state.diskonTotal} onChange={e => set('diskonTotal', e.target.value)} className="w-32 h-7 text-right text-xs" min="0" placeholder="0" />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">Jumlah Bayar (Rp)</Label>
                <Input type="number" value={state.bayar} onChange={e => set('bayar', e.target.value)} placeholder="0" className="text-right text-lg font-bold h-10" />
              </div>

              {bayarNum > 0 && (
                <div className={cn('flex justify-between rounded-lg p-3', kembalian >= 0 ? 'bg-success/10' : 'bg-destructive/10')}>
                  <span className={cn('font-medium text-sm', kembalian >= 0 ? 'text-success' : 'text-destructive')}>{kembalian >= 0 ? 'Kembalian' : 'Kurang'}</span>
                  <span className={cn('font-bold tabular-nums', kembalian >= 0 ? 'text-success' : 'text-destructive')}>{formatCurrency(Math.abs(kembalian))}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={state.catatan} onChange={e => set('catatan', e.target.value)} placeholder="Catatan..." className="text-xs h-8" />
              </div>

               {canCreate('transactions.cash_sale') && (
                 <div className="flex gap-2 pt-2">
                   <Button variant="outline" className="flex-1 h-9 text-sm" onClick={reset}>Reset</Button>
                   <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={state.cart.length === 0 || createTx.isPending}>
                     {createTx.isPending ? 'Menyimpan...' : 'Simpan'}
                   </Button>
                 </div>
               )}
               {savedTrx && canPrint('transactions.cash_sale') && (
                 <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsPreviewOpen(true)}><Eye className="mr-1.5 h-3.5 w-3.5" />Preview & Cetak</Button>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      {savedTrx && (
        <PrintPreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Faktur Penjualan Tunai"
          documentId="faktur-penjualan-tunai-print"
          filename={`faktur-penjualan-tunai-${savedTrx.invoiceNumber}`}
        >
          <div id="faktur-penjualan-tunai-print">
            <FakturPenjualan transaction={savedTrx} />
          </div>
        </PrintPreviewDialog>
      )}
    </MainLayout>
  );
};

export default PenjualanTunai;

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Banknote, Calculator, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSalesReps } from '@/hooks/api/useSalesReps';
import { useCreateTransaction, useDownloadTransactionPdf } from '@/hooks/api/useTransactions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchInput } from '@/components/common';
import { formatCurrency } from '@/lib/utils';
import { DraftPreviewDialog } from '@/components/dialogs/DraftPreviewDialog';
import { SuccessScreen } from '@/components/layout/SuccessScreen';
import { MainLayout } from '@/components/layout/MainLayout';
import { extractErrorMessage } from '@/lib/api';
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

  const downloadPdfMutation = useDownloadTransactionPdf();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [savedTrx, setSavedTrx] = useState<Transaction | null>(null);

  const handleDownloadPdf = async () => {
    if (!savedTrx) return;
    try {
      setIsDownloadingPdf(true);
      await downloadPdfMutation.mutateAsync({
        transactionId: savedTrx.id,
        filename: `${savedTrx.invoiceNumber ?? 'dokumen'}.pdf`,
        documentType: 'invoice',
      });
      toast({ title: 'Berhasil', description: 'Nota berhasil diunduh' });
    } catch (err) {
      toast({ title: 'Gagal Download', description: extractErrorMessage(err), variant: 'destructive' });
      console.error('PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const createTx = useCreateTransaction();

  const [state, setState] = useState(BLANK());
  const [saved, setSaved] = useState(false);
  const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);

  const { data: productsData } = useProducts({ perPage: 500 });
  const { data: customersData } = useCustomers({ perPage: 500 });
  const { data: salesData } = useSalesReps({ perPage: 100 });

  // Wrap data arrays in useMemo to stabilize references
  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const customers = useMemo(() => customersData?.data ?? [], [customersData?.data]);
  const salesReps = useMemo(() => salesData?.data ?? [], [salesData?.data]);

  const set = useCallback(<K extends keyof ReturnType<typeof BLANK>>(key: K, val: ReturnType<typeof BLANK>[K]) =>
    setState(p => ({ ...p, [key]: val })), []);

  const debouncedSearch = useDebouncedValue(state.searchProduct, 300);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.code ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [products, debouncedSearch]);

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
  const pembayaranKurang = state.bayar !== '' && bayarNum < grandTotal;
  const kembalian = bayarNum - grandTotal;

  const handleSave = useCallback(async () => {
    if (state.cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
    if (bayarNum <= 0) return toast({ title: 'Masukkan jumlah bayar', variant: 'destructive' });
    if (bayarNum < grandTotal) return toast({ title: 'Pembayaran kurang dari total belanja', variant: 'destructive' });
    try {
      const result = await createTx.mutateAsync({
        type: 'penjualan_tunai',
        date: state.tanggal,
        customerId: (state.selectedCustomer && state.selectedCustomer !== 'walk-in') ? state.selectedCustomer : null,
        salesId: state.selectedSales || null,
        discount: diskonTotalNum,
        paid: bayarNum,
        notes: state.catatan,
        items: state.cart.map(i => ({ productId: i.productId, quantity: i.qty, price: i.harga, discount: i.diskon })),
      });
      const responseData = (result as { data: Transaction }).data;
      setSavedTrx(responseData);
      setSaved(true);
      toast({ title: 'Transaksi berhasil disimpan', description: responseData.invoiceNumber });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [state, bayarNum, createTx, diskonTotalNum, grandTotal, toast]);

  const reset = useCallback(() => { setState(BLANK()); setSaved(false); setSavedTrx(null); setIsDraftPreviewOpen(false); }, []);

  const draftPreviewContent = useMemo(() => (
    <div className="w-full text-sm space-y-4 p-4">
      <div className="border-b pb-4">
        <p className="font-semibold text-lg">Penjualan Tunai (Draft)</p>
        <p className="text-xs text-muted-foreground">Belum disimpan</p>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span className="font-semibold">{state.tanggal}</span>
        </div>
        {state.catatan && (
          <div className="flex justify-between">
            <span>Catatan:</span>
            <span className="font-semibold">{state.catatan}</span>
          </div>
        )}
      </div>
      <table className="w-full text-xs">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-2">Produk</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Harga</th>
            <th className="text-right py-2">Diskon</th>
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {state.cart.map(item => (
            <tr key={item.productId} className="border-b">
              <td className="py-2">{item.nama}</td>
              <td className="text-right">{item.qty}</td>
              <td className="text-right">{formatCurrency(item.harga)}</td>
              <td className="text-right">{item.diskon}%</td>
              <td className="text-right font-semibold">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 text-xs border-t pt-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {diskonTotalNum > 0 && (
          <div className="flex justify-between text-warning">
            <span>Diskon:</span>
            <span>-{formatCurrency(diskonTotalNum)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
        {bayarNum > 0 && (
          <>
            <div className="flex justify-between">
              <span>Dibayar:</span>
              <span>{formatCurrency(bayarNum)}</span>
            </div>
            <div className={`flex justify-between ${kembalian >= 0 ? 'text-success' : 'text-destructive'}`}>
              <span>{kembalian >= 0 ? 'Kembalian' : 'Kurang'}:</span>
              <span className="font-semibold">{formatCurrency(Math.abs(kembalian))}</span>
            </div>
          </>
        )}
      </div>
    </div>
  ), [bayarNum, diskonTotalNum, grandTotal, kembalian, state.cart, state.catatan, state.tanggal, subtotal]);

  if (saved && savedTrx) {
    return (
      <SuccessScreen
        title="Transaksi Berhasil"
        invoiceNumber={savedTrx.invoiceNumber}
        total={savedTrx.total}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        canPrint={canPrint('transactions.cash_sale')}
        onReset={reset}
        extra={kembalian > 0 && <p className="text-muted-foreground mt-1">Kembalian: <span className="font-semibold text-success">{formatCurrency(kembalian)}</span></p>}
      />
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
                       <SearchInput 
                         placeholder="Cari produk..." 
                         value={state.searchProduct}
                         onChange={(value) => set('searchProduct', value)}
                       />
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)} aria-label={`Hapus item ${item.nama}`} title={`Hapus ${item.nama}`}>
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

              {pembayaranKurang && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  Jumlah bayar kurang dari grand total.
                </div>
              )}

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

               {state.cart.length > 0 && (
                 <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                   <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                 </Button>
               )}

                {canCreate('transactions.cash_sale') && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 h-9 text-sm" onClick={reset}>Reset</Button>
                    <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={state.cart.length === 0 || pembayaranKurang || createTx.isPending}>
                      {createTx.isPending ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                )}
                
            </CardContent>
          </Card>
        </div>
      </div>

       <DraftPreviewDialog
         isOpen={isDraftPreviewOpen}
         onClose={() => setIsDraftPreviewOpen(false)}
         content={draftPreviewContent}
         title="Preview Penjualan Tunai"
       />
    </MainLayout>
  );
};

export default PenjualanTunai;

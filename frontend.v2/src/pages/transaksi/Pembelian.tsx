import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, ShoppingCart, Calculator, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateTransaction, useDownloadTransactionPdf } from '@/hooks/api/useTransactions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchInput } from '@/components/common';
import { DraftPreviewDialog } from '@/components/dialogs/DraftPreviewDialog';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { SuccessScreen } from '@/components/layout/SuccessScreen';
import { FakturPembelian } from '@/components/print/FakturPembelian';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Product } from '@/types';

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  subtotal: number;
}

interface PriceConflict {
  show: boolean;
  existingPrice: number;
  newPrice: number;
  productName: string;
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
  const { canCreate, canPrint } = usePermissions();
  const createTx = useCreateTransaction();

   const [state, setState] = useState(BLANK_STATE());
   const [saved, setSaved] = useState(false);
   const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
   const downloadPdfMutation = useDownloadTransactionPdf();
   const [savedInvoice, setSavedInvoice] = useState('');
   const [savedTotal, setSavedTotal] = useState(0);
   const [savedTrx, setSavedTrx] = useState<Transaction | null>(null);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);
   const [priceConflict, setPriceConflict] = useState<PriceConflict>({ show: false, existingPrice: 0, newPrice: 0, productName: '' });
   const [pendingAddToCart, setPendingAddToCart] = useState<{ product: Product; qty: number; harga: number } | null>(null);

   const { data: productsData } = useProducts({ per_page: 500 });
   const { data: suppliersData } = useSuppliers({ perPage: 200 });
   const { data: warehousesData } = useWarehouses({ per_page: 100 });

   // Wrap data arrays in useMemo to stabilize references
   const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
   const suppliers = useMemo(() => suppliersData?.data ?? [], [suppliersData?.data]);
   const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData?.data]);

   const debouncedSearch = useDebouncedValue(state.searchProduct, 300);

   const set = useCallback(<K extends keyof ReturnType<typeof BLANK_STATE>>(key: K, val: ReturnType<typeof BLANK_STATE>[K]) =>
     setState(p => ({ ...p, [key]: val })), []);

   const filteredProducts = useMemo(() =>
     products.filter(p =>
       p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
       (p.code ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
     ), [products, debouncedSearch]);

  const supplier = suppliers.find(s => s.id === state.selectedSupplier);

  const addToCart = useCallback(() => {
    const product = products.find(p => p.id === state.selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(state.qty) || 1;
    const hargaNum = parseFloat(state.harga) || (product.buyPrice ?? 0);
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    
    // Check if product already exists in cart
    const existing = state.cart.findIndex(c => c.productId === state.selectedProduct);
    if (existing >= 0) {
      const existingPrice = state.cart[existing].harga;
      // If price is different, show dialog to confirm action
      if (hargaNum !== existingPrice) {
        setPriceConflict({
          show: true,
          existingPrice,
          newPrice: hargaNum,
          productName: product.name
        });
        setPendingAddToCart({ product, qty: qtyNum, harga: hargaNum });
        return;
      }
    }
    
    // Proceed with normal add
    setState(prev => {
      const idx = prev.cart.findIndex(c => c.productId === state.selectedProduct);
      const newCart = [...prev.cart];
      if (idx >= 0) {
        newCart[idx] = { ...newCart[idx], qty: newCart[idx].qty + qtyNum, subtotal: newCart[idx].harga * (newCart[idx].qty + qtyNum) };
      } else {
        newCart.push({ productId: product.id, nama: product.name, satuan: product.unit ?? 'pcs', qty: qtyNum, harga: hargaNum, subtotal: hargaNum * qtyNum });
      }
      return { ...prev, cart: newCart, selectedProduct: '', qty: '1', harga: '', searchProduct: '' };
    });
    toast({ title: `${product.name} ditambahkan` });
  }, [products, state.selectedProduct, state.qty, state.harga, state.cart, toast]);

  const removeItem = useCallback((idx: number) =>
    setState(p => ({ ...p, cart: p.cart.filter((_, i) => i !== idx) })), []);

  const handleConfirmPriceConflict = useCallback((useNewPrice: boolean) => {
    if (!pendingAddToCart) return;
    
    setState(prev => {
      const idx = prev.cart.findIndex(c => c.productId === pendingAddToCart.product.id);
      const newCart = [...prev.cart];
      const { product, qty: qtyNum, harga: hargaNum } = pendingAddToCart;
      
      if (idx >= 0) {
        if (useNewPrice) {
          // Replace price and recalculate
          const newPrice = hargaNum;
          newCart[idx] = { 
            ...newCart[idx], 
            harga: newPrice, 
            qty: newCart[idx].qty + qtyNum, 
            subtotal: newPrice * (newCart[idx].qty + qtyNum) 
          };
          toast({ 
            title: 'Harga diperbarui', 
            description: `Qty digabung dengan harga baru ${formatCurrency(newPrice)}` 
          });
        } else {
          // Keep existing price
          newCart[idx] = { 
            ...newCart[idx], 
            qty: newCart[idx].qty + qtyNum, 
            subtotal: newCart[idx].harga * (newCart[idx].qty + qtyNum) 
          };
          toast({ 
            title: 'Qty digabung', 
            description: `Harga tetap menggunakan ${formatCurrency(newCart[idx].harga)}` 
          });
        }
      }
      
      return { ...prev, cart: newCart, selectedProduct: '', qty: '1', harga: '', searchProduct: '' };
    });
    
    setPriceConflict({ show: false, existingPrice: 0, newPrice: 0, productName: '' });
    setPendingAddToCart(null);
  }, [pendingAddToCart, toast]);

  const subtotal = state.cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonNum = Math.max(0, parseFloat(state.diskon) || 0);
  const grandTotal = Math.max(0, subtotal - diskonNum);
  const isKredit = state.metodePembayaran === 'kredit';
  const paid = isKredit ? 0 : grandTotal;

  const handleSave = useCallback(async () => {
    if (state.cart.length === 0) return toast({ title: 'Keranjang masih kosong', variant: 'destructive' });
    if (!state.selectedSupplier) return toast({ title: 'Pilih supplier terlebih dahulu', variant: 'destructive' });
    if (diskonNum < 0) return toast({ title: 'Diskon tidak boleh negatif', variant: 'destructive' });
    if (diskonNum > subtotal) return toast({ title: 'Diskon tidak boleh melebihi subtotal', variant: 'destructive' });
    
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
      const responseData = (result as { data: Transaction }).data;
      setSavedInvoice(responseData.invoiceNumber ?? '');
      setSavedTotal(grandTotal);
      setSavedTrx(responseData);
      setSaved(true);
      toast({ title: 'Pembelian berhasil disimpan', description: responseData.invoiceNumber });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [state, createTx, diskonNum, subtotal, paid, grandTotal, toast]);

  const reset = useCallback(() => { setState(BLANK_STATE()); setSaved(false); }, []);

  const draftPreviewContent = useMemo(() => (
    <div className="w-full text-sm space-y-4 p-4">
      <div className="border-b pb-4">
        <p className="font-semibold text-lg">Pembelian (Draft)</p>
        <p className="text-xs text-muted-foreground">Belum disimpan</p>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span className="font-semibold">{state.tanggal}</span>
        </div>
        <div className="flex justify-between">
          <span>Supplier:</span>
          <span className="font-semibold">{supplier?.name || '-'}</span>
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
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {state.cart.map(item => (
            <tr key={item.productId} className="border-b">
              <td className="py-2">{item.nama}</td>
              <td className="text-right">{item.qty}</td>
              <td className="text-right">{formatCurrency(item.harga)}</td>
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
        {parseFloat(state.diskon) > 0 && (
          <div className="flex justify-between text-warning">
            <span>Diskon:</span>
            <span>-{formatCurrency(parseFloat(state.diskon) || 0)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  ), [grandTotal, state.cart, state.catatan, state.diskon, state.tanggal, subtotal, supplier?.name]);

  if (saved && savedTrx) {
    return (
      <>
        <SuccessScreen
          title="Pembelian Berhasil Disimpan"
          subtitle="Transaksi berhasil disimpan"
          invoiceNumber={savedInvoice}
          total={savedTotal}
          onDownloadPdf={async () => {
            if (!savedTrx) return;
            try {
              setIsDownloadingPdf(true);
              await downloadPdfMutation.mutateAsync({
                transactionId: savedTrx.id,
                filename: `${savedTrx.invoiceNumber ?? 'pembelian'}.pdf`,
                documentType: 'invoice',
              });
              toast({ title: 'Berhasil', description: 'Nota berhasil diunduh' });
            } catch (err: any) {
              toast({ title: 'Gagal Download', description: err?.response?.data?.message ?? err.message, variant: 'destructive' });
            } finally {
              setIsDownloadingPdf(false);
            }
          }}
          isDownloadingPdf={isDownloadingPdf}
          onPrint={() => setIsPreviewOpen(true)}
          canPrint={canPrint('transactions.pembelian') || canPrint('transactions.purchase')}
          onReset={reset}
          extra={isKredit && <Badge variant="outline" className="mt-2 text-warning border-warning">Dicatat sebagai Utang</Badge>}
        />

        <PrintPreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Faktur Pembelian"
          documentId="faktur-pembelian-print"
          filename={`Faktur-Pembelian-${savedTrx.invoiceNumber}`}
          backendPdf={{ transactionId: savedTrx.id, documentType: 'invoice' }}
        >
          <div id="faktur-pembelian-print">
            <FakturPembelian transaction={savedTrx} />
          </div>
        </PrintPreviewDialog>
      </>
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
                       <SearchInput 
                         placeholder="Cari produk..." 
                         value={state.searchProduct}
                         onChange={(value) => set('searchProduct', value)}
                       />
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
                <Input 
                  type="number" 
                  value={state.diskon} 
                  onChange={e => {
                    const val = e.target.value;
                    const numVal = parseFloat(val) || 0;
                    set('diskon', numVal < 0 ? '0' : val);
                  }}
                  className="w-32 h-7 text-right text-xs" 
                  min="0" 
                  step="1000"
                />
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

               {state.cart.length > 0 && !savedTrx && (
                 <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                   <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                 </Button>
               )}

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

       <DraftPreviewDialog
         isOpen={isDraftPreviewOpen}
         onClose={() => setIsDraftPreviewOpen(false)}
         content={draftPreviewContent}
         title="Preview Pembelian"
       />


      {/* Price Conflict Dialog */}
      <AlertDialog
        open={priceConflict.show}
        onOpenChange={v => {
          if (!v) {
            setPriceConflict({ show: false, existingPrice: 0, newPrice: 0, productName: '' });
            setPendingAddToCart(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Produk dengan Harga Berbeda</AlertDialogTitle>
            <AlertDialogDescription>
              Produk <span className="font-semibold text-foreground">{priceConflict.productName}</span> sudah ada di keranjang.
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga saat ini:</span>
                  <span className="font-semibold">{formatCurrency(priceConflict.existingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga baru:</span>
                  <span className="font-semibold text-primary">{formatCurrency(priceConflict.newPrice)}</span>
                </div>
              </div>
              <p className="mt-4">Qty akan digabung. Pilih harga mana yang ingin digunakan:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1" onClick={() => handleConfirmPriceConflict(false)}>
              Gunakan Harga Lama
            </AlertDialogCancel>
            <AlertDialogAction 
              className="flex-1"
              onClick={() => handleConfirmPriceConflict(true)}
            >
              Ganti Harga Baru
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Pembelian;

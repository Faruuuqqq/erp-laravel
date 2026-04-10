import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, CreditCard, Calculator, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useValidateQty } from '@/hooks/useValidateQty';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSalesReps } from '@/hooks/api/useSalesReps';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import type { Product, Customer, SalesRep, Warehouse } from '@/types';
import type { TransactionPrintData } from '@/types/print';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

const PenjualanKredit = () => {
  const { toast } = useToast();
  const { validateAddToCart, validateTotalDiscount, validateCartNotEmpty, showValidationError } = useValidateQty();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [diskon, setDiskon] = useState('0');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [selectedGudang, setSelectedGudang] = useState('');
  const [dp, setDp] = useState('0');
  const [catatan, setCatatan] = useState('');
   const [diskonTotal, setDiskonTotal] = useState('0');
   const [searchProduct, setSearchProduct] = useState('');
   const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
   const [dueDate, setDueDate] = useState('');
   const [saved, setSaved] = useState(false);
   const [lastInvoice, setLastInvoice] = useState('');
   const [lastInvoiceId, setLastInvoiceId] = useState<number>(0);
   const [previewOpen, setPreviewOpen] = useState(false);

  const { data: productsData } = useProducts({ per_page: 200 });
  const { data: customersData } = useCustomers({ per_page: 100 });
  const { data: salesData } = useSalesReps({ per_page: 100 });
  const { data: warehousesData } = useWarehouses({ per_page: 100 });
  const createMutation = useCreateTransaction();

  const products = (productsData?.data?.data ?? []) as Product[];
  const customers = (customersData?.data?.data ?? []) as Customer[];
  const sales = (salesData?.data?.data ?? []) as SalesRep[];
  const warehouses = (warehousesData?.data?.data ?? []) as Warehouse[];

  const noFaktur = '';
  const customer = customers.find(c => c.id === selectedCustomer);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const addToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    
    // Validate inputs
    const validation = validateAddToCart(qty, diskon, product);
    if (!validation.isValid) {
      return showValidationError(validation.error || 'Validasi gagal');
    }

    const qtyNum = parseInt(qty);
    const diskonNum = parseFloat(diskon);
    const subtotal = product.sellPrice * qtyNum * (1 - diskonNum / 100);
    const existing = cart.findIndex(c => c.productId === selectedProduct);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing].qty += qtyNum;
      updated[existing].subtotal = updated[existing].harga * updated[existing].qty * (1 - updated[existing].diskon / 100);
      setCart(updated);
    } else {
      setCart([...cart, { productId: product.id, nama: product.name, satuan: product.unit, qty: qtyNum, harga: product.sellPrice, diskon: diskonNum, subtotal }]);
    }
    setSelectedProduct(''); setQty('1'); setDiskon('0'); setSearchProduct('');
    toast({ title: `${product.name} ditambahkan` });
  };

  const removeItem = (idx: number) => setCart(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const diskonTotalNum = parseFloat(diskonTotal) || 0;
  const grandTotal = subtotal - diskonTotalNum;
  const dpNum = parseFloat(dp) || 0;
  const sisaPiutang = grandTotal - dpNum;
  const newPiutang = (customer?.balance || 0) + sisaPiutang;
  const isOverLimit = customer && (customer.creditLimit || 0) > 0 && newPiutang > (customer.creditLimit || 0);

  const handleSave = async () => {
    // Validate cart not empty
    const cartValidation = validateCartNotEmpty(cart);
    if (!cartValidation.isValid) {
      return showValidationError(cartValidation.error || 'Validasi gagal');
    }
    
    if (!selectedCustomer) return toast({ title: 'Pilih customer terlebih dahulu', variant: 'destructive' });
    
    // Validate total discount
    const discValidation = validateTotalDiscount(diskonTotal, subtotal);
    if (!discValidation.isValid) {
      return showValidationError(discValidation.error || 'Validasi gagal');
    }

    try {
      const payload = {
        type: 'penjualan_kredit',
        date: tanggal,
        dueDate: dueDate || null,
        customerId: selectedCustomer,
        salesRepId: selectedSales || null,
        warehouseId: selectedGudang || null,
        subtotal,
        discount: diskonTotalNum,
        tax: 0,
        total: grandTotal,
        paid: dpNum,
        remaining: sisaPiutang,
        status: 'completed',
        notes: catatan,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.qty,
          price: item.harga,
          discount: item.diskon,
        })),
       };

const response = await createMutation.mutateAsync(payload);
        const invoiceNumber = response.data?.data?.invoiceNumber || response.data?.invoiceNumber || '生成中';
        const invoiceId = response.data?.data?.id || response.data?.id || 0;
        setLastInvoice(invoiceNumber);
        setLastInvoiceId(invoiceId);
        setSaved(true);
       toast({ title: 'Penjualan kredit berhasil disimpan', description: `No. Faktur: ${invoiceNumber}` });
     } catch (err: unknown) {
       const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan transaksi';
       toast({ title: 'Error', description: msg, variant: 'destructive' });
     }
   };

   // Build print data from current form state
   const getPrintData = (): TransactionPrintData => ({
     documentType: 'penjualan_kredit',
     documentNumber: saved ? lastInvoice : undefined,
     savedDocumentId: saved ? lastInvoiceId : undefined,
     date: tanggal,
     isSaved: saved,
     customer: customer ? { name: customer.name, address: customer.address, phone: customer.phone } : undefined,
     items: cart.map((item, idx) => ({
       no: idx + 1,
       nama: item.nama,
       qty: item.qty,
       satuan: item.satuan,
       harga: item.harga,
       subtotal: item.subtotal,
     })),
     totalQty: cart.reduce((s, i) => s + i.qty, 0),
     totalItems: cart.length,
     subtotal,
     discount: diskonTotalNum,
     grandTotal,
     notes: catatan,
   });

   if (saved) {
     return (
       <MainLayout title="Penjualan Kredit" subtitle="Transaksi berhasil disimpan">
         <div className="flex flex-col items-center justify-center py-16 gap-6">
           <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
             <CheckCircle2 className="h-10 w-10 text-success" />
           </div>
           <div className="text-center">
             <h2 className="text-2xl font-bold">Penjualan Kredit Berhasil</h2>
             <p className="text-muted-foreground mt-1">No. Faktur: <span className="font-mono font-semibold text-primary">{lastInvoice}</span></p>
             <p className="text-3xl font-bold text-warning mt-3">{formatRupiah(sisaPiutang)}</p>
             <p className="text-sm text-muted-foreground">Total Piutang Ditambahkan</p>
           </div>
           <div className="flex gap-3">
             <Button variant="outline" onClick={() => setPreviewOpen(true)}>Preview & Lebih Lanjut</Button>
             <Button onClick={() => { setCart([]); setSaved(false); setDp('0'); setDiskonTotal('0'); setSelectedCustomer(''); setSelectedSales(''); }}>
               Transaksi Baru
             </Button>
           </div>
         </div>

         <PrintPreviewDialog
           isOpen={previewOpen}
           onOpenChange={setPreviewOpen}
           data={getPrintData()}
           documentType="penjualan_kredit"
         />
       </MainLayout>
     );
   }

  return (
    <MainLayout title="Penjualan Kredit" subtitle="Buat transaksi penjualan dengan pembayaran kredit">
      {isOverLimit && (
        <Alert className="mb-4 border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive text-sm">
            Piutang customer akan melebihi limit kredit ({formatRupiah(customer!.creditLimit || 0)}). Piutang saat ini: {formatRupiah(customer!.balance || 0)} + {formatRupiah(sisaPiutang)} = {formatRupiah(newPiutang)}
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Form Penjualan Kredit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur</Label>
                  <Input value="Akan dibuat setelah disimpan" disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <span>{c.name}</span>
                          {(c.balance || 0) > 0 && <Badge variant="outline" className="ml-2 text-[9px] h-3.5 px-1 text-warning border-warning">{formatRupiah(c.balance || 0)}</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-xs">Jatuh Tempo</Label>
                   <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="text-xs" />
                 </div>
               </div>

               {customer && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs grid grid-cols-3 gap-3">
                  <div><p className="text-muted-foreground">Piutang Saat Ini</p><p className="font-semibold text-warning">{formatRupiah(customer.balance || 0)}</p></div>
                  <div><p className="text-muted-foreground">Limit Kredit</p><p className="font-semibold">{formatRupiah(customer.creditLimit || 0)}</p></div>
                  <div><p className="text-muted-foreground">Sisa Limit</p><p className={`font-semibold ${((customer.creditLimit || 0) - (customer.balance || 0)) <= 0 ? 'text-destructive' : 'text-success'}`}>{formatRupiah((customer.creditLimit || 0) - (customer.balance || 0))}</p></div>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sales</Label>
                  <Select value={selectedSales} onValueChange={setSelectedSales}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih sales" /></SelectTrigger>
                    <SelectContent>
                      {sales.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Gudang</Label>
                  <Select value={selectedGudang} onValueChange={setSelectedGudang}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w.status === 'active').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Produk</p>
                <div className="grid gap-2 md:grid-cols-6">
                  <div className="md:col-span-3 space-y-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Cari produk..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} className="pl-8 text-xs h-8" />
                    </div>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {formatRupiah(p.sellPrice)}
                            <Badge variant={p.stock <= p.minStock ? 'destructive' : 'secondary'} className="ml-2 text-[9px] h-3.5 px-1">Stok: {p.stock}</Badge>
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
                    <Label className="text-xs">Disc%</Label>
                    <Input type="number" value={diskon} onChange={e => setDiskon(e.target.value)} className="text-xs h-8" min="0" max="100" />
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
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Disc%</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">Keranjang kosong</td></tr>
                    ) : (
                      cart.map((item, idx) => (
                        <tr key={item.productId} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2"><p className="font-medium text-sm">{item.nama}</p><p className="text-xs text-muted-foreground">{item.satuan}</p></td>
                          <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.harga)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{item.diskon > 0 ? `${item.diskon}%` : '-'}</td>
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
                Ringkasan Kredit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cart.length} item)</span>
                <span className="tabular-nums">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground flex-1">Diskon</span>
                <Input type="number" value={diskonTotal} onChange={e => setDiskonTotal(e.target.value)} className="w-32 h-7 text-right text-xs" min="0" />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatRupiah(grandTotal)}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs">Uang Muka / DP (Rp)</Label>
                <Input type="number" value={dp} onChange={e => setDp(e.target.value)} className="text-right h-9 text-sm" min="0" />
              </div>

              <div className="rounded-lg border bg-warning/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Sisa Piutang</p>
                <p className="text-xl font-bold text-warning tabular-nums">{formatRupiah(sisaPiutang)}</p>
              </div>

              {isOverLimit && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  Melebihi limit kredit!
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan tambahan..." className="text-xs h-8" />
              </div>

               <div className="flex gap-2 pt-1">
                 <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setCart([]); setDp('0'); setDiskonTotal('0'); setSelectedCustomer(''); }}>Reset</Button>
                 <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={cart.length === 0 || createMutation.isPending}>Simpan</Button>
               </div>
               <Button variant="outline" className="w-full h-9 text-sm" onClick={() => setPreviewOpen(true)}>
                 Preview & Lebih Lanjut
               </Button>
             </CardContent>
           </Card>
         </div>
       </div>

       <PrintPreviewDialog
         isOpen={previewOpen}
         onOpenChange={setPreviewOpen}
         data={getPrintData()}
         documentType="penjualan_kredit"
       />
     </MainLayout>
   );
 };

 export default PenjualanKredit;

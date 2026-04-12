import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, RotateCcw, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useTransactions, useCreateTransaction } from '@/hooks/api/useTransactions';
import { DraftPreviewDialog } from '@/components/dialogs/DraftPreviewDialog';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { ReturPembelianPrint } from '@/components/print/ReturPembelianPrint';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface ReturItem {
  productId: string;
  nama: string;
  qty: number;
  harga: number;
  satuan: string;
  subtotal: number;
}

const ALASAN_OPTIONS = [
  { value: 'rusak', label: 'Barang Rusak' },
  { value: 'kadaluarsa', label: 'Kadaluarsa' },
  { value: 'tidak_sesuai', label: 'Tidak Sesuai Pesanan' },
  { value: 'cacat', label: 'Cacat Produksi' },
  { value: 'kelebihan', label: 'Kelebihan Pengiriman' },
] as const;

const ReturPembelian = () => {
  const { toast } = useToast();
  const { canCreate, canPrint } = usePermissions();
  const createTx = useCreateTransaction();

  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedFakturId, setSelectedFakturId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [saved, setSaved] = useState(false);
   const [savedInvoice, setSavedInvoice] = useState('');
   const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);

  const { data: suppliersData } = useSuppliers({ perPage: 200 });
  const { data: productsData } = useProducts({ perPage: 500 });
  // Load pembelian transactions for selected supplier (to pick items from)
  const { data: pembelianData } = useTransactions({
    type: 'pembelian',
    perPage: 100,
    ...(selectedSupplier ? { supplier_id: selectedSupplier } : {}),
  });

  const suppliers = suppliersData?.data ?? [];
  const products = productsData?.data ?? [];
  const pembelianList: Transaction[] = pembelianData?.data ?? [];
  const filteredPembelian = selectedSupplier
    ? pembelianList.filter(t => t.supplierId === selectedSupplier)
    : pembelianList;

  const selectedTrx = pembelianList.find(t => t.id === selectedFakturId);
  // Products available from selected purchase invoice, or all products
  const availableProducts = selectedTrx?.items?.length
    ? selectedTrx.items.map(i => ({ id: i.productId ?? '', name: i.productName ?? '', unit: 'pcs', price: i.price }))
    : products.map(p => ({ id: p.id, name: p.name, unit: p.unit ?? 'pcs', price: p.buyPrice ?? 0 }));

  const addItem = useCallback(() => {
    const prod = availableProducts.find(p => p.id === selectedProduct);
    if (!prod) return toast({ title: 'Pilih produk dahulu', variant: 'destructive' });
    const existing = items.find(i => i.productId === selectedProduct);
    if (existing) return toast({ title: 'Produk sudah ada di list', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus > 0', variant: 'destructive' });
    setItems(prev => [...prev, { productId: prod.id, nama: prod.name, qty: qtyNum, harga: prod.price, satuan: prod.unit, subtotal: prod.price * qtyNum }]);
    setSelectedProduct(''); setQty('1');
    toast({ title: `${prod.name} ditambahkan ke retur` });
  }, [availableProducts, selectedProduct, qty, items, toast]);

  const removeItem = useCallback((idx: number) => setItems(prev => prev.filter((_, i) => i !== idx)), []);
  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = useCallback(() => {
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    if (!selectedSupplier) return toast({ title: 'Pilih supplier', variant: 'destructive' });
    setConfirmOpen(true);
  }, [items.length, alasan, selectedSupplier, toast]);

  const confirmSave = useCallback(async () => {
    setConfirmOpen(false);
    try {
      const result = await createTx.mutateAsync({
        type: 'retur_pembelian',
        date: tanggal,
        supplierId: selectedSupplier,
        notes: `${ALASAN_OPTIONS.find(a => a.value === alasan)?.label ?? alasan}${catatan ? ` — ${catatan}` : ''}`,
        items: items.map(i => ({ productId: i.productId, quantity: i.qty, price: i.harga, discount: 0 })),
      });
      setSavedInvoice((result as Transaction).invoiceNumber ?? '');
      setSavedTransaction(result as Transaction);
      setSaved(true);
      toast({ title: 'Retur pembelian berhasil', description: (result as Transaction).invoiceNumber });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [createTx, tanggal, selectedSupplier, alasan, catatan, items, toast]);

   const reset = useCallback(() => {
     setItems([]); setSaved(false); setSavedInvoice('');
     setSelectedFakturId(''); setSelectedSupplier(''); setAlasan(''); setCatatan(''); setIsDraftPreviewOpen(false);
   }, []);

  if (saved) {
    return (
      <MainLayout title="Retur Pembelian" subtitle="Retur berhasil diproses">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Retur Berhasil Diproses</h2>
            <p className="text-muted-foreground mt-1">No. Retur: <span className="font-mono font-semibold text-primary">{savedInvoice}</span></p>
            <p className="text-3xl font-bold text-destructive mt-3">{formatCurrency(totalNilai)}</p>
            <p className="text-sm text-muted-foreground">Nilai retur dikurangi dari utang</p>
          </div>
           <div className="flex gap-3">
             {canPrint('transactions.return_purchase') && savedTransaction && (
               <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                 <Eye className="mr-2 h-4 w-4" />Preview & Cetak
               </Button>
             )}
             <Button onClick={reset}>Retur Baru</Button>
           </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retur Pembelian" subtitle="Buat surat retur barang ke supplier">
      <Alert className="mb-4 border-destructive/30 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm text-destructive">
          Retur pembelian akan mengurangi stok barang dan menyesuaikan nilai utang ke supplier.
        </AlertDescription>
      </Alert>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4" />Form Retur Pembelian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Supplier *</Label>
                  <Select value={selectedSupplier} onValueChange={v => { setSelectedSupplier(v); setSelectedFakturId(''); }}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur Pembelian</Label>
                  <Select value={selectedFakturId} onValueChange={setSelectedFakturId}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih faktur (opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Input Manual</SelectItem>
                      {filteredPembelian.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.invoiceNumber}{t.supplier ? ` — ${t.supplier}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Alasan Retur *</Label>
                <Select value={alasan} onValueChange={setAlasan}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                  <SelectContent>
                    {ALASAN_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {canCreate('transactions.return_purchase') && (
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pilih Barang Retur</p>
                  <div className="grid gap-2 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                        <SelectContent>
                          {availableProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — {formatCurrency(p.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty Retur" className="text-xs h-8" min="1" />
                    <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
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
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang retur</TableCell></TableRow>
                    ) : items.map((item, idx) => (
                      <TableRow key={idx} className="text-sm">
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.nama}<p className="text-xs text-muted-foreground">{item.satuan}</p></TableCell>
                        <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.harga)}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-destructive">{formatCurrency(item.subtotal)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan Retur</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Item</span><span>{items.length} produk</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Qty</span><span className="tabular-nums">{items.reduce((s, i) => s + i.qty, 0)} pcs</span></div>
              <div className="rounded-lg border bg-destructive/10 p-3">
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className="text-xl font-bold text-destructive tabular-nums">{formatCurrency(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan retur..." className="text-xs h-8" />
              </div>
               {canCreate('transactions.return_purchase') && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setSelectedFakturId(''); setAlasan(''); }}>Reset</Button>
                    <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={items.length === 0 || createTx.isPending}>
                      {createTx.isPending ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </div>
                )}
                {items.length > 0 && (
                  <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                  </Button>
                )}
                {savedTransaction && (
                  <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />Preview & Cetak
                  </Button>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Retur Pembelian</AlertDialogTitle>
            <AlertDialogDescription>
              Retur sebesar <strong>{formatCurrency(totalNilai)}</strong> akan mengurangi stok dan utang ke supplier. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={createTx.isPending}>
              {createTx.isPending ? 'Memproses...' : 'Ya, Proses Retur'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {savedTransaction && (
         <PrintPreviewDialog
           isOpen={isPreviewOpen}
           onClose={() => setIsPreviewOpen(false)}
           title="Surat Retur Pembelian"
           documentId="retur-pembelian-print"
           filename={`retur-pembelian-${savedInvoice}`}
         >
           <div id="retur-pembelian-print">
             <ReturPembelianPrint transaction={savedTransaction} />
           </div>
         </PrintPreviewDialog>
       )}

       {/* Draft Preview Dialog */}
       {(() => {
         const draftPreviewContent = (
           <div className="w-full text-sm space-y-4 p-4">
             <div className="border-b pb-4">
               <p className="font-semibold text-lg">Retur Pembelian (Draft)</p>
               <p className="text-xs text-muted-foreground">Belum disimpan</p>
             </div>
             <div className="space-y-1 text-xs">
               <div className="flex justify-between">
                 <span>Tanggal Retur:</span>
                 <span className="font-semibold">{tanggal}</span>
               </div>
               <div className="flex justify-between">
                 <span>Supplier:</span>
                 <span className="font-semibold">{suppliers.find(s => s.id === selectedSupplier)?.name || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Alasan Retur:</span>
                 <span className="font-semibold">{ALASAN_OPTIONS.find(a => a.value === alasan)?.label || '-'}</span>
               </div>
               {catatan && (
                 <div className="flex justify-between">
                   <span>Catatan:</span>
                   <span className="font-semibold">{catatan}</span>
                 </div>
               )}
             </div>
             <div className="border-t pt-4">
               <p className="text-xs font-semibold text-muted-foreground mb-2">Daftar Barang Retur</p>
               <table className="w-full text-xs">
                 <thead className="border-b bg-muted/50">
                   <tr>
                     <th className="text-left py-2">No</th>
                     <th className="text-left py-2">Produk</th>
                     <th className="text-right py-2">Qty</th>
                     <th className="text-right py-2">Harga</th>
                     <th className="text-right py-2">Subtotal</th>
                   </tr>
                 </thead>
                 <tbody>
                   {items.map((item, idx) => (
                     <tr key={idx} className="border-b">
                       <td className="py-2">{idx + 1}</td>
                       <td className="py-2">{item.nama}</td>
                       <td className="text-right">{item.qty}</td>
                       <td className="text-right">{formatCurrency(item.harga)}</td>
                       <td className="text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="space-y-1 text-xs border-t pt-4">
               <div className="flex justify-between">
                 <span>Total Item:</span>
                 <span className="font-semibold">{items.length} produk</span>
               </div>
               <div className="flex justify-between">
                 <span>Total Qty:</span>
                 <span className="font-semibold">{items.reduce((s, i) => s + i.qty, 0)} pcs</span>
               </div>
               <div className="flex justify-between font-semibold text-base border-t pt-2">
                 <span>Total Nilai Retur:</span>
                 <span className="text-destructive">{formatCurrency(totalNilai)}</span>
               </div>
             </div>
           </div>
         );
         return (
           <DraftPreviewDialog
             isOpen={isDraftPreviewOpen}
             onClose={() => setIsDraftPreviewOpen(false)}
             content={draftPreviewContent}
             title="Preview Retur Pembelian"
           />
         );
       })()}
     </MainLayout>
   );
 };
 
 export default ReturPembelian;

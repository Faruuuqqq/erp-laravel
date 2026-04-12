import { useState, useCallback, useMemo } from 'react';
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
import { Plus, Trash2, RotateCcw, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useProducts } from '@/hooks/api/useProducts';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { DraftPreviewDialog } from '@/components/dialogs/DraftPreviewDialog';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { ReturPenjualanPrint } from '@/components/print/ReturPenjualanPrint';
import type { Transaction } from '@/types';

interface ReturItem { productId: string; nama: string; qty: number; harga: number; satuan: string; subtotal: number; }

const ReturPenjualan = () => {
  const { toast } = useToast();
  const { canCreate } = usePermissions();
  const createTx = useCreateTransaction();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedFaktur, setSelectedFaktur] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [metodeKembalian, setMetodeKembalian] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [saved, setSaved] = useState(false);
   const [savedTrx, setSavedTrx] = useState<Transaction | null>(null);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);
   const [isSaving, setIsSaving] = useState(false);

  const { data: customersData } = useCustomers({ perPage: 200 });
  // Query both penjualan_tunai and penjualan_kredit separately or use types array
  const { data: transactionsDataTunai } = useTransactions({ type: 'penjualan_tunai' });
  const { data: transactionsDataKredit } = useTransactions({ type: 'penjualan_kredit' });
  const { data: productsData } = useProducts({ perPage: 999 });

  const customers = customersData?.data ?? [];
  const allTransactions = useMemo(() => [
    ...(transactionsDataTunai?.data ?? []),
    ...(transactionsDataKredit?.data ?? [])
  ], [transactionsDataTunai?.data, transactionsDataKredit?.data]);
  
  const penjualanFakturs = useMemo(() => 
    allTransactions.filter(t =>
      !selectedCustomer || t.customerId === selectedCustomer
    ),
    [allTransactions, selectedCustomer]
  );
  
  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  
  // Fixed: Use t.id instead of t.invoiceNumber
  const selectedTrx = penjualanFakturs.find(t => t.id === selectedFaktur);

  // Fixed: Generate noRetur only once with useMemo
  const noRetur = useMemo(() => 
    `RTJ-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`,
    []
  );

  const addItem = useCallback(() => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    const trxItem = selectedTrx?.items?.find(i => i.productId === selectedProduct);
    const harga = trxItem ? Number(trxItem.price) : Number(product.sellPrice ?? product.buyPrice ?? 0);
    setItems(prev => [...prev, { productId: product.id, nama: product.name, qty: qtyNum, harga, satuan: product.unit ?? 'pcs', subtotal: harga * qtyNum }]);
    setSelectedProduct(''); 
    setQty('1');
    toast({ title: `${product.name} ditambahkan` });
  }, [products, selectedProduct, qty, selectedTrx, toast]);

  const removeItem = useCallback((idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = useCallback(() => {
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    if (!metodeKembalian) return toast({ title: 'Pilih metode pengembalian', variant: 'destructive' });
    setConfirmOpen(true);
  }, [items.length, alasan, metodeKembalian, toast]);

  if (saved) {
    return (
      <MainLayout title="Retur Penjualan" subtitle="Retur berhasil diproses">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
            <CheckCircle2 className="h-10 w-10 text-warning" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Retur Penjualan Diproses</h2>
            <p className="text-muted-foreground mt-1">No. Retur: <span className="font-mono font-semibold text-primary">{noRetur}</span></p>
            <p className="text-3xl font-bold text-warning mt-3">{formatCurrency(totalNilai)}</p>
            <p className="text-sm text-muted-foreground">Nilai retur - metode: {metodeKembalian}</p>
          </div>
           <div className="flex gap-3">
             {savedTrx && (
               <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                 <Eye className="mr-2 h-4 w-4" />Preview & Cetak
               </Button>
             )}
             <Button onClick={() => { setItems([]); setSaved(false); setSavedTrx(null); setSelectedFaktur(''); setSelectedCustomer(''); setAlasan(''); setMetodeKembalian(''); setCatatan(''); }}>Retur Baru</Button>
           </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retur Penjualan" subtitle="Terima retur barang dari customer">
      <Alert className="mb-4 border-warning/30 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm text-warning">
          Retur penjualan akan menambah kembali stok barang dan menyesuaikan nilai piutang/kas customer.
        </AlertDescription>
      </Alert>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4" />Form Retur Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Retur</Label>
                  <Input value={noRetur} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur Penjualan</Label>
                   <Select value={selectedFaktur} onValueChange={setSelectedFaktur}>
                     <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih faktur" /></SelectTrigger>
                     <SelectContent>
                       {penjualanFakturs.map(t => <SelectItem key={t.id} value={t.id}>{t.invoiceNumber} - {t.customer}</SelectItem>)}
                       <SelectItem value="manual">Input Manual</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Retur</Label>
                  <Select value={alasan} onValueChange={setAlasan}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rusak">Barang Rusak</SelectItem>
                      <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                      <SelectItem value="tidak_sesuai">Tidak Sesuai Pesanan</SelectItem>
                      <SelectItem value="kelebihan">Kelebihan Order</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pilih Barang Retur</p>
                <div className="grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs h-8" min="1" />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Harga</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang retur</TableCell></TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={idx} className="text-sm">
                          <TableCell className="text-xs">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama}<p className="text-xs text-muted-foreground">{item.satuan}</p></TableCell>
                          <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.harga)}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-warning">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan Retur</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Item</span><span>{items.length} produk</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Qty</span><span className="tabular-nums">{items.reduce((s,i) => s+i.qty,0)}</span></div>
              <div className="rounded-lg border bg-warning/10 p-3">
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className="text-xl font-bold text-warning tabular-nums">{formatCurrency(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pengembalian</Label>
                <Select value={metodeKembalian} onValueChange={setMetodeKembalian}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Pengembalian Tunai</SelectItem>
                    <SelectItem value="potong_piutang">Potong Piutang</SelectItem>
                    <SelectItem value="tukar_barang">Tukar Barang</SelectItem>
                    <SelectItem value="kredit_nota">Kredit Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-1.5">
                 <Label className="text-xs">Catatan</Label>
                 <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan retur..." className="text-xs h-8" />
               </div>
               {items.length > 0 && (
                 <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                   <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                 </Button>
               )}
               <div className="flex gap-2 pt-1">
                 <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setSelectedFaktur(''); setAlasan(''); setMetodeKembalian(''); }}>Reset</Button>
                 {canCreate('transactions.return_sale') && (
                   <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={items.length === 0}>Simpan</Button>
                 )}
               </div>
                {savedTrx && (
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
             <AlertDialogTitle>Konfirmasi Retur Penjualan</AlertDialogTitle>
             <AlertDialogDescription>
               Retur senilai <strong>{formatCurrency(totalNilai)}</strong> akan menambah stok dan mengurangi piutang/kas customer. Tindakan ini tidak dapat dibatalkan.
             </AlertDialogDescription>
           </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
               <AlertDialogAction onClick={async () => {
                 try {
                   setIsSaving(true);
                   const result = await createTx.mutateAsync({
                     type: 'retur_penjualan',
                     date: tanggal,
                     customerId: selectedCustomer,
                     notes: `${alasan} — ${catatan}`,
                     items: items.map(i => ({ productId: i.productId, quantity: i.qty, price: i.harga, discount: 0 })),
                   });
                  setSavedTrx(result as Transaction);
                  setConfirmOpen(false);
                  setSaved(true);
                  setIsDraftPreviewOpen(false);
                  toast({ title: 'Retur berhasil diproses', description: (result as Transaction).invoiceNumber });
                } catch (err: unknown) {
                  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan retur';
                  toast({ title: 'Error', description: msg, variant: 'destructive' });
                  setConfirmOpen(false);
                } finally {
                  setIsSaving(false);
                }
              }} disabled={isSaving}>
                {isSaving ? 'Memproses...' : 'Ya, Proses Retur'}
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {savedTrx && (
         <PrintPreviewDialog
           isOpen={isPreviewOpen}
           onClose={() => setIsPreviewOpen(false)}
           title="Surat Retur Penjualan"
           documentId="retur-penjualan-print"
           filename={`retur-penjualan-${savedTrx.invoiceNumber}`}
         >
           <div id="retur-penjualan-print">
             <ReturPenjualanPrint transaction={savedTrx} />
           </div>
         </PrintPreviewDialog>
       )}

       {/* Draft Preview Dialog */}
       {(() => {
         const draftPreviewContent = (
           <div className="w-full text-sm space-y-4 p-4">
             <div className="border-b pb-4">
               <p className="font-semibold text-lg">Retur Penjualan (Draft)</p>
               <p className="text-xs text-muted-foreground">Belum disimpan</p>
             </div>
             <div className="space-y-1 text-xs">
               <div className="flex justify-between">
                 <span>No. Retur:</span>
                 <span className="font-semibold">{noRetur}</span>
               </div>
               <div className="flex justify-between">
                 <span>Tanggal Retur:</span>
                 <span className="font-semibold">{tanggal}</span>
               </div>
               <div className="flex justify-between">
                 <span>Customer:</span>
                 <span className="font-semibold">{customers.find(c => c.id === selectedCustomer)?.name || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Alasan Retur:</span>
                 <span className="font-semibold">{alasan || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Metode Pengembalian:</span>
                 <span className="font-semibold">{metodeKembalian || '-'}</span>
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
                 <span className="font-semibold">{items.reduce((s, i) => s + i.qty, 0)}</span>
               </div>
               <div className="flex justify-between font-semibold text-base border-t pt-2">
                 <span>Total Nilai Retur:</span>
                 <span className="text-warning">{formatCurrency(totalNilai)}</span>
               </div>
             </div>
           </div>
         );
         return (
           <DraftPreviewDialog
             isOpen={isDraftPreviewOpen}
             onClose={() => setIsDraftPreviewOpen(false)}
             content={draftPreviewContent}
             title="Preview Retur Penjualan"
           />
         );
       })()}
     </MainLayout>
   );
 };
 
 export default ReturPenjualan;

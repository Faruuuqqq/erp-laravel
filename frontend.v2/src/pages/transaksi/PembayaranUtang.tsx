import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Check, Eye, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useTransactions, useCreateTransaction } from '@/hooks/api/useTransactions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchInput } from '@/components/common';
import { DraftPreviewDialog } from '@/components/dialogs/DraftPreviewDialog';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { PembayaranUtangPrint } from '@/components/print/PembayaranUtangPrint';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const PembayaranUtang = () => {
  const { toast } = useToast();
  const { canCreate } = usePermissions();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tanggal] = useState(new Date().toISOString().split('T')[0]);
   const [saved, setSaved] = useState(false);
   const [savedCount, setSavedCount] = useState(0);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);
   const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);

  const createTx = useCreateTransaction();
  const { data: suppliersData } = useSuppliers({ perPage: 200 });
  // Fetch unpaid pembelian transactions filtered by supplier if set
  const { data: txData } = useTransactions({
    type: 'pembelian',
    status: 'completed',
    perPage: 200,
    ...(filterSupplier !== 'all' ? { supplier_id: filterSupplier } : {}),
  });

   const suppliers = suppliersData?.data ?? [];
   // Filter to only ones with remaining > 0 (outstanding utang)
   const utangList: Transaction[] = (txData?.data ?? []).filter(t => (t.remaining ?? 0) > 0);

   const debouncedSearch = useDebouncedValue(searchTerm, 300);

   const filtered = utangList.filter(u => {
     const supplierName = u.supplier ?? '';
     const matchSearch = u.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
       supplierName.toLowerCase().includes(debouncedSearch.toLowerCase());
     const matchSupplier = filterSupplier === 'all' || u.supplierId === filterSupplier;
     return matchSearch && matchSupplier;
   });

  const totalSelected = utangList.filter(u => selectedItems.includes(u.id)).reduce((s, u) => s + (u.remaining ?? 0), 0);
  const selectedUtang = utangList.filter(u => selectedItems.includes(u.id));
  const selectedSupplierIds = Array.from(new Set(selectedUtang.map(u => u.supplierId).filter(Boolean)));
  const hasMixedSuppliers = selectedSupplierIds.length > 1;
  const jumlahBayarNum = parseFloat(jumlahBayar) || 0;

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahBayarNum <= 0) return toast({ title: 'Masukkan jumlah yang dibayar', variant: 'destructive' });
    if (hasMixedSuppliers) {
      return toast({
        title: 'Pilih faktur dari satu supplier saja',
        description: 'Pembayaran utang hanya bisa diproses per supplier.',
        variant: 'destructive',
      });
    }

    const supplierId = selectedSupplierIds[0];
    if (!supplierId) return;

    try {
      const result = await createTx.mutateAsync({
        type: 'pembayaran_utang',
        date: tanggal,
        supplierId,
        paid: jumlahBayarNum,
        notes: catatan || `Bayar utang: ${selectedItems.join(', ')}`,
        items: [], // payment transaction — no items
      });
      setSavedCount(selectedItems.length); // Save count BEFORE clearing
      setSavedTransaction(result as Transaction);
      setSelectedItems([]); // Clear selected items after successful save
      setSaved(true);
      toast({ title: 'Pembayaran utang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [selectedItems, metodePembayaran, jumlahBayarNum, hasMixedSuppliers, selectedSupplierIds, tanggal, catatan, createTx, toast]);

   const reset = useCallback(() => {
     setSelectedItems([]); setSaved(false); setSavedCount(0); setJumlahBayar(''); setMetodePembayaran(''); setCatatan(''); setSavedTransaction(null); setIsDraftPreviewOpen(false);
   }, []);

  const draftPreviewContent = useMemo(() => (
    <div className="w-full text-sm space-y-4 p-4">
      <div className="border-b pb-4">
        <p className="font-semibold text-lg">Pembayaran Utang (Draft)</p>
        <p className="text-xs text-muted-foreground">Belum disimpan</p>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Tanggal Bayar:</span>
          <span className="font-semibold">{tanggal}</span>
        </div>
        <div className="flex justify-between">
          <span>Metode Pembayaran:</span>
          <span className="font-semibold">{metodePembayaran || '-'}</span>
        </div>
        {catatan && (
          <div className="flex justify-between">
            <span>Catatan:</span>
            <span className="font-semibold">{catatan}</span>
          </div>
        )}
      </div>
      <div className="border-t pt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Daftar Faktur Utang</p>
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left py-2">No. Faktur</th>
              <th className="text-left py-2">Supplier</th>
              <th className="text-right py-2">Sisa Utang</th>
            </tr>
          </thead>
          <tbody>
            {utangList.filter(u => selectedItems.includes(u.id)).map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 font-mono font-semibold">{item.invoiceNumber}</td>
                <td className="py-2">{item.supplier || '-'}</td>
                <td className="text-right py-2">{formatCurrency(item.remaining ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-1 text-xs border-t pt-4">
        <div className="flex justify-between">
          <span>Total Utang:</span>
          <span className="font-semibold">{formatCurrency(totalSelected)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t pt-2">
          <span>Jumlah Bayar:</span>
          <span className="text-primary">{formatCurrency(jumlahBayarNum)}</span>
        </div>
      </div>
    </div>
  ), [catatan, jumlahBayarNum, metodePembayaran, selectedItems, tanggal, totalSelected, utangList]);

  if (saved) {
    return (
      <>
        <MainLayout title="Pembayaran Utang" subtitle="Pembayaran berhasil dicatat">
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Pembayaran Berhasil</h2>
              <p className="text-3xl font-bold text-primary mt-3">{formatCurrency(jumlahBayarNum)}</p>
              <p className="text-sm text-muted-foreground mt-1">{savedCount} faktur utang diselesaikan</p>
            </div>
             <div className="flex gap-3">
               {savedTransaction && (
                 <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                   <Eye className="mr-2 h-4 w-4" />Preview & Cetak
                 </Button>
               )}
               <Button onClick={reset}>Input Baru</Button>
             </div>
          </div>
        </MainLayout>
        {savedTransaction && (
          <PrintPreviewDialog
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            title="Bukti Pembayaran Utang"
            documentId="pembayaran-utang-print"
            filename={`pembayaran-utang-${new Date().toISOString().slice(0, 10)}`}
            backendPdf={{ transactionId: savedTransaction.id, documentType: 'document' }}
          >
            <div id="pembayaran-utang-print">
              <PembayaranUtangPrint transaction={savedTransaction} />
            </div>
          </PrintPreviewDialog>
        )}
      </>
    );
  }

  return (
    <MainLayout title="Pembayaran Utang" subtitle="Bayar utang ke supplier/distributor">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />Daftar Utang ke Supplier
                </CardTitle>
                 <div className="flex gap-2">
                   <div className="w-48">
                     <SearchInput 
                       placeholder="Cari..." 
                       value={searchTerm}
                       onChange={setSearchTerm}
                     />
                   </div>
                   <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                     <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Semua" /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Semua Supplier</SelectItem>
                       {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10 text-xs" />
                      <TableHead className="text-xs">No. Faktur</TableHead>
                      <TableHead className="text-xs">Supplier</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-right">Terbayar</TableHead>
                      <TableHead className="text-xs text-right">Sisa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        {utangList.length === 0 ? 'Tidak ada utang yang outstanding' : 'Tidak ada hasil pencarian'}
                      </TableCell></TableRow>
                    ) : filtered.map(item => (
                      <TableRow key={item.id} className={`text-sm cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            onClick={e => e.stopPropagation()}
                            aria-label={`Pilih faktur ${item.invoiceNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-primary font-semibold">{item.invoiceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[140px] truncate">{item.supplier || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.total)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(item.paid)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-destructive">{formatCurrency(item.remaining ?? 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {utangList.length === 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground text-center">
                  Data diambil dari transaksi pembelian yang belum lunas. Buat transaksi pembelian kredit untuk melihatnya di sini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Form Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Bayar</Label>
                <Input type="date" defaultValue={tanggal} className="text-xs h-8" readOnly />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="giro">Giro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Total Dipilih ({selectedItems.length} faktur)</p>
                <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(totalSelected)}</p>
              </div>
              {hasMixedSuppliers && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  Pilihan mencampur beberapa supplier. Pilih faktur dari satu supplier saja.
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Dibayar (Rp)</Label>
                <Input type="number" value={jumlahBayar} onChange={e => setJumlahBayar(e.target.value)} placeholder="0" className="text-right text-lg font-bold h-10" />
              </div>
               <div className="space-y-1.5">
                 <Label className="text-xs">Catatan</Label>
                 <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan pembayaran..." className="text-xs h-8" />
               </div>

                {selectedItems.length > 0 && (
                  <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                  </Button>
                )}

                {canCreate('transactions.payable') && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setSelectedItems([])}>Batal</Button>
                    <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0 || hasMixedSuppliers || createTx.isPending}>
                      <Check className="mr-1.5 h-4 w-4" />{createTx.isPending ? 'Menyimpan...' : 'Bayar'}
                    </Button>
                  </div>
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

       <DraftPreviewDialog
         isOpen={isDraftPreviewOpen}
         onClose={() => setIsDraftPreviewOpen(false)}
         content={draftPreviewContent}
         title="Preview Pembayaran Utang"
       />
     </MainLayout>
   );
 };
 
 export default PembayaranUtang;

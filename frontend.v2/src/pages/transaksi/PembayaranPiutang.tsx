import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Wallet, Check, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useTransactions, useCreateTransaction } from '@/hooks/api/useTransactions';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { PembayaranPiutangPrint } from '@/components/print/PembayaranPiutangPrint';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const PembayaranPiutang = () => {
  const { toast } = useToast();
  const { canCreate, canPrint } = usePermissions();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahDiterima, setJumlahDiterima] = useState('');
  const [catatan, setCatatan] = useState('');
   const [tanggal] = useState(new Date().toISOString().split('T')[0]);
   const [saved, setSaved] = useState(false);
   const [isDraftPreviewOpen, setIsDraftPreviewOpen] = useState(false);
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);

  const createTx = useCreateTransaction();
  const { data: customersData } = useCustomers({ perPage: 200 });
  // Load outstanding penjualan_kredit with remaining > 0
  const { data: txData } = useTransactions({ type: 'penjualan_kredit', status: 'completed', perPage: 200 });

  const customers = customersData?.data ?? [];
  const piutangList: Transaction[] = (txData?.data ?? []).filter(t => (t.remaining ?? 0) > 0);

  const filtered = piutangList.filter(p => {
    const customerName = p.customer ?? '';
    const matchSearch = p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer === 'all' || p.customerId === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const totalSelected = piutangList.filter(p => selectedItems.includes(p.id)).reduce((s, p) => s + (p.remaining ?? 0), 0);
  const jumlahDiterimaNum = parseFloat(jumlahDiterima) || 0;
  const sisa = totalSelected - jumlahDiterimaNum;

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahDiterimaNum <= 0) return toast({ title: 'Masukkan jumlah yang diterima', variant: 'destructive' });
    // Validate overpayment (allow max 1% tolerance)
    const tolerance = totalSelected * 0.01;
    if (jumlahDiterimaNum > totalSelected + tolerance) return toast({ title: 'Jumlah diterima melebihi piutang (max 1% tolerance)', variant: 'destructive' });

    const firstTx = piutangList.find(p => selectedItems.includes(p.id));
    if (!firstTx?.customerId) return;

    try {
      const result = await createTx.mutateAsync({
        type: 'pembayaran_piutang',
        date: tanggal,
        customerId: firstTx.customerId,
        paid: jumlahDiterimaNum,
        paymentMethod: metodePembayaran,
        notes: catatan || `Terima bayar piutang: ${selectedItems.join(', ')}`,
        items: [],
      });
      setSavedTransaction(result as Transaction);
      setSaved(true);
      toast({ title: 'Pembayaran piutang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [selectedItems, metodePembayaran, jumlahDiterimaNum, piutangList, totalSelected, tanggal, catatan, createTx, toast]);

   const reset = useCallback(() => {
     setSelectedItems([]); setSaved(false); setJumlahDiterima(''); setMetodePembayaran(''); setCatatan(''); setSavedTransaction(null); setIsDraftPreviewOpen(false);
   }, []);



  if (saved) {
    return (
      <MainLayout title="Pembayaran Piutang" subtitle="Pembayaran berhasil dicatat">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pembayaran Diterima</h2>
            <p className="text-3xl font-bold text-success mt-3">{formatCurrency(jumlahDiterimaNum)}</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedItems.length} faktur diselesaikan</p>
          </div>
           <div className="flex gap-3">
             {canPrint('transactions.payment') && (
               <Button variant="outline" onClick={() => setIsPreviewOpen(true)}><Eye className="mr-2 h-4 w-4" />Preview & Cetak</Button>
             )}
             <Button onClick={reset}>Input Baru</Button>
           </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Pembayaran Piutang" subtitle="Terima pembayaran piutang dari customer">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4" />Daftar Piutang Customer
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-52">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Cari faktur/customer..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                    <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Customer</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-right">Terbayar</TableHead>
                      <TableHead className="text-xs text-right">Sisa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        {piutangList.length === 0 ? 'Tidak ada piutang yang outstanding' : 'Tidak ada hasil pencarian'}
                      </TableCell></TableRow>
                    ) : filtered.map(item => (
                      <TableRow key={item.id} className={`text-sm cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                        <TableCell><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} /></TableCell>
                        <TableCell className="font-mono text-xs text-primary font-semibold">{item.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{item.customer || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.total)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(item.paid)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-warning">{formatCurrency(item.remaining ?? 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {piutangList.length === 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground text-center">
                  Data diambil dari transaksi penjualan kredit yang belum lunas.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Form Penerimaan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Terima</Label>
                <Input type="date" defaultValue={tanggal} readOnly className="text-xs h-8" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="giro">Giro</SelectItem>
                    <SelectItem value="cek">Cek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-success/10 p-3">
                <p className="text-xs text-muted-foreground">Total Dipilih ({selectedItems.length} faktur)</p>
                <p className="text-xl font-bold text-success tabular-nums">{formatCurrency(totalSelected)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Diterima (Rp)</Label>
                <Input type="number" value={jumlahDiterima} onChange={e => setJumlahDiterima(e.target.value)} placeholder="0" className="text-right text-lg font-bold h-10" />
              </div>
              {jumlahDiterimaNum > 0 && (
                <div className={`flex justify-between rounded-lg p-2.5 text-sm ${sisa <= 0 ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <span className={sisa <= 0 ? 'text-success' : 'text-warning'}>{sisa <= 0 ? 'Lebih bayar' : 'Sisa piutang'}</span>
                  <span className={`font-bold tabular-nums ${sisa <= 0 ? 'text-success' : 'text-warning'}`}>{formatCurrency(Math.abs(sisa))}</span>
                </div>
              )}
               <div className="space-y-1.5">
                 <Label className="text-xs">Catatan</Label>
                 <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan penerimaan..." className="text-xs h-8" />
               </div>

               {selectedItems.length > 0 && (
                 <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setIsDraftPreviewOpen(true)}>
                   <Eye className="mr-1.5 h-3.5 w-3.5" />Lihat Preview
                 </Button>
               )}

               {canCreate('transactions.receivable') && (
                 <div className="flex gap-2 pt-1">
                   <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setSelectedItems([])}>Batal</Button>
                   <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0 || createTx.isPending}>
                     <Check className="mr-1.5 h-4 w-4" />{createTx.isPending ? 'Menyimpan...' : 'Terima'}
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

       {savedTransaction && (
         <PrintPreviewDialog
           isOpen={isPreviewOpen}
           onClose={() => setIsPreviewOpen(false)}
           title="Bukti Pembayaran Piutang"
           documentId="pembayaran-piutang-print"
           filename={`pembayaran-piutang-${new Date().toISOString().slice(0, 10)}`}
         >
           <div id="pembayaran-piutang-print">
             <PembayaranPiutangPrint transaction={savedTransaction} />
           </div>
         </PrintPreviewDialog>
       )}

       {/* Draft Preview Dialog */}
       <PrintPreviewDialog
         isOpen={isDraftPreviewOpen}
         onClose={() => setIsDraftPreviewOpen(false)}
         title="Preview Pembayaran Piutang (Draft)"
         documentId="pembayaran-piutang-draft-print"
         filename="Pembayaran-Piutang-Draft"
         printContent={
           <div className="w-full text-sm space-y-4 p-4">
             <div className="border-b pb-4">
               <p className="font-semibold text-lg">Pembayaran Piutang (Draft)</p>
               <p className="text-xs text-muted-foreground">Belum disimpan</p>
             </div>
             <div className="space-y-1 text-xs">
               <div className="flex justify-between">
                 <span>Tanggal Terima:</span>
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
               <p className="text-xs font-semibold text-muted-foreground mb-2">Daftar Faktur Piutang</p>
               <table className="w-full text-xs">
                 <thead className="border-b bg-muted/50">
                   <tr>
                     <th className="text-left py-2">No. Faktur</th>
                     <th className="text-left py-2">Customer</th>
                     <th className="text-right py-2">Sisa Piutang</th>
                   </tr>
                 </thead>
                 <tbody>
                   {piutangList.filter(p => selectedItems.includes(p.id)).map(item => (
                     <tr key={item.id} className="border-b">
                       <td className="py-2 font-mono font-semibold">{item.invoiceNumber}</td>
                       <td className="py-2">{item.customer || '-'}</td>
                       <td className="text-right py-2">{formatCurrency(item.remaining ?? 0)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="space-y-1 text-xs border-t pt-4">
               <div className="flex justify-between">
                 <span>Total Piutang:</span>
                 <span className="font-semibold">{formatCurrency(totalSelected)}</span>
               </div>
               <div className="flex justify-between font-semibold text-base border-t pt-2">
                 <span>Jumlah Diterima:</span>
                 <span className="text-success">{formatCurrency(jumlahDiterimaNum)}</span>
               </div>
               {sisa !== 0 && (
                 <div className={`flex justify-between ${sisa <= 0 ? 'text-success' : 'text-warning'}`}>
                   <span>{sisa <= 0 ? 'Lebih Bayar' : 'Sisa Piutang'}:</span>
                   <span className="font-semibold">{formatCurrency(Math.abs(sisa))}</span>
                 </div>
               )}
             </div>
           </div>
         }
       >
         <div className="w-full text-sm space-y-4 p-4">
           <div className="border-b pb-4">
             <p className="font-semibold text-lg">Pembayaran Piutang (Draft)</p>
             <p className="text-xs text-muted-foreground">Belum disimpan</p>
           </div>
           <div className="space-y-1 text-xs">
             <div className="flex justify-between">
               <span>Tanggal Terima:</span>
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
             <p className="text-xs font-semibold text-muted-foreground mb-2">Daftar Faktur Piutang</p>
             <table className="w-full text-xs">
               <thead className="border-b bg-muted/50">
                 <tr>
                   <th className="text-left py-2">No. Faktur</th>
                   <th className="text-left py-2">Customer</th>
                   <th className="text-right py-2">Sisa Piutang</th>
                 </tr>
               </thead>
               <tbody>
                 {piutangList.filter(p => selectedItems.includes(p.id)).map(item => (
                   <tr key={item.id} className="border-b">
                     <td className="py-2 font-mono font-semibold">{item.invoiceNumber}</td>
                     <td className="py-2">{item.customer || '-'}</td>
                     <td className="text-right py-2">{formatCurrency(item.remaining ?? 0)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="space-y-1 text-xs border-t pt-4">
             <div className="flex justify-between">
               <span>Total Piutang:</span>
               <span className="font-semibold">{formatCurrency(totalSelected)}</span>
             </div>
             <div className="flex justify-between font-semibold text-base border-t pt-2">
               <span>Jumlah Diterima:</span>
               <span className="text-success">{formatCurrency(jumlahDiterimaNum)}</span>
             </div>
             {sisa !== 0 && (
               <div className={`flex justify-between ${sisa <= 0 ? 'text-success' : 'text-warning'}`}>
                 <span>{sisa <= 0 ? 'Lebih Bayar' : 'Sisa Piutang'}:</span>
                 <span className="font-semibold">{formatCurrency(Math.abs(sisa))}</span>
               </div>
             )}
           </div>
         </div>
       </PrintPreviewDialog>
     </MainLayout>
   );
 };
 
 export default PembayaranPiutang;

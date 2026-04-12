import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, FileText, Truck, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSalesReps } from '@/hooks/api/useSalesReps';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import { SuratJalanPrint } from '@/components/print/SuratJalanPrint';
import type { Transaction } from '@/types';

interface SJItem {
  productId: string;
  nama: string;
  qty: number;
  satuan: string;
  keterangan: string;
}

// Helper function to generate unique noSJ
const generateNoSJ = () => {
  const now = new Date();
  return `SJ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
};

const SuratJalan = () => {
  const { toast } = useToast();
  const { canCreate, canPrint } = usePermissions();
  const createTx = useCreateTransaction();

  const [items, setItems] = useState<SJItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [keterangan, setKeterangan] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [selectedGudang, setSelectedGudang] = useState('');
  const [alamatKirim, setAlamatKirim] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null);
  const [noSJ, setNoSJ] = useState(() => generateNoSJ());

  // Real API data
  const { data: productsData } = useProducts({ perPage: 500 });
  const { data: customersData } = useCustomers({ perPage: 500 });
  const { data: salesData } = useSalesReps({ perPage: 100 });
  const { data: warehousesData } = useWarehouses({ perPage: 100 });

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const customers = useMemo(() => customersData?.data ?? [], [customersData?.data]);
  const salesReps = useMemo(() => salesData?.data ?? [], [salesData?.data]);
  const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData?.data]);

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const customer = customers.find(c => c.id === selectedCustomer);
  const gudang = warehouses.find(g => g.id === selectedGudang);
  const sales = salesReps.find(s => s.id === selectedSales);

  const addItem = useCallback(() => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    setItems(prev => [...prev, {
      productId: product.id,
      nama: product.name,
      qty: qtyNum,
      satuan: product.unit ?? 'pcs',
      keterangan,
    }]);
    setSelectedProduct(''); 
    setQty('1'); 
    setKeterangan('');
    toast({ title: `${product.name} ditambahkan` });
  }, [products, selectedProduct, qty, keterangan, toast]);

  const removeItem = useCallback((idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const handleSimpan = useCallback(async () => {
    if (items.length === 0) return toast({ title: 'Belum ada barang', variant: 'destructive' });
    if (!selectedCustomer) return toast({ title: 'Pilih customer', variant: 'destructive' });
    
    try {
      setIsSaving(true);
      const result = await createTx.mutateAsync({
        type: 'surat_jalan',
        date: tanggal,
        customerId: selectedCustomer,
        warehouseId: selectedGudang || null,
        salesRepId: selectedSales || null,
        notes: catatan,
        items: items.map(i => ({ productId: i.productId, quantity: i.qty, price: 0, discount: 0 })),
      });
      
      setSavedTransaction(result as Transaction);
      toast({ title: 'Surat Jalan disimpan', description: (result as Transaction).invoiceNumber });
      
      // Generate new noSJ for next entry
      setNoSJ(generateNoSJ());
      setItems([]);
      setSelectedCustomer('');
      setSelectedGudang('');
      setAlamatKirim('');
      setPengirim('');
      setCatatan('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan surat jalan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [items, selectedCustomer, selectedGudang, selectedSales, tanggal, catatan, createTx, toast]);

  return (
    <MainLayout title="Surat Jalan" subtitle="Buat surat jalan untuk pengiriman barang">
      <Alert className="mb-4 border-primary/30 bg-primary/5">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-primary">
          Surat jalan tidak mencantumkan harga. Hanya digunakan sebagai bukti serah terima barang kepada penerima.
        </AlertDescription>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />Form Surat Jalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header fields */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Surat Jalan</Label>
                  <Input value={noSJ} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer / Penerima</Label>
                  <Select value={selectedCustomer} onValueChange={v => {
                    setSelectedCustomer(v);
                    const c = customers.find(c => c.id === v);
                    if (c) setAlamatKirim(c.address ?? '');
                  }}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alamat Pengiriman</Label>
                  <Input value={alamatKirim} onChange={e => setAlamatKirim(e.target.value)} placeholder="Alamat tujuan pengiriman" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Gudang Pengirim</Label>
                  <Select value={selectedGudang} onValueChange={setSelectedGudang}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
                    <SelectContent>{warehouses.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pengirim / Driver</Label>
                  <Input value={pengirim} onChange={e => setPengirim(e.target.value)} placeholder="Nama pengirim & kendaraan" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sales</Label>
                  <Select value={selectedSales} onValueChange={setSelectedSales}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih sales" /></SelectTrigger>
                    <SelectContent>{salesReps.filter(s => s.status === 'aktif').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add item row */}
              {canCreate('transactions.delivery_note') && (
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Barang</p>
                  <div className="grid gap-2 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (Stok: {p.stock ?? 0})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs h-8" min="1" />
                    <Input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Keterangan" className="text-xs h-8" />
                    <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                  </div>
                </div>
              )}

              {/* Items table */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Nama Barang</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs">Satuan</TableHead>
                      <TableHead className="text-xs">Keterangan</TableHead>
                      {canCreate('transactions.delivery_note') && <TableHead className="w-8" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={canCreate('transactions.delivery_note') ? 6 : 5} className="text-center text-sm text-muted-foreground py-8">Belum ada barang ditambahkan</TableCell></TableRow>
                    ) : items.map((item, idx) => (
                      <TableRow key={idx} className="text-sm">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">{item.qty}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.satuan}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.keterangan || '-'}</TableCell>
                        {canCreate('transactions.delivery_note') && (
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jenis Barang</span>
                <span className="font-medium">{items.length} produk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="font-medium tabular-nums">{totalQty} pcs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Penerima</span>
                <span className="font-medium truncate max-w-[120px]">{customer?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gudang</span>
                <span className="font-medium truncate max-w-[120px]">{gudang?.name || '-'}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan pengiriman..." className="text-xs h-8" />
              </div>

               {canCreate('transactions.delivery_note') && (
                 <div className="flex gap-2 pt-2">
                   <Button variant="outline" className="flex-1 h-9 text-sm"
                     onClick={() => { setItems([]); setSelectedCustomer(''); setSelectedGudang(''); setAlamatKirim(''); setPengirim(''); setNoSJ(generateNoSJ()); }}>
                     Reset
                   </Button>
                   <Button className="flex-1 h-9 text-sm" onClick={handleSimpan} disabled={isSaving}>
                     {isSaving ? 'Menyimpan...' : 'Simpan'}
                   </Button>
                 </div>
               )}

               {canPrint('transactions.delivery_note') && savedTransaction && (
                 <Button variant="outline" className="w-full h-9 text-sm" onClick={() => setIsPreviewOpen(true)}>
                   <Eye className="mr-1.5 h-3.5 w-3.5" />Preview & Cetak
                 </Button>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Preview - Only show after saved */}
      {savedTransaction && (
        <PrintPreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Surat Jalan"
          documentId="surat-jalan-print"
          filename={`surat-jalan-${savedTransaction.invoiceNumber}`}
        >
          <div id="surat-jalan-print">
            <SuratJalanPrint transaction={savedTransaction} />
          </div>
        </PrintPreviewDialog>
      )}
    </MainLayout>
  );
};

export default SuratJalan;

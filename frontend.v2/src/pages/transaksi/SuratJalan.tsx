import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, FileText, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSalesReps } from '@/hooks/api/useSalesReps';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useCreateDeliveryNote } from '@/hooks/api/useDeliveryNotes';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import type { Product, Customer, SalesRep, Warehouse } from '@/types';
import type { TransactionPrintData } from '@/types/print';

interface SJItem {
  productId: string;
  nama: string;
  qty: number;
  satuan: string;
  keterangan: string;
}

const SuratJalan = () => {
  const { toast } = useToast();
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSJ, setLastSJ] = useState('');
  const [lastSJId, setLastSJId] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useProducts({ per_page: 200 });
  const { data: customersData, isLoading: customersLoading } = useCustomers({ per_page: 100 });
  const { data: salesData, isLoading: salesLoading } = useSalesReps({ per_page: 100 });
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehouses({ per_page: 100 });
  const createMutation = useCreateDeliveryNote();

  const products = (productsData?.data?.data ?? []) as Product[];
  const customers = (customersData?.data?.data ?? []) as Customer[];
  const sales = (salesData?.data?.data ?? []) as SalesRep[];
  const warehouses = (warehousesData?.data?.data ?? []) as Warehouse[];
  const isDataLoading = productsLoading || customersLoading || salesLoading || warehousesLoading;

  const noSJ = '';
  const customer = customers.find(c => c.id === selectedCustomer);
  const gudang = warehouses.find(w => w.id === selectedGudang);
  const salesRep = sales.find(s => s.id === selectedSales);
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    setItems([...items, { productId: product.id, nama: product.name, qty: qtyNum, satuan: product.unit, keterangan }]);
    setSelectedProduct(''); setQty('1'); setKeterangan('');
    toast({ title: `${product.name} ditambahkan` });
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const handleSave = async () => {
    if (items.length === 0) return toast({ title: 'Belum ada barang', variant: 'destructive' });
    if (!selectedCustomer) return toast({ title: 'Pilih customer', variant: 'destructive' });

    try {
      const response = await createMutation.mutateAsync({
        date: new Date().toISOString().slice(0, 10),
        customer_id: selectedCustomer,
        driver: pengirim,
        vehicle_plate: '',
        notes: catatan,
        status: 'delivered',
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.qty,
          notes: item.keterangan,
        })),
      });
      const deliveryNumber = response.data?.data?.delivery_number || response.data?.delivery_number || '生成中';
      const deliveryId = response.data?.data?.id || response.data?.id || 0;
      setLastSJ(deliveryNumber);
      setLastSJId(deliveryId);
      setSaved(true);
      toast({ title: 'Surat Jalan disimpan', description: deliveryNumber });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan surat jalan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  // Build print data from current form state
  const getPrintData = (): TransactionPrintData => ({
    documentType: 'sj',
    documentNumber: saved ? lastSJ : undefined,
    savedDocumentId: saved ? lastSJId : undefined,
    date: new Date().toISOString().split('T')[0],
    isSaved: saved,
    customer: customer ? { name: customer.name, address: alamatKirim || customer.address } : undefined,
    items: items.map((item, idx) => ({
      no: idx + 1,
      nama: item.nama,
      qty: item.qty,
      satuan: item.satuan,
      keterangan: item.keterangan,
    })),
    totalQty,
    totalItems: items.length,
    notes: catatan,
    warehouse: gudang ? { name: gudang.name, address: gudang.address } : undefined,
    salesRep: salesRep ? { name: salesRep.name } : undefined,
    driver: pengirim,
    destination: alamatKirim,
  });

  if (saved) {
    return (
      <MainLayout title="Surat Jalan" subtitle="Surat jalan berhasil dibuat">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Truck className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Surat Jalan Berhasil Dibuat</h2>
            <p className="text-muted-foreground mt-1">No. Surat Jalan: <span className="font-mono font-semibold text-primary">{lastSJ}</span></p>
            <p className="text-sm text-muted-foreground mt-1">{items.length} produk, {totalQty} qty total</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>Preview & Lebih Lanjut</Button>
            <Button onClick={() => { setItems([]); setSaved(false); setSelectedCustomer(''); setSelectedGudang(''); setAlamatKirim(''); setPengirim(''); setCatatan(''); }}>Surat Jalan Baru</Button>
          </div>
        </div>

        <PrintPreviewDialog
          isOpen={previewOpen}
          onOpenChange={setPreviewOpen}
          data={getPrintData()}
          documentType="sj"
        />
      </MainLayout>
    );
  }

  // Show skeleton loaders while data is loading
  if (isDataLoading) {
    return (
      <MainLayout title="Surat Jalan" subtitle="Buat surat jalan untuk pengiriman barang">
        <Alert className="mb-4 border-primary/30 bg-primary/5">
          <FileText className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-primary">
            Surat jalan tidak mencantumkan harga. Hanya digunakan sebagai bukti serah terima barang kepada penerima.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4" />
                  Form Surat Jalan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </div>
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Barang</p>
                  <div className="grid gap-2 md:grid-cols-5">
                    <Skeleton className="h-8 md:col-span-2" />
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4 py-2 border-b">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Surat Jalan" subtitle="Buat surat jalan untuk pengiriman barang">
      <Alert className="mb-4 border-primary/30 bg-primary/5">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-primary">
          Surat jalan tidak mencantumkan harga. Hanya digunakan sebagai bukti serah terima barang kepada penerima.
        </AlertDescription>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Form Surat Jalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Surat Jalan</Label>
                  <Input value={noSJ} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer / Penerima</Label>
                  <Select value={selectedCustomer} onValueChange={(v) => {
                    setSelectedCustomer(v);
                    const c = customers.find(c => c.id === v);
                    if (c) setAlamatKirim(c.address || '');
                  }}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
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
                    <SelectContent>
                      {warehouses.filter(w => w.status === 'active').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
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
                    <SelectContent>
                      {sales.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Barang</p>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs h-8" min="1" />
                  <Input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Keterangan" className="text-xs h-8" />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left w-8">No</th>
                      <th className="px-3 py-2 text-left">Nama Barang</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-left">Satuan</th>
                      <th className="px-3 py-2 text-left">Keterangan</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang ditambahkan</td></tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{item.nama}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold">{item.qty}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.satuan}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.keterangan || '-'}</td>
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
              <CardTitle className="text-base">Ringkasan</CardTitle>
            </CardHeader>
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

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setSelectedCustomer(''); setSelectedGudang(''); setAlamatKirim(''); setPengirim(''); }}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={items.length === 0 || createMutation.isPending}>Simpan</Button>
              </div>

              <Button variant="outline" className="w-full h-9 text-sm" onClick={() => setPreviewOpen(true)}>
                Preview & Lebih Lanjut
              </Button>
            </CardContent>
          </Card>
        </div>

        <PrintPreviewDialog
          isOpen={previewOpen}
          onOpenChange={setPreviewOpen}
          data={getPrintData()}
           documentType="sj"
         />
       </div>
     </MainLayout>
   );
 };

 export default SuratJalan;

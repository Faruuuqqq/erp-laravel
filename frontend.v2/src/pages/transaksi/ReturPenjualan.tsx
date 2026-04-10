import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useProducts } from '@/hooks/api/useProducts';
import { useCreateReturnSale, printReturnSale } from '@/hooks/api/useReturns';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { ReturnTransactionForm, ReturnSuccessScreen, formatRupiah, type ReturItem, type ReturnFormConfig } from '@/components/forms/ReturnTransactionForm';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import type { Customer, Product } from '@/types';
import type { TransactionPrintData } from '@/types/print';

const METODE_LABEL: Record<string, string> = {
  tunai: 'Pengembalian Tunai',
  potong_piutang: 'Potong Piutang',
  tukar_barang: 'Tukar Barang',
  kredit_nota: 'Kredit Nota',
};

const ReturPenjualan = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [metodeKembalian, setMetodeKembalian] = useState('');
  const [catatan, setCatatan] = useState('');
const [confirmOpen, setConfirmOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const [lastRetur, setLastRetur] = useState('');
    const [lastReturId, setLastReturId] = useState<number>(0);
    const [returDate, setReturDate] = useState(new Date().toISOString().split('T')[0]);
    const [previewOpen, setPreviewOpen] = useState(false);

  const { data: customersData, isLoading: customersLoading } = useCustomers({ per_page: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ per_page: 200 });
  const createMutation = useCreateReturnSale();

  const customers = (customersData?.data?.data ?? []) as Customer[];
  const products = (productsData?.data?.data ?? []) as Product[];
  const isDataLoading = customersLoading || productsLoading;

  const config: ReturnFormConfig = {
    type: 'sale',
    title: 'Form Retur Penjualan',
    subtitle: 'Retur berhasil diproses',
    partnerLabel: 'Customer',
    alertColor: 'warning',
    alertText: 'Retur penjualan akan menambah kembali stok barang dan menyesuaikan nilai piutang/kas customer.',
    priceFieldName: 'sellPrice',
    successColorClass: 'text-warning',
    successBgClass: 'bg-warning/10',
    summaryColorClass: 'text-warning',
    summaryBgClass: 'bg-warning/10',
  };

   const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

   // Build print data from current form state
   const getPrintData = (): TransactionPrintData => ({
     documentType: 'retur_penjualan',
     documentNumber: saved ? lastRetur : undefined,
     savedDocumentId: saved ? lastReturId : undefined,
     date: returDate,
     isSaved: saved,
     customer: selectedCustomer ? customers.find(c => c.id === selectedCustomer) : undefined,
     items: items.map((item, idx) => ({
       no: idx + 1,
       nama: item.nama,
       qty: item.qty,
       satuan: item.satuan,
       harga: item.harga,
       subtotal: item.subtotal,
       keterangan: alasan,
     })),
     totalQty: items.reduce((s, i) => s + i.qty, 0),
     totalItems: items.length,
     subtotal: totalNilai,
     notes: catatan,
   });

  const handleSave = () => {
    if (!selectedCustomer) return toast({ title: 'Pilih customer', variant: 'destructive' });
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    if (!metodeKembalian) return toast({ title: 'Pilih metode pengembalian', variant: 'destructive' });
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);

    try {
      const payload = {
        customer_id: selectedCustomer,
        date: returDate,
        reason: alasan,
        refund_method: metodeKembalian,
        notes: catatan || undefined,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.nama,
          quantity: item.qty,
          price: item.harga,
        })),
      };

      const response = await createMutation.mutateAsync(payload);
      const returnNumber = response.data?.data?.return_number || response.data?.return_number || 'RTJ-XXXXX';
      const returId = response.data?.data?.id || response.data?.id || 0;

      setLastRetur(returnNumber);
      setLastReturId(returId);
      setSaved(true);
      toast({ title: 'Retur penjualan berhasil', description: returnNumber });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan retur penjualan';
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setItems([]);
    setSaved(false);
    setSelectedCustomer('');
    setAlasan('');
    setMetodeKembalian('');
    setCatatan('');
    setReturDate(new Date().toISOString().split('T')[0]);
  };

   if (saved) {
     return (
       <MainLayout title="Retur Penjualan" subtitle={config.subtitle}>
         <div className="flex flex-col items-center justify-center py-16 gap-6">
           <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
             <CheckCircle2 className="h-10 w-10 text-warning" />
           </div>
           <div className="text-center">
             <h2 className="text-2xl font-bold">{config.title}</h2>
             <p className="text-muted-foreground mt-1">
               No. Retur: <span className="font-mono font-semibold text-primary">{lastRetur}</span>
             </p>
             <p className="text-3xl font-bold text-warning mt-3">{formatRupiah(totalNilai)}</p>
           </div>
           <div className="flex gap-3">
             <Button variant="outline" onClick={() => setPreviewOpen(true)}>Preview & Lebih Lanjut</Button>
             <Button onClick={() => { setItems([]); setSaved(false); setSelectedCustomer(''); setAlasan(''); setMetodeKembalian(''); setCatatan(''); setReturDate(new Date().toISOString().split('T')[0]); }}>Retur Baru</Button>
           </div>
         </div>

         <PrintPreviewDialog
           isOpen={previewOpen}
           onOpenChange={setPreviewOpen}
           data={getPrintData()}
           documentType="retur_penjualan"
         />
       </MainLayout>
     );
   }

  if (isDataLoading) {
    return (
      <MainLayout title="Retur Penjualan" subtitle="Terima retur barang dari customer">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retur Penjualan" subtitle="Terima retur barang dari customer">
      <ReturnTransactionForm
        config={config}
        partners={customers}
        products={products}
        items={items}
        selectedPartner={selectedCustomer}
        selectedProduct={selectedProduct}
        qty={qty}
        alasan={alasan}
        catatan={catatan}
        returDate={returDate}
        metodeKembalian={metodeKembalian}
        confirmOpen={confirmOpen}
        isLoading={createMutation.isPending}
        onItemsChange={setItems}
        onSelectedPartnerChange={setSelectedCustomer}
        onSelectedProductChange={setSelectedProduct}
        onQtyChange={setQty}
        onAlasanChange={setAlasan}
        onCatananChange={setCatatan}
        onReturDateChange={setReturDate}
        onMetodeKembalianChange={setMetodeKembalian}
        onConfirmOpenChange={setConfirmOpen}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReset={resetForm}
        onSave={handleSave}
        onConfirmSave={confirmSave}
      />
    </MainLayout>
  );
};

export default ReturPenjualan;

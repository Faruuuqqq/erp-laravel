import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useProducts } from '@/hooks/api/useProducts';
import { useCreateReturnPurchase } from '@/hooks/api/useReturns';
import { printReturnPurchase } from '@/hooks/api/useReturns';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { ReturnTransactionForm, ReturnSuccessScreen, formatRupiah, type ReturItem, type ReturnFormConfig } from '@/components/forms/ReturnTransactionForm';
import { PrintPreviewDialog } from '@/components/dialogs/PrintPreviewDialog';
import type { Supplier, Product } from '@/types';
import type { TransactionPrintData } from '@/types/print';

const ReturPembelian = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
   const [saved, setSaved] = useState(false);
   const [lastRetur, setLastRetur] = useState('');
   const [lastReturId, setLastReturId] = useState<number>(0);
   const [returDate, setReturDate] = useState(new Date().toISOString().split('T')[0]);
   const [previewOpen, setPreviewOpen] = useState(false);

  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const { data: productsData } = useProducts({ per_page: 200 });
  const createMutation = useCreateReturnPurchase();

  const suppliers = (suppliersData?.data?.data ?? []) as Supplier[];
  const products = (productsData?.data?.data ?? []) as Product[];

  const config: ReturnFormConfig = {
    type: 'purchase',
    title: 'Form Retur Pembelian',
    subtitle: 'Retur berhasil diproses',
    partnerLabel: 'Supplier',
    alertColor: 'destructive',
    alertText: 'Retur pembelian akan mengurangi stok barang dan menyesuaikan nilai utang ke supplier.',
    priceFieldName: 'buyPrice',
    successColorClass: 'text-destructive',
    successBgClass: 'bg-destructive/10',
    summaryColorClass: 'text-destructive',
    summaryBgClass: 'bg-destructive/10',
  };

   const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

   // Build print data from current form state
   const getPrintData = (): TransactionPrintData => ({
     documentType: 'retur_pembelian',
     documentNumber: saved ? lastRetur : undefined,
     savedDocumentId: saved ? lastReturId : undefined,
     date: returDate,
     isSaved: saved,
     supplier: selectedSupplier ? suppliers.find(s => s.id === selectedSupplier) : undefined,
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
    if (!selectedSupplier) return toast({ title: 'Pilih supplier', variant: 'destructive' });
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);

    try {
      const payload = {
        supplier_id: selectedSupplier,
        date: returDate,
        reason: alasan,
        notes: catatan || undefined,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.nama,
          quantity: item.qty,
          price: item.harga,
        })),
      };

      const response = await createMutation.mutateAsync(payload);
      const returnNumber = response.data?.data?.return_number || response.data?.return_number || 'RTB-XXXXX';
      const returId = response.data?.data?.id || response.data?.id || 0;

      setLastRetur(returnNumber);
      setLastReturId(returId);
      setSaved(true);
      toast({ title: 'Retur pembelian berhasil', description: returnNumber });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan retur pembelian';
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setItems([]);
    setSaved(false);
    setSelectedSupplier('');
    setAlasan('');
    setCatatan('');
    setReturDate(new Date().toISOString().split('T')[0]);
  };

   if (saved) {
     return (
       <MainLayout title="Retur Pembelian" subtitle={config.subtitle}>
         <div className="flex flex-col items-center justify-center py-16 gap-6">
           <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
             <CheckCircle2 className="h-10 w-10 text-destructive" />
           </div>
           <div className="text-center">
             <h2 className="text-2xl font-bold">Retur Pembelian Diproses</h2>
             <p className="text-muted-foreground mt-1">
               No. Retur: <span className="font-mono font-semibold text-primary">{lastRetur}</span>
             </p>
             <p className="text-3xl font-bold text-destructive mt-3">{formatRupiah(totalNilai)}</p>
           </div>
           <div className="flex gap-3">
             <Button variant="outline" onClick={() => setPreviewOpen(true)}>Preview & Lebih Lanjut</Button>
             <Button onClick={() => { setItems([]); setSaved(false); setSelectedSupplier(''); setAlasan(''); setCatatan(''); setReturDate(new Date().toISOString().split('T')[0]); }}>Retur Baru</Button>
           </div>
         </div>

         <PrintPreviewDialog
           isOpen={previewOpen}
           onOpenChange={setPreviewOpen}
           data={getPrintData()}
           documentType="retur_pembelian"
         />
       </MainLayout>
     );
   }

  return (
    <MainLayout title="Retur Pembelian" subtitle="Buat surat retur barang ke supplier">
      <ReturnTransactionForm
        config={config}
        partners={suppliers}
        products={products}
        items={items}
        selectedPartner={selectedSupplier}
        selectedProduct={selectedProduct}
        qty={qty}
        alasan={alasan}
        catatan={catatan}
        returDate={returDate}
        metodeKembalian=""
        confirmOpen={confirmOpen}
        isLoading={createMutation.isPending}
        onItemsChange={setItems}
        onSelectedPartnerChange={setSelectedSupplier}
        onSelectedProductChange={setSelectedProduct}
        onQtyChange={setQty}
        onAlasanChange={setAlasan}
        onCatananChange={setCatatan}
        onReturDateChange={setReturDate}
        onMetodeKembalianChange={() => {}}
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

export default ReturPembelian;

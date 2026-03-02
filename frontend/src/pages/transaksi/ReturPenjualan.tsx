import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, RotateCcw, Printer, RefreshCw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useCreateReturnSale, usePrintReturnSale } from '@/hooks/api/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface ReturnSaleFormData {
  date: string;
  transactionId: string;
  customerId: string;
  reason: string;
  items: ReturnItem[];
  notes: string;
}

const ReturPenjualan = () => {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const { data: transactions = [] } = useTransactions({ type: 'penjualan_tunai,penjualan_kredit' });
  
  const createReturnSale = useCreateReturnSale();
  const printReturnSale = usePrintReturnSale();
  const [returnId, setReturnId] = useState<string | null>(null);
  
  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      transactionId: '',
      customerId: '',
      reason: '',
      items: [] as ReturnItem[],
      notes: '',
    },
  });
  
  const [currentItem, setCurrentItem] = useState<Partial<ReturnItem>>({
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
  });

  const items = form.watch('items') || [];

  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity! <= 0) return;
    
    const product = products?.find(p => p.id === currentItem.productId);
    if (!product) return;

    const newItem: ReturnItem = {
      productId: currentItem.productId,
      productName: product.name,
      quantity: currentItem.quantity!,
      price: currentItem.price || product.sellPrice,
      discount: 0,
    };

    form.setValue('items', [...items, newItem]);
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    form.setValue('items', items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setCurrentItem({
        ...currentItem,
        productId,
        productName: product.name,
        price: product.sellPrice,
      });
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: ReturnSaleFormData) => {
    const submitData = {
      transactionId: data.transactionId,
      customerId: data.customerId,
      date: data.date,
      reason: data.reason,
      notes: data.notes,
      items: data.items.map((item: ReturnItem) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
      })),
    };

    try {
      const result = await createReturnSale.mutateAsync(submitData);
      setReturnId(result?.id || null);
      form.reset();
      setCurrentItem({
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
      });
      toast.success('Retur penjualan berhasil disimpan');
    } catch (error) {
      console.error('Error creating return sale:', error);
    }
  };

  return (
    <MainLayout title="Retur Penjualan" subtitle="Terima retur barang dari customer">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Form Retur Penjualan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Faktur Penjualan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih faktur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {transactions?.map((tx) => (
                                <SelectItem key={tx.id} value={tx.id}>
                                  {tx.invoiceNumber} - {tx.customer || 'Umum'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pelanggan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pelanggan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers?.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alasan Retur</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih alasan retur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rusak">Barang Rusak</SelectItem>
                            <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                            <SelectItem value="tidak_sesuai">Tidak Sesuai Pesanan</SelectItem>
                            <SelectItem value="kelebihan">Kelebihan Order</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-4 font-medium">Pilih Barang Retur</h4>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Select onValueChange={handleProductSelect} value={currentItem.productId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk dari faktur" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name} - {formatCurrency(product.sellPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                       <FormField
                         control={form.control}
                         name="items"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Qty Retur</FormLabel>
                             <FormControl>
                               <Input
                                 type="number"
                                 placeholder="Qty Retur"
                                 min={1}
                                 value={currentItem.quantity || ''}
                                 onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                               />
                             </FormControl>
                           </FormItem>
                         )}
                       />
                       <Button type="button" onClick={handleAddItem}>
                         <Plus className="mr-2 h-4 w-4" />
                         Tambah
                       </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Harga Jual</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.price)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ringkasan Retur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Item</span>
                    <span>{items.length} produk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Qty</span>
                    <span>{totalQty} pcs</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Nilai Retur</span>
                      <span className="text-xl font-bold text-destructive">{formatCurrency(totalValue)}</span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Catatan retur..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => form.reset()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Batal
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createReturnSale.isPending}>
                    {createReturnSale.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (returnId) {
                        printReturnSale.mutate(returnId);
                      }
                    }}
                    disabled={!returnId || printReturnSale.isPending}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {printReturnSale.isPending ? 'Memuat...' : 'Cetak Surat Retur'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
         </form>
       </Form>
    </MainLayout>
  );
};

export default ReturPenjualan;

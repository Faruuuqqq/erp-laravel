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
import { Plus, Trash2, FileText, Printer, RefreshCw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useProducts } from '@/hooks/api/useProducts';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useCreateReturnPurchase, usePrintReturnPurchase } from '@/hooks/api/useReturns';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface ReturnPurchaseFormData {
  date: string;
  transactionId: string;
  supplierId: string;
  reason: string;
  items: ReturnItem[];
  notes: string;
}

const ReturPembelian = () => {
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: transactions = [] } = useTransactions({ type: 'pembelian' });

  const createReturnPurchase = useCreateReturnPurchase();
  const printReturnPurchase = usePrintReturnPurchase();
  const [returnId, setReturnId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      transactionId: '',
      supplierId: '',
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
    discount: 0,
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
      price: currentItem.price || product.buyPrice,
      discount: currentItem.discount || 0,
    };

    form.setValue('items', [...items, newItem]);
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
      discount: 0,
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
        price: product.buyPrice,
        discount: 0,
      });
    }
  };

  const totalValue = items.reduce((sum, item) => {
    const discountFactor = 1 - ((item.discount || 0) / 100);
    return sum + (item.quantity * item.price * discountFactor);
  }, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: ReturnPurchaseFormData) => {
    const submitData = {
      transactionId: data.transactionId,
      supplierId: data.supplierId,
      date: data.date,
      reason: data.reason,
      notes: data.notes,
      items: data.items.map((item: ReturnItem) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      })),
    };

    try {
      const result = await createReturnPurchase.mutateAsync(submitData);
      setReturnId(result?.id || null);
      form.reset();
      setCurrentItem({
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
        discount: 0,
      });
      toast.success('Retur pembelian berhasil disimpan');
    } catch (error) {
      console.error('Error creating return purchase:', error);
    }
  };

  return (
    <MainLayout title="Retur Pembelian" subtitle="Kirim retur barang ke supplier">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-destructive" />
                    Form Retur Pembelian
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
                          <FormLabel>No. Faktur Pembelian</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih faktur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {transactions?.map((tx) => (
                                <SelectItem key={tx.id} value={tx.id}>
                                  {tx.invoiceNumber} - {tx.supplier || 'Umum'}
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
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers?.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
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
                        <Label>Produk</Label>
                        <Select onValueChange={handleProductSelect} value={currentItem.productId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk dari faktur" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name} - {formatCurrency(product.buyPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Qty Retur</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qty Retur"
                          value={currentItem.quantity || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Diskon (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Diskon"
                          value={currentItem.discount || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, discount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button type="button" onClick={handleAddItem} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Harga Beli</TableHead>
                        <TableHead className="text-right">Diskon</TableHead>
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
                          <TableCell className="text-right">{item.discount || 0}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.price * (1 - ((item.discount || 0) / 100)))}
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
                    <Button type="submit" className="flex-1" disabled={createReturnPurchase.isPending}>
                      {createReturnPurchase.isPending ? (
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
                        printReturnPurchase.mutate(returnId);
                      }
                    }}
                    disabled={!returnId || printReturnPurchase.isPending}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {printReturnPurchase.isPending ? 'Memuat...' : 'Cetak Surat Retur'}
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

export default ReturPembelian;

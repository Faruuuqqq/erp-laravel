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
import { Plus, Trash2, FileText, Printer, Truck, RefreshCw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSales } from '@/hooks/api/useSales';
import { useTransactions } from '@/hooks/api/useTransactions';
import { useCreateDeliveryNote, usePrintDeliveryNote } from '@/hooks/api/useDeliveryNotes';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface DeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface DeliveryNoteFormData {
  date: string;
  transactionId: string;
  customerId: string;
  driver: string;
  vehiclePlate: string;
  address: string;
  notes: string;
  items: DeliveryItem[];
}

const SuratJalan = () => {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const { data: sales = [] } = useSales();
  const { data: transactions = [] } = useTransactions({
    type: 'penjualan_tunai,penjualan_kredit',
  });

  const createDeliveryNote = useCreateDeliveryNote();
  const printDeliveryNote = usePrintDeliveryNote();

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      transactionId: '',
      customerId: '',
      driver: '',
      vehiclePlate: '',
      address: '',
      notes: '',
      items: [] as DeliveryItem[],
    },
  });

  const [currentItem, setCurrentItem] = useState<Partial<DeliveryItem>>({
    productId: '',
    productName: '',
    quantity: 1,
    unit: 'pcs',
  });

  const items = form.watch('items') || [];

  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity! <= 0) return;

    const product = products?.find(p => p.id === currentItem.productId);
    if (!product) return;

    const newItem: DeliveryItem = {
      productId: currentItem.productId,
      productName: product.name,
      quantity: currentItem.quantity!,
      unit: product.unit,
    };

    form.setValue('items', [...items, newItem]);
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      unit: 'pcs',
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
        unit: product.unit,
      });
    }
  };

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: DeliveryNoteFormData) => {
    if (items.length === 0) {
      toast.error('Harap tambahkan minimal 1 barang');
      return;
    }

    const submitData = {
      date: data.date,
      transactionId: data.transactionId,
      customerId: data.customerId,
      driver: data.driver,
      vehiclePlate: data.vehiclePlate,
      address: data.address,
      notes: data.notes,
    };

    try {
      const result = await createDeliveryNote.mutateAsync(submitData);
      toast.success('Surat jalan berhasil dibuat');

      // Print automatically after creation
      if (result?.id) {
        await printDeliveryNote.mutateAsync(result.id);
      }

      form.reset();
      setCurrentItem({
        productId: '',
        productName: '',
        quantity: 1,
        unit: 'pcs',
      });
    } catch (error) {
      console.error('Error creating delivery note:', error);
    }
  };

  return (
    <MainLayout title="Surat Jalan" subtitle="Buat surat jalan untuk pengiriman barang">
      <Alert className="mb-6 border-primary/50 bg-primary/10">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          Surat jalan tidak mencantumkan harga. Digunakan sebagai bukti serah terima barang.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Form Surat Jalan
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
                          <FormLabel>No. Faktur</FormLabel>
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
                          <FormLabel>Customer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih customer" />
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Pengiriman</FormLabel>
                        <FormControl>
                          <Input placeholder="Alamat tujuan pengiriman" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="driver"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pengirim/Driver</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama driver" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehiclePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plat Kendaraan</FormLabel>
                          <FormControl>
                            <Input placeholder="B 1234 CD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-4 font-medium">Tambah Barang</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <Label>Produk</Label>
                        <Select onValueChange={handleProductSelect} value={currentItem.productId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={currentItem.quantity || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
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
                        <TableHead>Nama Barang</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Satuan</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.unit}</TableCell>
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
                  <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Jenis Barang</span>
                    <span>{items.length} produk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Quantity</span>
                    <span>{totalQty} pcs</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Pengiriman</FormLabel>
                        <FormControl>
                          <Input placeholder="Catatan khusus..." {...field} />
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
                    <Button type="submit" className="flex-1" disabled={createDeliveryNote.isPending || printDeliveryNote.isPending}>
                      {(createDeliveryNote.isPending || printDeliveryNote.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Simpan & Cetak'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
};

export default SuratJalan;

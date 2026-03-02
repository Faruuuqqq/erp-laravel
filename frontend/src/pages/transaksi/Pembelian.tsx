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
import {
  Plus,
  ShoppingCart,
  RefreshCw,
  Printer,
  Download,
  Trash2,
  Calculator,
} from 'lucide-react';
import { useTransactionForm } from '@/hooks/forms';
import { usePaginatedSuppliers } from '@/hooks/api/usePaginated';
import { usePaginatedProducts } from '@/hooks/api/usePaginated';
import { useCustomers } from '@/hooks/api/useCustomers';
import { formatCurrency } from '@/lib/utils';
import type { TransactionItemFormData } from '@/types';

const Pembelian = () => {
  const { data: products } = usePaginatedProducts({ search });
  const { data: suppliers } = usePaginatedSuppliers();
  const transactionForm = useTransactionForm();
  const { form, calculateTotals, onSubmit } = transactionForm;
  
  form.setValue('type', 'pembelian');
  
  const { subtotal, total } = calculateTotals();
  
  const [currentItem, setCurrentItem] = useState<Partial<TransactionItemFormData>>({
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

    const newItem: TransactionItemFormData = {
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
      });
    }
  };

  return (
    <MainLayout title="Transaksi Pembelian" subtitle="Buat transaksi pembelian barang dari supplier">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Form Pembelian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Faktur</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Auto-generated" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-4 font-medium">Tambah Produk</h4>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <Select onValueChange={handleProductSelect} value={currentItem.productId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk" />
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
                      <Input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={currentItem.quantity || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        placeholder="Diskon"
                        min={0}
                        max={100}
                        value={currentItem.discount || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, discount: parseInt(e.target.value) || 0 })}
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
                          <TableCell className="text-right">{item.discount}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.price * (1 - item.discount / 100))}
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
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Ringkasan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between text-sm items-center gap-2">
                          <span className="text-muted-foreground">Diskon</span>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="w-24 text-right"
                              min={0}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between text-sm items-center gap-2">
                          <span className="text-muted-foreground">PPN (11%)</span>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="w-24 text-right"
                              min={0}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Metode Pembayaran</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                        <SelectItem value="credit">Kredit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

        <div className="flex gap-2 pt-4">
                     <Button
                       type="button"
                       variant="outline"
                       className="flex-1"
                       onClick={() => form.reset()}
                     >
                       <RefreshCw className="mr-2 h-4 w-4" />
                       Reset
                     </Button>
                     <Button type="submit" className="flex-1" disabled={transactionForm.isCreating}>
                       {transactionForm.isCreating ? 'Menyimpan...' : 'Simpan'}
                     </Button>
                     <div className="flex gap-2">
                       <Button 
                         type="button"
                         variant="outline"
                         className="flex-1"
                         onClick={() => {
                           const saleId = form.getValues('salesId');
                           if (saleId) {
                             window.open(`/api/transactions/${saleId}/print/invoice`, '_blank');
                           }
                         }}
                         disabled={!form.getValues('salesId')}
                       >
                         <Download className="mr-2 h-4 w-4" />
                         Download Faktur
                       </Button>
                     </div>
                   </div>
                   
                   <Button type="button" variant="outline" className="w-full">
                     <Printer className="mr-2 h-4 w-4" />
                     Cetak Faktur
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

export default Pembelian;

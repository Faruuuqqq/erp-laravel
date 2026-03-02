import { useState, useRef } from 'react';
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
import { Plus, Trash2, CreditCard, Calculator, Printer, Download, FileText, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionForm } from '@/hooks/forms';
import { useProducts } from '@/hooks/api/useProducts';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useSales } from '@/hooks/api/useSales';
import { usePrintInvoice, usePrintReceipt } from '@/hooks/api/usePdf';
import { formatCurrency } from '@/lib/utils';
import type { TransactionItemFormData } from '@/types';

const PenjualanKredit = () => {
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { data: sales } = useSales();
  
  const transactionForm = useTransactionForm();
  const { form, calculateTotals, onSubmit } = transactionForm;
  
  const { subtotal, total } = calculateTotals();
  
  const [currentItem, setCurrentItem] = useState<Partial<TransactionItemFormData>>({
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
    discount: 0,
  });

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const items = form.watch('items') || [];
  const paid = form.watch('paid') || 0;
  const salesId = form.watch('salesId');

  const remainingDebt = total - paid;

  form.setValue('type', 'penjualan_kredit');

  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity! <= 0) return;
    
    const product = products?.find(p => p.id === currentItem.productId);
    if (!product) return;

    const newItem: TransactionItemFormData = {
      productId: currentItem.productId,
      productName: product.name,
      quantity: currentItem.quantity!,
      price: currentItem.price || product.sellPrice,
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
        price: product.sellPrice,
      });
    }
  };

  return (
    <MainLayout title="Penjualan Kredit" subtitle="Buat transaksi penjualan kredit">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Form Penjualan Kredit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
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
                    <FormField
                      control={form.control}
                      name="salesId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih sales" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sales?.map((sales) => (
                                <SelectItem key={sales.id} value={sales.id}>
                                  {sales.name}
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
                                {product.code} - {product.name} - {formatCurrency(product.sellPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        ref={quantityInputRef}
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={currentItem.quantity || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        ref={priceInputRef}
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
                        <TableHead className="text-right">Harga</TableHead>
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
                          <span className="text-muted-foreground">Diskon Total</span>
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
                      <span className="font-semibold">Total Piutang</span>
                      <span className="text-xl font-bold text-warning">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <FormField
                      control={form.control}
                      name="paid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uang Muka (DP)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="text-right text-lg"
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-destructive">Sisa Piutang</span>
                      <span className="font-bold text-destructive">{formatCurrency(remainingDebt)}</span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Catatan tambahan..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={transactionForm.isCreating}>
                      {transactionForm.isCreating ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => form.reset()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        if (salesId) {
                          window.open(`/api/transactions/${salesId}/print/invoice`, '_blank');
                        }
                      }}
                      disabled={!salesId}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Faktur
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        if (salesId) {
                          window.open(`/api/transactions/${salesId}/print/receipt`, '_blank');
                        }
                      }}
                      disabled={!salesId}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Struk
                    </Button>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (salesId) {
                        window.print();
                      }
                    }}
                    disabled={!salesId}
                  >
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

export default PenjualanKredit;

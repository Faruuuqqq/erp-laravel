import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData as TransactionSchemaType } from '@/lib/validations/transaction';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/api/useTransactions';
import { TransactionFormData, Transaction, TransactionItem } from '@/types';
import { generateInvoiceNumber, calculateTotal, calculateChange } from '@/lib/utils';

export const useTransactionForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const form = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      type: 'penjualan_tunai',
      items: [],
      discount: 0,
      tax: 0,
      paid: 0,
    },
  });

  const onSubmit = (data: TransactionSchemaType) => {
    const formData: TransactionFormData = {
      invoiceNumber: data.invoiceNumber || generateInvoiceNumber(data.type),
      date: data.date,
      type: data.type,
      supplierId: data.supplierId || undefined,
      customerId: data.customerId || undefined,
      salesId: data.salesId || undefined,
      items: data.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      discount: data.discount,
      tax: data.tax,
      paid: data.paid,
      notes: data.notes || undefined,
    };
    
    if (editingId) {
      updateTransaction.mutate({ id: editingId, data: formData });
    } else {
      createTransaction.mutate(formData);
    }

    setIsDialogOpen(false);
    setEditingId(null);
    form.reset();
  };

  const calculateTotals = () => {
    const items = form.watch('items') || [];
    const discount = form.watch('discount') || 0;
    const tax = form.watch('tax') || 0;

    const subtotal = calculateTotal(items);
    const total = subtotal - discount + tax;
    const paid = form.watch('paid') || 0;
    const change = calculateChange(paid, total);

    return {
      subtotal,
      total,
      change,
    };
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      type: 'penjualan_tunai',
      items: [],
      discount: 0,
      tax: 0,
      paid: 0,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    form.reset({
      invoiceNumber: transaction.invoiceNumber,
      date: transaction.date,
      type: transaction.type,
      supplierId: transaction.supplierId,
      customerId: transaction.customerId,
      salesId: transaction.salesId,
      items: transaction.items?.map((item: TransactionItem) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      discount: transaction.discount,
      tax: transaction.tax,
      paid: transaction.paid,
      notes: transaction.notes,
    });
    setIsDialogOpen(true);
  };

  return {
    form,
    isDialogOpen,
    setIsDialogOpen,
    onSubmit,
    calculateTotals,
    openCreate,
    openEdit,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    editingId,
  };
};

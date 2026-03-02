import { useState } from 'react';
import { Search, ClipboardList, Printer, Loader2, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTransactions } from '@/hooks/api/useTransactions';
import { usePrintKontraBon } from '@/hooks/api/useKontraBon';
import { useCustomers } from '@/hooks/api/useCustomers';
import { formatCurrency } from '@/lib/utils';

const KontraBon = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  const { data: transactions = [], isLoading } = useTransactions({
    type: 'penjualan_kredit',
  });

  const { data: customersData = [] } = useCustomers();

  const printKontraBon = usePrintKontraBon();

  const transactionsWithBalance = transactions.filter(t => t.remaining > 0);

  const groupedByCustomer = transactionsWithBalance.reduce((acc, tx) => {
    const customerName = tx.customer || 'Unknown';
    if (!acc[customerName]) {
      acc[customerName] = [];
    }
    acc[customerName].push(tx);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const customers = Object.keys(groupedByCustomer);

  const filteredData = Object.entries(groupedByCustomer)
    .filter(([customer]) =>
      filterCustomer === 'all' || customer === filterCustomer
    )
    .filter(([customer]) =>
      customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalKontraBon = transactionsWithBalance.reduce((sum, tx) => sum + tx.remaining, 0);
  const totalTransactions = transactionsWithBalance.length;

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const toggleAllForCustomer = (customer: string, txIds: string[]) => {
    const allSelected = txIds.every(id => selectedTransactions.has(id));
    
    if (allSelected) {
      setSelectedTransactions(prev => {
        const newSet = new Set(prev);
        txIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedTransactions(prev => {
        const newSet = new Set(prev);
        txIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };

  const handlePrint = async (customer: string, customerId?: string) => {
    if (!customerId || selectedTransactions.size === 0) return;
    
    const customerTransactions = transactionsWithBalance.filter(tx => 
      (tx.customer || 'Unknown') === customer && selectedTransactions.has(tx.id)
    );

    if (customerTransactions.length === 0) return;

    try {
      await printKontraBon.mutateAsync({
        customer_id: customerId,
        transaction_ids: Array.from(selectedTransactions),
        interest_rate: 0,
      });
    } catch (error) {
      console.error('Error printing kontra bon:', error);
    }
  };

  return (
    <MainLayout title="Kontra Bon" subtitle="Daftar bon yang belum dilunasi per customer">
      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customer</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Bon</p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Nilai</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(totalKontraBon)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari customer..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterCustomer} 
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="w-48 h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Semua Customer</option>
            {customers.map((cust) => (
              <option key={cust} value={cust}>{cust}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kontra Bon List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Daftar Kontra Bon per Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <PageLoader />
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredData.map(([customer, txs]) => {
                const totalCustomer = txs.reduce((sum, tx) => sum + tx.remaining, 0);
                const totalBon = txs.length;
                const customerData = customersData?.find((c) => c.name === customer);
                const txIds = txs.map((tx) => tx.id);
                const allSelected = txIds.every((id) => selectedTransactions.has(id)) && txIds.length > 0;
                return (
                  <AccordionItem key={customer} value={customer}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={allSelected}
                            onCheckedChange={() => toggleAllForCustomer(customer, txIds)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-semibold">{customer}</span>
                          <Badge variant="secondary">{totalBon} bon</Badge>
                        </div>
                        <span className="text-lg font-bold text-warning">{formatCurrency(totalCustomer)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>No. Faktur</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Jatuh Tempo</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Dibayar</TableHead>
                            <TableHead className="text-right">Sisa</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {txs.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedTransactions.has(tx.id)}
                                  onCheckedChange={() => toggleTransactionSelection(tx.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-primary">{tx.invoiceNumber}</TableCell>
                              <TableCell>{tx.date}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(tx.total)}</TableCell>
                              <TableCell className="text-right text-success">{formatCurrency(tx.paid)}</TableCell>
                              <TableCell className="text-right font-bold text-warning">{formatCurrency(tx.remaining)}</TableCell>
                              <TableCell>
                                <Badge variant={tx.remaining === 0 ? 'default' : 'destructive'}>
                                  {tx.remaining === 0 ? 'Lunas' : 'Belum Lunas'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => handlePrint(customer, customerData?.id)}
                          disabled={txIds.filter(id => selectedTransactions.has(id)).length === 0 || printKontraBon.isPending}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {printKontraBon.isPending ? 'Memproses...' : 'Cetak Kontra Bon'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
              {filteredData.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Tidak ada kontra bon
                </div>
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default KontraBon;

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ClipboardList, FileDown, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useKontraBon, printKontraBon } from '@/hooks/api/useKontraBon';
import type { Customer } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer: { id: string; name: string };
  date: string;
  total: number;
  paid: number;
  remaining: number;
  type: string;
}

const KontraBon = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: customersData } = useCustomers({ per_page: 100 });
  const { data, isLoading, refetch } = useKontraBon({ perPage: 100 });
  const customers = (customersData?.data?.data ?? []) as Customer[];
  const invoices = (data?.data ?? []) as Invoice[];

  const grouped = invoices.reduce<Record<string, Invoice[]>>((acc, item) => {
    const customerName = item.customer?.name || 'Unknown';
    if (!acc[customerName]) acc[customerName] = [];
    acc[customerName].push(item);
    return acc;
  }, {});

  const filteredGrouped = Object.entries(grouped).filter(([customer, items]) => {
    const matchSearch = customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer === 'all' || items[0].customer_id === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const totalNilai = invoices.reduce((s, i) => s + (i.remaining || 0), 0);
  const uniqueCustomers = [...new Set(invoices.map(i => i.customer_id))].length;

  const handlePrint = async (customerId: string, transactionIds: string[]) => {
    try {
      setIsPrinting(true);
      const result = await printKontraBon({
        customer_id: customerId,
        transaction_ids: transactionIds,
        interest_rate: 0,
      });
      window.open(result.url, '_blank');
      toast({ title: 'PDF berhasil dibuat', description: `Billing: ${result.billing_number}` });
    } catch {
      toast({ title: 'Error', description: 'Gagal membuat PDF billing', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsPrinting(true);
      if (invoices.length > 0) {
        const firstCustomerId = invoices[0].customer_id;
        const allIds = invoices.map(i => i.id);
        const result = await printKontraBon({
          customer_id: firstCustomerId,
          transaction_ids: allIds,
          interest_rate: 0,
        });
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        link.click();
        toast({ title: 'PDF berhasil diunduh' });
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal mengunduh PDF', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <MainLayout title="Kontra Bon" subtitle="Bon yang belum dilunasi per customer">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Customer Dengan Bon</p><p className="text-2xl font-bold">{uniqueCustomers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Bon Aktif</p><p className="text-2xl font-bold">{invoices.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Nilai</p><p className="text-2xl font-bold text-warning tabular-nums">{formatRupiah(totalNilai)}</p></CardContent></Card>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Cari customer..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterCustomer} onValueChange={setFilterCustomer}>
            <SelectTrigger className="w-44 text-xs h-8"><SelectValue placeholder="Semua Customer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Customer</SelectItem>
              {customers.filter(c => invoices.some(k => k.customer_id === c.id)).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExportAll} disabled={isPrinting || invoices.length === 0}>
            <FileDown className="h-3.5 w-3.5" />Export PDF
          </Button>
          <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />Cetak
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Daftar Kontra Bon per Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : filteredGrouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tidak ada kontra bon</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrouped.map(([customer, items]) => {
                const totalCustomer = items.reduce((s, i) => s + (i.remaining || 0), 0);
                const customerData = customers.find(c => c.id === items[0].customer_id);
                const isOverLimit = customerData && (customerData.creditLimit || 0) > 0 && (customerData.balance || 0) > (customerData.creditLimit || 0);
                const transactionIds = items.map(i => i.id);

                return (
                  <div key={customer} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        const el = document.getElementById(`kb-${customer}`);
                        if (el) el.classList.toggle('hidden');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {customer.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{customer}</span>
                            {isOverLimit && <Badge variant="destructive" className="text-[9px] h-4 px-1">Over Limit</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{items.length} bon aktif</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-warning tabular-nums">{formatRupiah(totalCustomer)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); handlePrint(items[0].customer_id, transactionIds); }}
                          disabled={isPrinting}
                        >
                          Cetak
                        </Button>
                      </div>
                    </div>
                    <div id={`kb-${customer}`} className="hidden px-4 pb-3">
                      {customerData && (
                        <div className="mb-3 grid grid-cols-3 gap-2 text-xs rounded-lg bg-muted/30 p-2.5">
                          <div><p className="text-muted-foreground">Limit Kredit</p><p className="font-semibold">{formatRupiah(customerData.creditLimit || 0)}</p></div>
                          <div><p className="text-muted-foreground">Total Piutang</p><p className={`font-semibold ${(customerData.balance || 0) > (customerData.creditLimit || 0) ? 'text-destructive' : 'text-warning'}`}>{formatRupiah(customerData.balance || 0)}</p></div>
                          <div><p className="text-muted-foreground">Sisa Limit</p><p className={`font-semibold ${((customerData.creditLimit || 0) - (customerData.balance || 0)) < 0 ? 'text-destructive' : 'text-success'}`}>{formatRupiah((customerData.creditLimit || 0) - (customerData.balance || 0))}</p></div>
                        </div>
                      )}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 text-xs text-muted-foreground">
                            <th className="px-3 py-2 text-left">No. Faktur</th>
                            <th className="px-3 py-2 text-left">Tanggal</th>
                            <th className="px-3 py-2 text-left">Tipe</th>
                            <th className="px-3 py-2 text-right">Total</th>
                            <th className="px-3 py-2 text-right">Terbayar</th>
                            <th className="px-3 py-2 text-right">Sisa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id} className="border-b text-sm">
                              <td className="px-3 py-2 font-mono text-xs text-primary font-semibold">{item.invoice_number}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{item.date}</td>
                              <td className="px-3 py-2 text-xs">{item.type === 'penjualan_tunai' ? 'Penjualan Tunai' : 'Penjualan Kredit'}</td>
                              <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.total)}</td>
                              <td className="px-3 py-2 text-right tabular-nums text-xs text-success">{formatRupiah(item.paid)}</td>
                              <td className="px-3 py-2 text-right font-semibold tabular-nums text-warning">{formatRupiah(item.remaining)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default KontraBon;

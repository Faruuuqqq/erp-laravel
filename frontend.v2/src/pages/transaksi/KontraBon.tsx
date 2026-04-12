import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ClipboardList, Eye, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { usePrint } from '@/contexts/usePrint';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useTransactions } from '@/hooks/api/useTransactions';
import { KontraBonPrint } from '@/components/print/KontraBonPrint';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

const KontraBon = () => {
  const { toast } = useToast();
  const { canPrint } = usePermissions();
  const { user } = useAuth();
  const { printDocument } = usePrint();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');

  const { data: customersData } = useCustomers({ perPage: 200 });
  // Load all outstanding penjualan_kredit (remaining > 0)
  const { data: txData, isLoading } = useTransactions({
    type: 'penjualan_kredit',
    status: 'completed',
    perPage: 500,
  });

  const customers = customersData?.data ?? [];
  const allPiutang: Transaction[] = (txData?.data ?? []).filter(t => (t.remaining ?? 0) > 0);

  // Group by customer - memoize to prevent re-computation
  const grouped = useMemo(() => 
    allPiutang.reduce<Record<string, { name: string; customerId: string; items: Transaction[] }>>((acc, tx) => {
      const cid = tx.customerId ?? 'unknown';
      const cname = tx.customer ?? 'Unknown Customer';
      if (!acc[cid]) acc[cid] = { name: cname, customerId: cid, items: [] };
      acc[cid].items.push(tx);
      return acc;
    }, {}),
    [allPiutang]
  );

  const filteredGrouped = useMemo(() =>
    Object.entries(grouped).filter(([cid, group]) => {
      const matchSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCustomer = filterCustomer === 'all' || cid === filterCustomer;
      return matchSearch && matchCustomer;
    }),
    [grouped, searchTerm, filterCustomer]
  );

  const totalNilai = allPiutang.reduce((s, t) => s + (t.remaining ?? 0), 0);
  const uniqueCustomers = Object.keys(grouped).length;

  // Memoize default expanded items - recompute only when filteredGrouped changes
  const defaultExpanded = useMemo(
    () => filteredGrouped.map(([cid]) => cid),
    [filteredGrouped]
  );

  // Print all filtered kontra bon (per-customer)
  const handlePrintAll = useCallback(() => {
    // If filtering to one customer, print just that customer's kontra bon
    const entries = filteredGrouped;
    if (entries.length === 0) return toast({ title: 'Tidak ada data untuk dicetak', variant: 'destructive' });
    printDocument(
      <div>
        {entries.map(([cid, group]) => (
          <KontraBonPrint
            key={cid}
            customerName={group.name}
            printedBy={user?.name}
            items={group.items.map(t => ({
              invoiceNumber: t.invoiceNumber,
              date: t.date,
              total: t.total,
              paid: t.paid,
              remaining: t.remaining ?? 0,
            }))}
          />
        ))}
      </div>
    );
  }, [filteredGrouped, printDocument, user?.name, toast]);

  // Per-customer print
  const handlePrintCustomer = useCallback((cid: string, group: { name: string; items: Transaction[] }) => {
    printDocument(
      <KontraBonPrint
        customerName={group.name}
        printedBy={user?.name}
        items={group.items.map(t => ({
          invoiceNumber: t.invoiceNumber,
          date: t.date,
          total: t.total,
          paid: t.paid,
          remaining: t.remaining ?? 0,
        }))}
      />
    );
   }, [printDocument, user?.name]);

   return (
    <MainLayout title="Kontra Bon" subtitle="Bon yang belum dilunasi per customer">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Customer Dengan Bon</p>
          <p className="text-2xl font-bold">{isLoading ? '-' : uniqueCustomers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Bon Aktif</p>
          <p className="text-2xl font-bold">{isLoading ? '-' : allPiutang.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Nilai</p>
          <p className="text-2xl font-bold text-warning tabular-nums">{isLoading ? '-' : formatCurrency(totalNilai)}</p>
        </CardContent></Card>
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
              {customers.filter(c => grouped[c.id]).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
          <div className="flex gap-2">
             {canPrint('transactions.kontra_bon') && (
               <>
                 <Button variant="outline" className="h-8 text-xs gap-1.5" disabled title="Gunakan tombol 'Cetak Kontra Bon' di masing-masing customer untuk export PDF">
                   <Eye className="h-3.5 w-3.5" />Lihat PDF
                 </Button>
                 <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={handlePrintAll}>
                   <Printer className="h-3.5 w-3.5" />Cetak Semua
                 </Button>
               </>
             )}
          </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />Daftar Kontra Bon per Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : filteredGrouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>{allPiutang.length === 0 ? 'Tidak ada piutang outstanding' : 'Tidak ada hasil pencarian'}</p>
            </div>
           ) : (
             <Accordion type="multiple" defaultValue={defaultExpanded} className="w-full space-y-2">
              {filteredGrouped.map(([cid, group]) => {
                const totalCustomer = group.items.reduce((s, t) => s + (t.remaining ?? 0), 0);
                const customerData = customers.find(c => c.id === cid);
                const limitKredit = Number(customerData?.creditLimit ?? 0);
                const currentPiutang = Number(customerData?.balance ?? 0);
                const isOverLimit = limitKredit > 0 && currentPiutang > limitKredit;

                return (
                  <AccordionItem key={cid} value={cid} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/30">
                      <div className="flex w-full items-center justify-between pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {group.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{group.name}</span>
                              {isOverLimit && <Badge variant="destructive" className="text-[9px] h-4 px-1">Over Limit</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{group.items.length} bon aktif</p>
                          </div>
                        </div>
                        <span className="text-base font-bold text-warning tabular-nums">{formatCurrency(totalCustomer)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      {customerData && limitKredit > 0 && (
                        <div className="mb-3 grid grid-cols-3 gap-2 text-xs rounded-lg bg-muted/30 p-2.5">
                          <div><p className="text-muted-foreground">Limit Kredit</p><p className="font-semibold">{formatCurrency(limitKredit)}</p></div>
                          <div><p className="text-muted-foreground">Total Piutang</p><p className={`font-semibold ${isOverLimit ? 'text-destructive' : 'text-warning'}`}>{formatCurrency(currentPiutang)}</p></div>
                          <div><p className="text-muted-foreground">Sisa Limit</p><p className={`font-semibold ${limitKredit - currentPiutang < 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(limitKredit - currentPiutang)}</p></div>
                        </div>
                      )}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">No. Faktur</TableHead>
                            <TableHead className="text-xs">Tanggal</TableHead>
                            <TableHead className="text-xs text-right">Total</TableHead>
                            <TableHead className="text-xs text-right">Terbayar</TableHead>
                            <TableHead className="text-xs text-right">Sisa</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map(item => (
                            <TableRow key={item.id} className="text-sm">
                              <TableCell className="font-mono text-xs text-primary font-semibold">{item.invoiceNumber}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                              <TableCell className="text-right tabular-nums text-xs">{formatCurrency(item.total)}</TableCell>
                              <TableCell className="text-right tabular-nums text-xs text-success">{formatCurrency(item.paid)}</TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(item.remaining ?? 0)}</TableCell>
                              <TableCell>
                                <Badge variant={item.paid > 0 ? 'outline' : 'destructive'} className="text-xs">
                                  {item.paid > 0 ? 'Sebagian' : 'Belum Lunas'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {canPrint('transactions.kontra_bon') && (
                        <div className="flex justify-end mt-3">
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => handlePrintCustomer(cid, group)}>
                            <Printer className="h-3 w-3" />Cetak Kontra Bon
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default KontraBon;

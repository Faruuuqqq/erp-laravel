import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, ClipboardList, FileDown, Printer } from 'lucide-react';
import { Badge as BadgeUi } from '@/components/ui/badge';
import { CUSTOMERS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface KontraBonItem {
  id: string;
  customerId: string;
  customer: string;
  faktur: string;
  tanggal: string;
  jumlah: number;
  status: 'belum_lunas' | 'sebagian';
}

const kontraBonData: KontraBonItem[] = [
  { id: '1', customerId: 'cus1', customer: 'Toko Makmur Jaya', faktur: 'PJ-2025-027-001', tanggal: '27-02-2025', jumlah: 4_600_000, status: 'belum_lunas' },
  { id: '2', customerId: 'cus1', customer: 'Toko Makmur Jaya', faktur: 'PK-2025-020-003', tanggal: '20-02-2025', jumlah: 2_900_000, status: 'sebagian' },
  { id: '3', customerId: 'cus5', customer: 'UD Berkah Bersama', faktur: 'PJ-2025-026-005', tanggal: '26-02-2025', jumlah: 4_560_000, status: 'belum_lunas' },
  { id: '4', customerId: 'cus5', customer: 'UD Berkah Bersama', faktur: 'PK-2025-015-001', tanggal: '15-02-2025', jumlah: 17_540_000, status: 'belum_lunas' },
  { id: '5', customerId: 'cus3', customer: 'CV Sumber Rejeki', faktur: 'PK-2025-022-001', tanggal: '22-02-2025', jumlah: 1_200_000, status: 'belum_lunas' },
  { id: '6', customerId: 'cus4', customer: 'Toko Aneka Sembako', faktur: 'PK-2025-010-002', tanggal: '10-02-2025', jumlah: 4_200_000, status: 'belum_lunas' },
];

const KontraBon = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');

  const grouped = kontraBonData.reduce<Record<string, KontraBonItem[]>>((acc, item) => {
    if (!acc[item.customer]) acc[item.customer] = [];
    acc[item.customer].push(item);
    return acc;
  }, {});

  const filteredGrouped = Object.entries(grouped).filter(([customer, items]) => {
    const matchSearch = customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer === 'all' || items[0].customerId === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const totalNilai = kontraBonData.reduce((s, i) => s + i.jumlah, 0);
  const uniqueCustomers = [...new Set(kontraBonData.map(i => i.customerId))].length;

  return (
    <MainLayout title="Kontra Bon" subtitle="Bon yang belum dilunasi per customer">
      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Customer Dengan Bon</p><p className="text-2xl font-bold">{uniqueCustomers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Bon Aktif</p><p className="text-2xl font-bold">{kontraBonData.length}</p></CardContent></Card>
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
              {CUSTOMERS.filter(c => kontraBonData.some(k => k.customerId === c.id)).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => toast({ title: 'Mengekspor PDF...' })}>
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
          {filteredGrouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tidak ada kontra bon</p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={filteredGrouped.map(([c]) => c)} className="w-full space-y-2">
              {filteredGrouped.map(([customer, items]) => {
                const totalCustomer = items.reduce((s, i) => s + i.jumlah, 0);
                const customer_ = CUSTOMERS.find(c => c.id === items[0].customerId);
                const isOverLimit = customer_ && customer_.totalPiutang > customer_.limitKredit;
                return (
                  <AccordionItem key={customer} value={customer} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/30">
                      <div className="flex w-full items-center justify-between pr-3">
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
                        <span className="text-base font-bold text-warning tabular-nums">{formatRupiah(totalCustomer)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      {customer_ && (
                        <div className="mb-3 grid grid-cols-3 gap-2 text-xs rounded-lg bg-muted/30 p-2.5">
                          <div><p className="text-muted-foreground">Limit Kredit</p><p className="font-semibold">{formatRupiah(customer_.limitKredit)}</p></div>
                          <div><p className="text-muted-foreground">Total Piutang</p><p className={`font-semibold ${isOverLimit ? 'text-destructive' : 'text-warning'}`}>{formatRupiah(customer_.totalPiutang)}</p></div>
                          <div><p className="text-muted-foreground">Sisa Limit</p><p className={`font-semibold ${customer_.limitKredit - customer_.totalPiutang < 0 ? 'text-destructive' : 'text-success'}`}>{formatRupiah(customer_.limitKredit - customer_.totalPiutang)}</p></div>
                        </div>
                      )}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">No. Faktur</TableHead>
                            <TableHead className="text-xs">Tanggal</TableHead>
                            <TableHead className="text-xs text-right">Jumlah</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(item => (
                            <TableRow key={item.id} className="text-sm">
                              <TableCell className="font-mono text-xs text-primary font-semibold">{item.faktur}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{item.tanggal}</TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(item.jumlah)}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'belum_lunas' ? 'destructive' : 'outline'} className="text-xs">
                                  {item.status === 'belum_lunas' ? 'Belum Lunas' : 'Sebagian'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

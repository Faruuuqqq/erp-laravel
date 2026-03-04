import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Receipt, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface SaldoUtangItem {
  id: string;
  supplier: string;
  totalFaktur: number;
  totalUtang: number;
  lastTransaction: string;
}

const utangData: SaldoUtangItem[] = [
  { id: '1', supplier: 'PT Sumber Makmur', totalFaktur: 2, totalUtang: 10000000, lastTransaction: '2024-01-15' },
  { id: '2', supplier: 'CV Berkah Jaya', totalFaktur: 1, totalUtang: 8500000, lastTransaction: '2024-01-18' },
  { id: '3', supplier: 'UD Sentosa Abadi', totalFaktur: 2, totalUtang: 3200000, lastTransaction: '2024-01-20' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const SaldoUtang = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = utangData.filter((item) =>
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUtang = utangData.reduce((sum, item) => sum + item.totalUtang, 0);
  const totalSupplier = utangData.length;

  return (
    <MainLayout title="Saldo Utang" subtitle="Daftar utang ke supplier">
      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Receipt className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Utang</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalUtang)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier Berutang</p>
                <p className="text-2xl font-bold">{totalSupplier}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Utang</p>
                <p className="text-2xl font-bold">{formatCurrency(totalUtang / totalSupplier)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari supplier..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Utang per Supplier</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Jumlah Faktur</TableHead>
                <TableHead className="text-right">Total Utang</TableHead>
                <TableHead>Transaksi Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.supplier}</TableCell>
                  <TableCell className="text-center">{item.totalFaktur}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">{formatCurrency(item.totalUtang)}</TableCell>
                  <TableCell>{item.lastTransaction}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">TOTAL</TableCell>
                <TableCell className="text-center font-bold">{utangData.reduce((sum, i) => sum + i.totalFaktur, 0)}</TableCell>
                <TableCell className="text-right text-lg font-bold text-destructive">{formatCurrency(totalUtang)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SaldoUtang;

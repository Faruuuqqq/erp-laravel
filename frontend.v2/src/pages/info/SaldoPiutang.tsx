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
import { Search, Wallet, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SaldoPiutangItem {
  id: string;
  customer: string;
  totalFaktur: number;
  totalPiutang: number;
  lastTransaction: string;
}

const piutangData: SaldoPiutangItem[] = [
  { id: '1', customer: 'Toko Makmur', totalFaktur: 3, totalPiutang: 5500000, lastTransaction: '2024-01-20' },
  { id: '2', customer: 'CV Sejahtera', totalFaktur: 2, totalPiutang: 12000000, lastTransaction: '2024-01-19' },
  { id: '3', customer: 'UD Bahagia', totalFaktur: 4, totalPiutang: 8200000, lastTransaction: '2024-01-18' },
  { id: '4', customer: 'PT Sentosa', totalFaktur: 1, totalPiutang: 3200000, lastTransaction: '2024-01-17' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const SaldoPiutang = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = piutangData.filter((item) =>
    item.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPiutang = piutangData.reduce((sum, item) => sum + item.totalPiutang, 0);
  const totalCustomer = piutangData.length;

  return (
    <MainLayout title="Saldo Piutang" subtitle="Daftar piutang dari customer">
      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Wallet className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Piutang</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalPiutang)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Berpiutang</p>
                <p className="text-2xl font-bold">{totalCustomer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Piutang</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPiutang / totalCustomer)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari customer..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Piutang per Customer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Jumlah Faktur</TableHead>
                <TableHead className="text-right">Total Piutang</TableHead>
                <TableHead>Transaksi Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.customer}</TableCell>
                  <TableCell className="text-center">{item.totalFaktur}</TableCell>
                  <TableCell className="text-right font-bold text-warning">{formatCurrency(item.totalPiutang)}</TableCell>
                  <TableCell>{item.lastTransaction}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">TOTAL</TableCell>
                <TableCell className="text-center font-bold">{piutangData.reduce((sum, i) => sum + i.totalFaktur, 0)}</TableCell>
                <TableCell className="text-right text-lg font-bold text-warning">{formatCurrency(totalPiutang)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SaldoPiutang;

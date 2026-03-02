import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart3, Printer, TrendingUp, TrendingDown, Banknote, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useLaporanHarian } from '@/hooks/api/useReports';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const LaporanHarian = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: laporanHarian, isLoading } = useLaporanHarian(date);

  const totalPenjualan = laporanHarian?.byType['penjualan_tunai']?.total || 0;
  const totalPenjualanKredit = laporanHarian?.byType['penjualan_kredit']?.total || 0;
  const totalPenjualanSemua = totalPenjualan + totalPenjualanKredit;
  const totalPembelian = laporanHarian?.byType['pembelian']?.total || 0;
  const totalPenerimaan = laporanHarian?.totalIn || 0;
  const totalPengeluaran = laporanHarian?.totalOut || 0;

  return (
    <MainLayout title="Laporan Harian" subtitle="Ringkasan transaksi harian">
      {/* Date Selection */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Tanggal:</span>
          <Input type="date" className="w-44" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Penjualan</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalPenjualanSemua)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pembelian</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(totalPembelian)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Penerimaan</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalPenerimaan)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <ShoppingCart className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
                <p className="text-xl font-bold">{laporanHarian?.transactionCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ringkasan per Tipe Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <PageLoader />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe Transaksi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(laporanHarian?.byType || {}).map(([type, data]) => (
                  <TableRow key={type}>
                    <TableCell>
                      <Badge variant={
                        type.includes('penjualan') ? 'default' :
                        type.includes('pembelian') ? 'destructive' : 'secondary'
                      }>
                        {type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{data.count} transaksi</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(data.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default LaporanHarian;

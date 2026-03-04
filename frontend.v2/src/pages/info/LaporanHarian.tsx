import { MainLayout } from '@/components/layout/MainLayout';
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
import { BarChart3, Printer, TrendingUp, TrendingDown, Banknote, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const transaksiHarian = [
  { id: '1', waktu: '08:15', faktur: 'PJ-2024-020', tipe: 'Penjualan Tunai', customer: 'Walk-in', jumlah: 150000 },
  { id: '2', waktu: '09:30', faktur: 'PK-2024-015', tipe: 'Penjualan Kredit', customer: 'Toko Makmur', jumlah: 2500000 },
  { id: '3', waktu: '10:45', faktur: 'PJ-2024-021', tipe: 'Penjualan Tunai', customer: 'CV Sejahtera', jumlah: 850000 },
  { id: '4', waktu: '11:20', faktur: 'PB-2024-010', tipe: 'Pembelian', customer: 'PT Sumber Makmur', jumlah: -3200000 },
  { id: '5', waktu: '13:00', faktur: 'PJ-2024-022', tipe: 'Penjualan Tunai', customer: 'Walk-in', jumlah: 75000 },
  { id: '6', waktu: '14:30', faktur: 'BP-2024-005', tipe: 'Bayar Piutang', customer: 'UD Bahagia', jumlah: 1500000 },
  { id: '7', waktu: '15:45', faktur: 'PJ-2024-023', tipe: 'Penjualan Tunai', customer: 'Toko Jaya', jumlah: 320000 },
];

const LaporanHarian = () => {
  const totalPenjualan = transaksiHarian.filter(t => t.jumlah > 0 && t.tipe.includes('Penjualan')).reduce((sum, t) => sum + t.jumlah, 0);
  const totalPembelian = Math.abs(transaksiHarian.filter(t => t.jumlah < 0).reduce((sum, t) => sum + t.jumlah, 0));
  const totalPenerimaan = transaksiHarian.filter(t => t.jumlah > 0).reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <MainLayout title="Laporan Harian" subtitle="Ringkasan transaksi harian">
      {/* Date Selection */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Tanggal:</span>
          <Input type="date" className="w-44" defaultValue={new Date().toISOString().split('T')[0]} />
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
                <p className="text-xl font-bold text-success">{formatCurrency(totalPenjualan)}</p>
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
                <p className="text-xl font-bold">{transaksiHarian.length}</p>
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
            Daftar Transaksi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>No. Faktur</TableHead>
                <TableHead>Tipe Transaksi</TableHead>
                <TableHead>Customer/Supplier</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksiHarian.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.waktu}</TableCell>
                  <TableCell className="font-medium text-primary">{item.faktur}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.tipe.includes('Penjualan') ? 'default' :
                      item.tipe === 'Pembelian' ? 'destructive' : 'secondary'
                    }>
                      {item.tipe}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell className={`text-right font-bold ${item.jumlah >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {item.jumlah >= 0 ? '+' : ''}{formatCurrency(item.jumlah)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="font-bold">SALDO HARIAN</TableCell>
                <TableCell className="text-right text-lg font-bold text-primary">
                  {formatCurrency(transaksiHarian.reduce((sum, t) => sum + t.jumlah, 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default LaporanHarian;

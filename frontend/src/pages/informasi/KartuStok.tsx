import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ClipboardList, Package, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useKartuStok } from '@/hooks/api/useReports';
import { useProducts } from '@/hooks/api/useProducts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const KartuStok = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const { data: products = [] } = useProducts();
  const { data: kartuStok, isLoading } = useKartuStok(selectedProduct);

  const product = products.find(p => p.id === selectedProduct);
  const mutations = kartuStok?.mutations || [];

  const totalMasuk = mutations?.filter(m => m.type === 'IN' || (m.type === 'ADJUSTMENT' && m.quantity > 0))?.reduce((sum, m) => sum + (m.type === 'IN' || m.quantity > 0 ? m.quantity : 0), 0) || 0;
  const totalKeluar = mutations?.filter(m => m.type === 'OUT' || (m.type === 'ADJUSTMENT' && m.quantity < 0))?.reduce((sum, m) => sum + (m.type === 'OUT' || m.quantity < 0 ? Math.abs(m.quantity) : 0), 0) || 0;
  const saldoAkhir = mutations && mutations.length > 0 ? mutations[mutations.length - 1].stockAfter : 0;

  return (
    <MainLayout title="Kartu Stok" subtitle="Histori pergerakan stok per produk">
      {/* Product Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Pilih Produk</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-1 w-72">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.code} - {prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {product && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Satuan</p>
                <p className="text-lg font-bold">{product.unit}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Masuk</p>
                <p className="text-2xl font-bold text-success">{totalMasuk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keluar</p>
                <p className="text-2xl font-bold text-destructive">{totalKeluar}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Akhir</p>
                <p className="text-2xl font-bold text-primary">{saldoAkhir}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kartu Stok Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Kartu Stok - {product ? `${product.code} ${product.name}` : 'Pilih produk terlebih dahulu'}
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
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead className="text-right">Masuk</TableHead>
                  <TableHead className="text-right">Keluar</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mutations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{item.notes || item.type}</TableCell>
                    <TableCell>
                      {item.reference && item.reference !== '-' ? (
                        <span className="font-medium text-primary">{item.reference}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.type === 'IN' || (item.type === 'ADJUSTMENT' && item.quantity > 0) ? (
                        <Badge variant="default" className="bg-success">+{Math.abs(item.quantity)}</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.type === 'OUT' || (item.type === 'ADJUSTMENT' && item.quantity < 0) ? (
                        <Badge variant="destructive">-{Math.abs(item.quantity)}</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-bold">{item.stockAfter}</TableCell>
                  </TableRow>
                ))}
                {mutations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {selectedProduct ? 'Tidak ada data mutasi stok' : 'Pilih produk untuk melihat kartu stok'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default KartuStok;

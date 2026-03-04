import { MainLayout } from '@/components/layout/MainLayout';
import { VirtualTable, type ColumnDef } from '@/components/ui/VirtualTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { Search, Package, Warehouse, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useStockReport } from '@/hooks/api/useReports';
import { formatCurrency } from '@/lib/utils';

const SaldoStok = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useStockReport({ page, perPage });

  const items = data?.data || [];
  const meta = data?.meta;

  const totalValue = items?.reduce((sum, item) => sum + item.stockValue, 0) || 0;
  const totalStok = items?.reduce((sum, item) => sum + item.stock, 0) || 0;
  const lowStockCount = items?.filter((item) => item.stock <= 0).length || 0;

  const columns: ColumnDef[] = [
    {
      key: 'code',
      header: 'Kode',
      render: (item) => <span className="font-mono text-primary">{item.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama Produk',
      render: (item) => item.name,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => <Badge variant="secondary">{item.category}</Badge>,
    },
    {
      key: 'stock',
      header: 'Stok',
      render: (item) => (
        <span className={`font-medium text-right block ${item.stock <= 0 ? 'text-destructive' : ''}`}>
          {item.stock} {item.unit}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'buyPrice',
      header: 'Harga Beli',
      render: (item) => (
        <span className="text-right block">{formatCurrency(item.buyPrice)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'sellPrice',
      header: 'Harga Jual',
      render: (item) => (
        <span className="text-right block">{formatCurrency(item.sellPrice)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'stockValue',
      header: 'Nilai Persediaan',
      render: (item) => (
        <span className="font-bold text-right block">{formatCurrency(item.stockValue)}</span>
      ),
      className: 'text-right',
    },
  ];

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleItemsPerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <MainLayout title="Saldo Stok" subtitle="Informasi stok dan nilai persediaan barang">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{meta?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Unit (Halaman)</p>
                <p className="text-2xl font-bold">{totalStok.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Warehouse className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nilai Persediaan (Halaman)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Package className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Kosong (Halaman)</p>
                <p className="text-2xl font-bold text-destructive">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter (gunakan pagination)..."
              className="pl-9"
              readOnly
            />
          </div>
          <ExportButton
            data={items}
            filename={`saldo_stok_${new Date().toISOString().split('T')[0]}`}
            onPrint={() => window.print()}
            disabled={!items.length}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Stok Barang</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <VirtualTable
            data={items}
            columns={columns}
            rowHeight={48}
            height={500}
            isLoading={isLoading}
            error={error}
            emptyMessage="Tidak ada data stok"
          >
            {meta && (
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                totalItems={meta.total}
                itemsPerPage={perPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </VirtualTable>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SaldoStok;

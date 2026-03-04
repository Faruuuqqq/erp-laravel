import { MainLayout } from '@/components/layout/MainLayout';
import { VirtualTable, type ColumnDef } from '@/components/ui/VirtualTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { Search, RotateCcw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useHistoryReturPembelian } from '@/hooks/api/useReports';
import { formatCurrency } from '@/lib/utils';
import { formatDateRange } from '@/lib/export';

const HistoriReturPembelian = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, error } = useHistoryReturPembelian({
    from: fromDate,
    to: toDate,
    page,
    perPage,
  });

  const returns = data?.data || [];
  const meta = data?.meta;

  const totalReturns = meta?.total || 0;
  const totalItems = returns?.reduce((sum, item) => sum + item.itemsCount, 0) || 0;
  const totalValue = returns?.reduce((sum, item) => sum + item.total, 0) || 0;

  const columns: ColumnDef[] = [
    {
      key: 'invoiceNumber',
      header: 'No. Invoice',
      render: (item) => <span className="font-medium">{item.invoiceNumber}</span>,
    },
    {
      key: 'date',
      header: 'Tanggal',
      render: (item) => new Date(item.date).toLocaleDateString('id-ID'),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (item) => item.supplier,
    },
    {
      key: 'itemsCount',
      header: 'Jumlah Item',
      render: (item) => <span className="text-center block">{item.itemsCount}</span>,
      className: 'text-center',
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => (
        <span className="font-bold text-right block">{formatCurrency(item.total)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'completed'
              ? 'default'
              : item.status === 'partial'
              ? 'secondary'
              : 'destructive'
          }
        >
          {item.status === 'completed'
            ? 'Selesai'
            : item.status === 'partial'
            ? 'Sebagian'
            : 'Batal'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <div className="text-right">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
  ];

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleItemsPerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <MainLayout
      title="Histori Retur Pembelian"
      subtitle="Daftar retur pembelian ke supplier"
    >
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter tanggal..."
            className="pl-9"
            readOnly
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={returns}
            filename={`retur_pembelian_${formatDateRange(fromDate, toDate)}`}
            onPrint={() => window.print()}
            disabled={!returns.length}
            isLoading={isLoading}
          />
          <Input
            type="date"
            className="w-auto"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            className="w-auto"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Retur</p>
                <p className="text-2xl font-bold text-primary">{totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <RotateCcw className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Item (Halaman)</p>
                <p className="text-2xl font-bold text-success">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <RotateCcw className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Nilai (Halaman)</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Retur Pembelian</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <VirtualTable
            data={returns}
            columns={columns}
            rowHeight={48}
            height={500}
            isLoading={isLoading}
            error={error}
            emptyMessage="Tidak ada data retur pembelian"
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

export default HistoriReturPembelian;

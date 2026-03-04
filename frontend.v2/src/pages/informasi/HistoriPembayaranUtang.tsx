import { MainLayout } from '@/components/layout/MainLayout';
import { VirtualTable, type ColumnDef } from '@/components/ui/VirtualTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { Search, Receipt, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useHistoryPembayaranUtang } from '@/hooks/api/useReports';
import { formatCurrency } from '@/lib/utils';
import { formatDateRange } from '@/lib/export';

const HistoriPembayaranUtang = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, error } = useHistoryPembayaranUtang({
    from: fromDate,
    to: toDate,
    page,
    perPage,
  });

  const payments = data?.data || [];
  const meta = data?.meta;

  const totalPaid = payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const paymentCount = meta?.total || 0;

  const columns: ColumnDef[] = [
    {
      key: 'invoiceNumber',
      header: 'No. Invoice',
      render: (item) => <span className="font-medium">{item.invoiceNumber}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (item) => item.supplier,
    },
    {
      key: 'paymentDate',
      header: 'Tanggal Bayar',
      render: (item) => new Date(item.paymentDate).toLocaleDateString('id-ID'),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item) => (
        <span className="font-bold text-success text-right block">{formatCurrency(item.amount)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'reference',
      header: 'Referensi',
      render: (item) => (
        <span className="text-muted-foreground text-sm">{item.reference || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <div className="text-right">
          <Button variant="ghost" size="icon">
            <Receipt className="h-4 w-4" />
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
      title="Histori Pembayaran Utang"
      subtitle="Daftar pembayaran hutang ke supplier"
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
            data={payments}
            filename={`pembayaran_utang_${formatDateRange(fromDate, toDate)}`}
            onPrint={() => window.print()}
            disabled={!payments.length}
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

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Receipt className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dibayar (Halaman)</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Pembayaran</p>
                <p className="text-2xl font-bold text-primary">{paymentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Utang</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <VirtualTable
            data={payments}
            columns={columns}
            rowHeight={48}
            height={500}
            isLoading={isLoading}
            error={error}
            emptyMessage="Tidak ada data pembayaran utang"
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

export default HistoriPembayaranUtang;

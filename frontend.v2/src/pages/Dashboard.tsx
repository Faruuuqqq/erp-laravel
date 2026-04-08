import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp, TrendingDown, Package, Users, ShoppingCart,
  Wallet, AlertTriangle, BarChart3, ArrowRight, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge, CurrencyCell } from '@/components/ui/DataComponents';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats,
  useRecentTransactions,
  useLowStock,
  useFinancialSummary,
  useSalesTrend,
} from '@/hooks/api/useDashboard';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const TIPE_LABEL: Record<string, string> = {
  pembelian: 'Pembelian',
  penjualan_tunai: 'Penjualan Tunai',
  penjualan_kredit: 'Penjualan Kredit',
};

const Dashboard = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();

  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: recentData, isLoading: recentLoading } = useRecentTransactions();
  const { data: lowStockData, isLoading: lowStockLoading } = useLowStock();
  const { data: financialData, isLoading: financialLoading } = useFinancialSummary();
  const { data: trendData, isLoading: trendLoading } = useSalesTrend();

  const stats = statsData?.data?.data ?? {};
  const recentTx = recentData?.data?.data ?? [];
  const lowStock = lowStockData?.data?.data ?? [];
  const financial = financialData?.data?.data ?? {};
  const trendDataFormatted = trendData?.data?.data ?? [];

  const chartData = trendDataFormatted.map((d: any) => ({
    hari: d.name,
    masuk: d.sales || 0,
    keluar: d.purchases || 0,
  }));

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Selamat datang kembali, ${user?.name} · ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
    >
      {/* Smart Alerts */}
      {isOwner && (lowStock.length > 0 || (financial.overdueReceivables ?? 0) > 0) && (
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex-1">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-warning">
                <strong>{lowStock.length} produk</strong> stok di bawah minimum:{' '}
                {lowStock.slice(0, 2).map((p: any) => p.name).join(', ')}{lowStock.length > 2 ? '...' : ''}
              </p>
              <Button size="sm" variant="outline" className="ml-auto shrink-0 h-7 border-warning text-warning hover:bg-warning/10" onClick={() => navigate('/produk')}>
                Lihat
              </Button>
            </div>
          )}
          {(financial.overdueReceivables ?? 0) > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex-1">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                <strong>{financial.overdueReceivables}</strong> piutang jatuh tempo
              </p>
              <Button size="sm" variant="outline" className="ml-auto shrink-0 h-7 border-destructive text-destructive hover:bg-destructive/10" onClick={() => navigate('/laporan/saldo-piutang')}>
                Lihat
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      {statsLoading || financialLoading ? (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Penjualan Hari Ini"
            value={stats.totalSalesToday ?? 0}
            subValue={`${stats.totalTransactionsToday ?? 0} transaksi`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="success"
            trend={stats.salesGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${stats.salesGrowth >= 0 ? '+' : ''}${stats.salesGrowth ?? 0}%`}
            onClick={() => navigate('/informasi/penjualan')}
          />
          <StatCard
            title="Pembelian Hari Ini"
            value={stats.totalPurchasesToday ?? 0}
            icon={<ShoppingCart className="h-5 w-5" />}
            color="primary"
            trend={stats.purchasesGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${stats.purchasesGrowth >= 0 ? '+' : ''}${stats.purchasesGrowth ?? 0}%`}
            onClick={() => navigate('/informasi/pembelian')}
          />
          <StatCard
            title="Total Piutang"
            value={financial.totalReceivables ?? 0}
            subValue="Dari customer aktif"
            icon={<TrendingUp className="h-5 w-5" />}
            color="warning"
            onClick={() => navigate('/laporan/saldo-piutang')}
          />
          <StatCard
            title="Total Utang"
            value={financial.totalPayables ?? 0}
            subValue="Ke supplier"
            icon={<TrendingDown className="h-5 w-5" />}
            color="destructive"
            onClick={() => navigate('/laporan/saldo-utang')}
          />
        </div>
      )}

      {/* Owner-only extra stats */}
      {isOwner && (statsLoading || lowStockLoading ? (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Nilai Stok"
            value={stats.stockValue ?? 0}
            icon={<BarChart3 className="h-5 w-5" />}
            color="primary"
            onClick={() => navigate('/laporan/saldo-stok')}
          />
          <StatCard
            title="Stok Rendah"
            value={`${lowStock.length} Produk`}
            icon={<Package className="h-5 w-5" />}
            color={lowStock.length > 0 ? 'warning' : 'success'}
            onClick={() => navigate('/laporan/saldo-stok')}
          />
          <StatCard
            title="Customer Aktif"
            value={`${stats.activeCustomers ?? 0}`}
            subValue={`${stats.customersGrowth >= 0 ? '+' : ''}${stats.customersGrowth ?? 0}% dari periode lalu`}
            icon={<Users className="h-5 w-5" />}
            color="info"
            onClick={() => navigate('/customer')}
          />
        </div>
      ))}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Cashflow Chart */}
        {isOwner && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Arus Kas Minggu Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="h-[200px] space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="h-[140px] bg-muted rounded mt-4" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Belum ada data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="hari" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [formatRupiah(v), '']}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Bar dataKey="masuk" name="Masuk" fill="hsl(142,71%,38%)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="keluar" name="Keluar" fill="hsl(0,84%,55%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" />Kas Masuk</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive inline-block" />Kas Keluar</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Low Stock */}
        <Card className={!isOwner ? 'lg:col-span-1' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-warning" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Semua stok aman ✓</p>
            ) : (
              lowStock.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[140px]">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Min: {p.minStock} {p.unit}</p>
                  </div>
                  <Badge variant="destructive" className="tabular-nums">{p.stock} {p.unit}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className={isOwner ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Transaksi Terbaru
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/informasi/penjualan')}>
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {recentLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 py-2 border-b">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">No. Faktur</th>
                      <th className="pb-2 font-medium">Nama</th>
                      <th className="pb-2 font-medium">Tipe</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada transaksi</td></tr>
                    ) : (
                      recentTx.slice(0, 5).map((tx: any) => (
                        <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2.5 font-mono text-xs text-primary">{tx.invoice_number}</td>
                          <td className="py-2.5 truncate max-w-[150px]">{tx.customer?.name || tx.supplier?.name || '-'}</td>
                          <td className="py-2.5">
                            <span className="text-xs text-muted-foreground">{TIPE_LABEL[tx.type] || tx.type}</span>
                          </td>
                          <td className="py-2.5 text-right">
                            <CurrencyCell value={tx.total} />
                          </td>
                          <td className="py-2.5">
                            <StatusBadge
                              status={tx.status === 'lunas' ? 'Lunas' : tx.status === 'kredit' ? 'Kredit' : 'Sebagian'}
                              variant={tx.status}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      {!isOwner && (
        <Card className="mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Penjualan Tunai', icon: ShoppingCart, path: '/transaksi/penjualan-tunai', color: 'bg-success' },
                { label: 'Penjualan Kredit', icon: Users, path: '/transaksi/penjualan-kredit', color: 'bg-primary' },
                { label: 'Surat Jalan', icon: Package, path: '/transaksi/surat-jalan', color: 'bg-warning' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors text-left"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-sm">{a.label}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default Dashboard;

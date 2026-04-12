import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp, TrendingDown, Package, Users, ShoppingCart,
  Wallet, AlertTriangle, BarChart3, ArrowRight, Clock, RefreshCw,
} from 'lucide-react';
import {
  useDashboardStats,
  useRecentTransactions,
  useLowStock,
  useSalesTrend,
} from '@/hooks/api/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, CurrencyCell } from '@/components/ui/DataComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

// --- Type helpers -------------------------------------------------------
interface DashboardStats {
  penjualanHariIni?: number;
  pembelianHariIni?: number;
  totalPiutang?: number;
  totalUtang?: number;
  kasHariIni?: number;
  produkStokRendah?: number;
  totalNilaiStok?: number;
  totalTransaksiHariIni?: number;
  trendPenjualan?: number;
  trendPembelian?: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minimumStock?: number;
  unit?: string;
}

interface SalesTrendItem {
  hari?: string;
  day?: string;
  date?: string;
  masuk?: number;
  penjualan?: number;
  keluar?: number;
  pembelian?: number;
}

const TIPE_LABEL: Record<string, string> = {
  penjualan_tunai: 'Penjualan Tunai',
  penjualan_kredit: 'Penjualan Kredit',
  pembelian: 'Pembelian',
  pembayaran_piutang: 'Bayar Piutang',
  pembayaran_utang: 'Bayar Utang',
  retur_pembelian: 'Retur Pembelian',
  retur_penjualan: 'Retur Penjualan',
  surat_jalan: 'Surat Jalan',
};

// -----------------------------------------------------------------------
const Dashboard = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState<'week' | 'month'>('week');

  // --- Real API hooks ---------------------------------------------------
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats('today');
  const { data: recentData, isLoading: recentLoading } = useRecentTransactions('all');
  const { data: lowStockData, isLoading: lowStockLoading } = useLowStock();
  const { data: trendData, isLoading: trendLoading } = useSalesTrend(trendRange);

  const stats: DashboardStats = (statsData as { data?: DashboardStats })?.data ?? {};
  const recentTx: Transaction[] = (recentData as { data?: Transaction[] })?.data ?? [];
  const lowStock: LowStockItem[] = (lowStockData as { data?: LowStockItem[] })?.data ?? [];

  // Map trend data to chart format
  const chartData: SalesTrendItem[] = ((trendData as { data?: SalesTrendItem[] })?.data ?? []).map((d) => ({
    hari: d.hari ?? d.day ?? d.date ?? '',
    masuk: d.masuk ?? d.penjualan ?? 0,
    keluar: d.keluar ?? d.pembelian ?? 0,
  }));

  const overLimitCustomers = stats.produkStokRendah ?? 0; // reuse slot for over-limit if API provides it

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Selamat datang, ${user?.name} · ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
    >
      {/* Smart Alerts */}
      {isOwner && lowStock.length > 0 && (
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex-1">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-sm text-warning">
              <strong>{lowStock.length} produk</strong> stok di bawah minimum:{' '}
              {lowStock.slice(0, 2).map(p => p.name).join(', ')}{lowStock.length > 2 ? '...' : ''}
            </p>
            <Button size="sm" variant="outline" className="ml-auto shrink-0 h-7 border-warning text-warning hover:bg-warning/10" onClick={() => navigate('/produk')}>
              Lihat
            </Button>
          </div>
        </div>
      )}

      {/* Row 1 Stat Cards — semua user */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Penjualan Hari Ini"
              value={stats.penjualanHariIni ?? 0}
              subValue={`${stats.totalTransaksiHariIni ?? 0} transaksi`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="success"
              trend={stats.trendPenjualan != null ? (stats.trendPenjualan >= 0 ? 'up' : 'down') : undefined}
              trendValue={stats.trendPenjualan != null ? `${stats.trendPenjualan > 0 ? '+' : ''}${stats.trendPenjualan}%` : undefined}
              onClick={() => navigate('/informasi/penjualan')}
            />
            <StatCard
              title="Pembelian Hari Ini"
              value={stats.pembelianHariIni ?? 0}
              icon={<ShoppingCart className="h-5 w-5" />}
              color="primary"
              trend={stats.trendPembelian != null ? (stats.trendPembelian >= 0 ? 'up' : 'down') : undefined}
              trendValue={stats.trendPembelian != null ? `${stats.trendPembelian > 0 ? '+' : ''}${stats.trendPembelian}%` : undefined}
              onClick={() => navigate('/informasi/pembelian')}
            />
            <StatCard
              title="Total Piutang"
              value={stats.totalPiutang ?? 0}
              subValue="Dari customer aktif"
              icon={<TrendingUp className="h-5 w-5" />}
              color="warning"
              onClick={() => navigate('/laporan/saldo-piutang')}
            />
            <StatCard
              title="Total Utang"
              value={stats.totalUtang ?? 0}
              subValue="Ke supplier"
              icon={<TrendingDown className="h-5 w-5" />}
              color="destructive"
              onClick={() => navigate('/laporan/saldo-utang')}
            />
          </>
        )}
      </div>

      {/* Row 2 Stat Cards — owner only */}
      {isOwner && (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-7 w-28 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Kas Masuk Hari Ini"
                value={stats.kasHariIni ?? 0}
                icon={<Wallet className="h-5 w-5" />}
                color="info"
              />
              <StatCard
                title="Stok Rendah"
                value={lowStockLoading ? '...' : `${lowStock.length} Produk`}
                icon={<Package className="h-5 w-5" />}
                color={lowStock.length > 0 ? 'warning' : 'success'}
                onClick={() => navigate('/laporan/saldo-stok')}
              />
              <StatCard
                title="Total Nilai Stok"
                value={stats.totalNilaiStok ?? 0}
                icon={<BarChart3 className="h-5 w-5" />}
                color="primary"
                onClick={() => navigate('/laporan/saldo-stok')}
              />
            </>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chart Arus Kas — owner only */}
        {isOwner && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Arus Kas
                </CardTitle>
                <div className="flex gap-1">
                  {(['week', 'month'] as const).map(r => (
                    <Button
                      key={r}
                      variant={trendRange === r ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setTrendRange(r)}
                    >
                      {r === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : chartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  Tidak ada data arus kas
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hari" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v), '']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="masuk" name="Masuk" fill="hsl(142,71%,38%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="keluar" name="Keluar" fill="hsl(0,84%,55%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" />Kas Masuk</div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive inline-block" />Kas Keluar</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stok Menipis */}
        <Card className={!isOwner ? 'lg:col-span-1' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-warning" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)
            ) : lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Semua stok aman ✓</p>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[140px]">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Min: {p.minimumStock ?? 0} {p.unit ?? 'pcs'}</p>
                  </div>
                  <Badge variant="destructive" className="tabular-nums">{p.stock} {p.unit ?? 'pcs'}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Transaksi Terbaru */}
        <Card className={isOwner ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Transaksi Terbaru
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetchStats()} title="Refresh">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/informasi/penjualan')}>
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
              </div>
            ) : recentTx.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi hari ini</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">No. Faktur</th>
                      <th className="pb-2 font-medium">Nama</th>
                      <th className="pb-2 font-medium">Jenis</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.slice(0, 8).map(tx => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2.5 font-mono text-xs text-primary">{tx.invoiceNumber}</td>
                        <td className="py-2.5 truncate max-w-[150px]">{tx.customer || tx.supplier || '-'}</td>
                        <td className="py-2.5">
                          <span className="text-xs text-muted-foreground">{TIPE_LABEL[tx.type] ?? tx.type}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          <CurrencyCell value={tx.total} />
                        </td>
                        <td className="py-2.5">
                          <StatusBadge
                            status={tx.status === 'completed' ? 'Lunas' : tx.status === 'kredit' ? 'Kredit' : tx.status ?? '-'}
                            variant={tx.status === 'completed' ? 'lunas' : tx.status ?? 'default'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

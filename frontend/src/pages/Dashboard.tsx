import { useState, useEffect, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardShimmer } from '@/components/ui/DashboardShimmer';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/auth/useAuth';
import { useDashboardStats, useRecentTransactions, useLowStock } from '@/hooks/api/useDashboard';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Banknote,
  Truck,
  UserCheck,
  Receipt,
  RefreshCw,
  ChevronRight,
  Clock,
  Wallet,
  BarChart3,
  ArrowRight,
  Keyboard,
  Zap,
  MoreHorizontal,
  LayoutGrid,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DateRange = 'today' | 'week' | 'month';

interface StatCard {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
  description: string;
  shortcut?: string;
}

const Dashboard = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: transactions, isLoading: transactionsLoading } = useRecentTransactions();
  const { data: lowStock, isLoading: isLoadingLowStock } = useLowStock();
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [quickActionsLoading, setQuickActionsLoading] = useState<Record<string, boolean>>({});

  const isLoading = statsLoading || transactionsLoading || isLoadingLowStock;

  // Dynamic greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, []);

  // Quick actions with descriptions
  const quickActions: QuickAction[] = useMemo(() => [
    { label: 'Penjualan Tunai', icon: Banknote, path: '/transaksi/penjualan-tunai', color: 'primary', description: 'Buat transaksi penjualan tunai', shortcut: 'Alt + 1' },
    { label: 'Pembelian Baru', icon: ShoppingCart, path: '/transaksi/pembelian', color: 'success', description: 'Buat pembelian baru ke supplier', shortcut: 'Alt + 2' },
    { label: 'Tambah Customer', icon: UserCheck, path: '/customer', color: 'warning', description: 'Tambah customer baru', shortcut: 'Alt + 3' },
    { label: 'Lihat Stok Menipis', icon: AlertTriangle, path: '/produk', color: 'destructive', description: 'Cek produk dengan stok rendah', shortcut: 'Alt + 4' },
    { label: 'Pembayaran Piutang', icon: Receipt, path: '/transaksi/pembayaran-piutang', color: 'info', description: 'Terima pembayaran dari customer', shortcut: 'Alt + 5' },
    { label: 'Pembayaran Utang', icon: Activity, path: 'transaksi/pembayaran-utang', color: 'secondary', description: 'Bayar utang ke supplier', shortcut: 'Alt + 6' },
  ], []);

  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
    secondary: 'bg-secondary/10 text-secondary',
  };

  const cashflowChartData = [
    { name: 'Sen', masuk: 4000, keluar: 2400 },
    { name: 'Sel', masuk: 3000, keluar: 1398 },
    { name: 'Rab', masuk: 2000, keluar: 9800 },
    { name: 'Kam', masuk: 2780, keluar: 3908 },
    { name: 'Jum', masuk: 1890, keluar: 4800 },
    { name: 'Sab', masuk: 2390, keluar: 3800 },
    { name: 'Min', masuk: 3490, keluar: 4300 },
  ];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        e.preventDefault();
        switch(e.key) {
          case '1': navigate(quickActions[0].path); break;
          case '2': navigate(quickActions[1].path); break;
          case '3': navigate(quickActions[2].path); break;
          case '4': navigate(quickActions[3].path); break;
          case '5': navigate(quickActions[4].path); break;
          case '6': navigate(quickActions[5].path); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, quickActions]);

  // Quick action handler with loading feedback
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    setQuickActionsLoading(prev => ({ ...prev, [action.path]: true }));
    try {
      // Simulate navigation delay
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate(action.path);
    } finally {
      setQuickActionsLoading(prev => ({ ...prev, [action.path]: false }));
    }
  }, [navigate]);

  // Date range tab counts for badges
  const dateRangeCounts = useMemo(() => ({
    today: transactions?.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length || 0,
    week: transactions?.filter(t => {
      const d = new Date(t.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= new Date();
    }).length || 0,
    month: transactions?.length || 0,
  }), [transactions]);

  const statCards: StatCard[] = useMemo(() => [
    {
      title: 'Penjualan Hari Ini',
      value: formatCurrency(stats?.totalSalesToday || 0),
      subValue: `${stats?.totalTransactionsToday || 0} transaksi`,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'primary',
      trend: 'up',
      trendValue: '+12.5%',
      onClick: () => navigate('/informasi/penjualan'),
    },
    {
      title: 'Pembelian Hari Ini',
      value: formatCurrency(stats?.totalPurchasesToday || 0),
      icon: <Activity className="h-5 w-5" />,
      color: 'success',
      trend: 'neutral',
      trendValue: '=0%',
      onClick: () => navigate('/informasi/pembelian'),
    },
    {
      title: 'Total Piutang',
      value: formatCurrency(stats?.totalReceivables || 0),
      subValue: `${stats?.overdueReceivables || 0} overdue`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'warning',
      onClick: () => navigate('/informasi/saldo-piutang'),
    },
    {
      title: 'Total Utang',
      value: formatCurrency(stats?.totalPayables || 0),
      subValue: `${stats?.pendingPayments || 0} pending`,
      icon: <Truck className="h-5 w-5" />,
      color: 'destructive',
      onClick: () => navigate('/informasi/saldo-utang'),
    },
  ], [stats, navigate]);

  const financialCards = useMemo(() => [
    {
      title: 'Total Piutang',
      value: stats?.totalReceivables || 0,
      subtitle: `${stats?.overdueReceivables || 0} overdue`,
      icon: <Receipt className="h-6 w-6" />,
      color: 'destructive',
      link: '/informasi/saldo-piutang',
    },
    {
      title: 'Total Utang',
      value: stats?.totalPayables || 0,
      subtitle: `${stats?.pendingPayments || 0} pending`,
      icon: <Truck className="h-6 w-6" />,
      color: 'warning',
      link: '/informasi/saldo-utang',
    },
  ], [stats]);

  if (statsError) {
    return (
      <MainLayout title="Dashboard" subtitle={`${greeting}, ${user?.name}`}>
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-destructive">Gagal memuat data dashboard</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`${greeting} kembali, ${user?.name} · ${new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`}
    >
      {isLoading ? (
        <DashboardShimmer />
      ) : (
        <div className="space-y-6">
          {/* Smart Alerts */}
          {isOwner && lowStock?.length > 0 && (
            <div className="mb-5 flex flex-col sm:flex-row gap-3">
              {lowStock.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex-1 hover:bg-warning/20 transition-colors">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <p className="text-sm text-warning">
                    <strong>{lowStock.length} produk</strong> stok di bawah minimum:{' '}
                    {lowStock.slice(0, 2).map(p => p.name).join(', ')}
                    {lowStock.length > 2 ? '...' : ''}
                  </p>
                  <Button size="sm" variant="outline" className="ml-auto shrink-0 h-7 border-warning text-warning hover:bg-warning/10" onClick={() => navigate('/produk')}>
                    Lihat
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Date Range Selector */}
          <div className="flex items-center justify-between">
            <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <TabsList className="relative">
                {(['today', 'week', 'month'] as DateRange[]).map((range) => (
                  <TabsTrigger key={range} value={range} className="relative">
                    {range === 'today' && (
                      <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold">
                        {dateRangeCounts.today}
                      </span>
                    )}
                    {range === 'today' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full opacity-50" />
                    )}
                    {range === 'today' ? 'Hari Ini' : range === 'week' ? '7 Hari' : 'Bulan Ini'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Aksi Cepat
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" title="Keyboard shortcuts: Alt + 1-6">
                <Keyboard className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => handleQuickAction(action)}
                    disabled={quickActionsLoading[action.path]}
                    className="group relative flex h-20 flex-col gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-accent transition-all active:scale-105"
                  >
                    {quickActionsLoading[action.path] && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${colorMap[action.color as keyof typeof colorMap]}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-muted-foreground">{action.shortcut}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <StatCard
                key={index}
                {...card}
              />
            ))}
          </div>

          {/* Owner-only extra stats */}
          {isOwner && (
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Kas Masuk Hari Ini"
                value={formatCurrency(stats?.cashInToday || 0)}
                icon={<Wallet className="h-5 w-5" />}
                color="info"
                trend="up"
                trendValue="+5.2%"
                onClick={() => navigate('/informasi/saldo-stok')}
              />
              <StatCard
                title="Stok Rendah"
                value={`${stats?.lowStockProducts || 0} Produk`}
                icon={<Package className="h-5 w-5" />}
                color={stats?.lowStockProducts > 0 ? 'warning' : 'success'}
                onClick={() => navigate('/informasi/saldo-stok')}
              />
              <StatCard
                title="Total Nilai Stok"
                value={formatCurrency(stats?.stockValue || 0)}
                icon={<BarChart3 className="h-5 w-5" />}
                color="secondary"
                onClick={() => navigate('/informasi/saldo-stok')}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Financial Summary */}
            <div className="space-y-4">
              {financialCards.map((card, index) => (
                <Card key={index} className="hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${colorMap[card.color as keyof typeof colorMap]}`}>
                          <card.icon />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{card.title}</p>
                          <p className="text-2xl font-bold">{formatCurrency(card.value as number)}</p>
                          <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cashflow Chart */}
            {isOwner && (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Arus Kas Minggu Ini
                    </div>
                  <div className="flex items-center gap-1.5">
                      <div className="text-xs text-muted-foreground">Net:</div>
                      <div className="text-sm font-semibold text-success">
                        {formatCurrency(((cashflowChartData.reduce((sum, d) => sum + d.masuk - d.keluar, 0)) / 7))}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={cashflowChartData} barGap={8} margin={{ top: 20, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Bar dataKey="masuk" name="Masuk" fill="hsl(142,71%,38%)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="keluar" name="Keluar" fill="hsl(0,84%,55%)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" />Kas Masuk
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-destructive inline-block" />Kas Keluar
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">
                        Minggu ini
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Laporan Lengkap
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <Card>
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
                      {!transactions || transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted-foreground">
                            Belum ada transaksi
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 5).map((tx) => (
                          <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2.5 font-mono text-xs text-primary">{tx.invoiceNumber}</td>
                            <td className="py-2.5 truncate max-w-[150px]">{tx.customer || tx.supplier || '-'}</td>
                            <td className="py-2.5">
                              <span className="text-xs text-muted-foreground">{tx.type.replace('_', ' ')}</span>
                            </td>
                            <td className="py-2.5 text-right">
                              {formatCurrency(tx.total)}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`text-xs font-medium ${
                                  tx.paymentStatus === 'lunas' ? 'text-success' : tx.paymentStatus === 'pending' ? 'text-warning' : 'text-orange-600'
                                }`}
                              >
                                {tx.paymentStatus?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Stok Menipis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!lowStock || lowStock.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-4">Semua stok aman ✓</p>
                ) : (
                  lowStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[140px]">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Min: {item.minStock} {item.unit}</p>
                      </div>
                      <span className="text-xs font-semibold text-destructive px-2 py-1 rounded bg-destructive/10">
                        {item.stock} {item.unit}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;

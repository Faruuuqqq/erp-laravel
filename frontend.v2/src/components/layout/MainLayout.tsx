import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Bell, Search, Sun, Moon, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/supplier': 'Supplier',
  '/customer': 'Customer',
  '/produk': 'Produk',
  '/gudang': 'Gudang',
  '/sales': 'Sales',
  '/transaksi/pembelian': 'Transaksi › Pembelian',
  '/transaksi/penjualan-tunai': 'Transaksi › Penjualan Tunai',
  '/transaksi/penjualan-kredit': 'Transaksi › Penjualan Kredit',
  '/transaksi/pembayaran-utang': 'Transaksi › Pembayaran Utang',
  '/transaksi/pembayaran-piutang': 'Transaksi › Pembayaran Piutang',
  '/transaksi/retur-pembelian': 'Transaksi › Retur Pembelian',
  '/transaksi/retur-penjualan': 'Transaksi › Retur Penjualan',
  '/transaksi/surat-jalan': 'Transaksi › Surat Jalan',
  '/transaksi/kontra-bon': 'Transaksi › Kontra Bon',
  '/laporan/saldo-piutang': 'Laporan › Saldo Piutang',
  '/laporan/saldo-utang': 'Laporan › Saldo Utang',
  '/laporan/saldo-stok': 'Laporan › Saldo Stok',
  '/laporan/kartu-stok': 'Laporan › Kartu Stok',
  '/laporan/laporan-harian': 'Laporan › Laporan Harian',
};

export const MainLayout = ({ children, title, subtitle, actions }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const { user, isOwner } = useAuth();
  const location = useLocation();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn('min-h-screen bg-background', dark && 'dark')}>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn(
        'flex min-h-screen flex-col transition-all duration-300',
        collapsed ? 'ml-[60px]' : 'ml-[240px]'
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari..." className="h-8 w-48 pl-8 text-sm" />
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive pulse-dot" />
            </Button>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-xs">
                <p className="font-medium text-foreground">{user?.name || 'User'}</p>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
              </div>
              {isOwner && <Badge variant="outline" className="text-[10px] h-4 px-1 text-warning border-warning">OWNER</Badge>}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};

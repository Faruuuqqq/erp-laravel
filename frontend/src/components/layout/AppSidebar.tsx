import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Warehouse,
  BadgePercent,
  ShoppingCart,
  Banknote,
  CreditCard,
  Receipt,
  RotateCcw,
  FileText,
  ClipboardList,
  History,
  Wallet,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  AlertTriangle,
  Bell,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth/useAuth';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
}

const buildMenu = (isOwner: boolean): MenuItem[] => [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    title: 'Data Utama',
    icon: Users,
    children: [
      { title: 'Supplier', icon: Package, path: '/supplier' },
      { title: 'Customer', icon: UserCheck, path: '/customer' },
      { title: 'Produk', icon: Package, path: '/produk' },
      { title: 'Gudang', icon: Warehouse, path: '/gudang' },
      { title: 'Sales', icon: BadgePercent, path: '/sales' },
    ],
  },
  {
    title: 'Transaksi',
    icon: ShoppingCart,
    children: [
      { title: 'Pembelian', icon: ShoppingCart, path: '/transaksi/pembelian' },
      { title: 'Penjualan Tunai', icon: Banknote, path: '/transaksi/penjualan-tunai' },
      { title: 'Penjualan Kredit', icon: CreditCard, path: '/transaksi/penjualan-kredit' },
      { title: 'Pembayaran Utang', icon: Receipt, path: '/transaksi/pembayaran-utang' },
      { title: 'Pembayaran Piutang', icon: Receipt, path: '/transaksi/pembayaran-piutang' },
      { title: 'Retur Pembelian', icon: RotateCcw, path: '/transaksi/retur-pembelian' },
      { title: 'Retur Penjualan', icon: RotateCcw, path: '/transaksi/retur-penjualan' },
      { title: 'Surat Jalan', icon: FileText, path: '/transaksi/surat-jalan' },
      { title: 'Kontra Bon', icon: ClipboardList, path: '/transaksi/kontra-bon' },
    ],
  },
  {
    title: 'Informasi',
    icon: History,
    children: [
      { title: 'Histori Pembelian', icon: History, path: '/informasi/pembelian' },
      { title: 'Histori Penjualan', icon: History, path: '/informasi/penjualan' },
      { title: 'Histori Retur Pembelian', icon: History, path: '/informasi/retur-pembelian' },
      { title: 'Histori Retur Penjualan', icon: History, path: '/informasi/retur-penjualan' },
      { title: 'Biaya/Jasa', icon: Wallet, path: '/informasi/biaya-jasa' },
      { title: 'Histori Pembayaran Utang', icon: History, path: '/informasi/pembayaran-utang' },
      { title: 'Histori Pembayaran Piutang', icon: History, path: '/informasi/pembayaran-piutang' },
    ],
  },
  {
    title: 'Info Tambahan',
    icon: BarChart3,
    children: [
      { title: 'Saldo Piutang', icon: Wallet, path: '/informasi/saldo-piutang' },
      { title: 'Saldo Utang', icon: Wallet, path: '/informasi/saldo-utang' },
      ...(isOwner ? [{ title: 'Saldo Stok', icon: Package, path: '/informasi/saldo-stok' }] : []),
      { title: 'Kartu Stok', icon: ClipboardList, path: '/informasi/kartu-stok' },
      { title: 'Laporan Harian', icon: BarChart3, path: '/informasi/laporan-harian' },
    ],
  },
  { title: 'Pengaturan', icon: Settings, path: '/pengaturan' },
];

interface NavGroupProps {
  item: MenuItem;
  collapsed: boolean;
}

const NavGroup = ({ item, collapsed }: NavGroupProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isChildActive = item.children?.some(c => c.path === location.pathname);
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!item.children) {
    const isActive = item.path === location.pathname;
    return (
      <button
        onClick={() => item.path && navigate(item.path)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.title : undefined}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="flex-1 text-left truncate">{item.title}</span>}
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isChildActive && 'text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.title : undefined}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
          </>
        )}
      </button>
      {!collapsed && open && (
        <div className="ml-3 mt-0.5 border-l border-sidebar-border pl-3 space-y-0.5">
          {item.children.map(child => (
            <NavChild key={child.title} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const NavChild = ({ item }: { item: MenuItem }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = item.path === location.pathname;
  return (
    <button
      onClick={() => item.path && navigate(item.path)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-primary/20 text-sidebar-primary font-medium'
      )}
    >
      <item.icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{item.title}</span>
    </button>
  );
};

export const AppSidebar = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const menu = buildMenu(isOwner);

  const handleLogout = () => {
    logout();
  };

  return (
     <aside className={cn(
      'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
      collapsed ? 'w-[60px]' : 'w-[240px]'
    )}>
      <div className="flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className={cn(
          'flex h-14 shrink-0 items-center border-b border-sidebar-border px-3 gap-3',
          collapsed && 'justify-center px-2'
        )}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary cursor-pointer transition-all hover:bg-sidebar-primary/80"
            onClick={onToggle}
          >
            <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-sidebar-foreground leading-tight">StoreMate Genie</p>
              <p className="text-[10px] text-sidebar-muted">ERP v2.0</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          {menu.map(item => (
            <NavGroup key={item.title} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className={cn(
        'shrink-0 border-t border-sidebar-border p-2.5',
        collapsed && 'flex flex-col items-center gap-2'
      )}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name}</p>
              <p className="text-[10px] text-sidebar-muted capitalize">{user?.role === 'owner' ? 'Owner' : 'Admin'}</p>
            </div>
            {isOwner && <span className="text-[9px] h-4 px-1 bg-warning/20 text-warning border-0 shrink-0">OWNER</span>}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent/50 px-2.5 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          title="Keluar"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span className="truncate">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

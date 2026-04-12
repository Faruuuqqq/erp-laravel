import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  Bell,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, type PermissionModule } from '@/hooks/usePermissions';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  /** If set, this item is hidden when canView(module) returns false */
  module?: PermissionModule;
  children?: MenuItem[];
}

/**
 * Builds the full menu definition.
 * Items with a `module` key are later filtered based on permissions.
 */
const FULL_MENU: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    title: 'Data Utama',
    icon: Users,
    children: [
      { title: 'Supplier', icon: Package, path: '/supplier', module: 'suppliers' },
      { title: 'Customer', icon: UserCheck, path: '/customer', module: 'customers' },
      { title: 'Produk', icon: Package, path: '/produk', module: 'products' },
      { title: 'Gudang', icon: Warehouse, path: '/gudang', module: 'warehouses' },
      { title: 'Sales', icon: BadgePercent, path: '/sales', module: 'sales_reps' },
    ],
  },
  {
    title: 'Transaksi',
    icon: ShoppingCart,
    children: [
      { title: 'Pembelian', icon: ShoppingCart, path: '/transaksi/pembelian', module: 'transactions.purchase' },
      { title: 'Penjualan Tunai', icon: Banknote, path: '/transaksi/penjualan-tunai', module: 'transactions.cash_sale' },
      { title: 'Penjualan Kredit', icon: CreditCard, path: '/transaksi/penjualan-kredit', module: 'transactions.credit_sale' },
      { title: 'Pembayaran Utang', icon: Receipt, path: '/transaksi/pembayaran-utang', module: 'transactions.payable' },
      { title: 'Pembayaran Piutang', icon: Receipt, path: '/transaksi/pembayaran-piutang', module: 'transactions.receivable' },
      { title: 'Retur Pembelian', icon: RotateCcw, path: '/transaksi/retur-pembelian', module: 'transactions.return_purchase' },
      { title: 'Retur Penjualan', icon: RotateCcw, path: '/transaksi/retur-penjualan', module: 'transactions.return_sale' },
      { title: 'Surat Jalan', icon: FileText, path: '/transaksi/surat-jalan', module: 'transactions.delivery_note' },
      { title: 'Kontra Bon', icon: ClipboardList, path: '/transaksi/kontra-bon', module: 'transactions.kontra_bon' },
    ],
  },
  {
    title: 'Informasi',
    icon: History,
    children: [
      { title: 'Histori Pembelian', icon: History, path: '/informasi/pembelian', module: 'transactions.purchase' },
      { title: 'Histori Penjualan', icon: History, path: '/informasi/penjualan', module: 'transactions.cash_sale' },
      { title: 'Histori Retur Pembelian', icon: History, path: '/informasi/retur-pembelian', module: 'transactions.return_purchase' },
      { title: 'Histori Retur Penjualan', icon: History, path: '/informasi/retur-penjualan', module: 'transactions.return_sale' },
      { title: 'Biaya/Jasa', icon: Wallet, path: '/informasi/biaya-jasa' },
      { title: 'Histori Pembayaran Utang', icon: History, path: '/informasi/pembayaran-utang', module: 'transactions.payable' },
      { title: 'Histori Pembayaran Piutang', icon: History, path: '/informasi/pembayaran-piutang', module: 'transactions.receivable' },
    ],
  },
  {
    title: 'Laporan',
    icon: BarChart3,
    children: [
      { title: 'Saldo Piutang', icon: Wallet, path: '/laporan/saldo-piutang' },
      { title: 'Saldo Utang', icon: Wallet, path: '/laporan/saldo-utang' },
      { title: 'Saldo Stok', icon: Package, path: '/laporan/saldo-stok', module: '__owner_only__' as PermissionModule },
      { title: 'Kartu Stok', icon: ClipboardList, path: '/laporan/kartu-stok' },
      { title: 'Laporan Harian', icon: BarChart3, path: '/laporan/laporan-harian', module: '__owner_only__' as PermissionModule },
    ],
  },
  { title: 'Pengaturan', icon: Settings, path: '/pengaturan', module: 'settings' },
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
  const { canView } = usePermissions();
  const navigate = useNavigate();

  // Filter menu items: items without a module key are always shown.
  // Items WITH a module key are shown only if canView(module) returns true.
  // Group parents are shown only if they have at least one visible child.
  const filterItems = (items: MenuItem[]): MenuItem[] =>
    items
      .map(item => {
        if (item.children) {
          const visibleChildren = item.children.filter(c => !c.module || canView(c.module));
          return visibleChildren.length > 0 ? { ...item, children: visibleChildren } : null;
        }
        if (item.module && !canView(item.module)) return null;
        return item;
      })
      .filter(Boolean) as MenuItem[];

  // Add owner-only items before filtering
  const fullMenuWithOwner: MenuItem[] = [
    ...FULL_MENU,
    ...(isOwner ? [{ title: 'Kelola Admin', icon: Shield, path: '/pengaturan/admin' } as MenuItem] : []),
  ];

  const menu = filterItems(fullMenuWithOwner);

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
              <p className="text-sm font-bold text-sidebar-foreground leading-tight">Inventaris Toko</p>
              <p className="text-[10px] text-sidebar-muted">ERP</p>
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
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name || 'User'}</p>
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

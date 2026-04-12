import { Package, TrendingUp, Settings, Eye, PlusCircle, Edit, Trash, Printer } from 'lucide-react';

export const MODULE_GROUPS = [
  {
    key: 'master',
    label: 'Master Data',
    icon: Package,
    color: 'blue',
    modules: [
      { key: 'products',    label: 'Produk' },
      { key: 'categories',  label: 'Kategori' },
      { key: 'warehouses',  label: 'Gudang' },
      { key: 'suppliers',   label: 'Supplier' },
      { key: 'customers',   label: 'Customer' },
      { key: 'sales_reps',  label: 'Sales' },
    ],
  },
  {
    key: 'transaksi',
    label: 'Transaksi',
    icon: TrendingUp,
    color: 'emerald',
    modules: [
      { key: 'transactions.purchase',        label: 'Pembelian' },
      { key: 'transactions.cash_sale',       label: 'Penjualan Tunai' },
      { key: 'transactions.credit_sale',     label: 'Penjualan Kredit' },
      { key: 'transactions.payable',         label: 'Bayar Utang' },
      { key: 'transactions.receivable',      label: 'Bayar Piutang' },
      { key: 'transactions.return_purchase', label: 'Retur Pembelian' },
      { key: 'transactions.return_sale',     label: 'Retur Penjualan' },
      { key: 'transactions.delivery_note',   label: 'Surat Jalan' },
      { key: 'transactions.kontra_bon',      label: 'Kontra Bon' },
    ],
  },
  {
    key: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
    color: 'orange',
    modules: [
      { key: 'settings', label: 'Pengaturan Toko' },
    ],
  },
];

export const PERMISSION_ACTIONS = [
  { key: 'view',   label: 'Lihat',  icon: Eye,        short: 'V' },
  { key: 'create', label: 'Buat',   icon: PlusCircle, short: 'C' },
  { key: 'update', label: 'Edit',   icon: Edit,       short: 'E' },
  { key: 'delete', label: 'Hapus',  icon: Trash,      short: 'D' },
  { key: 'print',  label: 'Print',  icon: Printer,    short: 'P' },
];

export const ALL_MODULES = MODULE_GROUPS.flatMap(g => g.modules);

export const getGroupSummary = (permissions: Record<string, Record<string, boolean>>, group: typeof MODULE_GROUPS[0]) => {
  const hasAny = group.modules.some(m =>
    Object.values(permissions[m.key] ?? {}).some(Boolean)
  );
  const hasAll = group.modules.every(m =>
    PERMISSION_ACTIONS.every(a => permissions[m.key]?.[a.key])
  );
  return { hasAny, hasAll };
};


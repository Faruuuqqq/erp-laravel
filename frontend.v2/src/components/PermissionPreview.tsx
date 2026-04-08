import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, PlusCircle, Edit, Trash, Printer, CheckCircle2, XCircle } from 'lucide-react';

const MODULES = [
  { key: 'products', label: 'Produk' },
  { key: 'categories', label: 'Kategori' },
  { key: 'warehouses', label: 'Gudang' },
  { key: 'suppliers', label: 'Supplier' },
  { key: 'customers', label: 'Customer' },
  { key: 'sales_reps', label: 'Sales' },
  { key: 'transactions.purchase', label: 'Pembelian' },
  { key: 'transactions.cash_sale', label: 'Penjualan Tunai' },
  { key: 'transactions.credit_sale', label: 'Penjualan Kredit' },
  { key: 'transactions.payable', label: 'Pembayaran Utang' },
  { key: 'transactions.receivable', label: 'Pembayaran Piutang' },
  { key: 'transactions.return_purchase', label: 'Retur Pembelian' },
  { key: 'transactions.return_sale', label: 'Retur Penjualan' },
  { key: 'transactions.delivery_note', label: 'Surat Jalan' },
  { key: 'transactions.kontra_bon', label: 'Kontra Bon' },
  { key: 'settings', label: 'Pengaturan' },
];

const ACTION_ICONS = {
  view: <Eye size={16} />,
  create: <PlusCircle size={16} />,
  update: <Edit size={16} />,
  delete: <Trash size={16} />,
  print: <Printer size={16} />,
};

const ACTION_LABELS = {
  view: 'Lihat',
  create: 'Buat',
  update: 'Edit',
  delete: 'Hapus',
  print: 'Print',
};

interface PermissionPreviewProps {
  permissions: Record<string, Record<string, boolean>>;
  title?: string;
}

export const PermissionPreview = ({ permissions, title = 'Permission Preview' }: PermissionPreviewProps) => {
  const getAccessLevel = () => {
    const modules = Object.keys(permissions);
    const modulesWithAccess = modules.filter(m => {
      const perms = permissions[m];
      return Object.values(perms).some(p => p === true);
    }).length;
    return modulesWithAccess;
  };

  const hasFullAccess = (module: string) => {
    const perms = permissions[module];
    if (!perms) return false;
    const actions = Object.values(perms);
    return actions.filter(p => p === true).length >= 4; // view, create, update, print
  };

  const hasReadOnly = (module: string) => {
    const perms = permissions[module];
    if (!perms) return false;
    const hasView = perms.view === true;
    const hasWrite = (perms.create || perms.update || perms.delete || perms.print) === true;
    return hasView && !hasWrite;
  };

  const getModuleStatus = (module: string) => {
    const perms = permissions[module];
    if (!perms) return 'no-access';
    const trueCount = Object.values(perms).filter(p => p === true).length;
    if (trueCount === 0) return 'no-access';
    if (trueCount >= 4) return 'full-access';
    if (perms.view === true && trueCount === 1) return 'read-only';
    return 'limited-access';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            {title}
            <Badge variant="secondary">{getAccessLevel()} modul</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {MODULES.map(m => {
              const status = getModuleStatus(m.key);
              const perms = permissions[m.key] || {};

              return (
                <div key={m.key} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(perms).map(([action, allowed]) => (
                        <div
                          key={action}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                          title={`${ACTION_LABELS[action as keyof typeof ACTION_LABELS]}: ${allowed ? 'Yes' : 'No'}`}
                        >
                          <span className={`${allowed ? 'text-green-600' : 'text-muted-foreground/50'}`}>
                            {ACTION_ICONS[action as keyof typeof ACTION_ICONS]}
                          </span>
                          <span className={`${allowed ? 'text-green-700 font-medium' : 'text-muted-foreground/50 line-through'}`}>
                            {ACTION_LABELS[action as keyof typeof ACTION_LABELS]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {status === 'full-access' && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 size={12} className="mr-1" /> Penuh
                      </Badge>
                    )}
                    {status === 'read-only' && (
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        <Eye size={12} className="mr-1" /> Baca
                      </Badge>
                    )}
                    {status === 'limited-access' && (
                      <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                        Terbatas
                      </Badge>
                    )}
                    {status === 'no-access' && (
                      <Badge variant="outline" className="text-red-700 border-red-200">
                        <XCircle size={12} className="mr-1" /> Tidak Ada
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Full Access</p>
          <p className="text-lg font-bold">
            {MODULES.filter(m => hasFullAccess(m.key)).length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Limited</p>
          <p className="text-lg font-bold">
            {MODULES.filter(m => {
              const st = getModuleStatus(m.key);
              return st === 'limited-access';
            }).length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Read-Only</p>
          <p className="text-lg font-bold">
            {MODULES.filter(m => hasReadOnly(m.key)).length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">No Access</p>
          <p className="text-lg font-bold">
            {MODULES.filter(m => getModuleStatus(m.key) === 'no-access').length}
          </p>
        </Card>
      </div>
    </div>
  );
};
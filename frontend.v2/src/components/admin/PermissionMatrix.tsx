import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PermissionPreview } from '@/components/PermissionPreview';
import apiClient from '@/lib/api-client';
import { Eye, PlusCircle, Edit, Trash, Printer } from 'lucide-react';

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

const PERMISSION_ACTIONS = [
  { key: 'view', label: 'Lihat', icon: Eye },
  { key: 'create', label: 'Buat', icon: PlusCircle },
  { key: 'update', label: 'Edit', icon: Edit },
  { key: 'delete', label: 'Hapus', icon: Trash },
  { key: 'print', label: 'Print', icon: Printer },
];

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: Record<string, Record<string, boolean>>;
  createdAt: string;
}

interface PermissionMatrixProps {
  admin: Admin | null;
  onClose: () => void;
  onSaved: () => void;
}

export const PermissionMatrix = ({ admin, onClose, onSaved }: PermissionMatrixProps) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (admin) {
      setPermissions(admin.permissions || {});
    }
  }, [admin]);

  const togglePermission = (module: string, action: string) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    if (!admin) return;
    try {
      setIsSaving(true);
      await apiClient.put(`/admins/${admin.id}/permissions`, { permissions });
      toast({ title: 'Berhasil', description: 'Permission berhasil diperbarui' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Error', description: 'Gagal menyimpan permission', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={Boolean(admin)} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Permission — {admin.name}</DialogTitle></DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left: Permission Editor */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Atur Permission</h3>
            <div className="overflow-y-auto max-h-80 space-y-2 border rounded-lg p-3">
              {MODULES.map(mod => (
                <div key={mod.key} className="border rounded p-2">
                  <p className="text-sm font-medium mb-2">{mod.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_ACTIONS.map(a => (
                      <label key={`${mod.key}-${a.key}`} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded text-xs">
                        <Checkbox
                          checked={permissions[mod.key]?.[a.key] || false}
                          onCheckedChange={() => togglePermission(mod.key, a.key)}
                        />
                        {a.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Permission Preview */}
          <div className="space-y-4">
            <PermissionPreview permissions={permissions} title="Preview Akses" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Permission'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionMatrix;

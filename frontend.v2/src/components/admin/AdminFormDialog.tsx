import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

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

interface PermissionPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  isSystem: boolean;
}

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  presets: PermissionPreset[];
  systemPresets: Record<string, any>;
}

export const AdminFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  presets,
  systemPresets,
}: AdminFormDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Error', description: 'Semua field wajib diisi', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      let permissions = undefined;
      if (selectedPreset !== 'default' && selectedPreset !== 'system') {
        const preset = presets.find(p => p.id === selectedPreset);
        permissions = preset?.permissions;
      } else if (selectedPreset === 'system') {
        for (const [key, preset] of Object.entries(systemPresets)) {
          permissions = (preset as any).permissions;
          break;
        }
      }
      await apiClient.post('/admins', { ...form, permissions });
      toast({ title: 'Berhasil', description: `Admin ${form.name} berhasil ditambahkan` });
      setForm({ name: '', email: '', password: '' });
      setSelectedPreset('default');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal menambahkan admin', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Admin Baru</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Nama Admin *</Label>
            <Input placeholder="Nama admin" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" placeholder="admin@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input type="password" placeholder="Minimal 6 karakter" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Template Permission</Label>
            <select
              value={selectedPreset}
              onChange={e => setSelectedPreset(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="default">Default Permissions</option>
              <optgroup label="System Presets">
                {Object.entries(systemPresets).map(([key, preset]: [string, any]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Custom Presets">
                {presets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? 'Menambah...' : 'Tambah Admin'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDialog;

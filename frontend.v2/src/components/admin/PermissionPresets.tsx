import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PermissionPreview } from '@/components/PermissionPreview';
import apiClient from '@/lib/api-client';
import { Plus, Copy, Trash } from 'lucide-react';

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
  { key: 'view', label: 'Lihat' },
  { key: 'create', label: 'Buat' },
  { key: 'update', label: 'Edit' },
  { key: 'delete', label: 'Hapus' },
  { key: 'print', label: 'Print' },
];

interface PermissionPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  isSystem: boolean;
}

interface PermissionPresetsProps {
  presets: PermissionPreset[];
  systemPresets: Record<string, any>;
  onPresetsChange: () => void;
}

export const PermissionPresets = ({ presets, systemPresets, onPresetsChange }: PermissionPresetsProps) => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = async (preset: PermissionPreset) => {
    try {
      await apiClient.delete(`/permission-presets/${preset.slug}`);
      toast({ title: 'Berhasil', description: 'Preset berhasil dihapus' });
      onPresetsChange();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus preset', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (preset: PermissionPreset) => {
    try {
      await apiClient.post(`/permission-presets/${preset.slug}/duplicate`);
      toast({ title: 'Berhasil', description: 'Preset berhasil diduplikasi' });
      onPresetsChange();
    } catch {
      toast({ title: 'Error', description: 'Gagal menduplikasi preset', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>System Presets (Built-in)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(systemPresets).map(([key, preset]: [string, any]) => (
              <Card key={key} className="p-4 border">
                <h4 className="font-semibold text-sm">{preset.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {Object.entries(preset.permissions)
                    .filter(([_, perms]: [string, any]) => perms && Object.values(perms).some((p: boolean) => p))
                    .slice(0, 5)
                    .map(([mod, _]: [string, any]) => (
                      <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Custom Presets</CardTitle>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} className="mr-1" /> Buat Preset Baru
          </Button>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada custom preset</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map(preset => (
                <Card key={preset.id} className="p-4 border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preset.description}</p>
                    </div>
                    {!preset.isSystem && <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(preset)}>
                      <Copy size={14} className="mr-1" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(preset)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePresetDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSaved={onPresetsChange} />
    </div>
  );
};

const CreatePresetDialog = ({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', description: '' });
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const initializePermissions = () => {
    const newPerms: Record<string, Record<string, boolean>> = {};
    MODULES.forEach(m => {
      newPerms[m.key] = {
        view: false,
        create: false,
        update: false,
        delete: false,
        print: false,
      };
    });
    setPermissions(newPerms);
  };

  useEffect(() => {
    if (open) {
      initializePermissions();
      setForm({ name: '', description: '' });
    }
  }, [open]);

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
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Nama preset wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      await apiClient.post('/permission-presets', {
        name: form.name,
        description: form.description,
        permissions,
      });
      toast({ title: 'Berhasil', description: 'Preset berhasil dibuat' });
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal membuat preset', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Buat Permission Preset Baru</DialogTitle></DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left: Basic Info + Editor */}
          <div className="space-y-4">
            <div>
              <Label>Nama Preset *</Label>
              <Input placeholder="e.g., Sales Manager" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi preset ini..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} />
            </div>

            <div>
              <Label className="text-sm">Set Permission</Label>
              <div className="mt-2 space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {MODULES.map(mod => (
                  <div key={mod.key} className="border rounded p-2">
                    <p className="text-xs font-medium mb-1">{mod.label}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {PERMISSION_ACTIONS.map(a => (
                        <label key={`${mod.key}-${a.key}`} className="flex items-center gap-2 cursor-pointer text-xs hover:bg-muted/50 p-0.5 rounded">
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
          </div>

          {/* Right: Preview */}
          <div>
            <PermissionPreview permissions={permissions} title="Preview Preset" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Membuat...' : 'Buat Preset'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionPresets;

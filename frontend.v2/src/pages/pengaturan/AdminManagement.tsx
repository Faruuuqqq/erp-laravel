import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Trash2, Shield, Power, PowerOff, Eye, PlusCircle, Edit, Trash, Printer, Key, Copy, Zap } from 'lucide-react';
import { PermissionPreview } from '@/components/PermissionPreview';
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

interface PermissionPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  isSystem: boolean;
}

const AdminManagement = () => {
  const { isOwner } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [presets, setPresets] = useState<PermissionPreset[]>([]);
  const [systemPresets, setSystemPresets] = useState<Record<string, any>>({});

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admins', { params: { perPage: 100 } });
      setAdmins(res.data.data || []);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data admin', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const [customRes, systemRes] = await Promise.all([
        apiClient.get('/permission-presets'),
        apiClient.get('/admin-presets'),
      ]);
      setPresets(customRes.data.data || []);
      setSystemPresets(systemRes.data.data || {});
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchAdmins();
      fetchPresets();
    }
  }, [isOwner]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Error', description: 'Semua field wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      let permissions = undefined;
      if (selectedPreset !== 'default' && selectedPreset !== 'system') {
        const preset = presets.find(p => p.id === selectedPreset);
        permissions = preset?.permissions;
      } else if (selectedPreset === 'system') {
        // Find selected system preset
        for (const [key, preset] of Object.entries(systemPresets)) {
          permissions = (preset as any).permissions;
          break;
        }
      }
      await apiClient.post('/admins', { ...form, permissions });
      toast({ title: 'Berhasil', description: `Admin ${form.name} berhasil ditambahkan` });
      setForm({ name: '', email: '', password: '' });
      setSelectedPreset('default');
      setIsAddOpen(false);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Gagal menambahkan admin', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      await apiClient.patch(`/admins/${admin.id}/toggle-active`);
      toast({ title: 'Berhasil', description: `Status ${admin.name} telah diubah` });
      fetchAdmins();
    } catch {
      toast({ title: 'Error', description: 'Gagal mengubah status admin', variant: 'destructive' });
    }
  };

  const handleResetPassword = async (admin: Admin) => {
    try {
      const response = await apiClient.post(`/admins/${admin.id}/reset-password`);
      const tempPassword = response.data?.data?.tempPassword;
      toast({
        title: 'Password Reset Berhasil',
        description: `Password sementara: ${tempPassword} (berlaku 24 jam)`,
        variant: 'default',
      });
    } catch {
      toast({ title: 'Error', description: 'Gagal mereset password admin', variant: 'destructive' });
    }
  };

  const handleDelete = async (admin: Admin) => {
    try {
      await apiClient.delete(`/admins/${admin.id}`);
      toast({ title: 'Berhasil', description: `Admin ${admin.name} telah dihapus`, variant: 'destructive' });
      fetchAdmins();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus admin', variant: 'destructive' });
    }
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => onOpenChange(v)}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
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
          <Button variant="outline" onClick={() => { onOpenChange(false); }}>Batal</Button>
          <Button onClick={handleCreate}>Tambah Admin</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Kelola Admin" subtitle="Tambah dan atur permission admin">
      <div className="space-y-6">
        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
            <TabsTrigger value="presets">Permission Presets</TabsTrigger>
          </TabsList>

          {/* Tab 1: Admin Management */}
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Data Admin</CardTitle>
                <Button size="sm" onClick={() => { setForm({ name: '', email: '', password: '' }); setIsAddOpen(true); }}>
                  <Plus size={16} className="mr-1" /> Tambah Admin
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Cari admin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
                </div>

                {isLoading ? (
                  <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada admin</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-2 px-4 font-semibold">Nama</th>
                          <th className="text-left py-2 px-4 font-semibold">Email</th>
                          <th className="text-center py-2 px-4 font-semibold">Permission</th>
                          <th className="text-center py-2 px-4 font-semibold">Status</th>
                          <th className="text-center py-2 px-4 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins
                          .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
                          .map(admin => (
                            <tr key={admin.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-4 font-medium">{admin.name}</td>
                              <td className="py-2 px-4 text-xs">{admin.email}</td>
                              <td className="py-2 px-4 text-center"><PermissionSummary permissions={admin.permissions} /></td>
                              <td className="py-2 px-4 text-center">
                                {admin.isActive
                                  ? <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                                  : <Badge variant="outline" className="text-red-700">Tidak Aktif</Badge>}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => setEditAdmin(admin)} title="Edit Permission">
                                    <Shield size={16} />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(admin)} title={admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                                    {admin.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleResetPassword(admin)} title="Reset Password">
                                    <Key size={16} />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 size={16} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Admin?</AlertDialogTitle>
                                        <AlertDialogDescription>Apakah Anda yakin ingin menghapus {admin.name}?</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(admin)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Permission Presets */}
          <TabsContent value="presets" className="space-y-4">
            <PresetsManager presets={presets} systemPresets={systemPresets} onPresetsChange={fetchPresets} />
          </TabsContent>
        </Tabs>
      </div>

      <PermissionEditor admin={editAdmin} onClose={() => setEditAdmin(null)} onSaved={() => { setEditAdmin(null); fetchAdmins(); }} />
      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Admin Baru" />
    </MainLayout>
  );
};

const PermissionSummary = ({ permissions }: { permissions: Record<string, Record<string, boolean>> }) => {
  const modulesWithAccess = Object.keys(permissions || {}).filter(m => {
    const perms = permissions[m];
    return Object.values(perms).some(p => p === true);
  }).length;
  return <Badge variant="secondary">{modulesWithAccess} modul</Badge>;
};

const PermissionEditor = ({ admin, onClose, onSaved }: { admin: Admin | null; onClose: () => void; onSaved: () => void }) => {
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

const PresetsManager = ({ presets, systemPresets, onPresetsChange }: { presets: PermissionPreset[]; systemPresets: Record<string, any>; onPresetsChange: () => void }) => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPreset, setEditPreset] = useState<PermissionPreset | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

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
                    .filter(([_, perms]: [string, any]) => Object.values(perms).some((p: boolean) => p))
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
          <Button size="sm" onClick={() => { setForm({ name: '', description: '' }); setIsCreateOpen(true); }}>
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

      {/* Create/Edit Dialog */}
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

export default AdminManagement;
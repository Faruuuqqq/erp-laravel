import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Trash2, Shield, Power, PowerOff, Eye, PlusCircle, Edit, Trash, Printer } from 'lucide-react';
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
  const [presets, setPresets] = useState<Record<string, any>>({});

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
      const res = await apiClient.get('/admin-presets');
      setPresets(res.data.data || {});
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
      if (selectedPreset !== 'default' && presets[selectedPreset]) {
        permissions = presets[selectedPreset].permissions;
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

  const handleDelete = async (admin: Admin) => {
    try {
      await apiClient.delete(`/admins/${admin.id}`);
      toast({ title: 'Berhasil', description: `Admin ${admin.name} telah dihapus`, variant: 'destructive' });
      fetchAdmins();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus admin', variant: 'destructive' });
    }
  };

  const filtered = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOwner) {
    return (
      <MainLayout title="Kelola Admin" subtitle="Halaman ini hanya untuk Owner">
        <div className="py-12 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Akses Ditolak</p>
          <p className="text-sm">Halaman ini hanya dapat diakses oleh Owner.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Kelola Admin" subtitle="Tambah dan atur permission admin">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{admins.filter(a => a.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Nonaktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{admins.filter(a => !a.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari admin..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Admin</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Admin Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nama *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@domain.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 karakter" />
              </div>
              <div className="space-y-1.5">
                <Label>Template Permission</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={selectedPreset}
                  onChange={e => setSelectedPreset(e.target.value)}
                >
                  <option value="default">Default (Semua modul aktif)</option>
                  {Object.entries(presets).map(([key, val]: [string, any]) => (
                    <option key={key} value={key}>{val.name} — {val.description}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                <Button onClick={handleCreate}>Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Permission</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Tidak ada admin.</td></tr>
                  ) : (
                    filtered.map(admin => (
                      <tr key={admin.id} className="border-b transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{admin.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={admin.isActive ? 'outline' : 'destructive'} className="text-xs">
                            {admin.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <PermissionSummary permissions={admin.permissions} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditAdmin(admin)} title="Edit Permission">
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(admin)} title={admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                              {admin.isActive ? <PowerOff className="h-3.5 w-3.5 text-warning" /> : <Power className="h-3.5 w-3.5 text-success" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Hapus">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus admin <strong>{admin.name}</strong>?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(admin)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {editAdmin && (
        <PermissionEditor admin={editAdmin} onClose={() => setEditAdmin(null)} onSaved={() => { setEditAdmin(null); fetchAdmins(); }} presets={presets} />
      )}
    </MainLayout>
  );
};

const PermissionSummary = ({ permissions }: { permissions: Record<string, Record<string, boolean>> }) => {
  const modulesWithAccess = Object.keys(permissions || {}).filter(m => {
    const perms = permissions[m];
    return perms && Object.values(perms).some(v => v);
  });
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {modulesWithAccess.length > 5 ? (
        <Badge variant="secondary" className="text-xs">{modulesWithAccess.length} modul</Badge>
      ) : (
        modulesWithAccess.slice(0, 3).map(m => (
          <Badge key={m} variant="secondary" className="text-xs">{m.split('.').pop()}</Badge>
        ))
      )}
    </div>
  );
};

const PermissionEditor = ({ admin, onClose, onSaved, presets }: { admin: Admin; onClose: () => void; onSaved: () => void; presets: Record<string, any> }) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(admin.permissions || {});
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      setIsSaving(true);
      await apiClient.put(`/admins/${admin.id}/permissions`, { permissions });
      toast({ title: 'Berhasil', description: 'Permission berhasil diperbarui' });
      onSaved();
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan permission', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = presets[presetKey];
    if (preset) {
      setPermissions(preset.permissions);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permission — {admin.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2 items-center">
            <Label className="shrink-0">Template:</Label>
            <select
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              onChange={e => applyPreset(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Pilih template...</option>
              {Object.entries(presets).map(([key, val]: [string, any]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <Tabs defaultValue="modules">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
            </TabsList>
            <TabsContent value="modules">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left font-semibold">Modul</th>
                      {PERMISSION_ACTIONS.map(a => (
                        <th key={a.key} className="px-3 py-2 text-center font-semibold">
                          <a.icon className="h-3.5 w-3.5 mx-auto" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(mod => (
                      <tr key={mod.key} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium text-sm">{mod.label}</td>
                        {PERMISSION_ACTIONS.map(a => (
                          <td key={a.key} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={permissions[mod.key]?.[a.key] || false}
                              onChange={() => togglePermission(mod.key, a.key)}
                              className="h-4 w-4 rounded border-input"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminManagement;

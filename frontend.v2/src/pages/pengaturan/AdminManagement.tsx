import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Trash2, Shield, Power, PowerOff, Eye, PlusCircle, Edit, Trash, Printer, CheckSquare, Square, Users, TrendingUp, Settings, Package } from 'lucide-react';
import apiClient from '@/lib/api-client';

// ─── Module Definitions ───────────────────────────────────────────────────────
const MODULE_GROUPS = [
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

const PERMISSION_ACTIONS = [
  { key: 'view',   label: 'Lihat',  icon: Eye,        short: 'V' },
  { key: 'create', label: 'Buat',   icon: PlusCircle, short: 'C' },
  { key: 'update', label: 'Edit',   icon: Edit,       short: 'E' },
  { key: 'delete', label: 'Hapus',  icon: Trash,      short: 'D' },
  { key: 'print',  label: 'Print',  icon: Printer,    short: 'P' },
];

const ALL_MODULES = MODULE_GROUPS.flatMap(g => g.modules);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: Record<string, Record<string, boolean>>;
  createdAt: string;
}

// ─── Default Permissions (all view=true, write=false) ─────────────────────────
const buildDefaultPermissions = (): Record<string, Record<string, boolean>> => {
  const perms: Record<string, Record<string, boolean>> = {};
  ALL_MODULES.forEach(m => {
    perms[m.key] = { view: true, create: false, update: false, delete: false, print: false };
  });
  return perms;
};

const buildFullPermissions = (): Record<string, Record<string, boolean>> => {
  const perms: Record<string, Record<string, boolean>> = {};
  ALL_MODULES.forEach(m => {
    perms[m.key] = { view: true, create: true, update: true, delete: true, print: true };
  });
  return perms;
};

// ─── Permission Summary Helper ────────────────────────────────────────────────
const getGroupSummary = (permissions: Record<string, Record<string, boolean>>, group: typeof MODULE_GROUPS[0]) => {
  const hasAny = group.modules.some(m =>
    Object.values(permissions[m.key] ?? {}).some(Boolean)
  );
  const hasAll = group.modules.every(m =>
    PERMISSION_ACTIONS.every(a => permissions[m.key]?.[a.key])
  );
  return { hasAny, hasAll };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminManagement = () => {
  const { isOwner } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [newAdminPermissions, setNewAdminPermissions] = useState<Record<string, Record<string, boolean>>>(buildDefaultPermissions());

  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await apiClient.get('/admins', { params: { perPage: 100 } });
      return res.data.data as Admin[];
    },
    enabled: isOwner,
  });

  const admins = adminsData ?? [];

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Validasi', description: 'Semua field wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      await apiClient.post('/admins', { ...form, permissions: newAdminPermissions });
      toast({ title: 'Berhasil', description: `Admin ${form.name} berhasil ditambahkan` });
      setForm({ name: '', email: '', password: '' });
      setNewAdminPermissions(buildDefaultPermissions());
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menambahkan admin';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      await apiClient.patch(`/admins/${admin.id}/toggle-active`);
      toast({ title: 'Berhasil', description: `Status ${admin.name} telah diubah` });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch {
      toast({ title: 'Error', description: 'Gagal mengubah status admin', variant: 'destructive' });
    }
  };

  const handleDelete = async (admin: Admin) => {
    try {
      await apiClient.delete(`/admins/${admin.id}`);
      toast({ title: 'Admin dihapus', description: `${admin.name} telah dihapus`, variant: 'destructive' });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
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
    <MainLayout title="Kelola Admin" subtitle="Tambah dan atur permission admin secara granular">
      {/* Stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Total Admin</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{admins.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Power className="h-4 w-4 text-success" />Admin Aktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{admins.filter(a => a.isActive).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PowerOff className="h-4 w-4 text-destructive" />Admin Nonaktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{admins.filter(a => !a.isActive).length}</div></CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari admin..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={isAddOpen} onOpenChange={v => { setIsAddOpen(v); if (!v) { setForm({ name: '', email: '', password: '' }); setNewAdminPermissions(buildDefaultPermissions()); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Admin</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tambah Admin Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Nama *</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" /></div>
                <div className="space-y-1.5"><Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@domain.com" /></div>
              </div>
              <div className="space-y-1.5"><Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 karakter" /></div>

              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Hak Akses</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setNewAdminPermissions(buildDefaultPermissions())}>View Only</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setNewAdminPermissions(buildFullPermissions())}>Full Access</Button>
                  </div>
                </div>
                <PermissionMatrix permissions={newAdminPermissions} onChange={setNewAdminPermissions} compact />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                <Button onClick={handleCreate}>Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Tidak ada admin ditemukan.</p>
            </div>
          ) : filtered.map(admin => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={() => setEditAdmin(admin)}
              onToggleActive={() => handleToggleActive(admin)}
              onDelete={() => handleDelete(admin)}
            />
          ))}
        </div>
      )}

      {/* Permission Editor Dialog */}
      {editAdmin && (
        <PermissionEditorDialog
          admin={editAdmin}
          onClose={() => setEditAdmin(null)}
          onSaved={() => { setEditAdmin(null); queryClient.invalidateQueries({ queryKey: ['admins'] }); }}
        />
      )}
    </MainLayout>
  );
};

// ─── Admin Card ───────────────────────────────────────────────────────────────
const AdminCard = ({ admin, onEdit, onToggleActive, onDelete }: {
  admin: Admin;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) => {
  const groupSummaries = MODULE_GROUPS.map(g => ({
    ...g,
    ...getGroupSummary(admin.permissions ?? {}, g),
  }));

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <span className="text-primary font-bold text-sm">
                {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{admin.name}</p>
                <Badge variant={admin.isActive ? 'default' : 'destructive'} className="text-xs h-5">
                  {admin.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
              {/* Permission badges per category */}
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {groupSummaries.map(g => (
                  <TooltipProvider key={g.key} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border font-medium cursor-default
                          ${g.hasAll ? 'bg-success/10 border-success/40 text-success' :
                            g.hasAny ? 'bg-warning/10 border-warning/40 text-warning' :
                            'bg-muted/60 border-border text-muted-foreground line-through'}`}>
                          <g.icon className="h-3 w-3" />
                          {g.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {g.hasAll ? 'Akses penuh' : g.hasAny ? 'Akses sebagian' : 'Tidak ada akses'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Shield className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Permission</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleActive}>
                    {admin.isActive
                      ? <PowerOff className="h-3.5 w-3.5 text-warning" />
                      : <Power className="h-3.5 w-3.5 text-success" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus admin <strong>{admin.name}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Permission Matrix Component ──────────────────────────────────────────────
const PermissionMatrix = ({
  permissions, onChange, compact = false
}: {
  permissions: Record<string, Record<string, boolean>>;
  onChange: (p: Record<string, Record<string, boolean>>) => void;
  compact?: boolean;
}) => {
  const toggle = (module: string, action: string) => {
    onChange({
      ...permissions,
      [module]: { ...permissions[module], [action]: !permissions[module]?.[action] },
    });
  };

  const toggleRowAll = (moduleKey: string) => {
    const current = permissions[moduleKey] ?? {};
    const allOn = PERMISSION_ACTIONS.every(a => current[a.key]);
    onChange({
      ...permissions,
      [moduleKey]: Object.fromEntries(PERMISSION_ACTIONS.map(a => [a.key, !allOn])),
    });
  };

  const toggleColAll = (action: string, groupModules: { key: string }[]) => {
    const allOn = groupModules.every(m => permissions[m.key]?.[action]);
    const updated = { ...permissions };
    groupModules.forEach(m => {
      updated[m.key] = { ...updated[m.key], [action]: !allOn };
    });
    onChange(updated);
  };

  return (
    <Tabs defaultValue="master" className="w-full">
      <TabsList className="mb-3 h-8">
        {MODULE_GROUPS.map(g => (
          <TabsTrigger key={g.key} value={g.key} className="text-xs px-3 h-7">
            <g.icon className="h-3 w-3 mr-1.5" />{g.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {MODULE_GROUPS.map(group => (
        <TabsContent key={group.key} value={group.key}>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-semibold w-40">Modul</th>
                  {PERMISSION_ACTIONS.map(a => (
                    <th key={a.key} className="px-2 py-2 text-center font-semibold min-w-16">
                      <button
                        className="flex flex-col items-center gap-0.5 mx-auto hover:text-foreground transition-colors"
                        onClick={() => toggleColAll(a.key, group.modules)}
                        title={`Toggle semua ${a.label}`}
                      >
                        <a.icon className="h-3.5 w-3.5" />
                        <span>{a.label}</span>
                      </button>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-xs">Semua</th>
                </tr>
              </thead>
              <tbody>
                {group.modules.map((mod, i) => {
                  const modPerms = permissions[mod.key] ?? {};
                  const allOn = PERMISSION_ACTIONS.every(a => modPerms[a.key]);
                  return (
                    <tr key={mod.key} className={`border-b hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-3 py-2.5 font-medium text-sm">{mod.label}</td>
                      {PERMISSION_ACTIONS.map(a => (
                        <td key={a.key} className="px-2 py-2.5 text-center">
                          {compact ? (
                            <input
                              type="checkbox"
                              checked={modPerms[a.key] ?? false}
                              onChange={() => toggle(mod.key, a.key)}
                              className="h-4 w-4 rounded accent-primary cursor-pointer"
                            />
                          ) : (
                            <Switch
                              checked={modPerms[a.key] ?? false}
                              onCheckedChange={() => toggle(mod.key, a.key)}
                              className="mx-auto"
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => toggleRowAll(mod.key)}
                          className="hover:scale-110 transition-transform"
                          title={allOn ? 'Hapus semua akses' : 'Aktifkan semua akses'}
                        >
                          {allOn
                            ? <CheckSquare className="h-4 w-4 text-primary mx-auto" />
                            : <Square className="h-4 w-4 text-muted-foreground mx-auto" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

// ─── Permission Editor Dialog ─────────────────────────────────────────────────
const PermissionEditorDialog = ({ admin, onClose, onSaved }: {
  admin: Admin;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
    admin.permissions ?? buildDefaultPermissions()
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put(`/admins/${admin.id}/permissions`, { permissions });
      toast({ title: 'Permission diperbarui', description: `Hak akses ${admin.name} berhasil disimpan.` });
      onSaved();
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan permission', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Edit Permission — {admin.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{admin.email}</p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Quick Presets */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
            <Label className="text-sm font-medium shrink-0">Preset Cepat:</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => setPermissions(buildDefaultPermissions())}>
                View Only
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => setPermissions(buildFullPermissions())}>
                Full Access
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => {
                  const p = buildDefaultPermissions();
                  MODULE_GROUPS[0].modules.forEach(m => { p[m.key] = { view: true, create: true, update: true, delete: false, print: true }; });
                  setPermissions(p);
                }}>
                Master Data Only
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => {
                  const p = buildDefaultPermissions();
                  MODULE_GROUPS[1].modules.forEach(m => { p[m.key] = { view: true, create: true, update: false, delete: false, print: true }; });
                  setPermissions(p);
                }}>
                Transaksi Only
              </Button>
            </div>
          </div>

          {/* Matrix */}
          <PermissionMatrix permissions={permissions} onChange={setPermissions} />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Permission'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminManagement;

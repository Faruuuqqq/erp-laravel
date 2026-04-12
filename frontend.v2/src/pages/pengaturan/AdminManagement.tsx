import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Shield, Power, PowerOff, Users } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AdminCard, Admin } from './components/AdminCard';
import { PermissionEditorDialog } from './components/PermissionEditorDialog';
import { PermissionMatrix, buildDefaultPermissions, buildFullPermissions } from './components/PermissionMatrix';
import { AdminManagementSkeleton } from './components/AdminManagementSkeleton';
import { useAdminForm } from '@/hooks/useAdminForm';

const AdminManagement = () => {
  const { isOwner } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [newAdminPermissions, setNewAdminPermissions] = useState<Record<string, Record<string, boolean>>>(buildDefaultPermissions());
  
  const { form, setForm, errors, validateForm, resetForm } = useAdminForm();

  // Queries
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await apiClient.get('/admins', { params: { perPage: 100 } });
      return res.data.data as Admin[];
    },
    enabled: isOwner,
  });

  const admins = useMemo(() => adminsData ?? [], [adminsData]);

  // Mutations with optimistic updates
  const createAdminMutation = useMutation({
    mutationFn: async (payload: typeof form & { permissions: typeof newAdminPermissions }) => {
      return await apiClient.post('/admins', payload);
    },
    onSuccess: (response) => {
      const newAdmin = response.data.data as Admin;
      queryClient.setQueryData(['admins'], (old: Admin[] | undefined) => 
        old ? [...old, newAdmin] : [newAdmin]
      );
      toast({ title: 'Berhasil', description: `Admin ${form.name} berhasil ditambahkan` });
      resetForm();
      setNewAdminPermissions(buildDefaultPermissions());
      setIsAddOpen(false);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menambahkan admin';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (admin: Admin) => {
      return await apiClient.patch(`/admins/${admin.id}/toggle-active`);
    },
    onSuccess: (response, admin) => {
      const updatedAdmin = response.data.data as Admin;
      queryClient.setQueryData(['admins'], (old: Admin[] | undefined) =>
        old ? old.map(a => a.id === admin.id ? updatedAdmin : a) : [updatedAdmin]
      );
      toast({ title: 'Berhasil', description: `Status ${admin.name} telah diubah` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Gagal mengubah status admin', variant: 'destructive' });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (admin: Admin) => {
      return await apiClient.delete(`/admins/${admin.id}`);
    },
    onSuccess: (_, admin) => {
      queryClient.setQueryData(['admins'], (old: Admin[] | undefined) =>
        old ? old.filter(a => a.id !== admin.id) : []
      );
      toast({ title: 'Admin dihapus', description: `${admin.name} telah dihapus`, variant: 'destructive' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Gagal menghapus admin', variant: 'destructive' });
    },
  });

  const handleCreate = useCallback(async () => {
    if (!validateForm(form)) {
      return;
    }
    createAdminMutation.mutate({ ...form, permissions: newAdminPermissions });
  }, [form, newAdminPermissions, validateForm, createAdminMutation]);

  const handleToggleActive = useCallback((admin: Admin) => {
    toggleActiveMutation.mutate(admin);
  }, [toggleActiveMutation]);

  const handleDelete = useCallback((admin: Admin) => {
    deleteAdminMutation.mutate(admin);
  }, [deleteAdminMutation]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      resetForm();
      setNewAdminPermissions(buildDefaultPermissions());
    }
  }, [resetForm]);

  // Filtered admins
  const filtered = useMemo(() => 
    admins.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    ),
    [admins, search]
  );

  // Stats
  const stats = useMemo(() => ({
    total: admins.length,
    active: admins.filter(a => a.isActive).length,
    inactive: admins.filter(a => !a.isActive).length,
  }), [admins]);

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
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Power className="h-4 w-4 text-success" />Admin Aktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{stats.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PowerOff className="h-4 w-4 text-destructive" />Admin Nonaktif</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{stats.inactive}</div></CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari admin..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            aria-label="Search admins by name or email"
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Admin</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tambah Admin Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama *</Label>
                  <Input 
                    id="name"
                    value={form.name} 
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                    placeholder="Nama lengkap"
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email"
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                    placeholder="email@domain.com"
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                  placeholder="Min. 8 karakter (besar, kecil, angka)"
                  aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive">{errors.password}</p>
                )}
                {!errors.password && (
                  <p id="password-hint" className="text-xs text-muted-foreground">Minimal 8 karakter dengan huruf besar, kecil, dan angka</p>
                )}
              </div>

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
                <Button onClick={handleCreate} disabled={createAdminMutation.isPending}>
                  {createAdminMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      {isLoading ? (
        <AdminManagementSkeleton />
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

export default AdminManagement;

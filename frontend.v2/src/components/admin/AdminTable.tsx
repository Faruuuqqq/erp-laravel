import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, Shield, Power, PowerOff, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: Record<string, Record<string, boolean>>;
  createdAt: string;
}

interface AdminTableProps {
  admins: Admin[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onEditPermissions: (admin: Admin) => void;
  onRefresh: () => void;
}

export const AdminTable = ({
  admins,
  isLoading,
  search,
  onSearchChange,
  onEditPermissions,
  onRefresh,
}: AdminTableProps) => {
  const { toast } = useToast();

  const handleToggleActive = async (admin: Admin) => {
    try {
      await apiClient.patch(`/admins/${admin.id}/toggle-active`);
      toast({ title: 'Berhasil', description: `Status ${admin.name} telah diubah` });
      onRefresh();
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
      onRefresh();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus admin', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari admin..." value={search} onChange={e => onSearchChange(e.target.value)} className="pl-8" />
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
                        <Button variant="ghost" size="sm" onClick={() => onEditPermissions(admin)} title="Edit Permission">
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
    </div>
  );
};

const PermissionSummary = ({ permissions }: { permissions: Record<string, Record<string, boolean>> }) => {
  if (!permissions) return <Badge variant="secondary">0 modul</Badge>;
  const modulesWithAccess = Object.keys(permissions || {}).filter(m => {
    const perms = permissions[m];
    if (!perms) return false;
    return Object.values(perms).some(p => p === true);
  }).length;
  return <Badge variant="secondary">{modulesWithAccess} modul</Badge>;
};

export default AdminTable;

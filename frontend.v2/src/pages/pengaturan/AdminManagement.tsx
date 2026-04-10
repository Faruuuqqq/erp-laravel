import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormDialog } from '@/components/admin/AdminFormDialog';
import { PermissionMatrix } from '@/components/admin/PermissionMatrix';
import { PermissionPresets } from '@/components/admin/PermissionPresets';

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
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [presets, setPresets] = useState<PermissionPreset[]>([]);
  const [systemPresets, setSystemPresets] = useState<Record<string, any>>({});

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admins', { params: { perPage: 100 } });
      setAdmins(res.data.data || []);
    } catch (err: any) {
      // silent fail - use empty array
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
                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                  <Plus size={16} className="mr-1" /> Tambah Admin
                </Button>
              </CardHeader>
              <CardContent>
                <AdminTable
                  admins={admins}
                  isLoading={isLoading}
                  search={search}
                  onSearchChange={setSearch}
                  onEditPermissions={setEditAdmin}
                  onRefresh={fetchAdmins}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Permission Presets */}
          <TabsContent value="presets" className="space-y-4">
            <PermissionPresets
              presets={presets}
              systemPresets={systemPresets}
              onPresetsChange={fetchPresets}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PermissionMatrix
        admin={editAdmin}
        onClose={() => setEditAdmin(null)}
        onSaved={() => { setEditAdmin(null); fetchAdmins(); }}
      />
      
      <AdminFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={fetchAdmins}
        presets={presets}
        systemPresets={systemPresets}
      />
    </MainLayout>
  );
};

export default AdminManagement;
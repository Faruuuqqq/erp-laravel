import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, User, Store, Lock, Bell, Shield, ArrowRight, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Import sub-components
import ProfileSettings from '@/components/settings/ProfileSettings';
import StoreSettings from '@/components/settings/StoreSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import BackupManager from '@/components/settings/BackupManager';

const Pengaturan = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Toko</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Keamanan</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifikasi</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <ProfileSettings user={user} />
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store" className="space-y-4">
              <StoreSettings />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <SecuritySettings />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Access Control & Backup */}
        <div className="space-y-6">
          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Kontrol Akses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Owner</span>
                  <Badge>Akses Penuh</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dapat mengakses semua fitur termasuk laporan dan pengaturan
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Admin</span>
                  <Badge variant="secondary">Terbatas</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dapat mengelola transaksi harian dan data master
                </p>
              </div>
              {isOwner && (
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/pengaturan/admin')}>
                  Kelola Admin <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/pengaturan/profil')}>
                Profil Pemilik <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Database Backup - Owner Only */}
          {isOwner && (
            <BackupManager />
          )}

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tentang Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versi</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2026.03.04</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lisensi</span>
                <Badge variant="outline">Enterprise</Badge>
              </div>
              <div className="h-px bg-border" />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium mb-1">TokoSync ERP</p>
                <p className="text-xs text-muted-foreground">
                  Sistem Manajemen Toko Terintegrasi
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pengaturan;

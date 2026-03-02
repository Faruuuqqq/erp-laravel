import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth/useAuth';
import { Settings, User, Store, Lock, Bell, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettings, useUpdateProfile, useUpdateStore, useUpdateNotifications, useUpdatePassword } from '@/hooks/api/useSettings';

const Pengaturan = () => {
  const { user } = useAuth();
  const { data: settings, isLoading } = useSettings();
  
  const updateProfile = useUpdateProfile();
  const updateStore = useUpdateStore();
  const updateNotifications = useUpdateNotifications();
  const updatePassword = useUpdatePassword();

  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [storeData, setStoreData] = useState({ store_name: '', phone: '', address: '', npwp: '', siup: '' });
  const [notificationData, setNotificationData] = useState({ low_stock_alert: false, receivable_due_alert: false, daily_report: false });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileData);
    setIsEditingProfile(false);
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore.mutate(storeData);
    setIsEditingStore(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword.mutate(passwordData);
    setPasswordData({ current_password: '', password: '', password_confirmation: '' });
  };

  if (isLoading || !settings) {
    return <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi"><div>Loading...</div></MainLayout>;
  }

  return (
    <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{user?.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      value={profileData.name || user?.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={profileData.email || user?.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingProfile ? (
                    <>
                      <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Batal
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setIsEditingProfile(true)}>
                      Edit Profil
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Store Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informasi Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleStoreSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nama Toko</Label>
                    <Input 
                      value={storeData.store_name || settings.store?.store_name}
                      onChange={(e) => setStoreData({ ...storeData, store_name: e.target.value })}
                      disabled={!isEditingStore}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon</Label>
                    <Input 
                      value={storeData.phone || settings.store?.phone}
                      onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                      disabled={!isEditingStore}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input 
                    value={storeData.address || settings.store?.address}
                    onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                    disabled={!isEditingStore}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>NPWP</Label>
                    <Input 
                      placeholder="Masukkan NPWP"
                      value={storeData.npwp || settings.store?.npwp}
                      onChange={(e) => setStoreData({ ...storeData, npwp: e.target.value })}
                      disabled={!isEditingStore}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Izin Usaha</Label>
                    <Input 
                      placeholder="Masukkan No. SIUP"
                      value={storeData.siup || settings.store?.siup}
                      onChange={(e) => setStoreData({ ...storeData, siup: e.target.value })}
                      disabled={!isEditingStore}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isEditingStore ? (
                    <>
                      <Button type="submit" disabled={updateStore.isPending}>
                        {updateStore.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditingStore(false)}>
                        Batal
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setIsEditingStore(true)}>
                      Edit Toko
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <Label>Password Saat Ini</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi Password</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordData.password_confirmation}
                      onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={updatePassword.isPending} className="mt-4">
                  {updatePassword.isPending ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stok Menipis</p>
                  <p className="text-sm text-muted-foreground">Peringatan saat stok rendah</p>
                </div>
                <Switch 
                  checked={notificationData.low_stock_alert ?? settings.notifications?.low_stock_alert}
                  onCheckedChange={(checked) => {
                    setNotificationData({ ...notificationData, low_stock_alert: checked });
                    updateNotifications.mutate({ ...notificationData, low_stock_alert: checked });
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Piutang Jatuh Tempo</p>
                  <p className="text-sm text-muted-foreground">Pengingat piutang</p>
                </div>
                <Switch 
                  checked={notificationData.receivable_due_alert ?? settings.notifications?.receivable_due_alert}
                  onCheckedChange={(checked) => {
                    setNotificationData({ ...notificationData, receivable_due_alert: checked });
                    updateNotifications.mutate({ ...notificationData, receivable_due_alert: checked });
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Harian</p>
                  <p className="text-sm text-muted-foreground">Kirim laporan via email</p>
                </div>
                <Switch 
                  checked={notificationData.daily_report ?? settings.notifications?.daily_report}
                  onCheckedChange={(checked) => {
                    setNotificationData({ ...notificationData, daily_report: checked });
                    updateNotifications.mutate({ ...notificationData, daily_report: checked });
                  }}
                />
              </div>
            </CardContent>
          </Card>

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
            </CardContent>
          </Card>

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
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span>2024.01.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lisensi</span>
                <span>Enterprise</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pengaturan;

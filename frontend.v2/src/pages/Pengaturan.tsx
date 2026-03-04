import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, User, Store, Lock, Bell, Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/api/useSettings';
import { useUpdateProfile } from '@/hooks/api/useSettings';
import { useUpdateStore } from '@/hooks/api/useSettings';
import { useUpdatePassword } from '@/hooks/api/useSettings';
import { useUpdateNotifications } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';

interface ProfileForm {
  name: string;
  email: string;
}

interface StoreForm {
  store_name: string;
  phone: string;
  address: string;
  npwp: string;
  siup: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface NotificationsForm {
  low_stock_alert: boolean;
  receivable_due_alert: boolean;
  daily_report: boolean;
}

interface SettingsData {
  profile: {
    name: string;
    email: string;
    role: string;
  };
  store: {
    store_name?: string;
    phone?: string;
    address?: string;
    npwp?: string;
    siup?: string;
  };
  notifications: {
    low_stock_alert?: boolean;
    receivable_due_alert?: boolean;
    daily_report?: boolean;
  };
}

const Pengaturan = () => {
  const { user, updateUser } = useAuth();
  const { data: settingsData } = useSettings();
  const updateProfileMutation = useUpdateProfile();
  const updateStoreMutation = useUpdateStore();
  const updatePasswordMutation = useUpdatePassword();
  const updateNotificationsMutation = useUpdateNotifications();
  const { toast } = useToast();

  // Profile Form State
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Store Form State
  const [storeForm, setStoreForm] = useState<StoreForm>({
    store_name: '',
    phone: '',
    address: '',
    npwp: '',
    siup: '',
  });
  const [storeLoading, setStoreLoading] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications Form State
  const [notifications, setNotifications] = useState<NotificationsForm>({
    low_stock_alert: true,
    receivable_due_alert: true,
    daily_report: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Load settings data when fetched
  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data as SettingsData;
      
      // Load profile
      if (data.profile) {
        setProfileForm({
          name: data.profile.name || '',
          email: data.profile.email || '',
        });
      }
      
      // Load store
      if (data.store) {
        setStoreForm({
          store_name: data.store.store_name || '',
          phone: data.store.phone || '',
          address: data.store.address || '',
          npwp: data.store.npwp || '',
          siup: data.store.siup || '',
        });
      }
      
      // Load notifications
      if (data.notifications) {
        setNotifications({
          low_stock_alert: data.notifications.low_stock_alert ?? true,
          receivable_due_alert: data.notifications.receivable_due_alert ?? true,
          daily_report: data.notifications.daily_report ?? false,
        });
      }
    }
  }, [settingsData]);

  // Validation Functions
  const validateProfile = (): boolean => {
    if (!profileForm.name.trim()) {
      toast({ title: 'Nama harus diisi', variant: 'destructive' });
      return false;
    }
    if (!profileForm.email.trim()) {
      toast({ title: 'Email harus diisi', variant: 'destructive' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      toast({ title: 'Format email tidak valid', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateStore = (): boolean => {
    if (!storeForm.store_name.trim()) {
      toast({ title: 'Nama toko harus diisi', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (!passwordForm.current_password) {
      toast({ title: 'Password saat ini harus diisi', variant: 'destructive' });
      return false;
    }
    if (!passwordForm.password) {
      toast({ title: 'Password baru harus diisi', variant: 'destructive' });
      return false;
    }
    if (passwordForm.password.length < 8) {
      toast({ title: 'Password minimal 8 karakter', variant: 'destructive' });
      return false;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast({ title: 'Konfirmasi password tidak sesuai', variant: 'destructive' });
      return false;
    }
    return true;
  };

  // Submit Handlers
  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    
    setProfileLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: profileForm.name,
        email: profileForm.email,
      });
      
      toast({ 
        title: 'Profil berhasil diperbarui',
        description: `Nama: ${profileForm.name}, Email: ${profileForm.email}`,
        variant: 'default',
      });
      
      // Update user context
      if (updateUser && user) {
        updateUser({ ...user, name: profileForm.name, email: profileForm.email });
      }
    } catch (error: any) {
      const message = error.response?.data?.errors?.email?.[0] 
        || error.response?.data?.message 
        || 'Gagal memperbarui profil';
      
      toast({ 
        title: 'Gagal memperbarui profil',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleStoreSave = async () => {
    if (!validateStore()) return;
    
    setStoreLoading(true);
    try {
      await updateStoreMutation.mutateAsync(storeForm);
      
      toast({ 
        title: 'Informasi toko berhasil diperbarui',
        description: `Nama: ${storeForm.store_name}`,
        variant: 'default',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memperbarui informasi toko';
      
      toast({ 
        title: 'Gagal memperbarui toko',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setStoreLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!validatePassword()) return;
    
    setPasswordLoading(true);
    try {
      await updatePasswordMutation.mutateAsync({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
      });
      
      toast({ 
        title: 'Password berhasil diubah',
        description: 'Silakan login dengan password baru',
        variant: 'default',
      });
      
      // Reset form
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error: any) {
      const message = error.response?.data?.errors?.current_password?.[0]
        || error.response?.data?.errors?.password?.[0]
        || error.response?.data?.message
        || 'Gagal mengubah password';
      
      toast({ 
        title: 'Gagal mengubah password',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setNotificationsLoading(true);
    try {
      await updateNotificationsMutation.mutateAsync(notifications);
      
      toast({ 
        title: 'Pengaturan notifikasi berhasil diperbarui',
        description: 'Preferensi notifikasi Anda telah disimpan',
        variant: 'default',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memperbarui notifikasi';
      
      toast({ 
        title: 'Gagal memperbarui notifikasi',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setNotificationsLoading(false);
    }
  };

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
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-semibold">{user?.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>
              <Button 
                onClick={handleProfileSave}
                disabled={profileLoading}
                className="w-full"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nama Toko *</Label>
                  <Input
                    id="store_name"
                    value={storeForm.store_name}
                    onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
                    placeholder="Nama toko Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    placeholder="021-1234567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  placeholder="Jl. Raya No. 123, Jakarta"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input
                    id="npwp"
                    value={storeForm.npwp}
                    onChange={(e) => setStoreForm({ ...storeForm, npwp: e.target.value })}
                    placeholder="Masukkan NPWP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siup">No. Izin Usaha (SIUP)</Label>
                  <Input
                    id="siup"
                    value={storeForm.siup}
                    onChange={(e) => setStoreForm({ ...storeForm, siup: e.target.value })}
                    placeholder="Masukkan No. SIUP"
                  />
                </div>
              </div>
              <Button 
                onClick={handleStoreSave}
                disabled={storeLoading}
                className="w-full"
              >
                {storeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
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
              <div className="space-y-2">
                <Label htmlFor="current_password">Password Saat Ini *</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Info: Password harus minimal 8 karakter untuk keamanan akun Anda.</p>
              </div>
              <Button 
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="w-full"
                variant={passwordForm.current_password ? "default" : "secondary"}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Ubah Password
                  </>
                )}
              </Button>
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
                  checked={notifications.low_stock_alert}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, low_stock_alert: checked })}
                  disabled={notificationsLoading}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Piutang Jatuh Tempo</p>
                  <p className="text-sm text-muted-foreground">Peringatan piutang</p>
                </div>
                <Switch
                  checked={notifications.receivable_due_alert}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, receivable_due_alert: checked })}
                  disabled={notificationsLoading}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Harian</p>
                  <p className="text-sm text-muted-foreground">Kirim laporan via email</p>
                </div>
                <Switch
                  checked={notifications.daily_report}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, daily_report: checked })}
                  disabled={notificationsLoading}
                />
              </div>
              <Separator />
              <Button 
                onClick={handleNotificationsSave}
                disabled={notificationsLoading}
                className="w-full"
              >
                {notificationsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
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
                <span className="font-medium">1.0.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2026.03.04</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lisensi</span>
                <Badge variant="outline">Enterprise</Badge>
              </div>
              <Separator />
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

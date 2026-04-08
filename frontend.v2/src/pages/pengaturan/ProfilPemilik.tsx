import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { User, Key } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const ProfilPemilik = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPassword_confirmation: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/profile');
      const data = res.data?.data;
      setProfile(data);
      setProfileForm({
        name: data?.name || '',
        email: data?.email || '',
        phone: data?.phone || '',
      });
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat profil', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      toast({ title: 'Error', description: 'Nama dan email harus diisi', variant: 'destructive' });
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await apiClient.put('/profile', {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone || null,
      });
      setProfile(res.data?.data);
      toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal menyimpan profil';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.newPassword_confirmation) {
      toast({ title: 'Error', description: 'Semua field password harus diisi', variant: 'destructive' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.newPassword_confirmation) {
      toast({ title: 'Error', description: 'Password baru tidak cocok', variant: 'destructive' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password minimal 6 karakter', variant: 'destructive' });
      return;
    }

    try {
      setIsSavingPassword(true);
      await apiClient.put('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPassword_confirmation: passwordForm.newPassword_confirmation,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        newPassword_confirmation: '',
      });
      toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal mengubah password';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Profil Pemilik" subtitle="Kelola informasi pribadi Anda">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
                <Skeleton className="h-9 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profil Pemilik" subtitle="Kelola informasi pribadi Anda">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Informasi Pribadi</CardTitle>
                <CardDescription>Perbarui data pribadi Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                placeholder="Nama lengkap pemilik"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@domain.com"
                value={profileForm.email}
                onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                placeholder="+62812345678"
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-full"
            >
              {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>Amankan akun Anda dengan password baru</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini *</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Masukkan password saat ini"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimal 6 karakter"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password baru"
                value={passwordForm.newPassword_confirmation}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword_confirmation: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isSavingPassword}
              className="w-full"
              variant="outline"
            >
              {isSavingPassword ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilPemilik;

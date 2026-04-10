import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Loader2 } from 'lucide-react';
import { useSettings, useUpdateProfile } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileForm {
  name: string;
  email: string;
}

interface SettingsData {
  profile: {
    name: string;
    email: string;
    role: string;
  };
}

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const { data: settingsData } = useSettings();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data as SettingsData;
      if (data.profile) {
        setProfileForm({
          name: data.profile.name || '',
          email: data.profile.email || '',
        });
      }
    }
  }, [settingsData]);

  const validate = (): boolean => {
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

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync(profileForm);
      if (user) {
        updateUser({ ...user, name: profileForm.name, email: profileForm.email });
      }
      toast({ title: 'Profil berhasil diperbarui' });
    } catch (error) {
      toast({ 
        title: 'Gagal memperbarui profil', 
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5" />
          <CardTitle>Profil Pemilik</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="profile-name">Nama Lengkap</Label>
          <Input
            id="profile-name"
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            placeholder="Masukkan nama lengkap"
          />
        </div>
        <div>
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            placeholder="Masukkan email"
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || updateProfileMutation.isPending}
          className="w-full"
        >
          {loading || updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

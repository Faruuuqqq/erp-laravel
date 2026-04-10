import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useUpdatePassword } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export default function SecuritySettings() {
  const updatePasswordMutation = useUpdatePassword();
  const { toast } = useToast();

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validate = (): boolean => {
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

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await updatePasswordMutation.mutateAsync(passwordForm);
      toast({ title: 'Password berhasil diubah' });
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      toast({ 
        title: 'Gagal mengubah password', 
        description: error instanceof Error ? error.message : 'Password saat ini mungkin salah',
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
          <Lock className="h-5 w-5" />
          <CardTitle>Keamanan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="current-password">Password Saat Ini</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              placeholder="Masukkan password saat ini"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="new-password">Password Baru</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              placeholder="Masukkan password baru (minimal 8 karakter)"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm-password">Konfirmasi Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
              placeholder="Konfirmasi password baru"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || updatePasswordMutation.isPending}
          className="w-full"
        >
          {loading || updatePasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengubah Password...
            </>
          ) : (
            'Ubah Password'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

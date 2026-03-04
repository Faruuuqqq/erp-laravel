import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin'>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: 'owner' | 'admin') => {
    setSelectedRole(role);
    setEmail(role === 'owner' ? 'owner@tokosync.id' : 'admin@tokosync.id');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      setError(error.response?.data?.message || error.response?.data?.error || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar-accent to-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-primary shadow-lg">
            <Zap className="h-8 w-8 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-sidebar-foreground">TokoSync ERP</h1>
          <p className="mt-1 text-sidebar-muted">Sistem Manajemen Toko Terintegrasi</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
            <CardDescription>Pilih role dan masukkan kredensial Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedRole} onValueChange={(v) => handleRoleChange(v as 'owner' | 'admin')} className="mb-5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owner">Owner</TabsTrigger>
                <TabsTrigger value="admin">Admin/Kasir</TabsTrigger>
              </TabsList>
              <TabsContent value="owner" className="mt-3">
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-xs text-warning">
                  <strong>Owner</strong> — Akses penuh: laporan keuangan, nilai stok, dan semua laporan laba rugi.
                </div>
              </TabsContent>
              <TabsContent value="admin" className="mt-3">
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-xs text-primary">
                  <strong>Admin/Kasir</strong> — Akses operasional: transaksi harian dan data pelanggan.
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@tokosync.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : `Masuk sebagai ${selectedRole === 'owner' ? 'Owner' : 'Admin'}`}
              </Button>
            </form>

            <div className="mt-5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Demo credentials:</p>
              <p>Owner: <code className="text-primary">owner@tokosync.id</code> / password: <code className="text-primary">password</code></p>
              <p>Admin: <code className="text-primary">admin@tokosync.id</code> / password: <code className="text-primary">password</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

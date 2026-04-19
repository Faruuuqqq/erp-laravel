import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, User, Store, Lock, Bell, Shield, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/api/useSettings';
import { useUpdateProfile } from '@/hooks/api/useSettings';
import { useUpdateStore } from '@/hooks/api/useSettings';
import { useUpdatePassword } from '@/hooks/api/useSettings';
import { useUpdateNotifications } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils';

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
  email: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  billing_due_days: string;
  billing_payment_terms: string;
  billing_approver_name: string;
  billing_approver_title: string;
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
    email?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    billing_due_days?: number;
    billing_payment_terms?: string;
    billing_approver_name?: string;
    billing_approver_title?: string;
  };
  notifications: {
    low_stock_alert?: boolean;
    receivable_due_alert?: boolean;
    daily_report?: boolean;
  };
}

const Pengaturan = () => {
   const { user, updateUser } = useAuth();
   const { data: settingsData, isLoading: settingsLoading, isError: settingsError } = useSettings();
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

   // Store Form State
   const [storeForm, setStoreForm] = useState<StoreForm>({
     store_name: '',
     phone: '',
     address: '',
     npwp: '',
     siup: '',
     email: '',
     bank_name: '',
     bank_account_number: '',
     bank_account_name: '',
     billing_due_days: '7',
     billing_payment_terms: 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.',
     billing_approver_name: 'Finance',
     billing_approver_title: 'AR Officer',
   });

   // Password Form State
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
      current_password: '',
      password: '',
      password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // Notifications Form State
    const [notifications, setNotifications] = useState<NotificationsForm>({
      low_stock_alert: true,
      receivable_due_alert: true,
      daily_report: false,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    // Dirty state tracking
    const isProfileDirty = settingsData?.data?.profile && (
      settingsData.data.profile.name !== profileForm.name ||
      settingsData.data.profile.email !== profileForm.email
    );
    const isStoreDirty = settingsData?.data?.store && (
      settingsData.data.store.store_name !== storeForm.store_name ||
      settingsData.data.store.phone !== storeForm.phone ||
      settingsData.data.store.address !== storeForm.address ||
      settingsData.data.store.npwp !== storeForm.npwp ||
      settingsData.data.store.siup !== storeForm.siup ||
      (settingsData.data.store.email ?? '') !== storeForm.email ||
      (settingsData.data.store.bank_name ?? '') !== storeForm.bank_name ||
      (settingsData.data.store.bank_account_number ?? '') !== storeForm.bank_account_number ||
      (settingsData.data.store.bank_account_name ?? '') !== storeForm.bank_account_name ||
      String(settingsData.data.store.billing_due_days ?? 7) !== storeForm.billing_due_days ||
      (settingsData.data.store.billing_payment_terms ?? 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.') !== storeForm.billing_payment_terms ||
      (settingsData.data.store.billing_approver_name ?? 'Finance') !== storeForm.billing_approver_name ||
      (settingsData.data.store.billing_approver_title ?? 'AR Officer') !== storeForm.billing_approver_title
    );

    // Load settings data when fetched - only once to prevent overwriting user changes
    useEffect(() => {
      if (settingsData?.data && !isInitialized) {
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
            email: data.store.email || '',
            bank_name: data.store.bank_name || '',
            bank_account_number: data.store.bank_account_number || '',
            bank_account_name: data.store.bank_account_name || '',
            billing_due_days: String(data.store.billing_due_days ?? 7),
            billing_payment_terms: data.store.billing_payment_terms || 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.',
            billing_approver_name: data.store.billing_approver_name || 'Finance',
            billing_approver_title: data.store.billing_approver_title || 'AR Officer',
          });
        }
        
        // Load notifications with explicit boolean casting
        if (data.notifications) {
          setNotifications({
            low_stock_alert: Boolean(data.notifications.low_stock_alert ?? true),
            receivable_due_alert: Boolean(data.notifications.receivable_due_alert ?? true),
            daily_report: Boolean(data.notifications.daily_report ?? false),
          });
        }
        
        setIsInitialized(true);
      }
    }, [settingsData, isInitialized]);

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
    const handleProfileSave = () => {
      if (!validateProfile()) return;

      // Check if data has changed
      const originalData = settingsData?.data?.profile;
      if (
        originalData &&
        originalData.name === profileForm.name &&
        originalData.email === profileForm.email
      ) {
        toast({ title: 'Tidak ada perubahan pada profil', variant: 'default' });
        return;
      }

      updateProfileMutation.mutate(
        { name: profileForm.name, email: profileForm.email },
        {
          onSuccess: () => {
            toast({
              title: 'Profil berhasil diperbarui',
              description: `Nama: ${profileForm.name}, Email: ${profileForm.email}`,
              variant: 'default',
            });

            // Update user context
            if (updateUser && user) {
              updateUser({ ...user, name: profileForm.name, email: profileForm.email });
            }
          },
          onError: (error) => {
            const message = extractApiError(error, 'Gagal memperbarui profil');
            toast({
              title: 'Gagal memperbarui profil',
              description: message,
              variant: 'destructive',
            });
          },
        }
      );
    };

   const handleStoreSave = () => {
     if (!validateStore()) return;

     // Check if data has changed
     const originalData = settingsData?.data?.store;
     if (
       originalData &&
       originalData.store_name === storeForm.store_name &&
       originalData.phone === storeForm.phone &&
       originalData.address === storeForm.address &&
       originalData.npwp === storeForm.npwp &&
       originalData.siup === storeForm.siup &&
       (originalData.email ?? '') === storeForm.email &&
       (originalData.bank_name ?? '') === storeForm.bank_name &&
       (originalData.bank_account_number ?? '') === storeForm.bank_account_number &&
       (originalData.bank_account_name ?? '') === storeForm.bank_account_name &&
       String(originalData.billing_due_days ?? 7) === storeForm.billing_due_days &&
       (originalData.billing_payment_terms ?? 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.') === storeForm.billing_payment_terms &&
       (originalData.billing_approver_name ?? 'Finance') === storeForm.billing_approver_name &&
       (originalData.billing_approver_title ?? 'AR Officer') === storeForm.billing_approver_title
     ) {
       toast({ title: 'Tidak ada perubahan pada informasi toko' });
       return;
     }

     const billingDueDays = Number.parseInt(storeForm.billing_due_days, 10);
     if (!Number.isFinite(billingDueDays) || billingDueDays < 1 || billingDueDays > 90) {
       toast({ title: 'Jatuh tempo harus antara 1 sampai 90 hari', variant: 'destructive' });
       return;
     }

     if (!storeForm.billing_payment_terms.trim()) {
       toast({ title: 'Syarat pembayaran harus diisi', variant: 'destructive' });
       return;
     }

     updateStoreMutation.mutate({
       ...storeForm,
       billing_due_days: billingDueDays,
       billing_payment_terms: storeForm.billing_payment_terms.trim(),
       billing_approver_name: storeForm.billing_approver_name.trim(),
       billing_approver_title: storeForm.billing_approver_title.trim(),
     }, {
       onSuccess: () => {
         toast({
           title: 'Informasi toko berhasil diperbarui',
           description: `Nama: ${storeForm.store_name}`,
           variant: 'default',
         });
       },
       onError: (error) => {
         const message = extractApiError(error, 'Gagal memperbarui informasi toko');
         toast({
           title: 'Gagal memperbarui toko',
           description: message,
           variant: 'destructive',
         });
       },
     });
   };

    const handlePasswordSave = () => {
      if (!validatePassword()) return;

      updatePasswordMutation.mutate(
        {
          current_password: passwordForm.current_password,
          password: passwordForm.password,
          password_confirmation: passwordForm.password_confirmation,
        },
        {
          onSuccess: () => {
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
            setShowPassword(false);
            setShowPasswordConfirm(false);
          },
          onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { errors?: { current_password?: string[] }; message?: string } } };
            const errorMsg = apiError?.response?.data?.errors?.current_password?.[0] ||
                           apiError?.response?.data?.message ||
                           'Gagal mengubah password';
            toast({
              title: 'Gagal mengubah password',
              description: errorMsg,
              variant: 'destructive',
            });
          },
        }
      );
    };

    const handleNotificationsSave = () => {
      // Check if data has changed
      const originalData = settingsData?.data?.notifications;
      if (
        originalData &&
        Boolean(originalData.low_stock_alert ?? true) === notifications.low_stock_alert &&
        Boolean(originalData.receivable_due_alert ?? true) === notifications.receivable_due_alert &&
        Boolean(originalData.daily_report ?? false) === notifications.daily_report
      ) {
        toast({ title: 'Tidak ada perubahan pada notifikasi', variant: 'default' });
        return;
      }

      updateNotificationsMutation.mutate(notifications, {
        onSuccess: () => {
          toast({
            title: 'Pengaturan notifikasi berhasil diperbarui',
            description: 'Preferensi notifikasi Anda telah disimpan',
            variant: 'default',
          });
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMsg = apiError?.response?.data?.message || 'Gagal memperbarui notifikasi';
          toast({
            title: 'Gagal memperbarui notifikasi',
            description: errorMsg,
            variant: 'destructive',
          });
        },
      });
    };

   return (
     <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi">
       {settingsLoading && (
         <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-6">
             <Card>
               <CardHeader className="pb-4">
                 <div className="h-6 w-40 animate-pulse rounded bg-muted" />
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                   <div className="h-10 w-full animate-pulse rounded bg-muted" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                   <div className="h-10 w-full animate-pulse rounded bg-muted" />
                 </div>
                 <div className="h-10 w-full animate-pulse rounded bg-muted" />
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="pb-4">
                 <div className="h-6 w-40 animate-pulse rounded bg-muted" />
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                   <div className="h-10 w-full animate-pulse rounded bg-muted" />
                 </div>
               </CardContent>
             </Card>
           </div>
           <div>
             <Card>
               <CardHeader className="pb-4">
                 <div className="h-6 w-32 animate-pulse rounded bg-muted" />
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="h-10 w-full animate-pulse rounded bg-muted" />
                   <div className="h-10 w-full animate-pulse rounded bg-muted" />
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       )}

       {settingsError && (
         <Card className="border-destructive/50 bg-destructive/10">
           <CardContent className="py-10 text-center text-destructive">
             <p className="font-medium mb-2">Gagal memuat pengaturan</p>
             <p className="text-sm text-muted-foreground">Silakan refresh halaman untuk mencoba lagi</p>
           </CardContent>
         </Card>
       )}

        {!settingsLoading && !settingsError && (
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
                     aria-label="Nama lengkap pengguna"
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
                     aria-label="Email pengguna"
                     value={profileForm.email}
                     onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                     placeholder="email@contoh.com"
                   />
                 </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleProfileSave(); }}>
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending || !isProfileDirty}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isProfileDirty ? 'Simpan Perubahan' : 'Tidak Ada Perubahan'}
                      </>
                    )}
                  </Button>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Nama Toko *</Label>
                   <Input
                     id="store_name"
                     aria-label="Nama toko"
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
                     aria-label="Nomor telepon toko"
                     value={storeForm.phone}
                     onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      placeholder="021-1234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_email">Email Toko</Label>
                  <Input
                    id="store_email"
                    type="email"
                    aria-label="Email toko"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    placeholder="billing@tokoanda.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                   id="address"
                   aria-label="Alamat toko"
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
                     aria-label="Nomor NPWP"
                     value={storeForm.npwp}
                     onChange={(e) => setStoreForm({ ...storeForm, npwp: e.target.value })}
                     placeholder="Masukkan NPWP"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="siup">No. Izin Usaha (SIUP)</Label>
                   <Input
                     id="siup"
                     aria-label="Nomor SIUP"
                     value={storeForm.siup}
                     onChange={(e) => setStoreForm({ ...storeForm, siup: e.target.value })}
                     placeholder="Masukkan No. SIUP"
                    />
                  </div>
                 </div>

                 <Separator />

                 <div className="space-y-1">
                   <p className="text-sm font-semibold">Konfigurasi Dokumen Kontra Bon</p>
                   <p className="text-xs text-muted-foreground">Dipakai untuk PDF penagihan resmi (bank transfer, jatuh tempo, dan penanggung jawab).</p>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="bank_name">Nama Bank</Label>
                     <Input
                       id="bank_name"
                       aria-label="Nama bank penerima pembayaran"
                       value={storeForm.bank_name}
                       onChange={(e) => setStoreForm({ ...storeForm, bank_name: e.target.value })}
                       placeholder="BCA / Mandiri"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="bank_account_number">No. Rekening</Label>
                     <Input
                       id="bank_account_number"
                       aria-label="Nomor rekening penerima"
                       value={storeForm.bank_account_number}
                       onChange={(e) => setStoreForm({ ...storeForm, bank_account_number: e.target.value })}
                       placeholder="1234567890"
                     />
                   </div>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="bank_account_name">Nama Pemilik Rekening</Label>
                     <Input
                       id="bank_account_name"
                       aria-label="Nama pemilik rekening"
                       value={storeForm.bank_account_name}
                       onChange={(e) => setStoreForm({ ...storeForm, bank_account_name: e.target.value })}
                       placeholder="PT Toko Anda"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="billing_due_days">Jatuh Tempo (hari)</Label>
                     <Input
                       id="billing_due_days"
                       type="number"
                       min={1}
                       max={90}
                       aria-label="Jumlah hari jatuh tempo kontra bon"
                       value={storeForm.billing_due_days}
                       onChange={(e) => setStoreForm({ ...storeForm, billing_due_days: e.target.value })}
                       placeholder="7"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="billing_payment_terms">Syarat Pembayaran</Label>
                   <Textarea
                     id="billing_payment_terms"
                     aria-label="Template syarat pembayaran kontra bon"
                     rows={4}
                     value={storeForm.billing_payment_terms}
                     onChange={(e) => setStoreForm({ ...storeForm, billing_payment_terms: e.target.value })}
                     placeholder="Gunakan placeholder {due_days}"
                   />
                   <p className="text-xs text-muted-foreground">Gunakan placeholder <code>{'{due_days}'}</code> agar otomatis diganti sesuai nilai jatuh tempo.</p>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="billing_approver_name">Nama Penanggung Jawab</Label>
                     <Input
                       id="billing_approver_name"
                       aria-label="Nama penanggung jawab kontra bon"
                       value={storeForm.billing_approver_name}
                       onChange={(e) => setStoreForm({ ...storeForm, billing_approver_name: e.target.value })}
                       placeholder="Finance"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="billing_approver_title">Jabatan Penanggung Jawab</Label>
                     <Input
                       id="billing_approver_title"
                       aria-label="Jabatan penanggung jawab kontra bon"
                       value={storeForm.billing_approver_title}
                       onChange={(e) => setStoreForm({ ...storeForm, billing_approver_title: e.target.value })}
                       placeholder="AR Officer"
                     />
                   </div>
                 </div>

                 <form onSubmit={(e) => { e.preventDefault(); handleStoreSave(); }}>
                  <Button 
                    type="submit"
                    disabled={updateStoreMutation.isPending || !isStoreDirty}
                    className="w-full"
                  >
                    {updateStoreMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isStoreDirty ? 'Simpan Perubahan' : 'Tidak Ada Perubahan'}
                      </>
                    )}
                  </Button>
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
               <form onSubmit={(e) => { e.preventDefault(); handlePasswordSave(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Password Saat Ini *</Label>
                    <Input
                      id="current_password"
                      type="password"
                      autoComplete="current-password"
                      aria-label="Password saat ini untuk verifikasi"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password Baru *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          aria-label="Password baru - minimal 8 karakter"
                          value={passwordForm.password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                          placeholder="Minimal 8 karakter"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          type={showPasswordConfirm ? 'text' : 'password'}
                          autoComplete="new-password"
                          aria-label="Konfirmasi password baru"
                          value={passwordForm.password_confirmation}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                          placeholder="Ulangi password baru"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          aria-label={showPasswordConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                 <div className="text-sm text-muted-foreground">
                   <p>Info: Password harus minimal 8 karakter untuk keamanan akun Anda.</p>
                 </div>
                 <Button 
                   type="submit"
                   disabled={updatePasswordMutation.isPending}
                   className="w-full"
                   variant={passwordForm.current_password ? "default" : "secondary"}
                 >
                   {updatePasswordMutation.isPending ? (
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
                   checked={notifications.low_stock_alert}
                   onCheckedChange={(checked) => setNotifications({ ...notifications, low_stock_alert: checked })}
                   disabled={updateNotificationsMutation.isPending}
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
                   disabled={updateNotificationsMutation.isPending}
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
                   disabled={updateNotificationsMutation.isPending}
                 />
               </div>
               <Separator />
               <Button 
                 onClick={handleNotificationsSave}
                 disabled={updateNotificationsMutation.isPending}
                 className="w-full"
               >
                 {updateNotificationsMutation.isPending ? (
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
       )}
     </MainLayout>
  );
};

export default Pengaturan;

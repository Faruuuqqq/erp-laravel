import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Loader2 } from 'lucide-react';
import { useSettings, useUpdateStore } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';

interface StoreForm {
  store_name: string;
  phone: string;
  address: string;
  npwp: string;
  siup: string;
}

interface SettingsData {
  store: {
    store_name?: string;
    phone?: string;
    address?: string;
    npwp?: string;
    siup?: string;
  };
}

export default function StoreSettings() {
  const { data: settingsData } = useSettings();
  const updateStoreMutation = useUpdateStore();
  const { toast } = useToast();

  const [storeForm, setStoreForm] = useState<StoreForm>({
    store_name: '',
    phone: '',
    address: '',
    npwp: '',
    siup: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data as SettingsData;
      if (data.store) {
        setStoreForm({
          store_name: data.store.store_name || '',
          phone: data.store.phone || '',
          address: data.store.address || '',
          npwp: data.store.npwp || '',
          siup: data.store.siup || '',
        });
      }
    }
  }, [settingsData]);

  const validate = (): boolean => {
    if (!storeForm.store_name.trim()) {
      toast({ title: 'Nama toko harus diisi', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await updateStoreMutation.mutateAsync(storeForm);
      toast({ title: 'Informasi toko berhasil diperbarui' });
    } catch (error) {
      toast({ 
        title: 'Gagal memperbarui informasi toko', 
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
          <Store className="h-5 w-5" />
          <CardTitle>Informasi Toko</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="store-name">Nama Toko</Label>
          <Input
            id="store-name"
            type="text"
            value={storeForm.store_name}
            onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
            placeholder="Masukkan nama toko"
          />
        </div>
        <div>
          <Label htmlFor="store-phone">Nomor Telepon</Label>
          <Input
            id="store-phone"
            type="text"
            value={storeForm.phone}
            onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
            placeholder="Masukkan nomor telepon"
          />
        </div>
        <div>
          <Label htmlFor="store-address">Alamat</Label>
          <Input
            id="store-address"
            type="text"
            value={storeForm.address}
            onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            placeholder="Masukkan alamat toko"
          />
        </div>
        <div>
          <Label htmlFor="store-npwp">NPWP</Label>
          <Input
            id="store-npwp"
            type="text"
            value={storeForm.npwp}
            onChange={(e) => setStoreForm({ ...storeForm, npwp: e.target.value })}
            placeholder="Masukkan NPWP"
          />
        </div>
        <div>
          <Label htmlFor="store-siup">SIUP</Label>
          <Input
            id="store-siup"
            type="text"
            value={storeForm.siup}
            onChange={(e) => setStoreForm({ ...storeForm, siup: e.target.value })}
            placeholder="Masukkan SIUP"
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || updateStoreMutation.isPending}
          className="w-full"
        >
          {loading || updateStoreMutation.isPending ? (
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

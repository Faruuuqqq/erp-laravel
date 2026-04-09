import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users, Building2, CreditCard, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import type { Customer, Warehouse } from '@/types';
import { exportToCSV } from '@/lib/export';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface CustomerForm {
  customer_id: string;
  name: string;
  phone: string;
  phone_2: string;
  email: string;
  address: string;
  city: string;
  npwp: string;
  contact_person: string;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  warehouse_id: string;
  balance: string;
  credit_limit: string;
  discount_percentage: string;
  discount_amount: string;
  operational_hours: string;
  notes: string;
  is_verified: boolean;
}

const INITIAL_FORM: CustomerForm = {
  customer_id: '',
  name: '',
  phone: '',
  phone_2: '',
  email: '',
  address: '',
  city: '',
  npwp: '',
  contact_person: '',
  bank_name: '',
  bank_account: '',
  account_holder: '',
  warehouse_id: '',
  balance: '0',
  credit_limit: '0',
  discount_percentage: '0',
  discount_amount: '0',
  operational_hours: '',
  notes: '',
  is_verified: false,
};

const CustomerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(INITIAL_FORM);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useCustomers({ per_page: 100, search: searchTerm });
  const { data: warehousesData } = useWarehouses();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = (data?.data?.data ?? []) as Customer[];
  const warehouses = (warehousesData?.data?.data ?? []) as Warehouse[];

  const totalPiutang = customers.reduce((s, c) => s + (c.balance || 0), 0);
  const overLimit = customers.filter(c => (c.creditLimit || 0) > 0 && (c.balance || 0) > (c.creditLimit || 0)).length;
  const verified = customers.filter(c => c.isVerified).length;

  const openEdit = (c: Customer) => {
    setEditItem(c);
    setForm({
      customer_id: c.customerId || '',
      name: c.name,
      phone: c.phone || '',
      phone_2: c.phone2 || '',
      email: c.email || '',
      address: c.address || '',
      city: c.city || '',
      npwp: c.npwp || '',
      contact_person: c.contactPerson || '',
      bank_name: c.bankName || '',
      bank_account: c.bankAccount || '',
      account_holder: c.accountHolder || '',
      warehouse_id: c.warehouseId || '',
      balance: String(c.balance || 0),
      credit_limit: String(c.creditLimit || 0),
      discount_percentage: String(c.discountPercentage || 0),
      discount_amount: String(c.discountAmount || 0),
      operational_hours: c.operationalHours || '',
      notes: c.notes || '',
      is_verified: c.isVerified || false,
    });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.customer_id.trim()) {
      toast({ title: 'Validasi', description: 'ID Customer dan Nama wajib diisi.', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        customer_id: form.customer_id,
        name: form.name,
        phone: form.phone,
        phone_2: form.phone_2,
        email: form.email,
        address: form.address,
        city: form.city,
        npwp: form.npwp,
        contact_person: form.contact_person,
        bank_name: form.bank_name,
        bank_account: form.bank_account,
        account_holder: form.account_holder,
        warehouse_id: form.warehouse_id || null,
        balance: Number(form.balance),
        credit_limit: Number(form.credit_limit),
        discount_percentage: Number(form.discount_percentage),
        discount_amount: Number(form.discount_amount),
        operational_hours: form.operational_hours,
        notes: form.notes,
        is_verified: form.is_verified,
      };

      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: payload,
        });
        toast({ title: 'Berhasil', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Berhasil', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm(INITIAL_FORM);
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan customer';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Berhasil', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus customer', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const headers = [
      'ID Customer', 'Nama', 'Telepon', 'Telepon 2', 'Email', 'Alamat', 'Kota', 'NPWP',
      'Contact Person', 'Bank Name', 'Rekening', 'Pemilik Rekening', 'Warehouse',
      'Balance', 'Limit Kredit', 'Diskon %', 'Diskon Rp', 'Jam Operasional', 'Catatan', 'Verifikasi',
    ];

    const rows = customers.map(c => [
      c.customerId || '',
      c.name,
      c.phone || '',
      c.phone2 || '',
      c.email || '',
      c.address || '',
      c.city || '',
      c.npwp || '',
      c.contactPerson || '',
      c.bankName || '',
      c.bankAccount || '',
      c.accountHolder || '',
      c.warehouse?.name || '',
      formatRupiah(c.balance || 0),
      formatRupiah(c.creditLimit || 0),
      c.discountPercentage || 0,
      formatRupiah(c.discountAmount || 0),
      c.operationalHours || '',
      c.notes || '',
      c.isVerified ? 'Ya' : 'Tidak',
    ]);

    exportToCSV(headers, rows, 'customer.csv');
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-6 pt-4">
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Users size={16} /> Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ID Customer *</Label>
                <Input placeholder="CUST-001" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Customer *</Label>
                <Input placeholder="Nama lengkap" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Kota</Label>
                <Input placeholder="Jakarta, Surabaya, dll" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2 flex-1 h-10">
                  <Checkbox checked={form.is_verified} onCheckedChange={v => setForm(p => ({ ...p, is_verified: v as boolean }))} />
                  <Label className="cursor-pointer">Terverifikasi</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kontak */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Phone size={16} /> Kontak</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Telepon Utama</Label>
                <Input placeholder="0812-3456-7890" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Telepon 2</Label>
                <Input placeholder="0812-9876-5432" value={form.phone_2} onChange={e => setForm(p => ({ ...p, phone_2: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Contact Person</Label>
                <Input placeholder="Nama kontak" value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Section 3: Data Bisnis */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 size={16} /> Data Bisnis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Warehouse</Label>
                <Select value={form.warehouse_id || ''} onValueChange={v => setForm(p => ({ ...p, warehouse_id: v === 'none' ? '' : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {(warehouses ?? []).map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>NPWP</Label>
                <Input placeholder="XX.XXX.XXX.X-XXX.XXX" value={form.npwp} onChange={e => setForm(p => ({ ...p, npwp: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Jam Operasional</Label>
              <Input placeholder="09:00-17:00 (Senin-Jumat)" value={form.operational_hours} onChange={e => setForm(p => ({ ...p, operational_hours: e.target.value }))} />
            </div>
          </div>

          {/* Section 4: Kredit & Diskon */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><CreditCard size={16} /> Kredit & Diskon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Limit Kredit (Rp)</Label>
                <Input type="number" placeholder="0" value={form.credit_limit} onChange={e => setForm(p => ({ ...p, credit_limit: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Diskon %</Label>
                <Input type="number" placeholder="0" min="0" max="100" value={form.discount_percentage} onChange={e => setForm(p => ({ ...p, discount_percentage: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Diskon Nominal (Rp)</Label>
                <Input type="number" placeholder="0" value={form.discount_amount} onChange={e => setForm(p => ({ ...p, discount_amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Balance Awal (Rp)</Label>
                <Input type="number" placeholder="0" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Section 5: Informasi Bank */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Banknote size={16} /> Informasi Bank</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nama Bank</Label>
                <Input placeholder="BCA, Mandiri, BNI, dll" value={form.bank_name} onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nomor Rekening</Label>
                <Input placeholder="1234567890" value={form.bank_account} onChange={e => setForm(p => ({ ...p, bank_account: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Atas Nama Rekening</Label>
                <Input placeholder="Nama pemilik rekening" value={form.account_holder} onChange={e => setForm(p => ({ ...p, account_holder: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Section 6: Alamat & Catatan */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><MapPin size={16} /> Alamat & Catatan</h3>
            <div className="space-y-1.5">
              <Label>Alamat Lengkap</Label>
              <Textarea placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan Tambahan</Label>
              <Textarea placeholder="Informasi penting lainnya" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => { onOpenChange(false); setEditItem(null); }}>Batal</Button>
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Master Customer</h1>
          <p className="text-muted-foreground">Kelola data pelanggan bisnis Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Customer" value={customers.length} icon={<Users size={20} />} />
          <StatCard title="Total Piutang" value={formatRupiah(totalPiutang)} icon={<AlertCircle size={20} />} />
          <StatCard title="Overdue" value={overLimit} icon={<AlertCircle size={20} className="text-destructive" />} />
          <StatCard title="Terverifikasi" value={verified} icon={<Badge>✓</Badge>} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Customer</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={customers.length === 0}>
                <Download size={16} className="mr-1" /> Export CSV
              </Button>
              <Button size="sm" onClick={() => { setForm(INITIAL_FORM); setEditItem(null); setIsAddOpen(true); }}>
                <Plus size={16} className="mr-1" /> Tambah Customer
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama, nomor, atau kota..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Tidak ada data customer</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-4 font-semibold">ID Customer</th>
                        <th className="text-left py-2 px-4 font-semibold">Nama</th>
                        <th className="text-left py-2 px-4 font-semibold">Kota</th>
                        <th className="text-left py-2 px-4 font-semibold">Telepon</th>
                        <th className="text-left py-2 px-4 font-semibold">Email</th>
                        <th className="text-right py-2 px-4 font-semibold">Limit Kredit</th>
                        <th className="text-left py-2 px-4 font-semibold">Warehouse</th>
                        <th className="text-center py-2 px-4 font-semibold">Status</th>
                        <th className="text-center py-2 px-4 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4 font-mono text-xs">{c.customerId || '-'}</td>
                          <td className="py-2 px-4 font-medium">{c.name}</td>
                          <td className="py-2 px-4">{c.city || '-'}</td>
                          <td className="py-2 px-4">{c.phone || '-'}</td>
                          <td className="py-2 px-4 text-xs">{c.email || '-'}</td>
                          <td className="py-2 px-4 text-right">{formatRupiah(c.creditLimit || 0)}</td>
                          <td className="py-2 px-4">{c.warehouse?.name || '-'}</td>
                          <td className="py-2 px-4 text-center">
                            {c.isVerified ? <Badge className="bg-green-100 text-green-800">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                                <Pencil size={16} />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 size={16} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Customer?</AlertDialogTitle>
                                    <AlertDialogDescription>Apakah Anda yakin ingin menghapus {c.name}?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(c.id, c.name)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <FormDialog open={isAddOpen || Boolean(editItem)} onOpenChange={v => { if (!v) { setIsAddOpen(false); setEditItem(null); } else setIsAddOpen(true); }} title={editItem ? `Edit Customer: ${editItem.name}` : 'Tambah Customer Baru'} />
    </MainLayout>
  );
};

export default CustomerPage;
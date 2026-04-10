import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Loader2 } from 'lucide-react';
import { useSettings, useUpdateNotifications } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/use-toast';

interface NotificationsForm {
  low_stock_alert: boolean;
  receivable_due_alert: boolean;
  daily_report: boolean;
}

interface SettingsData {
  notifications: {
    low_stock_alert?: boolean;
    receivable_due_alert?: boolean;
    daily_report?: boolean;
  };
}

export default function NotificationSettings() {
  const { data: settingsData } = useSettings();
  const updateNotificationsMutation = useUpdateNotifications();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationsForm>({
    low_stock_alert: true,
    receivable_due_alert: true,
    daily_report: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data as SettingsData;
      if (data.notifications) {
        setNotifications({
          low_stock_alert: data.notifications.low_stock_alert ?? true,
          receivable_due_alert: data.notifications.receivable_due_alert ?? true,
          daily_report: data.notifications.daily_report ?? false,
        });
      }
    }
  }, [settingsData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateNotificationsMutation.mutateAsync(notifications);
      toast({ title: 'Pengaturan notifikasi berhasil diperbarui' });
    } catch (error) {
      toast({ 
        title: 'Gagal memperbarui pengaturan notifikasi', 
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
          <Bell className="h-5 w-5" />
          <CardTitle>Notifikasi</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="low-stock-alert" className="text-base font-medium">
              Peringatan Stok Rendah
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Terima notifikasi ketika stok produk di bawah minimum
            </p>
          </div>
          <Switch
            id="low-stock-alert"
            checked={notifications.low_stock_alert}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, low_stock_alert: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="receivable-due-alert" className="text-base font-medium">
              Peringatan Piutang Jatuh Tempo
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Terima notifikasi untuk piutang yang sudah jatuh tempo
            </p>
          </div>
          <Switch
            id="receivable-due-alert"
            checked={notifications.receivable_due_alert}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, receivable_due_alert: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="daily-report" className="text-base font-medium">
              Laporan Harian
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Terima ringkasan transaksi harian
            </p>
          </div>
          <Switch
            id="daily-report"
            checked={notifications.daily_report}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, daily_report: checked })
            }
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || updateNotificationsMutation.isPending}
          className="w-full"
        >
          {loading || updateNotificationsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Pengaturan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

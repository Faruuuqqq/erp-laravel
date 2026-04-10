import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Database, HardDrive, Download, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useBackups, useCreateBackup, useDownloadBackup, useDeleteBackup } from '@/hooks/api/useBackup';
import { useToast } from '@/hooks/use-toast';

export default function BackupManager() {
  const { data: backupsData, isLoading: backupsLoading, refetch: refetchBackups } = useBackups();
  const createBackupMutation = useCreateBackup();
  const downloadBackupMutation = useDownloadBackup();
  const deleteBackupMutation = useDeleteBackup();
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    try {
      await createBackupMutation.mutateAsync();
      toast({
        title: 'Backup berhasil dibuat',
        description: 'Database telah di-backup ke storage lokal',
        variant: 'default',
      });
      refetchBackups();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal membuat backup';
      toast({
        title: 'Gagal membuat backup',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      await downloadBackupMutation.mutateAsync(filename);
      toast({
        title: 'Download dimulai',
        description: `File ${filename} sedang diunduh`,
        variant: 'default',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengunduh backup';
      toast({
        title: 'Gagal mengunduh backup',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Yakin hapus backup ${filename}?`)) {
      return;
    }
    try {
      await deleteBackupMutation.mutateAsync(filename);
      toast({
        title: 'Backup dihapus',
        description: `File ${filename} telah dihapus`,
        variant: 'default',
      });
      refetchBackups();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menghapus backup';
      toast({
        title: 'Gagal menghapus backup',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5" />
          <div>
            <CardTitle>Backup Database</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Backup otomatis dilakukan setiap tanggal 1 pukul 00:00
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Backup Button */}
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateBackup}
            disabled={createBackupMutation.isPending}
            className="flex-1"
          >
            {createBackupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Backup...
              </>
            ) : (
              <>
                <HardDrive className="mr-2 h-4 w-4" />
                Buat Backup Sekarang
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Backup List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Backup Tersimpan</p>
          
          {backupsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : backupsData?.data && backupsData.data.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {backupsData.data.map((backup) => (
                <div 
                  key={backup.filename}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{backup.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {backup.size_formatted} • {backup.created_at}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadBackup(backup.filename)}
                      disabled={downloadBackupMutation.isPending}
                      title="Download backup"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBackup(backup.filename)}
                      disabled={deleteBackupMutation.isPending}
                      title="Hapus backup"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada backup</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
          <p className="font-medium">Informasi Backup:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Backup otomatis: Setiap 1 Januari pukul 00:00</li>
            <li>Penyimpanan: Folder lokal server</li>
            <li>Retensi: Menyimpan hingga 12 file backup terakhir</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { PermissionMatrix, buildDefaultPermissions, buildFullPermissions } from './PermissionMatrix';
import { MODULE_GROUPS } from '../constants';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { Admin } from './AdminCard';

interface PermissionEditorDialogProps {
  admin: Admin;
  onClose: () => void;
  onSaved: () => void;
}

export const PermissionEditorDialog = React.memo(({ admin, onClose, onSaved }: PermissionEditorDialogProps) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
    admin.permissions ?? buildDefaultPermissions()
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await apiClient.put(`/admins/${admin.id}/permissions`, { permissions });
      toast({ title: 'Permission diperbarui', description: `Hak akses ${admin.name} berhasil disimpan.` });
      onSaved();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan permission';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [admin.id, admin.name, permissions, onSaved, toast]);

  const handlePresetDefault = useCallback(() => {
    setPermissions(buildDefaultPermissions());
  }, []);

  const handlePresetFull = useCallback(() => {
    setPermissions(buildFullPermissions());
  }, []);

  const handlePresetMasterData = useCallback(() => {
    const p = buildDefaultPermissions();
    MODULE_GROUPS[0].modules.forEach(m => {
      p[m.key] = { view: true, create: true, update: true, delete: false, print: true };
    });
    setPermissions(p);
  }, []);

  const handlePresetTransaksi = useCallback(() => {
    const p = buildDefaultPermissions();
    MODULE_GROUPS[1].modules.forEach(m => {
      p[m.key] = { view: true, create: true, update: false, delete: false, print: true };
    });
    setPermissions(p);
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
            Edit Permission — {admin.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{admin.email}</p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Quick Presets */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
            <Label className="text-sm font-medium shrink-0">Preset Cepat:</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={handlePresetDefault}
              >
                View Only
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={handlePresetFull}
              >
                Full Access
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={handlePresetMasterData}
              >
                Master Data Only
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={handlePresetTransaksi}
              >
                Transaksi Only
              </Button>
            </div>
          </div>

          {/* Matrix */}
          <PermissionMatrix permissions={permissions} onChange={setPermissions} />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Permission'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

PermissionEditorDialog.displayName = 'PermissionEditorDialog';

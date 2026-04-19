import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, Power, PowerOff, Trash2 } from 'lucide-react';
import { MODULE_GROUPS, getGroupSummary } from '../constants';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: Record<string, Record<string, boolean>>;
  createdAt: string;
}

interface AdminCardProps {
  admin: Admin;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export const AdminCard = React.memo(({ admin, onEdit, onToggleActive, onDelete }: AdminCardProps) => {
  const groupSummaries = useMemo(() => 
    MODULE_GROUPS.map(g => ({
      ...g,
      ...getGroupSummary(admin.permissions ?? {}, g),
    })),
    [admin.permissions]
  );

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <span className="text-primary font-bold text-sm">
                {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{admin.name}</p>
                <Badge variant={admin.isActive ? 'default' : 'destructive'} className="text-xs h-5">
                  {admin.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
              {/* Permission badges per category - using semantic list */}
              <ul className="flex gap-2 mt-1.5 flex-wrap" role="list">
                {groupSummaries.map(g => (
                  <li key={g.key} role="listitem">
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border font-medium cursor-default
                          ${g.hasAll ? 'bg-success/10 border-success/40 text-success' :
                            g.hasAny ? 'bg-warning/10 border-warning/40 text-warning' :
                            'bg-muted/60 border-border text-muted-foreground line-through'}`}>
                          <g.icon className="h-3 w-3" aria-hidden="true" />
                          {g.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {g.hasAll ? 'Akses penuh' : g.hasAny ? 'Akses sebagian' : 'Tidak ada akses'}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={onEdit}
                  aria-label="Edit admin permissions"
                >
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Permission</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={onToggleActive}
                  aria-label={admin.isActive ? 'Deactivate admin' : 'Activate admin'}
                >
                  {admin.isActive
                    ? <PowerOff className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    : <Power className="h-3.5 w-3.5 text-success" aria-hidden="true" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{admin.isActive ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  aria-label="Delete admin"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus admin <strong>{admin.name}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AdminCard.displayName = 'AdminCard';

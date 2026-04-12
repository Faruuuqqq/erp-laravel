import { useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: string;
  onConfirm: (id: string) => void | Promise<void>;
  itemId: string;
  isDeleting?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteConfirmDialog = ({
  itemName,
  itemType,
  onConfirm,
  itemId,
  isDeleting = false,
  onOpenChange,
}: DeleteConfirmDialogProps) => {
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm(itemId);
    } finally {
      onOpenChange?.(false);
    }
  }, [itemId, onConfirm, onOpenChange]);

  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          title={`Hapus ${itemType}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {itemType}</AlertDialogTitle>
          <AlertDialogDescription>
            Hapus <strong>{itemName}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;

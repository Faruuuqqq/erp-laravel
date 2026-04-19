import { useCallback, useState } from 'react';
import { useModalState } from './useModalState';

interface UseConfirmDialogOptions {
  onConfirm: () => void | Promise<void>;
}

interface UseConfirmDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isLoading: boolean;
  handleConfirm: () => Promise<void>;
}

/**
 * Hook for managing confirmation dialogs with loading state
 * Handles async confirmation logic and automatic modal closing
 *
 * @param onConfirm - Async callback to execute on confirmation
 * @returns Dialog state and confirmation handler
 *
 * @example
 * const confirm = useConfirmDialog({
 *   onConfirm: async () => {
 *     await deleteItem(id);
 *   }
 * });
 *
 * // In JSX
 * <ConfirmationDialog
 *   open={confirm.isOpen}
 *   onOpenChange={(open) => open ? confirm.open() : confirm.close()}
 *   onConfirm={confirm.handleConfirm}
 *   isLoading={confirm.isLoading}
 * />
 */
export const useConfirmDialog = ({ onConfirm }: UseConfirmDialogOptions): UseConfirmDialogReturn => {
  const modal = useModalState();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      modal.close();
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, modal]);

  return {
    isOpen: modal.isOpen,
    open: modal.open,
    close: modal.close,
    isLoading,
    handleConfirm,
  };
};

export default useConfirmDialog;

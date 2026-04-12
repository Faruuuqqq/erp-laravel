import { useCallback, useState } from 'react';

interface UseModalStateOptions {
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Generic hook for managing modal state with consistent API
 * @param initialOpen - Initial open state
 * @param onOpenChange - Callback when state changes
 * @returns Modal state and control functions
 *
 * @example
 * const modal = useModalState();
 * <Dialog isOpen={modal.isOpen} onClose={modal.close} />
 */
export const useModalState = ({
  initialOpen = false,
  onOpenChange,
}: UseModalStateOptions = {}): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  }, [onOpenChange]);

  return { isOpen, open, close, toggle };
};

export default useModalState;

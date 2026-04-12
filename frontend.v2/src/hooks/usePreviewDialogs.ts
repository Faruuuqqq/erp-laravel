import { useModalState } from './useModalState';

interface PreviewModal {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

interface UsePreviewDialogsReturn {
  preview: PreviewModal;
  draft: PreviewModal;
}

/**
 * Hook for managing transaction preview and draft dialogs
 * Provides standardized interface for saved and draft transaction previews
 *
 * @returns Object with preview and draft modal states
 *
 * @example
 * const { preview, draft } = usePreviewDialogs();
 *
 * // In JSX
 * <PrintPreviewDialog isOpen={preview.isOpen} onClose={preview.close} />
 * <DraftPreviewDialog isOpen={draft.isOpen} onClose={draft.close} />
 *
 * // On save, close both dialogs
 * const handleSave = () => {
 *   try {
 *     await save();
 *     preview.close();
 *     draft.close();
 *   } catch (err) {
 *     // handle error
 *   }
 * }
 */
export const usePreviewDialogs = (): UsePreviewDialogsReturn => {
  const preview = useModalState();
  const draft = useModalState();

  return { preview, draft };
};

export default usePreviewDialogs;

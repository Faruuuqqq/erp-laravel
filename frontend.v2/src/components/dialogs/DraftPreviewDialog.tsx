import { ReactNode } from 'react';
import { PrintPreviewDialog } from './PrintPreviewDialog';

interface DraftPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: ReactNode;
  title: string;
  documentId?: string;
  filename?: string;
}

export const DraftPreviewDialog = ({
  isOpen,
  onClose,
  content,
  title,
  documentId,
  filename,
}: DraftPreviewDialogProps) => {
  // Auto-generate documentId from title if not provided
  const generatedDocumentId = documentId || `${title.toLowerCase().replace(/\s+/g, '-')}-draft-print`;
  
  // Auto-generate filename if not provided
  const generatedFilename = filename || `${title}-Draft`;

  return (
    <PrintPreviewDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview ${title} (Draft)`}
      documentId={generatedDocumentId}
      filename={generatedFilename}
      printContent={content}
    >
      {content}
    </PrintPreviewDialog>
  );
};

export default DraftPreviewDialog;

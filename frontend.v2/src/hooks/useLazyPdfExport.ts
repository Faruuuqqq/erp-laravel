import { useCallback } from 'react';

interface PdfExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export const useLazyPdfExport = () => {
  const exportToPdf = useCallback(
    async (
      elementId: string,
      options: PdfExportOptions
    ): Promise<void> => {
      try {
        // Dynamically import heavy libraries only when needed
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error(`Element with id "${elementId}" not found`);
        }

        // Create canvas from HTML element
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        // Create PDF with A4 dimensions
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pdfWidth - 2 * margin;

        // Add header
        let yPosition = margin;

        // Company info
        if (options.companyName || options.companyAddress || options.companyPhone) {
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          if (options.companyName) {
            pdf.text(options.companyName, margin, yPosition);
            yPosition += 6;
          }

          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          if (options.companyAddress) {
            const addressLines = pdf.splitTextToSize(options.companyAddress, contentWidth - 20);
            pdf.text(addressLines, margin, yPosition);
            yPosition += addressLines.length * 4 + 2;
          }

          if (options.companyPhone) {
            pdf.text(`Tel: ${options.companyPhone}`, margin, yPosition);
            yPosition += 5;
          }

          // Divider
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
          yPosition += 5;
        }

        // Document title and subtitle
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(options.title, margin, yPosition);
        yPosition += 7;

        if (options.subtitle) {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.text(options.subtitle, margin, yPosition);
          yPosition += 6;
        }

        // Export date
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        const exportDate = new Date().toLocaleString('id-ID');
        pdf.text(`Diekspor: ${exportDate}`, margin, yPosition);
        yPosition += 5;

        // Content image
        const contentHeight = (canvas.height / canvas.width) * contentWidth;
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          yPosition,
          contentWidth,
          contentHeight
        );

        // Save PDF
        pdf.save(options.filename);
      } catch (error) {
        console.error('PDF export failed:', error);
        throw error;
      }
    },
    []
  );

  return { exportToPdf };
};

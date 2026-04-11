import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface PrintContextType {
  printDocument: (content: ReactNode) => void;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export const PrintProvider = ({ children }: { children: ReactNode }) => {
  const [printContent, setPrintContent] = useState<ReactNode | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const printDocument = (content: ReactNode) => {
    setPrintContent(content);
    
    // Give time for React to render the content into the hidden div
    setTimeout(() => {
      const printArea = document.getElementById('print-area-hidden');
      const iframe = printFrameRef.current;
      
      if (printArea && iframe && iframe.contentWindow) {
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Print Document</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; }

                @media print {
                  @page { margin: 1cm; size: A4; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }

                /* Print document layout */
                .print-document { width: 100%; color: black; }
                .print-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                .print-table th,
                .print-table td { border: 1px solid #d1d5db; padding: 0.4rem 0.5rem; text-align: left; }
                .print-table th { background-color: #f3f4f6; font-weight: 600; }
                .print-table tfoot td { border-top: 2px solid #374151; }

                /* Signature & utility */
                .signature-box { border-top: 1px solid black; padding-top: 0.5rem; margin-top: 3rem; text-align: center; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .text-xl { font-size: 1.1rem; }
                .text-sm { font-size: 0.85rem; }
                .text-xs { font-size: 0.75rem; }
                .underline { text-decoration: underline; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .gap-4 { gap: 1rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mt-8 { margin-top: 2rem; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .border-none { border: none !important; }
                .border-b-2 { border-bottom: 2px solid #374151; }
              </style>
            </head>
            <body>
              <div class="print-only">
                ${printArea.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    }, 500);
  };

  return (
    <PrintContext.Provider value={{ printDocument }}>
      {children}
      {/* Hidden container for React to render the print content */}
      <div id="print-area-hidden" style={{ display: 'none' }}>
        {printContent}
      </div>
      {/* Hidden iframe for printing */}
      <iframe 
        ref={printFrameRef} 
        style={{ position: 'absolute', width: 0, height: 0, border: 'none' }} 
        title="print-frame"
      />
    </PrintContext.Provider>
  );
};

export const usePrint = () => {
  const context = useContext(PrintContext);
  if (context === undefined) {
    throw new Error('usePrint must be used within a PrintProvider');
  }
  return context;
};

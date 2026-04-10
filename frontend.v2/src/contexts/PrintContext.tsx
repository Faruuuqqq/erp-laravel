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
              <link rel="stylesheet" href="/src/index.css">
              <link rel="stylesheet" href="/src/App.css">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                @media print {
                  @page { margin: 1cm; }
                  body { font-family: 'Inter', sans-serif; }
                }
                
                .print-document { width: 100%; color: black; }
                .print-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                .print-table th, .print-table td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
                .print-table th { background-color: #f3f4f6 !important; }
                .signature-box { border-top: 1px solid black; padding-top: 0.5rem; margin-top: 3rem; text-align: center; }
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

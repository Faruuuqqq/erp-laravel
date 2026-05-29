import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Download, RefreshCcw } from 'lucide-react';
import type { ImportResultData } from './types';

interface ImportStepResultProps {
  result: ImportResultData;
  onReset: () => void;
  title: string;
}

export function ImportStepResult({ result, onReset, title }: ImportStepResultProps) {
  const handleDownloadErrors = () => {
    if (!result.errors || result.errors.length === 0) return;

    // Parse error strings into rows for Excel
    // "Row 5: The name field is required." -> ["5", "The name field is required."]
    const errorData = result.errors.map(err => {
      const match = err.match(/Baris (\d+): (.*)|Row (\d+): (.*)/i);
      if (match) {
        const row = match[1] || match[3];
        const message = match[2] || match[4];
        return {
          Baris: row,
          Pesan: message,
          'Pesan Asli': err
        };
      }
      return {
        Baris: '-',
        Pesan: err,
        'Pesan Asli': err
      };
    });

    const ws = XLSX.utils.json_to_sheet(errorData);
    
    // Auto-width
    ws['!cols'] = [
      { wch: 10 },
      { wch: 50 },
      { wch: 80 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Error Log");
    XLSX.writeFile(wb, `Error_Import_${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-green-800">Import Selesai</h4>
          <p className="text-green-700 mt-1">
            Berhasil import <strong>{result.imported}</strong> baris data.
            {result.skipped > 0 && ` Dilewati ${result.skipped} baris (duplikat/error).`}
          </p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Log Error ({result.errors.length}):
            </h4>
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-white"
              onClick={handleDownloadErrors}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Excel
            </Button>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-700 max-h-40 overflow-y-auto space-y-1 pr-2">
            {result.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onReset} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Import Lagi
        </Button>
      </div>
    </div>
  );
}

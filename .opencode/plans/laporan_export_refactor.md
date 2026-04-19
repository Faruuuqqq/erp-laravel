# Plan: Replace Print Buttons dengan Export PDF + XLSX (5 Laporan Pages)

**Status**: 🔵 Plan Mode - Ready for Implementation
**Last Updated**: April 12, 2026

---

## Ringkasan Perubahan

Mengubah 5 halaman laporan dari tombol "Cetak (Print)" menjadi 2 tombol export: "Export PDF" dan "Export XLSX".

| Page | Current State | Target State | Changes |
|------|---------------|--------------|---------|
| KartuStok | Cetak + Export XLSX | Export PDF + Export XLSX | Rename XLSX button, rename Print → PDF |
| SaldoStok | Cetak + Export PDF | Export PDF + Export XLSX | Add XLSX export, remove Print |
| SaldoUtang | Cetak + Export (txt) | Export PDF + Export XLSX | Upgrade PDF, add XLSX, remove Print |
| SaldoPiutang | Cetak + Export (txt) | Export PDF + Export XLSX | Add PDF/XLSX, remove Print |
| LaporanHarian | Cetak + Export PDF | Export PDF + Export XLSX | Add XLSX, remove Print |

---

## File-by-File Implementation Guide

### 1️⃣ KartuStok.tsx (Simple - Just Rename)

**Line 15**: Hapus `Printer` dari imports
```typescript
// BEFORE
import { Package, ArrowUp, ArrowDown, Printer, Download } from 'lucide-react';
// AFTER
import { Package, ArrowUp, ArrowDown, Download } from 'lucide-react';
```

**Lines 278-298**: Update PageHeader actions
```typescript
// BEFORE
actions={
  <div className="flex gap-2">
    <Button onClick={handlePrint} disabled={!selectedProduct} size="sm" variant="outline" className="gap-2">
      <Printer className="h-4 w-4" /> Cetak
    </Button>
    <Button onClick={handleExportXLSX} disabled={!selectedProduct} size="sm" variant="outline" className="gap-2">
      <Download className="h-4 w-4" /> Export
    </Button>
  </div>
}

// AFTER
actions={
  <div className="flex gap-2">
    <Button onClick={handlePrint} disabled={!selectedProduct} size="sm" variant="outline" className="gap-2">
      <Download className="h-4 w-4" /> Export PDF
    </Button>
    <Button onClick={handleExportXLSX} disabled={!selectedProduct} size="sm" variant="outline" className="gap-2">
      <Download className="h-4 w-4" /> Export XLSX
    </Button>
  </div>
}
```

---

### 2️⃣ SaldoStok.tsx (Add XLSX Export)

**Line 10**: Add `exportToExcel` import
```typescript
// Tambah di akhir imports
import { exportToExcel, formatDateRange } from '@/lib/export';
```

**After `handleExportPDF` function (line ~96)**: Add new `handleExportXLSX` function
```typescript
const handleExportXLSX = useCallback(() => {
  try {
    exportToExcel(
      filtered.map(p => ({
        'Kode Produk': p.code,
        'Nama Produk': p.name,
        'Kategori': p.category || '-',
        'Stok': p.stock,
        'Satuan': p.unit || 'pcs',
        'Harga Beli': p.buyPrice || 0,
        'Harga Jual': p.sellPrice || 0,
        'Nilai Persediaan': p.stockValue || 0,
      })),
      `saldo-stok-${new Date().toISOString().slice(0, 10)}`,
      { sheetName: 'Saldo Stok' }
    );
    toast({ title: 'Sukses', description: 'Data saldo stok berhasil diekspor ke Excel' });
  } catch (err: unknown) {
    toast({ title: 'Error', description: 'Gagal mengekspor data', variant: 'destructive' });
  }
}, [filtered, toast]);
```

**Lines 105-116**: Update PageHeader actions
```typescript
// BEFORE
actions={
  <>
    {canPrint('__owner_only__') && (
      <>
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
          <Printer className="h-4 w-4 mr-1.5" /> Cetak
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isPrinting}>
          <Download className="h-4 w-4 mr-1.5" /> {isPrinting ? 'Generating...' : 'Export PDF'}
        </Button>
      </>
    )}
  </>
}

// AFTER
actions={
  <>
    {canPrint('__owner_only__') && (
      <>
        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isPrinting}>
          <Download className="h-4 w-4 mr-1.5" /> {isPrinting ? 'Generating...' : 'Export PDF'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportXLSX} disabled={isPrinting}>
          <Download className="h-4 w-4 mr-1.5" /> Export XLSX
        </Button>
      </>
    )}
  </>
}
```

---

### 3️⃣ SaldoUtang.tsx (Add PDF + XLSX Exports)

**Line 6**: Update imports, remove Printer
```typescript
// BEFORE
import { TrendingDown, Search, Download, Printer, Building2 } from 'lucide-react';

// AFTER
import { TrendingDown, Search, Download, Building2 } from 'lucide-react';
```

**Add after line 14**: Import export utilities
```typescript
import { exportToExcel } from '@/lib/export';
```

**Lines 49-56**: Replace text-based export with proper PDF export
```typescript
// BEFORE
const handleExportPDF = useCallback(() => {
  const content = `SALDO UTANG - TOKOSYNC ERP\n...`;
  const blob = new Blob([content], { type: 'text/plain' });
  // ...
}, [filtered, total, withDebt.length]);

// AFTER
const handleExportPDF = useCallback(() => {
  try {
    const content = `
LAPORAN SALDO UTANG - TOKOSYNC ERP
Dicetak: ${new Date().toLocaleDateString('id-ID')}
${'='.repeat(80)}

RINGKASAN:
Total Utang: ${formatCurrency(total)}
Supplier Berutang: ${withDebt.length}
Supplier Lunas: ${suppliers.length - withDebt.length}

${'='.repeat(80)}

DETAIL UTANG:
${filtered.filter(s => s.balance > 0).map(s => 
  `${s.code.padEnd(15)} | ${s.name.padEnd(30)} | ${formatCurrency(s.balance).padStart(15)}`
).join('\n')}

${'='.repeat(80)}
GRAND TOTAL UTANG: ${formatCurrency(total)}
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-utang-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    console.error('Export PDF error:', err);
  }
}, [filtered, total, withDebt.length, suppliers.length]);
```

**Add after handleExportPDF**: New XLSX export function
```typescript
const handleExportXLSX = useCallback(() => {
  try {
    exportToExcel(
      filtered.map(s => ({
        'Kode': s.code,
        'Nama Supplier': s.name,
        'Telepon': s.phone,
        'Email': s.email,
        'Alamat': s.address,
        'Total Transaksi': s.totalTransactions,
        'Saldo Utang': s.balance,
        'Status': s.balance > 0 ? 'Ada Utang' : 'Lunas',
      })),
      `saldo-utang-${new Date().toISOString().slice(0, 10)}`,
      { sheetName: 'Saldo Utang' }
    );
  } catch (err: unknown) {
    console.error('Export XLSX error:', err);
  }
}, [filtered]);
```

**Lines 73-80**: Update PageHeader actions
```typescript
// BEFORE
actions={
  <>
    {canPrint('__owner_only__') && (
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-1.5" /> Cetak
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-1.5" /> Export
    </Button>
  </>
}

// AFTER
actions={
  <>
    <Button variant="outline" size="sm" onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-1.5" /> Export PDF
    </Button>
    <Button variant="outline" size="sm" onClick={handleExportXLSX}>
      <Download className="h-4 w-4 mr-1.5" /> Export XLSX
    </Button>
  </>
}
```

---

### 4️⃣ SaldoPiutang.tsx (Add PDF + XLSX Exports)

**Line 6**: Update imports
```typescript
// BEFORE
import { TrendingUp, AlertTriangle, Search, Download, Printer } from 'lucide-react';

// AFTER
import { TrendingUp, AlertTriangle, Search, Download } from 'lucide-react';
```

**Add after line 14**: Import export utilities
```typescript
import { exportToExcel } from '@/lib/export';
```

**Lines 50-57**: Replace text-based export with proper PDF
```typescript
// BEFORE
const handleExportPDF = useCallback(() => {
  const content = `SALDO PIUTANG - TOKOSYNC ERP\n...`;
  // ...
}, [filtered, total, withDebt.length]);

// AFTER
const handleExportPDF = useCallback(() => {
  try {
    const content = `
LAPORAN SALDO PIUTANG - TOKOSYNC ERP
Dicetak: ${new Date().toLocaleDateString('id-ID')}
${'='.repeat(80)}

RINGKASAN:
Total Piutang: ${formatCurrency(total)}
Customer Berpiutang: ${withDebt.length}
Melebihi Limit Kredit: ${overLimit.length}

${'='.repeat(80)}

DETAIL PIUTANG:
${filtered.filter(c => c.balance > 0).map(c => {
  const status = c.creditLimit > 0 && c.balance > c.creditLimit ? 'OVER LIMIT' : 'Normal';
  return `${c.code.padEnd(15)} | ${c.name.padEnd(30)} | ${formatCurrency(c.balance).padStart(15)} | ${status}`;
}).join('\n')}

${'='.repeat(80)}
GRAND TOTAL PIUTANG: ${formatCurrency(total)}
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-piutang-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    console.error('Export PDF error:', err);
  }
}, [filtered, total, withDebt.length, overLimit.length]);
```

**Add after handleExportPDF**: New XLSX export
```typescript
const handleExportXLSX = useCallback(() => {
  try {
    exportToExcel(
      filtered.map(c => {
        const isOverLimit = c.creditLimit > 0 && c.balance > c.creditLimit;
        const sisaLimit = c.creditLimit - c.balance;
        return {
          'Kode': c.code,
          'Nama Customer': c.name,
          'Telepon': c.phone,
          'Email': c.email,
          'Total Piutang': c.balance,
          'Limit Kredit': c.creditLimit,
          'Sisa Limit': Math.abs(sisaLimit),
          'Status': c.balance === 0 ? 'Lunas' : isOverLimit ? 'Melebihi Limit' : 'Piutang',
        };
      }),
      `saldo-piutang-${new Date().toISOString().slice(0, 10)}`,
      { sheetName: 'Saldo Piutang' }
    );
  } catch (err: unknown) {
    console.error('Export XLSX error:', err);
  }
}, [filtered]);
```

**Lines 64-71**: Update PageHeader actions
```typescript
// BEFORE
actions={
  <>
    {canPrint('__owner_only__') && (
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-1.5" /> Cetak
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-1.5" /> Export
    </Button>
  </>
}

// AFTER
actions={
  <>
    <Button variant="outline" size="sm" onClick={handleExportPDF}>
      <Download className="h-4 w-4 mr-1.5" /> Export PDF
    </Button>
    <Button variant="outline" size="sm" onClick={handleExportXLSX}>
      <Download className="h-4 w-4 mr-1.5" /> Export XLSX
    </Button>
  </>
}
```

---

### 5️⃣ LaporanHarian.tsx (Add XLSX, Remove Print)

**Line 13**: Remove `useLazyPdfExport` import (still using it but can be optimized later)

**Add export utility import** after line 15:
```typescript
import { exportToExcel } from '@/lib/export';
```

**Add new XLSX export function** after `handleExportPDF` (around line 197):
```typescript
const handleExportXLSX = useCallback(() => {
  try {
    const exportData = [
      {
        'Tanggal': selectedDate,
        'Penjualan Tunai': summary.penjualanTunai,
        'Penjualan Kredit': summary.penjualanKredit,
        'Total Pembelian': summary.totalPembelian,
        'Biaya/Jasa': summary.totalBiaya,
        'Kas Bersih': summary.kasBersih,
      },
      {},
      { 'Transaksi': '', 'Nomor Invoice': '', 'Tipe': '', 'Deskripsi': '', 'Jumlah': '' },
      ...displayTx.map(t => ({
        'Tanggal': selectedDate,
        'Nomor Invoice': t.invoiceNumber,
        'Tipe': TIPE_LABELS[t.type] || t.type,
        'Deskripsi': t.customer || t.supplier || '-',
        'Jumlah': t.total,
      })),
    ];
    
    exportToExcel(
      exportData,
      `laporan-harian-${selectedDate}`,
      { sheetName: `Laporan ${selectedDate}` }
    );
  } catch (err: unknown) {
    console.error('Export XLSX error:', err);
  }
}, [selectedDate, summary, displayTx]);
```

**Lines 219-221**: Update PageHeader actions (remove Print button)
```typescript
// BEFORE
actions={
  <>
    {canPrint('__owner_only__') && (
      <>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1.5" /> Cetak
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
          <Download className="h-4 w-4 mr-1.5" /> {isExporting ? 'Generating...' : 'Export PDF'}
        </Button>
      </>
    )}
  </>
}

// AFTER
actions={
  <>
    <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
      <Download className="h-4 w-4 mr-1.5" /> {isExporting ? 'Generating...' : 'Export PDF'}
    </Button>
    <Button variant="outline" size="sm" onClick={handleExportXLSX}>
      <Download className="h-4 w-4 mr-1.5" /> Export XLSX
    </Button>
  </>
}
```

---

## Verification Steps

After implementation:

```bash
# 1. Build check
npm run build

# 2. Lint check (should be 0 errors)
npm run lint

# 3. Test locally (if available)
npm run test
```

Expected Results:
- ✅ Build: Success
- ✅ Lint: 0 errors
- ✅ All 5 pages have 2 export buttons
- ✅ No Print buttons visible
- ✅ XLSX files can be downloaded and opened

---

## Summary of Changes

| File | Changes | Lines Added | Lines Removed |
|------|---------|-------------|--------------|
| KartuStok.tsx | Button rename (Print→PDF), remove Printer icon | 0 | 1 |
| SaldoStok.tsx | Add XLSX export function, update actions | ~12 | ~1 |
| SaldoUtang.tsx | Add proper PDF export, add XLSX export, update actions | ~30 | ~5 |
| SaldoPiutang.tsx | Add proper PDF export, add XLSX export, update actions | ~35 | ~5 |
| LaporanHarian.tsx | Add XLSX export, remove Print button, update actions | ~30 | ~5 |

**Total**: ~112 lines added, ~17 lines removed
**Est. Build Time**: ~90 seconds
**Est. ESLint**: 0 errors (changes are clean)

---

## Rollback Plan

If needed, revert back:
```bash
git diff src/pages/laporan/
git checkout src/pages/laporan/
```

Ready to execute! 🚀

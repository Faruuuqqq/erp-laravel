# Import Data Dialog Improvement

**Date:** 2026-05-29
**Scope:** Refactor `ImportDataDialog` component from single-view to 4-step wizard with full validation, column mapping, and error handling improvements.
**Pages affected:** All 5 master data pages (Produk, Customer, Supplier, Sales, Gudang)

---

## Problem

The existing `ImportDataDialog` works but has 27 identified issues across bugs, UX, validation, and missing features. Key problems:

- No file size limit -- large files freeze the browser
- Uses deprecated `readAsBinaryString` -- Unicode issues
- Synchronous XLSX parse blocks UI thread
- No loading state during file parsing
- Silently ignores unmapped columns
- No client-side data type validation
- No manual column mapping UI
- Cannot replace file after selecting
- Dialog closable during import
- No confirmation before large imports
- Template lacks sample data and required field indicators
- Error log not downloadable

## Solution

Refactor `ImportDataDialog` into a **4-step wizard** flow while maintaining the same external API (props interface unchanged -- all 5 master pages continue working without modification).

---

## Architecture

### Step Flow

```
Step 1: Upload --> Step 2: Column Mapping --> Step 3: Preview & Validate --> Step 4: Result
```

Each step is a sub-component rendered conditionally inside the dialog. Users can navigate back to previous steps (except from Step 4).

### Step 1: Upload File

**What it does:** File selection with drag-drop or file picker.

**Changes from current:**
- Add 5MB file size limit with clear error message
- Migrate from `readAsBinaryString` to `readAsArrayBuffer`
- Add loading spinner during file parse (`isParsing` state)
- Keep drop zone visible with "Ganti File" option after file is selected
- Add keyboard accessibility: `role="button"`, `tabIndex={0}`, `onKeyDown`

**Output:** Raw parsed headers (string[]) and raw data rows (any[][]) passed to Step 2.

### Step 2: Column Mapping

**What it does:** Maps file columns to system fields. Auto-matches via label + aliases, shows dropdowns for unmatched columns.

**UI layout:**
- Table with 3 columns: "Kolom di File" | "Field Sistem" | "Status"
- Auto-matched columns show green checkmark
- Unmatched columns show a `<Select>` dropdown with all available system fields
- Required fields that aren't mapped show red warning
- "Kolom tidak digunakan" label for file columns that map to nothing (this is fine)

**Logic:**
- Auto-match runs first using existing alias logic (case-insensitive, trimmed)
- Unmatched file columns get dropdown with remaining unmapped system fields + "Tidak digunakan" option
- Required fields validation: cannot proceed to Step 3 if any required field is unmapped
- Mapping state stored as `Record<string, string>` (fileHeader -> systemFieldKey)

**New type:**
```typescript
interface ColumnMapping {
  fileHeader: string;      // Original header from file
  systemField: string;     // Key from ImportColumnDef, or '' for unmapped
  autoMatched: boolean;    // Was this auto-matched or manually set
}
```

### Step 3: Preview & Validate

**What it does:** Shows mapped data with client-side validation, highlights errors, requires confirmation.

**Changes from current:**
- Show ALL data rows (paginated, 20 per page) instead of only first 5
- Apply column mapping from Step 2 to transform raw data
- Client-side validation per cell:
  - Required fields: highlight red if empty
  - Numeric fields (prices, stock, limits): highlight if non-numeric
  - Duplicate detection within the file (highlight duplicate rows)
- Row-level error summary: "X baris valid, Y baris bermasalah"
- Confirmation prompt for imports > 100 rows
- "Kembali" button to go back to column mapping

**Validation rules (per resource):**
- Products: `buyPrice`, `sellPrice`, `stock`, `minStock` must be numeric if present
- Customers: `creditLimit`, `discount` must be numeric if present
- All: required fields must not be empty

**New type addition to ImportColumnDef:**
```typescript
export interface ImportColumnDef {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
  type?: 'text' | 'number';  // NEW: for client-side validation
}
```

### Step 4: Result

**What it does:** Shows import results with downloadable error log.

**Changes from current:**
- Add "Download Error Log" button -- exports errors as XLSX with columns: Row#, Field, Error
- Prevent dialog close during import (disable close button and overlay click when `isPending`)
- Fix wrong icon: use `Upload` instead of `Download` for import action
- "Import Lagi" button to reset back to Step 1

---

## Component Structure

```
ImportDataDialog.tsx (wizard container, step state management)
├── ImportStepUpload.tsx      (Step 1: file selection + parsing)
├── ImportStepMapping.tsx     (Step 2: column mapping UI)
├── ImportStepPreview.tsx     (Step 3: data preview + validation)
└── ImportStepResult.tsx      (Step 4: result summary)
```

Each step component receives props from parent and calls `onNext(data)` / `onBack()`.

### File Organization

All step components go in a new directory:
```
src/components/dialogs/import/
├── ImportDataDialog.tsx       (moved & refactored)
├── ImportStepUpload.tsx
├── ImportStepMapping.tsx
├── ImportStepPreview.tsx
├── ImportStepResult.tsx
└── types.ts                   (shared types)
```

The old `ImportDataDialog.tsx` location becomes a re-export for backward compatibility:
```typescript
// src/components/dialogs/ImportDataDialog.tsx
export { ImportDataDialog, type ImportColumnDef } from './import/ImportDataDialog';
```

---

## Template Improvements

The template download (Step 1) is improved:
- Add one sample data row showing expected format per resource
- Required columns marked with asterisk (*) in header
- Auto-fit column widths via `!cols` property
- File naming: `Template_Import_{title}.xlsx` (unchanged)

Sample data is generated from the `columns` prop -- each column gets a placeholder value based on its `type`:
- `text`: "Contoh {label}"
- `number`: "0"

---

## Hook Changes

### `useImport.ts`

Minimal changes:
- Type the `rows` parameter properly instead of `any[]`
- Add batch support: if rows > 500, split into chunks of 500 and send sequentially
- Return aggregated result across all chunks

```typescript
export function useImport(resource: string) {
  // ...
  mutationFn: async (rows: Record<string, unknown>[]) => {
    if (rows.length <= 500) {
      return api.post<ImportResponse>(`/${resource}/import`, { rows });
    }
    // Batch: chunk into 500-row batches
    const results: ImportResponse = { message: '', imported: 0, skipped: 0, errors: [] };
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const res = await api.post<ImportResponse>(`/${resource}/import`, { rows: chunk });
      results.imported += res.imported;
      results.skipped += res.skipped;
      results.errors.push(...res.errors);
    }
    results.message = `Import selesai: ${results.imported} berhasil, ${results.skipped} dilewati`;
    return results;
  }
}
```

---

## Master Page Changes

Each master page needs one addition: add `type` field to `importColumns` for numeric fields.

Example for Produk:
```typescript
{ key: 'buyPrice', label: 'Harga Beli', type: 'number', aliases: [...] },
{ key: 'sellPrice', label: 'Harga Jual', type: 'number', aliases: [...] },
{ key: 'stock', label: 'Stok', type: 'number', aliases: [...] },
{ key: 'minStock', label: 'Min. Stok', type: 'number', aliases: [...] },
```

No other changes to master pages -- the `ImportDataDialog` component API (props) remains identical.

---

## Error Handling

- **File parse errors:** Caught in Step 1, shown as Alert with "Coba file lain" option
- **Column mapping errors:** Prevented from proceeding -- required fields must be mapped
- **Validation errors:** Shown inline in Step 3 preview table, row count summary at top
- **Import API errors:** Caught by `useImport` hook, shown in Step 4 with downloadable log
- **Network errors:** Caught by hook's `onError`, shown as toast
- **Dialog close during import:** Prevented by disabling `onOpenChange` when `isPending`

---

## Backward Compatibility

- `ImportColumnDef` interface: new `type` field is optional, defaults to `'text'`
- `ImportDataDialog` props: identical, no breaking changes
- `useImport` hook: same API, batch logic is internal
- Backend: no changes needed, same POST `/{resource}/import` with `{ rows }` payload
- Re-export from old path ensures no import path changes needed

---

## Out of Scope

- Undo/rollback after import (would need backend transaction support)
- Web Worker for XLSX parsing (complexity not justified for 5MB limit)
- Progress bar during batch upload (spinner is sufficient for chunked 500-row batches)
- Backend validation changes

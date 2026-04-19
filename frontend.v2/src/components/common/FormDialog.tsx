import { useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

export interface FormField<T = string | number | boolean> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  value: T;
  onChange: (value: T) => void;
  options?: Array<{ value: string; label: string }>;
  width?: 'full' | 'half';
  validation?: (value: T) => string | null;
  disabled?: boolean;
}

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FormField<string | number | boolean>[];
  onSubmit: (data: Record<string, string | number | boolean>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  showValidation?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  fields,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Simpan',
  showValidation = true,
}: FormDialogProps) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const errors: Record<string, string> = {};

  // Validate all fields
  fields.forEach((field) => {
    if (field.validation) {
      const error = field.validation(field.value);
      if (error) {
        errors[field.name] = error;
      }
    }
  });

  // Auto-focus first field when dialog opens
  useEffect(() => {
    if (open && firstFieldRef.current) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are validation errors
    if (showValidation && Object.keys(errors).length > 0) {
      return;
    }

    // Build data object
    const data: Record<string, string | number | boolean> = {};
    fields.forEach((field) => {
      data[field.name] = field.value;
    });

    try {
      await onSubmit(data);
    } catch {
      // Error handling is done in the page component
    }
  };

  // Split fields into rows for 2-column layout
  const fieldRows: FormField[][] = [];
  for (let i = 0; i < fields.length; i += 2) {
    const row = [fields[i]];
    if (i + 1 < fields.length && fields[i + 1].width === 'half') {
      row.push(fields[i + 1]);
    } else if (fields[i].width !== 'full' && i + 1 < fields.length) {
      row.push(fields[i + 1]);
    }
    fieldRows.push(row);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {fieldRows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`grid gap-4 ${row.length === 2 && row.every(f => f.width !== 'full') ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
              {row.map((field, fieldIdx) => {
                const error = showValidation ? errors[field.name] : null;
                const firstField = rowIdx === 0 && fieldIdx === 0;

                return (
                  <div key={field.name} className="space-y-1.5">
                    <Label className={required(field)}>
                      {field.label}
                    </Label>

                    {field.type === 'select' ? (
                      <Select value={String(field.value ?? '')} onValueChange={field.onChange} disabled={field.disabled}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder ?? 'Pilih...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    ) : (
                      <Input
                        ref={firstField ? firstFieldRef : undefined}
                        type={field.type}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                          field.onChange(val);
                        }}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                      />
                    )}

                    {error && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || (showValidation && Object.keys(errors).length > 0)}>
              {isSubmitting ? 'Menyimpan...' : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function required(field: FormField) {
  return field.required ? <span className="text-destructive">*</span> : null;
}

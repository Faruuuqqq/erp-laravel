import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'password'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime-local'
  | 'textarea';

export interface FormFieldOption {
  label: string;
  value: string | number;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  options?: FormFieldOption[];
  validate?: (value: any) => string | undefined;
  showIf?: (values: Record<string, any>) => boolean;
}

export interface FormFieldGroup {
  name: string;
  label?: string;
  description?: string;
  fields: FormFieldSchema[];
  initialCount?: number;
  maxCount?: number;
  addLabel?: string;
  removeLabel?: string;
}

export interface FormSection {
  title: string;
  description?: string;
  fieldNames: string[];
}

export interface FormSchema {
  fields?: FormFieldSchema[];
  groups?: FormFieldGroup[];
  sections?: FormSection[];
}

export interface FormBuilderProps {
  schema: FormSchema;
  values: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onChange?: (values: Record<string, any>) => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function FormBuilder({
  schema,
  values,
  onSubmit,
  onChange,
  isSubmitting = false,
  isLoading = false,
  errors = {},
  touched = {},
  layout = 'vertical',
  columns = 2,
  submitLabel = 'Simpan',
  resetLabel = 'Reset',
  showReset = true,
  submitVariant = 'default',
  className = '',
}: FormBuilderProps) {
  const [internalValues, setInternalValues] = useState(values);
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const [internalTouched, setInternalTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Get all fields (flat list)
  const allFields = useMemo(() => {
    const fields: FormFieldSchema[] = [];
    
    if (schema.fields) {
      fields.push(...schema.fields);
    }
    
    if (schema.groups) {
      schema.groups.forEach(group => {
        fields.push(...group.fields);
      });
    }
    
    return fields;
  }, [schema]);

  // Filter visible fields
  const visibleFields = useMemo(() => {
    return allFields.filter(field => {
      if (field.hidden) return false;
      if (field.showIf) return field.showIf(internalValues);
      return true;
    });
  }, [allFields, internalValues]);

  // Validate field value
  const validateField = useCallback((field: FormFieldSchema, value: any): string | undefined => {
    if (field.required && !value) {
      return `${field.label} wajib diisi`;
    }

    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field.label} tidak valid`;
      }
    }

    if (value && field.type === 'url') {
      try {
        new URL(value);
      } catch {
        return `${field.label} tidak valid`;
      }
    }

    if (value && field.type === 'phone') {
      if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
        return `${field.label} harus berupa angka minimal 10 digit`;
      }
    }

    if (field.minLength && value && String(value).length < field.minLength) {
      return `${field.label} minimal ${field.minLength} karakter`;
    }

    if (field.maxLength && value && String(value).length > field.maxLength) {
      return `${field.label} maksimal ${field.maxLength} karakter`;
    }

    if (field.min != null && value != null && Number(value) < field.min) {
      return `${field.label} minimal ${field.min}`;
    }

    if (field.max != null && value != null && Number(value) > field.max) {
      return `${field.label} maksimal ${field.max}`;
    }

    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(String(value))) {
        return `${field.label} format tidak valid`;
      }
    }

    if (field.validate) {
      return field.validate(value);
    }

    return undefined;
  }, []);

  // Validate all fields
  const validateAll = useCallback(async (valuesToValidate: Record<string, any>): Promise<Record<string, string>> => {
    const newErrors: Record<string, string> = {};

    visibleFields.forEach(field => {
      const error = validateField(field, valuesToValidate[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    return newErrors;
  }, [visibleFields, validateField]);

  // Handle field change
  const handleChange = useCallback((fieldName: string, value: any) => {
    const newValues = { ...internalValues, [fieldName]: value };
    setInternalValues(newValues);
    onChange?.(newValues);

    // Clear error when user starts typing
    if (internalErrors[fieldName]) {
      setInternalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [internalValues, internalErrors, onChange]);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setInternalTouched(prev => ({ ...prev, [fieldName]: true }));

    const field = allFields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, internalValues[fieldName]);
      if (error) {
        setInternalErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [internalValues, allFields, validateField]);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    const newErrors = await validateAll(internalValues);
    setInternalErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(internalValues);
      } catch (err) {
        console.error('Form submission error:', err);
      }
    }

    setIsValidating(false);
  }, [internalValues, validateAll, onSubmit]);

  // Handle reset
  const handleReset = useCallback(() => {
    setInternalValues(values);
    setInternalErrors({});
    setInternalTouched({});
  }, [values]);

  // Render form field
  const renderField = (field: FormFieldSchema, index: number) => {
    const fieldError = errors[field.name] || internalErrors[field.name];
    const fieldTouched = touched[field.name] ?? internalTouched[field.name];
    const fieldValue = values[field.name] ?? internalValues[field.name];

    const commonProps = {
      disabled: isLoading || isSubmitting || field.disabled,
      value: fieldValue ?? '',
      onChange: (e: any) => handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
    };

    return (
      <div
        key={field.name}
        className={`${
          layout === 'grid'
            ? `col-span-${field.type === 'textarea' ? columns : 1}`
            : ''
        }`}
      >
        {field.type === 'select' ? (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={String(fieldValue ?? '')}
              onValueChange={val => handleChange(field.name, val)}
              disabled={commonProps.disabled}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={field.placeholder || 'Pilih...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            {fieldTouched && fieldError && (
              <p className="text-xs text-red-500">{fieldError}</p>
            )}
          </div>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={fieldValue ?? false}
              onCheckedChange={checked => handleChange(field.name, checked)}
              disabled={commonProps.disabled}
            />
            <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
              {field.label}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground ml-6">{field.description}</p>
            )}
            {fieldTouched && fieldError && (
              <p className="text-xs text-red-500">{fieldError}</p>
            )}
          </div>
        ) : field.type === 'radio' ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={e => handleChange(field.name, e.target.value)}
                    disabled={commonProps.disabled}
                  />
                  <Label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            {fieldTouched && fieldError && (
              <p className="text-xs text-red-500">{fieldError}</p>
            )}
          </div>
        ) : field.type === 'textarea' ? (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={fieldValue ?? ''}
              onChange={e => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              disabled={commonProps.disabled}
              maxLength={field.maxLength}
              className={fieldTouched && fieldError ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {field.maxLength && (
                <p className="text-xs text-muted-foreground">
                  {String(fieldValue ?? '').length} / {field.maxLength}
                </p>
              )}
            </div>
            {fieldTouched && fieldError && (
              <p className="text-xs text-red-500">{fieldError}</p>
            )}
          </div>
         ) : (
           <div className="space-y-2">
             <Label htmlFor={field.name} className="text-sm font-medium">
               {field.label}
               {field.required && <span className="text-red-500 ml-1">*</span>}
             </Label>
             <Input
               id={field.name}
               type={field.type}
               placeholder={field.placeholder}
               {...commonProps}
               className={fieldTouched && fieldError ? 'border-red-500' : ''}
               min={field.min}
               max={field.max}
               maxLength={field.maxLength}
             />
             {field.description && (
               <p className="text-xs text-muted-foreground">{field.description}</p>
             )}
             {fieldTouched && fieldError && (
               <p className="text-xs text-red-500">{fieldError}</p>
             )}
           </div>
         )}
       </div>
     );
   };

  const gridClass = layout === 'grid' 
    ? `grid grid-cols-${columns} gap-6` 
    : layout === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-6';

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Display error summary if there are validation errors */}
      {Object.keys(internalErrors).length > 0 && Object.keys(internalTouched).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Terdapat {Object.keys(internalErrors).length} kesalahan dalam formulir. Silakan periksa kembali.
          </AlertDescription>
        </Alert>
      )}

      {/* Sections */}
      {schema.sections ? (
        schema.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </div>
            <div className={gridClass}>
              {allFields.map((field, idx) => {
                if (!section.fieldNames.includes(field.name)) return null;
                if (field.hidden) return null;
                if (field.showIf && !field.showIf(internalValues)) return null;
                return renderField(field, idx);
              })}
            </div>
          </div>
        ))
      ) : (
        <div className={gridClass}>
          {visibleFields.map((field, idx) => renderField(field, idx))}
        </div>
      )}

      {/* Form groups (dynamic arrays) */}
      {schema.groups?.map(group => (
        <div key={group.name} className="space-y-4 border rounded-lg p-4">
          <div>
            <h4 className="font-medium">{group.label ?? group.name}</h4>
            {group.description && (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            )}
          </div>
          
          {/* This is a placeholder for dynamic array support */}
          {/* Full implementation would include add/remove buttons for repeating field groups */}
        </div>
      ))}

      {/* Form actions */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        {showReset && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || isSubmitting || isValidating}
          >
            {resetLabel}
          </Button>
        )}
        <Button
          type="submit"
          variant={submitVariant}
          disabled={isLoading || isSubmitting || isValidating}
        >
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default FormBuilder;

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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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

export interface FormSection {
  title: string;
  description?: string;
  fieldNames: string[];
}

export interface FormSchema {
  fields?: FormFieldSchema[];
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

// ============================================
// Extracted Components for DRY Principle
// ============================================

interface FormFieldLabelProps {
  field: FormFieldSchema;
}

const FormFieldLabel = ({ field }: FormFieldLabelProps) => (
  <Label htmlFor={field.name} className="text-sm font-medium">
    {field.label}
    {field.required && <span className="text-destructive ml-1">*</span>}
  </Label>
);

interface FormErrorMessageProps {
  error?: string;
  touched?: boolean;
}

const FormErrorMessage = ({ error, touched }: FormErrorMessageProps) =>
  touched && error ? (
    <p className="text-xs text-destructive" role="alert">
      {error}
    </p>
  ) : null;

interface FormFieldDescriptionProps {
  description?: string;
}

const FormFieldDescription = ({ description }: FormFieldDescriptionProps) =>
  description ? (
    <p className="text-xs text-muted-foreground">{description}</p>
  ) : null;

interface FormFieldWrapperProps {
  children: React.ReactNode;
  field: FormFieldSchema;
  error?: string;
  touched?: boolean;
  className?: string;
}

const FormFieldWrapper = ({
  children,
  field,
  error,
  touched,
  className,
}: FormFieldWrapperProps) => (
  <div className={cn('space-y-2', className)}>
    <FormFieldLabel field={field} />
    {children}
    <FormFieldDescription description={field.description} />
    <FormErrorMessage error={error} touched={touched} />
  </div>
);

// ============================================
// Helper Functions
// ============================================

const getFieldErrorClass = (hasError: boolean): string => {
  return hasError ? 'border-destructive' : '';
};

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
    return schema.fields || [];
  }, [schema.fields]);

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
    const isFieldDisabled = isLoading || isSubmitting || field.disabled;
    const hasError = fieldTouched && !!fieldError;

    const commonProps = {
      disabled: isFieldDisabled,
      value: fieldValue ?? '',
      onChange: (e: any) => handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
    };

    const fieldWrapperStyle =
      layout === 'grid' && field.type === 'textarea'
        ? { gridColumn: `span ${columns}` }
        : undefined;

    return (
      <div key={field.name} style={fieldWrapperStyle}>
        {field.type === 'select' ? (
          <FormFieldWrapper
            field={field}
            error={fieldError}
            touched={fieldTouched}
          >
            <Select
              value={String(fieldValue ?? '')}
              onValueChange={val => handleChange(field.name, val)}
              disabled={isFieldDisabled}
            >
              <SelectTrigger
                id={field.name}
                className={getFieldErrorClass(hasError)}
                aria-invalid={hasError}
                aria-describedby={
                  hasError ? `${field.name}-error` : undefined
                }
              >
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
          </FormFieldWrapper>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center gap-3">
            <Checkbox
              id={field.name}
              checked={fieldValue ?? false}
              onCheckedChange={checked => handleChange(field.name, checked)}
              disabled={isFieldDisabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${field.name}-error` : undefined
              }
            />
            <div className="space-y-1 flex-1">
              <label
                htmlFor={field.name}
                className="text-sm font-medium cursor-pointer"
              >
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <FormFieldDescription description={field.description} />
              <div id={`${field.name}-error`}>
                <FormErrorMessage error={fieldError} touched={fieldTouched} />
              </div>
            </div>
          </div>
        ) : field.type === 'radio' ? (
          <FormFieldWrapper
            field={field}
            error={fieldError}
            touched={fieldTouched}
          >
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={e => handleChange(field.name, e.target.value)}
                    disabled={isFieldDisabled}
                    aria-invalid={hasError}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </FormFieldWrapper>
        ) : field.type === 'textarea' ? (
          <FormFieldWrapper
            field={field}
            error={fieldError}
            touched={fieldTouched}
          >
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={fieldValue ?? ''}
              onChange={e => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              disabled={isFieldDisabled}
              maxLength={field.maxLength}
              className={getFieldErrorClass(hasError)}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${field.name}-error` : undefined
              }
            />
            {field.maxLength && (
              <p className="text-xs text-muted-foreground text-right">
                {String(fieldValue ?? '').length} / {field.maxLength}
              </p>
            )}
          </FormFieldWrapper>
        ) : (
          <FormFieldWrapper
            field={field}
            error={fieldError}
            touched={fieldTouched}
          >
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...commonProps}
              className={getFieldErrorClass(hasError)}
              min={field.min}
              max={field.max}
              maxLength={field.maxLength}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${field.name}-error` : undefined
              }
              aria-required={field.required}
            />
          </FormFieldWrapper>
        )}
      </div>
    );
  };

  const gridStyle =
    layout === 'grid'
      ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: '1.5rem',
      }
      : undefined;

  const containerClass =
    layout === 'horizontal'
      ? 'flex flex-wrap gap-4'
      : layout === 'grid'
        ? ''
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
            <div className={containerClass} style={gridStyle}>
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
        <div className={containerClass} style={gridStyle}>
          {visibleFields.map((field, idx) => renderField(field, idx))}
        </div>
      )}

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

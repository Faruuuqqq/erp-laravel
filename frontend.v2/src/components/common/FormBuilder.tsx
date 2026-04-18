import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_REGEX = /^\d{10,}$/;
const NON_DIGIT_REGEX = /\D/g;

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
  density?: 'default' | 'compact';
  stickyActions?: boolean;
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
  density = 'default',
  stickyActions = false,
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
  const internalValuesRef = useRef(internalValues);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    internalValuesRef.current = internalValues;
  }, [internalValues]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Get all fields (flat list)
  const allFields = useMemo(() => {
    return schema.fields || [];
  }, [schema.fields]);

  const fieldByName = useMemo(() => {
    return new Map(allFields.map(field => [field.name, field]));
  }, [allFields]);

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
      if (!EMAIL_REGEX.test(String(value))) {
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
      if (!PHONE_DIGITS_REGEX.test(String(value).replace(NON_DIGIT_REGEX, ''))) {
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
    setInternalValues(prevValues => {
      const newValues = { ...prevValues, [fieldName]: value };
      internalValuesRef.current = newValues;
      onChangeRef.current?.(newValues);
      return newValues;
    });

    setInternalErrors(prevErrors => {
      if (!(fieldName in prevErrors)) {
        return prevErrors;
      }

      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setInternalTouched(prev => ({ ...prev, [fieldName]: true }));

    const field = fieldByName.get(fieldName);
    if (field) {
      const error = validateField(field, internalValuesRef.current[fieldName]);
      if (error) {
        setInternalErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [fieldByName, validateField]);

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
  const renderField = useCallback((field: FormFieldSchema) => {
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
            className={density === 'compact' ? 'space-y-1.5' : undefined}
          >
            <Select
              value={String(fieldValue ?? '')}
              onValueChange={val => handleChange(field.name, val)}
              disabled={isFieldDisabled}
            >
              <SelectTrigger
                id={field.name}
                className={cn(getFieldErrorClass(hasError), density === 'compact' && 'h-9')}
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
            className={density === 'compact' ? 'space-y-1.5' : undefined}
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
            className={density === 'compact' ? 'space-y-1.5' : undefined}
          >
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={fieldValue ?? ''}
              onChange={e => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              disabled={isFieldDisabled}
              maxLength={field.maxLength}
              className={cn(getFieldErrorClass(hasError), density === 'compact' && 'min-h-[72px]')}
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
            className={density === 'compact' ? 'space-y-1.5' : undefined}
          >
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...commonProps}
              className={cn(getFieldErrorClass(hasError), density === 'compact' && 'h-9')}
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
  }, [
    errors,
    internalErrors,
    touched,
    internalTouched,
    values,
    internalValues,
    isLoading,
    isSubmitting,
    handleChange,
    handleBlur,
    layout,
    columns,
    density,
  ]);

  const resolvedColumns = Math.max(1, Math.min(columns, 4));
  const gridColumnClass =
    resolvedColumns === 1
      ? 'grid-cols-1'
      : resolvedColumns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : resolvedColumns === 3
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';

  const gridClass =
    layout === 'grid'
      ? cn('grid', gridColumnClass, density === 'compact' ? 'gap-3' : 'gap-6')
      : '';

  const containerClass =
    layout === 'horizontal'
      ? 'flex flex-wrap gap-4'
      : layout === 'grid'
        ? gridClass
        : density === 'compact'
          ? 'space-y-4'
          : 'space-y-6';

  const isActionsDisabled = isLoading || isSubmitting || isValidating;
  const isSubmitBusy = isSubmitting || isValidating;
  const submitButtonText = isSubmitting
    ? 'Menyimpan...'
    : isValidating
      ? 'Memvalidasi...'
      : submitLabel;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(density === 'compact' ? 'space-y-4' : 'space-y-6', className)}
      aria-busy={isSubmitBusy}
    >
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
          <div key={sectionIdx} className={density === 'compact' ? 'space-y-3' : 'space-y-4'}>
            <div>
              <h3 className={cn('font-semibold', density === 'compact' ? 'text-base' : 'text-lg')}>
                {section.title}
              </h3>
              {section.description && (
                <p className={cn('text-muted-foreground', density === 'compact' ? 'text-xs' : 'text-sm')}>
                  {section.description}
                </p>
              )}
            </div>
            <div className={containerClass}>
              {allFields.map(field => {
                if (!section.fieldNames.includes(field.name)) return null;
                if (field.hidden) return null;
                if (field.showIf && !field.showIf(internalValues)) return null;
                return renderField(field);
              })}
            </div>
          </div>
        ))
      ) : (
        <div className={containerClass}>
          {visibleFields.map(renderField)}
        </div>
      )}

      {/* Form actions */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-end gap-2 border-t px-4',
          density === 'compact' ? 'pt-4' : 'pt-6',
          stickyActions && 'sticky bottom-0 z-10 -mx-4 bg-background/95 px-4 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80'
        )}
      >
        {showReset && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isActionsDisabled}
            aria-label={resetLabel}
            title="Reset semua field ke nilai awal"
            className={density === 'compact' ? 'h-9' : undefined}
          >
            {resetLabel}
          </Button>
        )}
        <Button
          type="submit"
          variant={submitVariant}
          disabled={isActionsDisabled}
          aria-label={submitLabel}
          aria-busy={isSubmitBusy}
          title={
            isSubmitBusy
              ? 'Form sedang diproses'
              : 'Simpan data formulir'
          }
          className={cn('min-w-[128px]', density === 'compact' && 'h-9')}
        >
          {isSubmitBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}

export default FormBuilder;

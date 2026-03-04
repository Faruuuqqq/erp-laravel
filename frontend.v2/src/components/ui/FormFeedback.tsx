import { ReactNode } from 'react';
import { ExclamationCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFeedbackProps {
  error?: string;
  success?: string;
  className?: string;
  icon?: ReactNode;
}

export const FormFeedback = ({ error, success, className, icon }: FormFeedbackProps) => {
  if (!error && !success) return null;

  return (
    <div className={cn(
      'flex items-center gap-1.5 mt-1.5 text-sm',
      error ? 'text-destructive' : 'text-success',
      className
    )}>
      {icon || (error ? <ExclamationCircleIcon className="h-4 w-4" /> : null)}
      <span>{error || success}</span>
    </div>
  );
};

export const FormError = ({ error, className }: { error?: string; className?: string }) => {
  if (!error) return null;

  return (
    <div className={cn('flex items-center gap-1.5 mt-1.5 text-sm text-destructive', className)}>
      <ExclamationCircleIcon className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
};

export const FormSuccess = ({ success, className }: { success?: string; className?: string }) => {
  if (!success) return null;

  return (
    <div className={cn('flex items-center gap-1.5 mt-1.5 text-sm text-success', className)}>
      <span>{success}</span>
    </div>
  );
};
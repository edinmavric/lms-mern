import type { ReactNode } from 'react';
import { Label, type LabelProps } from './Label';
import { cn } from '../../lib/utils';

export interface FormFieldProps {
  label?: string;
  labelProps?: LabelProps;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  labelProps,
  error,
  required,
  helperText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={labelProps?.htmlFor} required={required} {...labelProps}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

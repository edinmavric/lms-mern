import type { ReactNode, ReactElement } from 'react';
import { useId, cloneElement, isValidElement } from 'react';
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
  id?: string;
}

export function FormField({
  label,
  labelProps,
  error,
  required,
  helperText,
  children,
  className,
  id: providedId,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = providedId || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        id: fieldId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? errorId : (helperText ? helperId : undefined),
        'aria-required': required ? 'true' : undefined,
      } as any)
    : children;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required} {...labelProps}>
          {label}
        </Label>
      )}
      {childrenWithProps}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

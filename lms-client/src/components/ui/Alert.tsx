import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', onClose, children, ...props }, ref) => {
    const variants = {
      default: 'bg-card border-border text-card-foreground',
      success: 'bg-success/10 border-success/20 text-success-foreground',
      destructive:
        'bg-destructive/10 border-destructive/20 text-destructive-foreground',
      warning: 'bg-warning/10 border-warning/20 text-warning-foreground',
      info: 'bg-info/10 border-info/20 text-info-foreground',
    };

    const icons = {
      default: null,
      success: <CheckCircle2 className="h-4 w-4" />,
      destructive: <AlertCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
        <div className="flex items-start gap-3">
          {icons[variant] && <div className="mt-0.5">{icons[variant]}</div>}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };

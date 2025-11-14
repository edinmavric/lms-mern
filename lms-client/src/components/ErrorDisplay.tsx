import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  className?: string;
}

/**
 * Reusable error display component for queries
 * Shows a user-friendly error message with optional retry button
 */
export function ErrorDisplay({
  error,
  onRetry,
  title = 'Error',
  message,
  showRetry = true,
  className = '',
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = message || error.message || 'An unexpected error occurred';

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant="destructive">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>

            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}

/**
 * Minimal inline error display (for forms)
 */
export function InlineError({ error }: { error: Error | null }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
}

/**
 * Full-page error display (for critical errors)
 */
export function PageError({
  error,
  onRetry,
  title = 'Something went wrong',
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

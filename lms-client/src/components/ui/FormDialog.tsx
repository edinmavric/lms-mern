import { type ReactNode } from 'react';
import { Dialog, DialogContent, DialogFooter } from './Dialog';
import { Button } from './Button';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showFooter?: boolean;
}

export function FormDialog({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  disabled = false,
  submitVariant = 'default',
  maxWidth = 'lg',
  showFooter = true,
}: FormDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !disabled) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSubmit && !isSubmitting && !disabled) {
              onSubmit();
            }
          }}
          className="space-y-4"
        >
          {children}

          {showFooter && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || disabled}
              >
                {cancelLabel}
              </Button>
              {onSubmit && (
                <Button
                  type="submit"
                  variant={submitVariant}
                  disabled={isSubmitting || disabled}
                  loading={isSubmitting}
                >
                  {submitLabel}
                </Button>
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}


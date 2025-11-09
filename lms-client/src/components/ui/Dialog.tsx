import { type ReactNode } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  maxWidth = 'md',
}: DialogProps) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50">
      <Transition show={open}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-black/50"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="w-full flex items-center justify-center"
          >
            <HeadlessDialog.Panel
              className={cn(
                'w-full rounded-lg border border-border bg-card shadow-lg mx-auto flex flex-col max-h-[90vh]',
                maxWidthClasses[maxWidth]
              )}
            >
              <div className="flex-shrink-0 p-4 md:p-6 pb-0 relative">
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                )}

                {title && (
                  <HeadlessDialog.Title className="text-lg font-semibold text-foreground mb-2 pr-8">
                    {title}
                  </HeadlessDialog.Title>
                )}

                {description && (
                  <HeadlessDialog.Description className="text-sm text-muted-foreground mb-4">
                    {description}
                  </HeadlessDialog.Description>
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 px-4 md:px-6">
                {children}
              </div>
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </Transition>
    </HeadlessDialog>
  );
}

export interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={cn('space-y-4 py-4', className)}>{children}</div>;
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border flex-shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

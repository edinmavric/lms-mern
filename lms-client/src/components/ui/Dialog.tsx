import { type ReactNode } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}

              {title && (
                <HeadlessDialog.Title className="text-lg font-semibold text-foreground mb-2">
                  {title}
                </HeadlessDialog.Title>
              )}

              {description && (
                <HeadlessDialog.Description className="text-sm text-muted-foreground mb-4">
                  {description}
                </HeadlessDialog.Description>
              )}

              {children}
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
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 mt-6', className)}>
      {children}
    </div>
  );
}

import { type ReactNode } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const sideClasses = {
  left: 'inset-y-0 left-0 h-full w-full sm:max-w-sm',
  right: 'inset-y-0 right-0 h-full w-full sm:max-w-sm',
  top: 'inset-x-0 top-0 w-full sm:max-h-screen',
  bottom: 'inset-x-0 bottom-0 w-full sm:max-h-screen',
};

const slideClasses = {
  left: {
    enterFrom: '-translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-full',
  },
  right: {
    enterFrom: 'translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-full',
  },
  top: {
    enterFrom: '-translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: '-translate-y-full',
  },
  bottom: {
    enterFrom: 'translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: 'translate-y-full',
  },
};

export function Sheet({
  open,
  onClose,
  children,
  side = 'left',
}: SheetProps) {
  const slide = slideClasses[side];

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

        <div className="fixed inset-0 flex pointer-events-none">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom={slide.enterFrom}
            enterTo={slide.enterTo}
            leave="ease-in duration-200"
            leaveFrom={slide.leaveFrom}
            leaveTo={slide.leaveTo}
            className={cn(
              'fixed flex flex-col bg-card border-border shadow-lg pointer-events-auto',
              sideClasses[side],
              side === 'left' || side === 'right' ? 'border-r' : 'border-b'
            )}
          >
            {children}
          </Transition.Child>
        </div>
      </Transition>
    </HeadlessDialog>
  );
}

export interface SheetContentProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function SheetContent({
  children,
  className,
}: SheetContentProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {children}
    </div>
  );
}


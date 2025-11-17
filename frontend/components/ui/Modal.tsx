// components/ui/Modal.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
}

const MODAL_SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
}: ModalProps) {
  // Close on ESC key and lock scroll when open
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow || 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dialogId = title ? 'modal-title' : undefined;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby={dialogId}
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full',
            'rounded-2xl bg-white shadow-2xl',
            'border border-neutral-200',
            'dark:bg-neutral-900 dark:border-neutral-800',
            'transform transition-all',
            MODAL_SIZES[size]
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
              <h3
                id={dialogId}
                className="text-xl font-semibold text-neutral-900 dark:text-neutral-50"
              >
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                aria-label="Cerrar modal"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
          )}

          {/* Content */}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}



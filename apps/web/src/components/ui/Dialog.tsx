// 📁 web/src/components/ui/dialog.tsx

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface DialogContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function Dialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('DialogTrigger must be used within Dialog');
  }

  return (
    <button
      onClick={() => {
        context.open();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = useContext(DialogContext);

  if (!context?.isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={context.close}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={context.close}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}

"use client";
import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, title, children, footer, onClose, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} mx-4 bg-white rounded-xl shadow-lg border border-gray-200`}> 
        {title && (
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button aria-label="Cerrar" className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ARCHIVO: Spinner.tsx
 * FUNCION: Componentes de indicadores de carga (spinner, overlay, card)
 * IMPLEMENTACION: SVG animado con clases Tailwind, variantes de tamaño sm/md/lg
 * DEPENDENCIAS: react, @/lib/cn
 * EXPORTS: Spinner, LoadingOverlay, LoadingCard
 */
import React from 'react';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-blue-600', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingOverlay({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size="md" />
    </div>
  );
}

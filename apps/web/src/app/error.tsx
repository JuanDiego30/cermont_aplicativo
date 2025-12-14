/**
 * ARCHIVO: error.tsx
 * FUNCION: Error boundary para capturar errores a nivel de página manteniendo el layout
 * IMPLEMENTACION: Client Component con reset callback, logging de errores y UI amigable con acciones
 * DEPENDENCIAS: react, next/link, lucide-react
 * EXPORTS: Error (Client Component default)
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error para debugging/monitoreo
    console.error('❌ Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-warning-100 dark:bg-warning-500/20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-warning-600 dark:text-warning-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ocurrió un error
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Algo salió mal al cargar esta página. Por favor, intenta de nuevo.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        {/* Error digest for support */}
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Código de error: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

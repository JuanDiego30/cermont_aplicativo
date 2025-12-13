/**
 * @file error.tsx
 * @description Error boundary para la página de técnicos
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TecnicosError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error
    console.error('Error en página de técnicos:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Error al cargar técnicos
      </h2>
      
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {error.message || 'Ocurrió un error inesperado al cargar la información de los técnicos.'}
      </p>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
        
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          Ir al Dashboard
        </a>
      </div>

      {process.env.NODE_ENV === 'development' && error.digest && (
        <p className="mt-6 text-xs text-gray-400">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

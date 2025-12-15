/**
 * ARCHIVO: clientes/error.tsx
 * FUNCION: Error boundary para la pagina de clientes
 * IMPLEMENTACION: Muestra mensaje de error con boton de reintentar
 * DEPENDENCIAS: React useEffect, lucide-react icons
 * EXPORTS: ClientesError (default) - Client Component
 */
'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ClientesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en clientes:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Error al cargar clientes
      </h2>
      <p className="text-gray-500 mb-6">
        {error.message || 'Ocurrió un error inesperado'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}

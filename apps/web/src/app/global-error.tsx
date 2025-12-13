/**
 * 📁 app/global-error.tsx
 *
 * ✨ Global Error Boundary - Client Component
 *
 * Este componente captura errores críticos a nivel de aplicación.
 * Es necesario incluir <html> y <body> porque reemplaza el layout raíz.
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log del error para servicios de monitoreo (Sentry, etc.)
    console.error('🚨 Global Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });

    // Aquí podrías enviar a un servicio de error tracking
    // Ejemplo: Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg w-full">
          {/* Error Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-error-100 dark:bg-error-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-error-600 dark:text-error-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Algo salió mal!
            </h1>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Ha ocurrido un error inesperado en la aplicación.
              Por favor, intenta recargar la página.
            </p>

            {/* Error details (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left overflow-auto max-h-32">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Detalles del error
                  </span>
                </div>
                <code className="text-xs text-error-600 dark:text-error-400 break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <p className="text-xs text-gray-400 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </a>
            </div>
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Si el problema persiste, por favor{' '}
            <a
              href="mailto:soporte@cermont.co"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
            >
              contacta a soporte
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}

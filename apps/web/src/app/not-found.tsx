/**
 * 📁 app/not-found.tsx
 *
 * ✨ 404 Page - Server Component
 * Página para rutas no encontradas
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { Home, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o ha sido movida.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        {/* 404 Graphic */}
        <div className="relative">
          <div className="text-[150px] font-bold text-gray-200 dark:text-gray-800 select-none leading-none">
            404
          </div>
          {/* Decorative element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          Página no encontrada
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            Ir al dashboard
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
          ¿Necesitas ayuda?{' '}
          <Link
            href="/contacto"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
          >
            Contáctanos
          </Link>
        </p>
      </div>
    </div>
  );
}

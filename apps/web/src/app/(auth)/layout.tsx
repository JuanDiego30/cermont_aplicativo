/**
 * ARCHIVO: layout.tsx
 * FUNCION: Layout compartido para rutas de autenticación (login, register, forgot-password)
 * IMPLEMENTACION: Server Component con panel de formulario y branding lateral con Antigravity
 * DEPENDENCIAS: next/link, lucide-react, auth-branding-client
 * EXPORTS: AuthLayout (default), metadata
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AuthBrandingClient } from './auth-branding-client';

export const metadata: Metadata = {
  title: {
    template: '%s | CERMONT',
    default: 'Autenticación | CERMONT',
  },
  description: 'Accede al sistema de gestión de órdenes de trabajo de CERMONT SAS',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left side - Form */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full p-6 sm:p-0">
        {/* Back link */}
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Form container */}
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {children}
        </div>
      </div>

      {/* Right side - Branding with Antigravity effect (hidden on mobile) */}
      <AuthBrandingClient />
    </div>
  );
}

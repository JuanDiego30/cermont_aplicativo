/**
 * 📁 app/(auth)/login/page.tsx
 *
 * ✨ Página de login refactorizada
 * Server Component con metadata + Client Component para el form
 */

import type { Metadata } from 'next';
import { LoginFormClient } from './login-form-client';
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Accede a tu cuenta de CERMONT para gestionar órdenes de trabajo',
};

export default function LoginPage() {
  return (
    <>
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggleButton />
      </div>

      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
          Iniciar Sesión
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      {/* Form - Client Component */}
      <LoginFormClient />
    </>
  );
}

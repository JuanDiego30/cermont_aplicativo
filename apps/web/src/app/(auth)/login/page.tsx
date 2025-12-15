/**
 * ARCHIVO: page.tsx (login)
 * FUNCION: Página de inicio de sesión del sistema CERMONT
 * IMPLEMENTACION: Server Component con metadata SEO y Client Component para formulario
 * DEPENDENCIAS: next/Metadata, LoginFormClient
 * EXPORTS: LoginPage (default), metadata
 */
import type { Metadata } from 'next';
import { LoginFormClient } from './login-form-client';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Accede a tu cuenta de CERMONT para gestionar órdenes de trabajo',
};

export default function LoginPage() {
  return (
    <>
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

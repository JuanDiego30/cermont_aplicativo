/**
 * ARCHIVO: page.tsx (forgot-password)
 * FUNCION: Página de recuperación de contraseña olvidada
 * IMPLEMENTACION: Server Component con metadata SEO y Client Component para formulario
 * DEPENDENCIAS: next/Metadata, ForgotPasswordFormClient
 * EXPORTS: ForgotPasswordPage (default), metadata
 */
import type { Metadata } from 'next';
import { ForgotPasswordFormClient } from './forgot-password-form-client';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña',
  description: 'Recupera tu contraseña de acceso a CERMONT',
};

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
          Recuperar Contraseña
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña
        </p>
      </div>

      {/* Form - Client Component */}
      <ForgotPasswordFormClient />
    </>
  );
}

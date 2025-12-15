/**
 * ARCHIVO: page.tsx (register)
 * FUNCION: Página de registro de nuevos usuarios en CERMONT
 * IMPLEMENTACION: Server Component con metadata SEO y Client Component para formulario
 * DEPENDENCIAS: next/Metadata, RegisterFormClient
 * EXPORTS: RegisterPage (default), metadata
 */
import type { Metadata } from 'next';
import { RegisterFormClient } from './register-form-client';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Crea tu cuenta en CERMONT para gestionar órdenes de trabajo',
};

export default function RegisterPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
          Crear Cuenta
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Completa el formulario para registrarte en el sistema
        </p>
      </div>

      {/* Form - Client Component */}
      <RegisterFormClient />
    </>
  );
}

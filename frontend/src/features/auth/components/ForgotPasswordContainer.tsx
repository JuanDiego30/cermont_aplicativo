/**
 * Forgot Password Page Container
 * Contenedor principal que maneja el layout y el modo de la página
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RequestResetForm } from './RequestResetForm';
import { NewPasswordForm } from './NewPasswordForm';
import type { PageMode } from '../types/password-reset.types';

// ============================================================================
// Constants
// ============================================================================

const PAGE_CONTENT = {
  request: {
    title: 'Recuperar Contraseña',
    subtitle: 'Ingresa tu correo para recibir un enlace de recuperación',
  },
  reset: {
    title: 'Nueva Contraseña',
    subtitle: 'Ingresa tu nueva contraseña para restablecer el acceso',
  },
} as const;

// ============================================================================
// Main Component
// ============================================================================

export function ForgotPasswordContainer() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const mode: PageMode = token ? 'reset' : 'request';

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <Navigation />
      <PageLayout mode={mode} token={token} />
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function Navigation() {
  return (
    <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
      <Link
        href="/signin"
        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Volver al inicio de sesión
      </Link>
    </div>
  );
}

function PageLayout({ mode, token }: { mode: PageMode; token: string | null }) {
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div>
        <Header mode={mode} />
        <FormRenderer mode={mode} token={token} />
      </div>
    </div>
  );
}

function Header({ mode }: { mode: PageMode }) {
  const content = PAGE_CONTENT[mode];

  return (
    <div className="mb-5 sm:mb-8">
      <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
        {content.title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{content.subtitle}</p>
    </div>
  );
}

function FormRenderer({ mode, token }: { mode: PageMode; token: string | null }) {
  return (
    <div>
      {mode === 'reset' && token ? (
        <NewPasswordForm token={token} />
      ) : (
        <RequestResetForm />
      )}
    </div>
  );
}

export default ForgotPasswordContainer;

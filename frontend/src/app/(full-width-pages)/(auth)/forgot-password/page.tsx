/**
 * Forgot Password Page
 * Página de recuperación de contraseña - Refactorizada
 * 
 * Este archivo ahora solo actúa como entry point,
 * toda la lógica está delegada a los componentes del feature auth.
 */

import { Suspense } from 'react';
import { ForgotPasswordContainer } from '@/features/auth/components';

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ForgotPasswordContainer />
    </Suspense>
  );
}

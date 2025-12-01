/**
 * Request Reset Form Component
 * Formulario para solicitar enlace de recuperación de contraseña
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Input from '@/shared/components/form/input/InputField';
import Label from '@/shared/components/form/Label';
import Button from '@/shared/components/ui/button/Button';
import { useRequestReset } from '../hooks/usePasswordReset';

// ============================================================================
// Constants
// ============================================================================

const RESET_EMAIL_EXPIRY_HOURS = 1;

// ============================================================================
// Main Component
// ============================================================================

export function RequestResetForm() {
  const [email, setEmail] = useState('');
  const { state, submitRequest } = useRequestReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRequest(email);
  };

  if (state.formState === 'success') {
    return <SuccessState message={state.message} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailInput
        value={email}
        onChange={setEmail}
        disabled={state.formState === 'loading'}
      />

      {state.formState === 'error' && state.message && (
        <ErrorAlert message={state.message} />
      )}

      <SubmitButton isLoading={state.formState === 'loading'} />
      <BackToLoginLink />
    </form>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function EmailInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <Label>
        Correo electrónico <span className="text-error-500">*</span>
      </Label>
      <Input
        type="email"
        placeholder="correo@ejemplo.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button className="w-full" size="sm" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        'Enviar enlace de recuperación'
      )}
    </Button>
  );
}

function BackToLoginLink() {
  return (
    <Link href="/signin">
      <Button variant="outline" className="w-full mt-3">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio de sesión
      </Button>
    </Link>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-center">
      <SuccessIcon />
      <SuccessHeading />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
      <InfoBanner expiryHours={RESET_EMAIL_EXPIRY_HOURS} />
      <BackToLoginLink />
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
    </div>
  );
}

function SuccessHeading() {
  return (
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
      Revisa tu correo
    </h2>
  );
}

function InfoBanner({ expiryHours }: { expiryHours: number }) {
  return (
    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-700 dark:text-blue-300">
        El enlace de recuperación expirará en {expiryHours} hora
        {expiryHours > 1 ? 's' : ''}. Si no recibes el correo, revisa tu carpeta
        de spam.
      </p>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
    </div>
  );
}

export default RequestResetForm;

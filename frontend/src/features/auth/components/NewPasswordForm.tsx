/**
 * New Password Form Component
 * Formulario para establecer nueva contraseña con token de recuperación
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Input from '@/shared/components/form/input/InputField';
import Label from '@/shared/components/form/Label';
import Button from '@/shared/components/ui/button/Button';
import { useResetPassword } from '../hooks/usePasswordReset';
import { PASSWORD_REQUIREMENTS } from '../utils/password-validation';

// ============================================================================
// Types
// ============================================================================

interface NewPasswordFormProps {
  token: string;
}

interface PasswordFieldState {
  password: string;
  showPassword: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function NewPasswordForm({ token }: NewPasswordFormProps) {
  const [passwordField, setPasswordField] = useState<PasswordFieldState>({
    password: '',
    showPassword: false,
  });

  const [confirmPasswordField, setConfirmPasswordField] = useState<PasswordFieldState>({
    password: '',
    showPassword: false,
  });

  const { state, submitReset } = useResetPassword(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReset(passwordField.password, confirmPasswordField.password);
  };

  // Token verification state
  if (state.tokenStatus === 'verifying') {
    return <TokenVerifyingState />;
  }

  // Invalid token state
  if (state.tokenStatus === 'invalid') {
    return <InvalidTokenState message={state.message} />;
  }

  // Success state
  if (state.formState === 'success') {
    return <SuccessState message={state.message} />;
  }

  const isLoading = state.formState === 'loading';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.formState === 'error' && state.message && (
        <ErrorAlert message={state.message} />
      )}

      <PasswordInputField
        label="Nueva contraseña"
        field={passwordField}
        setField={setPasswordField}
        disabled={isLoading}
      />

      <PasswordInputField
        label="Confirmar contraseña"
        field={confirmPasswordField}
        setField={setConfirmPasswordField}
        disabled={isLoading}
      />

      <PasswordRequirementsSection />
      <SubmitButton isLoading={isLoading} />
    </form>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function PasswordInputField({
  label,
  field,
  setField,
  disabled,
}: {
  label: string;
  field: PasswordFieldState;
  setField: (field: PasswordFieldState) => void;
  disabled: boolean;
}) {
  const toggleVisibility = () => {
    setField({ ...field, showPassword: !field.showPassword });
  };

  const handleChange = (value: string) => {
    setField({ ...field, password: value });
  };

  return (
    <div>
      <Label>
        {label} <span className="text-error-500">*</span>
      </Label>
      <div className="relative">
        <Input
          type={field.showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={field.password}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
        />
        <PasswordVisibilityToggle
          isVisible={field.showPassword}
          onClick={toggleVisibility}
        />
      </div>
    </div>
  );
}

function PasswordVisibilityToggle({
  isVisible,
  onClick,
}: {
  isVisible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      {isVisible ? (
        <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}

function PasswordRequirementsSection() {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Requisitos de contraseña:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
        {PASSWORD_REQUIREMENTS.map((req, index) => (
          <li key={index}>{req.label}</li>
        ))}
      </ul>
    </div>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button className="w-full" size="sm" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Actualizando...
        </>
      ) : (
        'Actualizar contraseña'
      )}
    </Button>
  );
}

// ============================================================================
// State Components
// ============================================================================

function TokenVerifyingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-gray-600 dark:text-gray-400">Verificando enlace...</p>
    </div>
  );
}

function InvalidTokenState({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-center">
      <StateIcon variant="error" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Enlace no válido
      </h2>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
      <Link href="/forgot-password">
        <Button className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Solicitar nuevo enlace
        </Button>
      </Link>
    </div>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-center">
      <StateIcon variant="success" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        ¡Contraseña actualizada!
      </h2>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
      <Link href="/signin">
        <Button className="w-full">Iniciar sesión</Button>
      </Link>
    </div>
  );
}

function StateIcon({ variant }: { variant: 'success' | 'error' }) {
  const bgColor = variant === 'success' 
    ? 'bg-green-100 dark:bg-green-900/30' 
    : 'bg-red-100 dark:bg-red-900/30';
  
  const Icon = variant === 'success' ? CheckCircle : AlertCircle;
  const iconColor = variant === 'success'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex justify-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${bgColor}`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
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

export default NewPasswordForm;

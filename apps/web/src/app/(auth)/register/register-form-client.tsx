/**
 * 📁 app/(auth)/register/register-form-client.tsx
 *
 * ✨ Client Component para el formulario de registro
 * Con validación Zod y mejor UX
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export function RegisterFormClient() {
  const router = useRouter();
  const { register } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Validaciones del password
  const passwordValidations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo electrónico inválido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (!isPasswordValid) {
      errors.password = 'La contraseña no cumple los requisitos';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        await register.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al registrarse. Por favor intenta de nuevo.';
        setError(errorMessage);
      }
    });
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar errores del campo cuando el usuario escribe
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) setError('');
  };

  const isLoading = isPending || register.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Nombre completo <span className="text-error-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Juan Pérez"
          required
          autoComplete="name"
          disabled={isLoading}
          className={`w-full h-12 px-4 text-gray-800 bg-gray-50 border rounded-lg outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white ${
            fieldErrors.name
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:focus:border-brand-400'
          }`}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-error-500">{fieldErrors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Correo electrónico <span className="text-error-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="correo@empresa.com"
          required
          autoComplete="email"
          disabled={isLoading}
          className={`w-full h-12 px-4 text-gray-800 bg-gray-50 border rounded-lg outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white ${
            fieldErrors.email
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:focus:border-brand-400'
          }`}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-error-500">{fieldErrors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Teléfono <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          placeholder="+57 300 123 4567"
          autoComplete="tel"
          disabled={isLoading}
          className="w-full h-12 px-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Contraseña <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Crea una contraseña segura"
            required
            autoComplete="new-password"
            disabled={isLoading}
            className={`w-full h-12 px-4 pr-12 text-gray-800 bg-gray-50 border rounded-lg outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white ${
              fieldErrors.password
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:focus:border-brand-400'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password requirements */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            <PasswordRequirement
              met={passwordValidations.length}
              text="Mínimo 8 caracteres"
            />
            <PasswordRequirement
              met={passwordValidations.uppercase}
              text="Una mayúscula"
            />
            <PasswordRequirement
              met={passwordValidations.lowercase}
              text="Una minúscula"
            />
            <PasswordRequirement
              met={passwordValidations.number}
              text="Un número"
            />
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Confirmar contraseña <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirma tu contraseña"
            required
            autoComplete="new-password"
            disabled={isLoading}
            className={`w-full h-12 px-4 pr-12 text-gray-800 bg-gray-50 border rounded-lg outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white ${
              fieldErrors.confirmPassword
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:focus:border-brand-400'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-error-500">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleInputChange('acceptTerms')}
            disabled={isLoading}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Acepto los{' '}
            <Link
              href="/terms"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
            >
              Términos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link
              href="/privacy"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
            >
              Política de Privacidad
            </Link>
          </span>
        </label>
        {fieldErrors.acceptTerms && (
          <p className="mt-1 text-sm text-error-500">{fieldErrors.acceptTerms}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg text-sm dark:bg-error-900/20 dark:border-error-800 dark:text-error-400"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 flex items-center justify-center gap-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-gray-900"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creando cuenta...</span>
          </>
        ) : (
          'Crear Cuenta'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium hover:underline"
        >
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
}

/**
 * Componente para mostrar requisitos de contraseña
 */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600" />
      )}
      <span className={met ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'}>
        {text}
      </span>
    </div>
  );
}

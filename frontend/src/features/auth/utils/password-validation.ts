/**
 * Password Validation Utilities
 * Funciones de validación para formularios de contraseña
 */

import type { FormError } from '../types/password-reset.types';

// ============================================================================
// Constants
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Por favor ingresa tu correo electrónico',
  EMAIL_INVALID: 'Por favor ingresa un correo electrónico válido',
  PASSWORD_REQUIRED: 'Por favor ingresa una contraseña',
  PASSWORD_MIN_LENGTH: (length: number) => `La contraseña debe tener al menos ${length} caracteres`,
  PASSWORD_UPPERCASE: 'La contraseña debe contener al menos una mayúscula',
  PASSWORD_LOWERCASE: 'La contraseña debe contener al menos una minúscula',
  PASSWORD_NUMBER: 'La contraseña debe contener al menos un número',
  PASSWORD_SPECIAL: 'La contraseña debe contener al menos un carácter especial',
  CONFIRM_PASSWORD_REQUIRED: 'Por favor confirma tu contraseña',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
} as const;

// ============================================================================
// Password Requirements Configuration
// ============================================================================

export const PASSWORD_REQUIREMENTS = [
  {
    label: 'Mínimo 8 caracteres',
    test: (p: string) => p.length >= PASSWORD_RULES.minLength,
  },
  {
    label: 'Al menos una mayúscula',
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: 'Al menos una minúscula',
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    label: 'Al menos un número',
    test: (p: string) => /\d/.test(p),
  },
  {
    label: 'Al menos un carácter especial',
    test: (p: string) => SPECIAL_CHAR_REGEX.test(p),
  },
] as const;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates an email address
 */
export function validateEmail(email: string): FormError | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return {
      field: 'email',
      message: ERROR_MESSAGES.EMAIL_REQUIRED,
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      field: 'email',
      message: ERROR_MESSAGES.EMAIL_INVALID,
    };
  }

  return null;
}

/**
 * Validates password against configured rules
 */
export function validatePassword(password: string): FormError | null {
  if (!password) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_REQUIRED,
    };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_MIN_LENGTH(PASSWORD_RULES.minLength),
    };
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_UPPERCASE,
    };
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_LOWERCASE,
    };
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_NUMBER,
    };
  }

  if (PASSWORD_RULES.requireSpecialChar && !SPECIAL_CHAR_REGEX.test(password)) {
    return {
      field: 'password',
      message: ERROR_MESSAGES.PASSWORD_SPECIAL,
    };
  }

  return null;
}

/**
 * Validates that passwords match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): FormError | null {
  if (!confirmPassword) {
    return {
      field: 'confirmPassword',
      message: ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    };
  }

  if (password !== confirmPassword) {
    return {
      field: 'confirmPassword',
      message: ERROR_MESSAGES.PASSWORD_MISMATCH,
    };
  }

  return null;
}

/**
 * Validates complete password reset form
 */
export function validateResetPasswordForm(
  password: string,
  confirmPassword: string
): FormError | null {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }

  return validatePasswordMatch(password, confirmPassword);
}

// ============================================================================
// Password Strength Analysis
// ============================================================================

/**
 * Gets the status of each password requirement
 */
export function getPasswordStrength(
  password: string
): Array<{ label: string; met: boolean }> {
  return PASSWORD_REQUIREMENTS.map((req) => ({
    label: req.label,
    met: req.test(password),
  }));
}

/**
 * Calculates password strength as a percentage (0-100)
 */
export function getPasswordStrengthPercentage(password: string): number {
  if (!password) {
    return 0;
  }

  const metRequirements = PASSWORD_REQUIREMENTS.filter((req) =>
    req.test(password)
  ).length;

  return (metRequirements / PASSWORD_REQUIREMENTS.length) * 100;
}

// Re-export constants for external use
export const PASSWORD_VALIDATION_RULES = PASSWORD_RULES;

/**
 * Tipos relacionados con formularios
 */

import type { CctvFormData } from '../schemas/cctv';

/**
 * Re-export del tipo CctvFormData desde el schema
 */
export type { CctvFormData };

/**
 * Tipo para el estado de validación de campos
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Tipo para opciones de formulario
 */
export interface FormOptions {
  resetOnSubmit?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

/**
 * Tipo para datos de autenticación
 */
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

/**
 * Props comunes para componentes de formulario
 */
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

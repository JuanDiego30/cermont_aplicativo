/**
 * Password Reset Types
 * Tipos relacionados con el flujo de recuperación de contraseña
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type FormState = 'idle' | 'loading' | 'success' | 'error';
export type PageMode = 'request' | 'reset';
export type TokenStatus = 'verifying' | 'valid' | 'invalid';

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface RequestResetFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface RequestResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  message?: string;
}

export interface PasswordResetResponse {
  message: string;
  success?: boolean;
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface FormError {
  field?: string;
  message: string;
}

export interface RequestResetState {
  formState: FormState;
  message: string;
  error: FormError | null;
}

export interface ResetPasswordState {
  formState: FormState;
  tokenStatus: TokenStatus;
  message: string;
  error: FormError | null;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseRequestResetReturn {
  state: RequestResetState;
  submitRequest: (email: string) => Promise<void>;
  reset: () => void;
}

export interface UseResetPasswordReturn {
  state: ResetPasswordState;
  submitReset: (password: string, confirmPassword: string) => Promise<void>;
  reset: () => void;
}

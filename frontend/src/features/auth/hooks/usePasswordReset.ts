/**
 * Password Reset Hooks
 * Custom hooks para manejar el flujo de recuperación de contraseña
 */

import { useState, useCallback, useEffect } from 'react';
import { passwordResetApi } from '../api/password-reset.service';
import { validateEmail, validateResetPasswordForm } from '../utils/password-validation';
import type {
  RequestResetState,
  ResetPasswordState,
  UseRequestResetReturn,
  UseResetPasswordReturn,
} from '../types/password-reset.types';

// ============================================================================
// Constants
// ============================================================================

const REQUEST_RESET_INITIAL_STATE: RequestResetState = {
  formState: 'idle',
  message: '',
  error: null,
};

const RESET_PASSWORD_INITIAL_STATE: ResetPasswordState = {
  formState: 'idle',
  tokenStatus: 'verifying',
  message: '',
  error: null,
};

const DEFAULT_REQUEST_SUCCESS_MESSAGE = 'Si el correo existe, recibirás un enlace de recuperación.';
const DEFAULT_RESET_SUCCESS_MESSAGE = 'Contraseña actualizada exitosamente';
const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error. Intenta nuevamente.';
const INVALID_TOKEN_MESSAGE = 'El enlace ha expirado o no es válido';

// ============================================================================
// Error Handler
// ============================================================================

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as {
      response?: { data?: { detail?: string; message?: string } };
      message?: string;
    };
    return (
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      DEFAULT_ERROR_MESSAGE
    );
  }
  return DEFAULT_ERROR_MESSAGE;
}

// ============================================================================
// Use Request Reset Hook
// ============================================================================

/**
 * Hook para manejar la solicitud de recuperación de contraseña
 */
export function useRequestReset(): UseRequestResetReturn {
  const [state, setState] = useState<RequestResetState>(REQUEST_RESET_INITIAL_STATE);

  const submitRequest = useCallback(async (email: string) => {
    const emailError = validateEmail(email);
    if (emailError) {
      setState({
        formState: 'error',
        message: emailError.message,
        error: emailError,
      });
      return;
    }

    setState({
      formState: 'loading',
      message: '',
      error: null,
    });

    try {
      const response = await passwordResetApi.requestReset({ email });
      setState({
        formState: 'success',
        message: response.message || DEFAULT_REQUEST_SUCCESS_MESSAGE,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      setState({
        formState: 'error',
        message: errorMessage,
        error: { message: errorMessage },
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState(REQUEST_RESET_INITIAL_STATE);
  }, []);

  return { state, submitRequest, reset };
}

// ============================================================================
// Use Reset Password Hook
// ============================================================================

/**
 * Hook para manejar el restablecimiento de contraseña con token
 */
export function useResetPassword(token: string): UseResetPasswordReturn {
  const [state, setState] = useState<ResetPasswordState>(RESET_PASSWORD_INITIAL_STATE);

  const verifyTokenOnMount = useCallback(async () => {
    try {
      const response = await passwordResetApi.verifyToken(token);
      const isValid = response.valid;
      const message = isValid ? '' : (response.message || INVALID_TOKEN_MESSAGE);

      setState((prev) => ({
        ...prev,
        tokenStatus: isValid ? 'valid' : 'invalid',
        message,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        tokenStatus: 'invalid',
        message: INVALID_TOKEN_MESSAGE,
      }));
    }
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    verifyTokenOnMount();
  }, [verifyTokenOnMount]);

  const submitReset = useCallback(
    async (password: string, confirmPassword: string) => {
      const validationError = validateResetPasswordForm(password, confirmPassword);
      if (validationError) {
        setState((prev) => ({
          ...prev,
          formState: 'error',
          message: validationError.message,
          error: validationError,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        formState: 'loading',
        message: '',
        error: null,
      }));

      try {
        const response = await passwordResetApi.resetPassword({
          token,
          newPassword: password,
        });
        setState((prev) => ({
          ...prev,
          formState: 'success',
          message: response.message || DEFAULT_RESET_SUCCESS_MESSAGE,
          error: null,
        }));
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error);
        setState((prev) => ({
          ...prev,
          formState: 'error',
          message: errorMessage,
          error: { message: errorMessage },
        }));
      }
    },
    [token]
  );

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      formState: 'idle',
      message: '',
      error: null,
    }));
  }, []);

  return { state, submitReset, reset };
}

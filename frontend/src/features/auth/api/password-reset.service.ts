/**
 * Password Reset API Service
 * Servicio para manejar las llamadas al backend relacionadas con recuperación de contraseña
 */

import { apiClient } from '@/core/api';
import type {
  RequestResetPayload,
  ResetPasswordPayload,
  VerifyTokenResponse,
  PasswordResetResponse,
} from '../types/password-reset.types';

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

// ============================================================================
// Default Responses
// ============================================================================

const DEFAULT_RESPONSES = {
  REQUEST_RESET: { message: 'Si el correo existe, recibirás un enlace de recuperación.' } as const,
  VERIFY_TOKEN: { valid: false } as const,
  RESET_PASSWORD: { message: 'Contraseña actualizada exitosamente' } as const,
};

// ============================================================================
// Service
// ============================================================================

export const passwordResetApi = {
  /**
   * Solicita un enlace de recuperación de contraseña
   */
  requestReset: async (payload: RequestResetPayload): Promise<PasswordResetResponse> => {
    try {
      const response = await apiClient.post<PasswordResetResponse>(
        ENDPOINTS.FORGOT_PASSWORD,
        payload
      );
      return response ?? DEFAULT_RESPONSES.REQUEST_RESET;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verifica si un token de recuperación es válido
   */
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    try {
      const response = await apiClient.get<VerifyTokenResponse>(
        `${ENDPOINTS.VERIFY_RESET_TOKEN}?token=${encodeURIComponent(token)}`
      );
      return response ?? DEFAULT_RESPONSES.VERIFY_TOKEN;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restablece la contraseña con el token proporcionado
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<PasswordResetResponse> => {
    try {
      const response = await apiClient.post<PasswordResetResponse>(
        ENDPOINTS.RESET_PASSWORD,
        payload
      );
      return response ?? DEFAULT_RESPONSES.RESET_PASSWORD;
    } catch (error) {
      throw error;
    }
  },
};

export default passwordResetApi;

/**
 * ErrorInterceptor - Centralized HTTP error handling with Toast notifications
 * 
 * Handles:
 * - 401 Unauthorized → Logout + redirect to login
 * - 403 Forbidden → Show permission error toast
 * - 404 Not Found → Show not found toast
 * - 422 Validation → Show validation errors
 * - 500+ Server errors → Show generic error toast
 * - Network errors → Show connection error toast
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { logError, logWarn } from '../utils/logger';

// URLs that should skip error handling to avoid loops
const SKIP_ERROR_HANDLING_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/2fa',
  '/health'
];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for certain endpoints to avoid loops
      const shouldSkip = SKIP_ERROR_HANDLING_URLS.some(url => req.url.includes(url));
      
      // Extract error message from response
      const errorMessage = extractErrorMessage(error);
      
      switch (error.status) {
        case 0:
          // Network error (CORS, connection refused, etc.)
          if (!shouldSkip) {
            toast.error('Error de conexión. Verifica tu conexión a internet.', {
              title: 'Sin conexión',
              duration: 6000
            });
          }
          logError('Network error - Check if backend is running', error);
          break;
          
        case 400:
          // Bad Request - validation errors
          if (!shouldSkip) {
            toast.warning(errorMessage || 'Datos inválidos. Revisa el formulario.', {
              title: 'Error de validación'
            });
          }
          logWarn('400 Bad Request', { message: errorMessage });
          break;
          
        case 401:
          // Unauthorized - Clear session and redirect to login
          if (!shouldSkip) {
            authService.clearLocalAuth();
            toast.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
              title: 'Sesión expirada'
            });
            router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: router.url } 
            });
          }
          logWarn('401 Unauthorized - Session expired');
          break;
          
        case 403:
          // Forbidden - User doesn't have permission
          toast.error('No tienes permisos para realizar esta acción.', {
            title: 'Acceso denegado'
          });
          logWarn('403 Forbidden - Insufficient permissions');
          break;
          
        case 404:
          // Not Found
          if (!shouldSkip) {
            toast.warning(errorMessage || 'El recurso solicitado no existe.', {
              title: 'No encontrado'
            });
          }
          logWarn('404 Not Found', { url: req.url });
          break;
          
        case 409:
          // Conflict - duplicate entry
          toast.warning(errorMessage || 'Ya existe un registro con estos datos.', {
            title: 'Conflicto'
          });
          logWarn('409 Conflict', { message: errorMessage });
          break;
          
        case 422:
          // Unprocessable Entity - validation errors
          toast.warning(errorMessage || 'Error de validación en los datos.', {
            title: 'Datos inválidos'
          });
          logWarn('422 Unprocessable Entity', { message: errorMessage });
          break;
          
        case 429:
          // Too Many Requests - rate limiting
          toast.warning('Demasiadas solicitudes. Espera un momento e intenta de nuevo.', {
            title: 'Límite excedido',
            duration: 8000
          });
          logWarn('429 Too Many Requests - Rate limited');
          break;
          
        default:
          if (error.status >= 500) {
            // Server error
            toast.error('Error en el servidor. Por favor, intenta más tarde.', {
              title: 'Error del servidor',
              duration: 6000
            });
            logError('Server error', error, { status: error.status });
          }
          break;
      }

      // Re-throw error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

/**
 * Extract error message from HTTP error response
 */
function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.error) {
    // Handle structured error responses
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message) {
      return error.error.message;
    }
    if (error.error.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.map((e: { message?: string }) => e.message).join(', ');
    }
  }
  return error.message || 'Error desconocido';
}

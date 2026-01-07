/**
 * Auth Interceptor - Token & CSRF Header Management
 * 
 * Adds Authorization header with Bearer token.
 * Adds x-csrf-token header for CSRF protection.
 * Handles 401 responses with automatic token refresh.
 * 
 * @see apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Rutas que NO deben pasar por el interceptor de refresh token
const SKIP_INTERCEPTOR_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/validate-reset-token',
  '/auth/2fa/'
];

// Rutas que requieren CSRF token (modificaciones de estado)
const CSRF_REQUIRED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// CSRF Header name (must match backend x-csrf-token)
const CSRF_HEADER_NAME = 'x-csrf-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si la URL debe saltar el interceptor
  const shouldSkip = SKIP_INTERCEPTOR_URLS.some(url => req.url.includes(url));

  // Obtener tokens
  const accessToken = authService.getToken();
  const csrfToken = authService.getCsrfToken?.() || null;

  // Build headers object
  const headers: Record<string, string> = {};

  // Add Authorization header
  if (accessToken && (!shouldSkip || req.url.includes('/auth/logout'))) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Add CSRF header for state-changing requests
  if (csrfToken && CSRF_REQUIRED_METHODS.includes(req.method)) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  }

  // Clone request with headers if any were added
  let authReq = req;
  if (Object.keys(headers).length > 0) {
    authReq = req.clone({ setHeaders: headers });
  }

  // Handle response and errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip refresh logic for auth routes
      if (shouldSkip) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        // Token expired - attempt refresh
        return authService.refreshToken().pipe(
          switchMap((refreshResponse) => {
            // Retry original request with new tokens
            const newToken = refreshResponse?.token || authService.getToken();
            const newCsrf = refreshResponse?.csrfToken || authService.getCsrfToken?.();

            const retryHeaders: Record<string, string> = {
              Authorization: `Bearer ${newToken}`
            };

            if (newCsrf && CSRF_REQUIRED_METHODS.includes(req.method)) {
              retryHeaders[CSRF_HEADER_NAME] = newCsrf;
            }

            const retryReq = req.clone({ setHeaders: retryHeaders });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed - clear auth and redirect to login
            authService.clearLocalAuth();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

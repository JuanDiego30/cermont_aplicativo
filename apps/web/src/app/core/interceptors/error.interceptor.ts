/**
 * ErrorInterceptor - Centralized HTTP error handling
 * 
 * Handles:
 * - 401 Unauthorized → Logout + redirect to login
 * - 403 Forbidden → Show permission error
 * - 500+ Server errors → Show generic error
 * - Network errors → Show connection error
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { logError, logWarn } from '../utils/logger';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for auth endpoints to avoid loops (login/register/refresh/logout/2fa/etc)
      const isAuthEndpoint = req.url.includes('/auth/');
      
      if (error.status === 401 && !isAuthEndpoint) {
        // Unauthorized - Clear session and redirect to login
        authService.clearLocalAuth();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url } 
        });
        
        logWarn('401 Unauthorized - Session expired');
      } else if (error.status === 403) {
        // Forbidden - User doesn't have permission
        logWarn('403 Forbidden - Insufficient permissions');
        // You can inject a notification service here to show a toast
      } else if (error.status >= 500) {
        // Server error
        logError('Server error', error, { status: error.status });
        // You can inject a notification service here to show a toast
      } else if (error.status === 0) {
        // Network error (CORS, connection refused, etc.)
        logError('Network error - Check if backend is running', error);
        // You can inject a notification service here to show a toast
      }

      // Re-throw error so components can handle it if needed
      return throwError(() => error);
    })
  );
};


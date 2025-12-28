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
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/validate-reset-token',
  '/auth/2fa/'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si la URL debe saltar el interceptor
  const shouldSkip = SKIP_INTERCEPTOR_URLS.some(url => req.url.includes(url));

  // Obtener token
  const token = authService.getToken();

  // Clonar request y agregar token si existe
  let authReq = req;
  if (token && !shouldSkip) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (token && !req.url.includes('/auth/logout')) {
    // Para rutas auth excepto logout, no agregamos token
    authReq = req;
  } else if (token) {
    // Para logout, agregamos el token
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar respuesta y errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es una ruta que debe saltarse, no intentar refresh
      if (shouldSkip) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        // Token expirado o inválido - intentar refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry original request con nuevo token
            const newToken = authService.getToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh falló - limpiar estado local y redirigir (sin llamar logout API)
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


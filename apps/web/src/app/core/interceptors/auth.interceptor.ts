import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // No agregar token a rutas de autenticación
    if (
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh')
    ) {
        return next(req);
    }

    // Agregar token JWT al header
    const token = authService.getToken();
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es error 401, intentar refresh del token
            if (error.status === 401 && !req.url.includes('/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(response => {
                        // Reintentar la petición original con el nuevo token
                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${response.token}`
                            }
                        });
                        return next(clonedReq);
                    }),
                    catchError(refreshError => {
                        // Si el refresh falla, hacer logout
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};

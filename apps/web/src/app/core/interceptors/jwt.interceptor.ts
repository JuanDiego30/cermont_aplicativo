import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function isAuthRequest(url: string): boolean {
    return url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh');
}

export const jwtInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {
    const storage = inject(StorageService);
    const authService = inject(AuthService);

    // No agregar token a las rutas de autenticación
    if (isAuthRequest(request.url)) {
        return next(request);
    }

    // Agregar token a la petición
    const token = storage.getToken();
    if (token) {
        request = addToken(request, token);
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !isAuthRequest(request.url)) {
                return handleUnauthorizedError(request, next, authService, storage);
            }
            return throwError(() => error);
        })
    );
};

function handleUnauthorizedError(
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    authService: AuthService,
    storage: StorageService
) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((response: any) => {
                isRefreshing = false;
                const newToken = response.accessToken || storage.getToken();
                refreshTokenSubject.next(newToken);
                return next(addToken(request, newToken));
            }),
            catchError(error => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => error);
            })
        );
    } else {
        // Si ya se está refrescando, esperar a que termine
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => {
                return next(addToken(request, token!));
            })
        );
    }
}

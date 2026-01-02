import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { logError } from '../utils/logger';

export interface Usuario {
    userId: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: Usuario;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly API_URL = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'current_user';

    private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    /**
     * Realiza el login del usuario
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => this.handleAuthenticationSuccess(response)),
            catchError(this.handleError)
        );
    }

    /**
     * Registra un nuevo usuario
     */
    register(userData: Record<string, unknown>): Observable<unknown> {
        return this.http.post(`${this.API_URL}/register`, userData).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Cierra la sesión del usuario
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    /**
     * Refresca el token de acceso
     */
    refreshToken(): Observable<{ accessToken: string }> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<{ accessToken: string }>(
            `${this.API_URL}/refresh`,
            { refreshToken }
        ).pipe(
            tap(response => {
                this.setToken(response.accessToken);
            }),
            catchError(err => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Verificar si el token ha expirado
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convertir a milisegundos
            return Date.now() < expiry;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene el token de acceso
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Obtiene el refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser(): Usuario | null {
        return this.currentUserSubject.value;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    /**
     * Guarda el token en localStorage
     */
    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /**
     * Guarda el refresh token en localStorage
     */
    private setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    /**
     * Guarda el usuario en localStorage
     */
    private setUser(user: Usuario): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    /**
     * Obtiene el usuario desde localStorage
     */
    private getUserFromStorage(): Usuario | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Maneja el éxito de la autenticación
     */
    private handleAuthenticationSuccess(response: LoginResponse): void {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        this.setUser(response.user);
    }

    /**
     * Maneja errores HTTP
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ha ocurrido un error';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }

        logError('Error en AuthService', error, { errorMessage });
        return throwError(() => new Error(errorMessage));
    }
}

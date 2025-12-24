import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User, LoginDto, AuthResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly api = inject(ApiService);
    private readonly storage = inject(StorageService);
    private readonly router = inject(Router);

    // Signals for state management
    private currentUserSignal = signal<User | null>(null);
    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.currentUserSignal());

    constructor() {
        // Try to restore session on init
        // In a real app, you might want into validate the token with the backend
        const token = this.storage.getToken();
        if (token) {
            // Ideally decode token or fetch profile
            // For now, we wait for a detailed profile fetch or assume logged in state if needed
            // This simple check just ensures we have a token
        }
    }

    login(credentials: LoginDto): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
            tap(response => {
                // Handle both token field names for compatibility
                const accessToken = response.token || response.access_token;
                const refreshToken = response.refreshToken || response.refresh_token;

                if (accessToken) {
                    this.storage.setToken(accessToken);
                }
                if (refreshToken) {
                    this.storage.setItem('refreshToken', refreshToken);
                }
                this.currentUserSignal.set(response.user);
            })
        );
    }

    /**
     * Refrescar token de acceso
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.storage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        return this.api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken }).pipe(
            tap(response => {
                this.storage.setToken(response.access_token);
                if (response.refresh_token) {
                    this.storage.setItem('refreshToken', response.refresh_token);
                }
            })
        );
    }

    logout(): void {
        // Opcional: llamar al endpoint de logout del backend
        this.api.post('/auth/logout', {}).subscribe({
            next: () => { },
            error: () => { } // Continuar con logout local aunque falle
        });

        this.storage.removeToken();
        this.storage.removeItem('refreshToken');
        this.currentUserSignal.set(null);
        this.router.navigate(['/signin']);
    }

    // Helper validation
    hasRole(roles: string[]): boolean {
        const user = this.currentUserSignal();
        return user ? roles.includes(user.role) : false;
    }
}

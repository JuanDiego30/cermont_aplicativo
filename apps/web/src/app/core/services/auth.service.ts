import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthApi } from '../api/auth.api';
import { StorageService } from './storage.service';
import { User, LoginDto, AuthResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly authApi = inject(AuthApi);
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
        return this.authApi.login(credentials).pipe(
            tap(response => {
                this.currentUserSignal.set(response.user);
            })
        );
    }

    register(data: any): Observable<AuthResponse> {
        return this.authApi.register(data).pipe(
            tap(response => {
                this.currentUserSignal.set(response.user);
            })
        );
    }

    /**
     * Refrescar token de acceso
     */
    refreshToken(): Observable<AuthResponse> {
        return this.authApi.refreshToken();
    }

    /**
     * Get current user profile
     */
    getMe(): Observable<User> {
        return this.authApi.getMe().pipe(
            tap(user => {
                this.currentUserSignal.set(user);
            })
        );
    }

    logout(): void {
        // Call backend logout endpoint (optional, continue even if it fails)
        this.authApi.logout().subscribe({
            next: () => { },
            error: () => { } // Continue with local logout even if backend call fails
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

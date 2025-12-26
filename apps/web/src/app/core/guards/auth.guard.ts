import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
    try {
        // JWT format: header.payload.signature
        const payload = token.split('.')[1];
        if (!payload) return true;

        // Decode base64 payload
        const decoded = JSON.parse(atob(payload));

        // Check expiration (exp is in seconds, Date.now() is in ms)
        if (!decoded.exp) return false; // No expiration = valid

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch {
        return true; // Invalid token format = expired
    }
}

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const storage = inject(StorageService);
    const router = inject(Router);

    const token = storage.getToken();

    // Check if token exists
    if (!token) {
        router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
        // Clear expired token
        storage.removeToken();
        storage.removeItem('refreshToken');
        router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    return true;
};

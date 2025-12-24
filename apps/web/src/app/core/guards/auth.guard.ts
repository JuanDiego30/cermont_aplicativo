import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const storage = inject(StorageService);
    const router = inject(Router);

    // Check valid token first
    if (storage.getToken()) {
        return true;
    }

    // Redirect to login
    router.navigate(['/signin']);
    return false;
};

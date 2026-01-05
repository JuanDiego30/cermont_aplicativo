/**
 * ToastService - Stub implementation for toast notifications
 * TODO: Replace with actual toast library (e.g., ngx-toastr)
 */
import { Injectable } from '@angular/core';

export interface ToastOptions {
    title?: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    /**
     * Show success toast
     */
    success(message: string, options?: ToastOptions): void {
        console.log('[SUCCESS]', message, options);
        // TODO: Implement with actual toast library
    }

    /**
     * Show error toast
     */
    error(message: string, options?: ToastOptions): void {
        console.error('[ERROR]', message, options);
        // TODO: Implement with actual toast library
    }

    /**
     * Show warning toast
     */
    warning(message: string, options?: ToastOptions): void {
        console.warn('[WARNING]', message, options);
        // TODO: Implement with actual toast library
    }

    /**
     * Show info toast
     */
    info(message: string, options?: ToastOptions): void {
        console.info('[INFO]', message, options);
        // TODO: Implement with actual toast library
    }
}

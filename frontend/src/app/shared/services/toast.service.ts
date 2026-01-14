/**
 * ToastService - Real implementation using ngx-toastr
 * Provides toast notifications across the application
 */
import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface ToastOptions {
    title?: string;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    closeButton?: boolean;
    progressBar?: boolean;
}

const DEFAULT_OPTIONS: ToastOptions = {
    duration: 4000,
    position: 'top-right',
    closeButton: true,
    progressBar: true
};

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly toastr = inject(ToastrService);

    /**
     * Show success toast
     */
    success(message: string, options?: ToastOptions): void {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        this.toastr.success(message, mergedOptions.title || 'Éxito', {
            timeOut: mergedOptions.duration,
            positionClass: this.mapPosition(mergedOptions.position),
            closeButton: mergedOptions.closeButton,
            progressBar: mergedOptions.progressBar
        });
    }

    /**
     * Show error toast
     */
    error(message: string, options?: ToastOptions): void {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options, duration: 6000 };
        this.toastr.error(message, mergedOptions.title || 'Error', {
            timeOut: mergedOptions.duration,
            positionClass: this.mapPosition(mergedOptions.position),
            closeButton: mergedOptions.closeButton,
            progressBar: mergedOptions.progressBar
        });
    }

    /**
     * Show warning toast
     */
    warning(message: string, options?: ToastOptions): void {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        this.toastr.warning(message, mergedOptions.title || 'Advertencia', {
            timeOut: mergedOptions.duration,
            positionClass: this.mapPosition(mergedOptions.position),
            closeButton: mergedOptions.closeButton,
            progressBar: mergedOptions.progressBar
        });
    }

    /**
     * Show info toast
     */
    info(message: string, options?: ToastOptions): void {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        this.toastr.info(message, mergedOptions.title || 'Información', {
            timeOut: mergedOptions.duration,
            positionClass: this.mapPosition(mergedOptions.position),
            closeButton: mergedOptions.closeButton,
            progressBar: mergedOptions.progressBar
        });
    }

    /**
     * Clear all toasts
     */
    clear(): void {
        this.toastr.clear();
    }

    /**
     * Map position to ngx-toastr class
     */
    private mapPosition(position?: string): string {
        const positionMap: Record<string, string> = {
            'top-right': 'toast-top-right',
            'top-left': 'toast-top-left',
            'bottom-right': 'toast-bottom-right',
            'bottom-left': 'toast-bottom-left',
            'top-center': 'toast-top-center',
            'bottom-center': 'toast-bottom-center'
        };
        return positionMap[position || 'top-right'] || 'toast-top-right';
    }
}

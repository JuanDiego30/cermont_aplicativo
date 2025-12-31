import { Injectable } from '@angular/core';

export interface Toast {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor() { }

    success(message: string, duration = 3000): void {
        console.log('[SUCCESS]', message);
        // TODO: Implement toast notification (use ngx-toastr or similar)
    }

    error(message: string, duration = 3000): void {
        console.log('[ERROR]', message);
        // TODO: Implement toast notification
    }

    warning(message: string, duration = 3000): void {
        console.log('[WARNING]', message);
    }

    info(message: string, duration = 3000): void {
        console.log('[INFO]', message);
    }
}

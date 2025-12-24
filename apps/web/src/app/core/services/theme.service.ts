import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);

    // Use signal for reactive state
    readonly theme = signal<Theme>('light');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            // Initialize theme from localStorage or system preference
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            const initialTheme = savedTheme || 'light';
            this.theme.set(initialTheme);
            this.applyTheme(initialTheme);
        }

        // Effect to persist theme changes
        effect(() => {
            const currentTheme = this.theme();
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('theme', currentTheme);
                this.applyTheme(currentTheme);
            }
        });
    }

    toggleTheme(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const newTheme = this.theme() === 'light' ? 'dark' : 'light';

        // View Transitions API support
        const doc = document as any;
        if (doc.startViewTransition) {
            doc.startViewTransition(() => {
                this.theme.set(newTheme);
            });
        } else {
            this.theme.set(newTheme);
        }
    }

    private applyTheme(theme: Theme): void {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}

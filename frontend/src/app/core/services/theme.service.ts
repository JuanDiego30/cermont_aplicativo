import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  currentTheme = signal<Theme>(this.getInitialTheme());

  // Alias for backward compatibility
  readonly theme = this.currentTheme;

  get isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(this.currentTheme());
      this.watchSystemTheme();
    }
  }

  /**
   * Toggle con transición hexagonal
   */
  async toggleTheme(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';

    // Verificar soporte de View Transition API
    if (!this.supportsViewTransitions()) {
      this.setTheme(newTheme);
      return;
    }

    // Obtener posición del centro de la pantalla
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    // Establecer custom properties para el centro de la animación
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    // Ejecutar transición
    const transition = (
      document as Document & {
        startViewTransition?: (callback: () => void) => { ready: Promise<void> };
      }
    ).startViewTransition?.(() => {
      this.setTheme(newTheme);
    });

    if (transition) {
      await transition.ready;
    }
  }

  /**
   * Toggle desde un elemento específico (posición del mouse)
   */
  async toggleThemeFromElement(event: MouseEvent): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';

    if (!this.supportsViewTransitions()) {
      this.setTheme(newTheme);
      return;
    }

    // Usar la posición del click
    const x = event.clientX;
    const y = event.clientY;

    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    const transition = (
      document as Document & {
        startViewTransition?: (callback: () => void) => { ready: Promise<void> };
      }
    ).startViewTransition?.(() => {
      this.setTheme(newTheme);
    });

    if (transition) {
      await transition.ready;
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(theme);
      this.saveTheme(theme);
    }
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const savedTheme = localStorage.getItem('cermont-theme') as Theme;
    if (savedTheme) return savedTheme;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private saveTheme(theme: Theme): void {
    localStorage.setItem('cermont-theme', theme);
  }

  private supportsViewTransitions(): boolean {
    return 'startViewTransition' in document;
  }

  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', e => {
      if (!localStorage.getItem('cermont-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  resetToSystemTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem('cermont-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    this.setTheme(systemTheme);
  }
}

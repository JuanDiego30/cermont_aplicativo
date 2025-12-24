/**
 * Theme Service - Migrado de Next.js con View Transitions API
 * @see apps/web-old/src/context/ThemeContext.tsx
 * 
 * Incluye efecto visual de transición al cambiar entre modo claro/oscuro
 * usando View Transitions API cuando está disponible
 */

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private themeSubject = new BehaviorSubject<Theme>('light');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
      this.setTheme(savedTheme, false); // Sin transición en inicialización
    }
  }

  /**
   * Cambiar entre tema claro y oscuro con efecto de transición
   */
  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme, true); // Con transición
  }

  /**
   * Establecer tema específico
   * @param theme - Tema a establecer
   * @param useTransition - Si usar View Transitions API (efecto visual)
   */
  setTheme(theme: Theme, useTransition: boolean = true): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const applyTheme = () => {
      this.themeSubject.next(theme);
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Usar View Transitions API si está disponible y se solicita
    if (useTransition && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        applyTheme();
      });
    } else {
      applyTheme();
    }
  }

  /**
   * Obtener tema actual
   */
  get currentTheme(): Theme {
    return this.themeSubject.value;
  }
}
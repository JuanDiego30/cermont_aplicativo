import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onToggle($event)"
      class="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group shadow-sm hover:shadow-md"
      [attr.aria-label]="themeService.currentTheme() === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'"
      [attr.title]="themeService.currentTheme() === 'light' ? 'Modo Oscuro' : 'Modo Claro'"
    >
      <!-- Sol (Light Mode) -->
      @if (themeService.currentTheme() === 'light') {
        <svg 
          class="w-5 h-5 text-gray-700 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      }

      <!-- Luna (Dark Mode) -->
      @if (themeService.currentTheme() === 'dark') {
        <svg 
          class="w-5 h-5 text-gray-300 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      }

      <!-- Efecto hexagonal decorativo -->
      <div 
        class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style="background: conic-gradient(from 0deg, transparent 0deg 60deg, rgba(0, 191, 255, 0.1) 60deg 120deg, transparent 120deg 180deg, rgba(0, 191, 255, 0.1) 180deg 240deg, transparent 240deg 300deg, rgba(0, 191, 255, 0.1) 300deg 360deg);"
      ></div>
    </button>
  `
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);

  async onToggle(event: MouseEvent): Promise<void> {
    await this.themeService.toggleThemeFromElement(event);
  }
}


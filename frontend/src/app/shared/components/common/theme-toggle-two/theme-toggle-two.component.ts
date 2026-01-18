import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle-two',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle-two.component.html',
  styles: [
    `
      :host {
        display: block;
      }

      .hexagon-wrapper {
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        transition: filter 0.3s ease;
      }

      .hexagon-wrapper:hover {
        filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.2));
      }

      .hexagon-btn {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .hexagon-btn:active {
        transform: scale(0.95);
      }

      /* Custom View Transition Name */
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
      }

      ::view-transition-old(root) {
        z-index: 1;
      }
      ::view-transition-new(root) {
        z-index: 9999;
      }

      .dark::view-transition-old(root) {
        z-index: 9999;
      }
      .dark::view-transition-new(root) {
        z-index: 1;
      }
    `,
  ],
})
export class ThemeToggleTwoComponent {
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  isDark = false;

  constructor() {
    // Sync with service state
    this.isDark = this.themeService.isDark;

    // Listen to changes (effect manually or just check on toggle)
    // Simple sync for start
  }

  toggleTheme(event: MouseEvent): void {
    const x = event.clientX;
    const y = event.clientY;

    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    // Initial state before toggle
    this.isDark = this.themeService.isDark;

    // If the browser doesn't support startViewTransition, just toggle
    const viewTransitionDocument = this.document as ViewTransitionDocument;
    if (!viewTransitionDocument.startViewTransition) {
      this.themeService.toggleTheme();
      this.isDark = !this.isDark;
      return;
    }

    const transition = viewTransitionDocument.startViewTransition(() => {
      this.themeService.toggleTheme();
      this.isDark = !this.isDark; // Optimistic update
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: this.isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

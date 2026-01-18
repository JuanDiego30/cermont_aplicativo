import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing-navbar',
  imports: [RouterModule, ThemeToggleComponent],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
    >
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Navegacion principal"
      >
        <a
          routerLink="/"
          class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em]"
        >
          <img src="/logo.svg" alt="" class="h-6 w-6" aria-hidden="true" />
          CERMONT
        </a>
        <div class="flex items-center gap-3">
          <a
            href="#contacto"
            class="hidden rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:text-slate-900 sm:inline-flex dark:border-white/30 dark:text-white/80 dark:hover:border-white/60 dark:hover:text-white"
          >
            Cotizar
          </a>
          <a
            routerLink="/auth/login"
            class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
          >
            Ingresar
          </a>
          <app-theme-toggle />
        </div>
      </nav>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNavbarComponent {}

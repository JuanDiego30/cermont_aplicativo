import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Bottom Navigation Bar - Mobile Only -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden safe-area-bottom"
    >
      <div class="flex items-center justify-around h-16 px-2">
        <!-- Panel/Home -->
        <a
          routerLink="/dashboard/ecommerce"
          routerLinkActive="text-brand-500 dark:text-brand-400"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span class="text-xs mt-1 font-medium">Panel</span>
        </a>

        <!-- Órdenes -->
        <a
          routerLink="/orders"
          routerLinkActive="text-brand-500 dark:text-brand-400"
          class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span class="text-xs mt-1 font-medium">Órdenes</span>
        </a>

        <!-- FAB - Nueva Orden -->
        <div class="flex items-center justify-center flex-1">
          <a
            routerLink="/orders/new"
            class="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-linear-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </a>
        </div>

        <!-- Reportes -->
        <a
          routerLink="/reports"
          routerLinkActive="text-brand-500 dark:text-brand-400"
          class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span class="text-xs mt-1 font-medium">Reportes</span>
        </a>

        <!-- Perfil -->
        <a
          routerLink="/perfil"
          routerLinkActive="text-brand-500 dark:text-brand-400"
          class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span class="text-xs mt-1 font-medium">Perfil</span>
        </a>
      </div>
    </nav>

    <!-- Spacer for content above bottom nav -->
    <div class="h-16 lg:hidden"></div>
  `,
  styles: [
    `
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
    `,
  ],
})
export class BottomNavComponent {}

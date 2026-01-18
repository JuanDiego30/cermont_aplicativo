import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div class="max-w-md w-full text-center">
        <div class="mb-8">
          <svg
            class="w-24 h-24 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Acceso Denegado</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          No tienes permisos para acceder a esta página
        </p>
        <div class="space-y-3">
          <a routerLink="/dashboard" class="btn-primary w-full block text-center">
            Ir al Dashboard
          </a>
          <a routerLink="/auth/login" class="btn-outline w-full block text-center">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}

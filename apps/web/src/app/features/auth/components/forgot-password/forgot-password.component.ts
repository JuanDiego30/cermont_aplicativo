import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="card max-w-md w-full">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recuperar Contraseña</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Componente en desarrollo</p>
        <a routerLink="/auth/login" class="btn-primary w-full text-center block">
          Volver al Login
        </a>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent { }

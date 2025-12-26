import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-900 mb-2">CERMONT</h1>
          <p class="text-gray-600">Sistema de Gestión de Órdenes</p>
        </div>

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tu@correo.com"
            />
            <div
              *ngIf="email.invalid && email.touched"
              class="text-red-500 text-sm mt-1"
            >
              Email inválido
            </div>
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <div
              *ngIf="password.invalid && password.touched"
              class="text-red-500 text-sm mt-1"
            >
              La contraseña es requerida
            </div>
          </div>

          <!-- Botón Login -->
          <button
            type="submit"
            [disabled]="!loginForm.valid || isLoading"
            class="w-full bg-primary-500 text-white py-2 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

          <!-- Mensaje de error -->
          <div
            *ngIf="errorMessage"
            class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    ngOnInit(): void {
        // Si ya está autenticado, redirigir al dashboard
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    get email() {
        return this.loginForm.get('email')!;
    }

    get password() {
        return this.loginForm.get('password')!;
    }

    onSubmit(): void {
        if (!this.loginForm.valid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Error al iniciar sesión';
                this.isLoading = false;
            },
        });
    }
}

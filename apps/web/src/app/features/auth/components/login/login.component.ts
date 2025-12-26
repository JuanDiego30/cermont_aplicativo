import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        
        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.error.set('Credenciales inválidas o usuario inactivo');
        } else if (err.status === 429) {
          this.error.set('Demasiados intentos. Por favor espera unos minutos');
        } else if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Error al iniciar sesión. Intenta de nuevo');
        }
        
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}


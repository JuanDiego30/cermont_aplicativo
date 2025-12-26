import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  forgotPasswordForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  emailSent = signal(false);

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.success.set(true);
        this.emailSent.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al enviar el correo');
        this.loading.set(false);
      }
    });
  }

  resendEmail(): void {
    this.emailSent.set(false);
    this.success.set(false);
    this.onSubmit();
  }
}

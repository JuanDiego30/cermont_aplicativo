import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    resetPasswordForm!: FormGroup;
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal(false);
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    token = signal<string | null>(null);

    ngOnInit(): void {
        // Obtener token de la URL
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                const token = params['token'];
                if (!token) {
                    this.error.set('Token no válido o expirado');
                    return;
                }
                this.token.set(token);
            });

        this.initializeForm();
    }

    initializeForm(): void {
        this.resetPasswordForm = this.fb.group({
            newPassword: ['', [
                Validators.required,
                Validators.minLength(6),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            ]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
        const password = group.get('newPassword')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    onSubmit(): void {
        if (this.resetPasswordForm.invalid || !this.token()) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        const newPassword = this.resetPasswordForm.get('newPassword')?.value;

        this.authService.resetPassword(this.token()!, newPassword)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.success.set(true);
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 3000);
                },
                error: (err) => {
                    this.error.set(err.message || 'Error al restablecer la contraseña');
                    this.loading.set(false);
                }
            });
    }

    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
        if (field === 'password') {
            this.showPassword.update(value => !value);
        } else {
            this.showConfirmPassword.update(value => !value);
        }
    }
}

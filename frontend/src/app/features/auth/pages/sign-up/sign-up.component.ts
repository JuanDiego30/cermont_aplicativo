import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '@app/core/api/auth.api';
import { ToastService } from '@app/shared/components/toast/toast.service';
import { catchError, tap, throwError, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authApi = inject(AuthApi);
  private toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = null;

    const { nombre, email, password } = this.form.value;

    this.authApi.register({
      nombre,
      email,
      password
    })
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.loading = false;
          this.toastService.success('Cuenta creada correctamente. Inicia sesión');
          this.router.navigate(['/auth/sign-in']);
        }),
        catchError((err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al crear la cuenta';
          this.toastService.error(this.error!);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get nombre() {
    return this.form.get('nombre');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }
}

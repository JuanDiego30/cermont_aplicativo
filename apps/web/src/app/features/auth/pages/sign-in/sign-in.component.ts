import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '@app/core/api/auth.api';
import { ToastService } from '@app/shared/services/toast.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authApi = inject(AuthApi);
  private toastService = inject(ToastService);

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    this.authApi.login(email, password)
      .pipe(
        tap(() => {
          this.loading = false;
          this.toastService.success('Sesión iniciada correctamente');
          this.router.navigate(['/dashboard']);
        }),
        catchError((err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error en la autenticación';
          this.toastService.error(this.error);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }
}

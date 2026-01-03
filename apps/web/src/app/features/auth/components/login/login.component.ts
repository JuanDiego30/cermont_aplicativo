import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AntigravityBackgroundComponent } from '../../../../shared/components/antigravity-background/antigravity-background.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AntigravityBackgroundComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  requires2FA = signal(false);
  isMobile = signal(false);

  // Datos temporales para 2FA
  private tempEmail = signal('');
  private tempPassword = signal('');
  private tempRememberMe = signal(false);

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.checkMobile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password, rememberMe })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.requires2FA) {
            this.tempEmail.set(email);
            this.tempPassword.set(password);
            this.tempRememberMe.set(rememberMe);
            this.requires2FA.set(true);
            this.loading.set(false);
          } else {
            this.handleLoginSuccess();
          }
        },
        error: (err) => {
          this.error.set(err.message || 'Error al iniciar sesión');
          this.loading.set(false);
        }
      });
  }

  onSubmit2FA(): void {
    if (this.twoFactorForm.invalid) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const code = this.twoFactorForm.get('code')?.value;

    this.authService.verify2FALogin(
      this.tempEmail(),
      this.tempPassword(),
      code,
      this.tempRememberMe()
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleLoginSuccess();
        },
        error: (err) => {
          this.error.set(err.message || 'Código 2FA inválido');
          this.loading.set(false);
        }
      });
  }

  handleLoginSuccess(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultRoute();
    this.router.navigateByUrl(returnUrl);
  }

  getDefaultRoute(): string {
    const user = this.authService.currentUserSignal();
    if (!user) return '/dashboard';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'supervisor':
        return '/supervisor/dashboard';
      case 'cliente':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  backToLogin(): void {
    this.requires2FA.set(false);
    this.twoFactorForm.reset();
    this.error.set(null);
  }
}

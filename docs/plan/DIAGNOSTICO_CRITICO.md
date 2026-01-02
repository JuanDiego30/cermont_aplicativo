# 🔧 CERMONT - DIAGNÓSTICO COMPLETO Y PLAN DE CORRECCIÓN

**Fecha:** 2026-01-02 | **Estado:** 🔴 CRÍTICO | **Usuario:** JuanDiego30

---

## 📊 EXECUTIVE SUMMARY

### El Problema: 401 Error en Login
```
POST http://localhost:4000/api/auth/login 401 (Unauthorized)
```

### La Causa Raíz (Root Cause)
1. **CORS sin Credentials** - Frontend → Backend no puede enviar cookies
2. **Sin Http Interceptor** - No se agregan Authorization headers ni CSRF tokens
3. **CSRF Token Missing** - Backend espera token que frontend NUNCA envía
4. **Falta Validación Global** - DTOs no se validan automáticamente

### Impact
- ✋ **LOGIN NO FUNCIONA** (usuario no puede entrar)
- 💥 **TODA LA APP BLOQUEADA** sin autenticación
- 🚨 **SEGURIDAD COMPROMETIDA** (sin validación global, sin rate limit)

---

## 🎯 PLAN DE ACCIÓN (5 FASES)

```
FASE 1: Fix Backend CORS (10 min)
FASE 2: Create Http Interceptor (20 min)
FASE 3: Fix CSRF Token Flow (15 min)
FASE 4: Global Validation Pipe (10 min)
FASE 5: Build UI Components Base (30 min)

TOTAL: ~85 minutos
```

---

## 🔴 FASE 1: BACKEND CORS CONFIGURATION

### Problema
```typescript
// ❌ ACTUAL (apps/api/src/main.ts)
app.enableCors({
  origin: 'http://localhost:4200',
  // credentials: true es FALTANTE
});
```

### Solución
```typescript
// ✅ CORRECTED (apps/api/src/main.ts)
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,  // 🔑 CRITICAL: Permite cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 3600,
});

// Esto permite que withCredentials: true en frontend funcione
```

### Archivo a Actualizar
- `apps/api/src/main.ts` → enableCors config

---

## 🟡 FASE 2: HTTP INTERCEPTOR (CRITICAL)

### Problema
```
❌ Ningún interceptor agrega:
   - Authorization header (token)
   - CSRF token
   - Manejo de errores 401
```

### Solución: Crear Interceptor

**Archivo:** `apps/web/src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Flag para evitar refresh infinito
  private isRefreshing = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1️⃣ Agregar Authorization header
    const token = this.authService.getAccessToken();
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // 2️⃣ Todas las requests hacia el backend con credentials (Regla 1)
    req = req.clone({
      withCredentials: true, // Permite enviar/recibir cookies
    });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401(error, req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(
    error: HttpErrorResponse,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Si ya está intentando refresh, no lo vuelvas a hacer
    if (this.isRefreshing) {
      this.authService.clearLocalAuth();
      this.router.navigate(['/auth/login']);
      return throwError(() => error);
    }

    // Si el error es en refresh token, logout
    if (req.url.includes('/auth/refresh')) {
      this.authService.clearLocalAuth();
      this.router.navigate(['/auth/login']);
      return throwError(() => error);
    }

    // Intentar refrescar token
    this.isRefreshing = true;
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        this.isRefreshing = false;
        const newToken = response.token;

        // Reintentar request original con nuevo token
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next.handle(req);
      }),
      catchError((refreshError) => {
        this.isRefreshing = false;
        this.authService.clearLocalAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => refreshError);
      })
    );
  }
}
```

### Registro en AppConfig

**Archivo:** `apps/web/src/app/app.config.ts` (o `main.ts` si no usa standalone)

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([/* otros interceptors */])
    ),
    // Registrar interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
```

### Result
✅ Todas las requests incluyen:
- `Authorization: Bearer <token>`
- `withCredentials: true`
- Manejo automático de 401

---

## 🟠 FASE 3: CSRF TOKEN FLOW

### Problema
```
❌ Backend guarda CSRF token en cookie
❌ Frontend NUNCA lee la cookie  
❌ Frontend NUNCA incluye header X-CSRF-Token
❌ Resultado: assertCsrf() falla en logout/refresh
```

### Solución: Update AuthService

**Archivo:** `apps/web/src/app/core/services/auth.service.ts`

```typescript
export class AuthService {
  // ... existing code ...

  /**
   * Obtener CSRF token del cookie (después de login)
   * Regla 5: Double-submit cookie protection
   */
  private getCsrfToken(): string | null {
    const name = 'cermont_csrf';
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) return decodeURIComponent(value);
    }
    return null;
  }

  /**
   * Guardar CSRF token después de login/register
   */
  private saveCsrfToken(token: string): void {
    localStorage.setItem('cermont_csrf_token', token);
  }

  /**
   * Obtener CSRF token para requests posteriores
   */
  getCsrfTokenForRequest(): string | null {
    return localStorage.getItem('cermont_csrf_token') || this.getCsrfToken();
  }

  // Update login() to save CSRF
  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginDto, { 
      withCredentials: true 
    }).pipe(
      tap(response => {
        if (response.requires2FA) {
          return;
        }

        if (response.user && response.token) {
          // 🆕 Guardar CSRF token
          if (response.csrfToken) {
            this.saveCsrfToken(response.csrfToken);
          }
          this.handleAuthSuccess(response, loginDto.rememberMe);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Update register() to save CSRF
  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerDto, { 
      withCredentials: true 
    }).pipe(
      tap(response => {
        if (response.user && response.token) {
          if (response.csrfToken) {
            this.saveCsrfToken(response.csrfToken);
          }
          this.handleAuthSuccess(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Clear CSRF on logout
  private clearAuthData(): void {
    localStorage.removeItem('cermont_access_token');
    localStorage.removeItem('cermont_csrf_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('cermont_user');
    localStorage.removeItem('cermont_remember_me');
    this.userSubject.next(null);
  }
}
```

### Update AuthInterceptor (Add CSRF Header)

**Archivo:** `apps/web/src/app/core/interceptors/auth.interceptor.ts`

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // 1️⃣ Agregar Authorization header
  const token = this.authService.getAccessToken();
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 2️⃣ 🆕 Agregar CSRF header para logout, refresh, etc
  const csrfToken = this.authService.getCsrfTokenForRequest();
  if (csrfToken) {
    req = req.clone({
      setHeaders: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  // 3️⃣ Credentials
  req = req.clone({
    withCredentials: true,
  });

  return next.handle(req).pipe(
    // ... error handling ...
  );
}
```

---

## 🟡 FASE 4: GLOBAL VALIDATION PIPE

### Problema
```typescript
// ❌ DTOs sin validación automática
// Los datos invalidos llegan al negocio (Regla 37 violada)
```

### Solución: Configurar ValidationPipe Global

**Archivo:** `apps/api/src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🆕 Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Remover props no en DTO
      forbidNonWhitelisted: true,   // Error si hay props extra
      transform: true,              // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Errores formateados
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        }));
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    })
  );

  // Resto de config...
  await app.listen(process.env.API_PORT || 3000);
}
```

### Resultado
✅ Regla 37 cumplida: Validación en AMBOS lados

---

## 🟢 FASE 5: UI COMPONENTS BASE

### Problema
```
❌ No existen componentes reutilizables
❌ LoginComponent tiene estilos hardcoded
❌ Violación de DRY (Don't Repeat Yourself)
```

### Solución: Crear Shared Components

**Estructura:**
```
apps/web/src/app/shared/components/
├── button/
│   ├── button.component.ts
│   └── button.component.css
├── form-input/
│   ├── form-input.component.ts
│   └── form-input.component.css
├── form-error/
│   ├── form-error.component.ts
│   └── form-error.component.css
├── card/
│   ├── card.component.ts
│   └── card.component.css
└── loader/
    ├── loader.component.ts
    └── loader.component.css
```

**File:** `apps/web/src/app/shared/components/button/button.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="onClick.emit()">
      <span *ngIf="loading" class="loader"></span>
      {{ label }}
    </button>
  `,
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Output() onClick = new EventEmitter<void>();

  getButtonClasses(): string {
    return `btn btn--${this.variant}`;
  }
}
```

**File:** `apps/web/src/app/shared/components/form-input/form-input.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      <label *ngIf="label" [for]="id" class="form-label">{{ label }}</label>
      <input
        [id]="id"
        [type]="type"
        [value]="value"
        [disabled]="disabled"
        [placeholder]="placeholder"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        class="form-control"
        [class.is-invalid]="hasError"
      />
      <small *ngIf="hasError && error" class="form-text-error">{{ error }}</small>
    </div>
  `,
  styleUrls: ['./form-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  touched = false;

  get hasError(): boolean {
    return this.touched && !!this.error;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  // ControlValueAccessor methods
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
```

### Update LoginComponent to use Shared Components

**File:** `apps/web/src/app/features/auth/components/login/login.component.ts`

```typescript
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { AntigravityBackgroundComponent } from '../../../../shared/components/antigravity-background/antigravity-background.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    FormInputComponent,
    AntigravityBackgroundComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  requires2FA = signal(false);

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
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

    // 🆕 takeUntil(destroy$) para prevenir memory leaks (Regla 41)
    this.authService
      .login({ email, password, rememberMe })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.requires2FA) {
            this.requires2FA.set(true);
            this.loading.set(false);
          } else {
            this.handleLoginSuccess();
          }
        },
        error: (err) => {
          this.error.set(err.message || 'Error al iniciar sesión');
          this.loading.set(false);
        },
      });
  }

  handleLoginSuccess(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
```

---

## 📋 RESUMEN DE CAMBIOS

| Fase | Archivo | Cambio | Impacto |
|------|---------|--------|--------|
| 1 | `apps/api/src/main.ts` | `enableCors({ credentials: true })` | ✅ Cookies funciona |
| 2 | `apps/web/src/app/core/interceptors/auth.interceptor.ts` | Crear nuevo | ✅ Auth headers automáticos |
| 2 | `apps/web/src/app/app.config.ts` | Registrar interceptor | ✅ Interceptor activo |
| 3 | `apps/web/src/app/core/services/auth.service.ts` | CSRF token management | ✅ CSRF flow funciona |
| 3 | `auth.interceptor.ts` | Agregar CSRF header | ✅ CSRF protección |
| 4 | `apps/api/src/main.ts` | `useGlobalPipes(ValidationPipe)` | ✅ Regla 37 cumplida |
| 5 | `apps/web/src/app/shared/components/` | Crear 4 componentes base | ✅ UI unificada |

---

## ✅ CHECKLIST POST-CORRECCIÓN

- [ ] CORS habilitado con `credentials: true`
- [ ] AuthInterceptor creado y registrado
- [ ] CSRF token flow implementado
- [ ] ValidationPipe global configurado
- [ ] Shared components creados
- [ ] LoginComponent actualizado a usar shared components
- [ ] Login funciona (POST /api/auth/login → 200 OK)
- [ ] Token guardado en localStorage
- [ ] CSRF token guardado
- [ ] Redireccion a dashboard
- [ ] Tests: npm run test:auth (cobertura >80%)

---

## 🧪 TESTING MANUAL

```bash
# 1. Terminal 1: Backend
cd apps/api
npm run dev

# 2. Terminal 2: Frontend
cd apps/web
npm run dev

# 3. Browser: http://localhost:4200/auth/login
# Ingresar:
#   Email: test@example.com
#   Password: Test@123
#   ✅ Debería redirigir a /dashboard
#   ✅ localStorage debe tener: cermont_access_token, cermont_csrf_token, cermont_user

# 4. Network tab en DevTools:
#   POST /api/auth/login
#   ✅ Headers incluyen: Authorization, X-CSRF-Token, withCredentials
#   ✅ Cookies enviados
#   Response: 200 OK con token, user, csrfToken
```

---

## 🆕 NUEVOS AGENTES Y PROMPTS NECESARIOS

Crear estos prompts en `docs/prompts/`:

### 19-frontend-auth-critical.prompt.md
- Reparar login/logout flow
- CSRF token management
- Token refresh automático
- 2FA implementation

### 20-frontend-shared-components.prompt.md
- Button, Input, Card componentes
- Consistent styling
- Accessibility ARIA labels
- Dark mode support

### 21-backend-security.prompt.md
- CORS validation
- Rate limiting global
- Input validation
- CSRF protection

### 22-integration-tests.prompt.md
- E2E tests (login flow)
- API integration tests
- Mock data setup

---

## 📚 REFERENCIAS

- Regla 1: CORS with Credentials
- Regla 5: CSRF Double-Submit Cookie
- Regla 6: Security Logging
- Regla 7: Rate Limiting
- Regla 37: Frontend + Backend Validation
- Regla 41: State Management

---

**Generado:** 2026-01-02 14:04 PM | **Por:** AI Assistant
**Versión:** 1.0 | **Estado:** 🔴 IMPLEMENTACIÓN REQUERIDA

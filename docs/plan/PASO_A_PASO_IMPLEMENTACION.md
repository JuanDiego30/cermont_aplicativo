# 🚀 IMPLEMENTACIÓN PASO A PASO - 401 FIX

## ANTES DE EMPEZAR

```bash
# 1. Actualiza tu rama
git pull origin main

# 2. Crea rama de feature
git checkout -b fix/auth-401-and-frontend

# 3. Verifica que ambas apps corran
cd apps/api && npm run dev  # Terminal 1
cd apps/web && npm run dev  # Terminal 2
```

---

## PASO 1: FIX BACKEND CORS (10 min)

### Archivo: `apps/api/src/main.ts`

Busca la línea con `enableCors` y reemplázala:

**ANTES:**
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
});
```

**DESPUÉS:**
```typescript
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,  // 🔑 CRITICAL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 3600,
});
```

### Archivo: `apps/api/src/main.ts`

Agrega GlobalPipes antes de `app.listen()`:

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
    maxAge: 3600,
  });

  // 🆕 Validación Global (Regla 37)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Rest del código...
  await app.listen(process.env.API_PORT || 4000);
}
```

### Verificación
```bash
# Backend debe reiniciar sin errores
# Logs: [NestFactory] Application successfully started

curl -i -H "Origin: http://localhost:4200" http://localhost:4000/api/auth/me
# Headers deben incluir: Access-Control-Allow-Origin, Access-Control-Allow-Credentials
```

---

## PASO 2: CREAR HTTP INTERCEPTOR (20 min)

### Crear Archivo: `apps/web/src/app/core/interceptors/auth.interceptor.ts`

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
  private isRefreshing = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Agregar Authorization header
    const token = this.authService.getAccessToken();
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // 2. Agregar CSRF header
    const csrfToken = this.authService.getCsrfTokenForRequest();
    if (csrfToken) {
      req = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken,
        },
      });
    }

    // 3. Credentials (Regla 1)
    req = req.clone({
      withCredentials: true,
    });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
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
    if (this.isRefreshing) {
      this.authService.clearLocalAuth();
      this.router.navigate(['/auth/login']);
      return throwError(() => error);
    }

    if (req.url.includes('/auth/refresh')) {
      this.authService.clearLocalAuth();
      this.router.navigate(['/auth/login']);
      return throwError(() => error);
    }

    this.isRefreshing = true;
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        this.isRefreshing = false;
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.token}`,
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

### Crear Archivo: `apps/web/src/app/core/interceptors/index.ts`

```typescript
export * from './auth.interceptor';
```

### Registrar en app.config.ts

**Busca:**
```typescript
export const appConfig: ApplicationConfig = {
```

**Agrega:**
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers ...
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
```

### Verificación
```bash
# DevTools → Network → POST /api/auth/login
# Headers deben incluir:
# - Authorization: Bearer <token>
# - X-CSRF-Token: <token>
# - withCredentials: true (no visible pero activo)
```

---

## PASO 3: FIX CSRF TOKEN FLOW (15 min)

### Actualizar `apps/web/src/app/core/services/auth.service.ts`

**Busca la sección de métodos y agrega:**

```typescript
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
```

**En el método `login()`, busca `tap(response =>` y agrega:**

```typescript
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
```

**En el método `register()`, busca `tap(response =>` y agrega:**

```typescript
tap(response => {
  if (response.user && response.token) {
    if (response.csrfToken) {
      this.saveCsrfToken(response.csrfToken);
    }
    this.handleAuthSuccess(response);
  }
}),
```

**En `clearAuthData()`, agrega:**

```typescript
private clearAuthData(): void {
  localStorage.removeItem('cermont_access_token');
  localStorage.removeItem('cermont_csrf_token');  // 🆕
  localStorage.removeItem('auth_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('access_token');
  localStorage.removeItem('cermont_user');
  localStorage.removeItem('cermont_remember_me');
  this.userSubject.next(null);
}
```

### Verificación
```bash
# 1. DevTools → Application → LocalStorage
# Después de login debe haber:
# - cermont_access_token: <jwt>
# - cermont_csrf_token: <uuid>
# - cermont_user: {...}

# 2. Network → POST /api/auth/refresh
# Headers: X-CSRF-Token: <value>

# 3. Network → POST /api/auth/logout
# Headers: X-CSRF-Token: <value>
```

---

## PASO 4: ACTUALIZAR LOGIN COMPONENT (Regla 41 - Memory Leaks)

### Archivo: `apps/web/src/app/features/auth/components/login/login.component.ts`

**Busca el imports y agrega:**

```typescript
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
```

**En la clase, busca `export class LoginComponent` y agrega `implements OnInit, OnDestroy`:**

```typescript
export class LoginComponent implements OnInit, OnDestroy {
  // ... existing properties ...
  private destroy$ = new Subject<void>();

  // ... rest of component ...

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**En `onSubmit()`, busca `this.authService.login(...)` y reemplaza:**

**ANTES:**
```typescript
this.authService.login({ email, password, rememberMe }).subscribe({
```

**DESPUÉS:**
```typescript
this.authService
  .login({ email, password, rememberMe })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
```

**En `onSubmit2FA()`, busca `this.authService.verify2FALogin(...)` y reemplaza:**

**ANTES:**
```typescript
this.authService.verify2FALogin(...).subscribe({
```

**DESPUÉS:**
```typescript
this.authService
  .verify2FALogin(...)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
```

### Verificación
```bash
# DevTools → Console → No memory leak warnings
# Cuando navega fuera de login y vuelve, no hay suscripciones duplicadas
```

---

## PASO 5: TESTEO COMPLETO

### Test 1: CORS + Credentials
```bash
# Terminal: curl test
curl -i \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test@123"}' \
  http://localhost:4000/api/auth/login

# Esperado:
# - Status: 200 OK (no 401, no CORS error)
# - Headers: Access-Control-Allow-Credentials: true
```

### Test 2: Frontend Login
```bash
# 1. http://localhost:4200/auth/login
# 2. Ingresa: email: test@example.com, password: test@123
# 3. Verifica:
#    - Redirección a /dashboard (o home)
#    - DevTools → Application → localStorage tiene tokens
#    - DevTools → Application → Cookies tiene refreshToken
#    - No errores en console
```

### Test 3: Network Inspection
```bash
# DevTools → Network
# POST /api/auth/login
# Request Headers:
#   - Authorization: Bearer <token> ❌ (no debe estar en login)
#   - Content-Type: application/json ✅
# Response Headers:
#   - Set-Cookie: refreshToken=...; HttpOnly ✅
#   - Set-Cookie: cermont_csrf=... ✅
# Response Body:
#   - token: <jwt> ✅
#   - csrfToken: <uuid> ✅
#   - user: {...} ✅
```

### Test 4: Protected Endpoint
```bash
# Con token guardado, ir a http://localhost:4200/dashboard
# DevTools → Network → GET /api/auth/me (u otro endpoint)
# Request Headers:
#   - Authorization: Bearer <token> ✅
#   - X-CSRF-Token: <value> ✅
# Response: 200 OK con datos del usuario ✅
```

### Test 5: Refresh Token
```bash
# 1. Login normalmente
# 2. DevTools → Network → Filter "refresh"
# 3. Abrir console: setTimeout(() => location.reload(), 30000)
# 4. Esperar 30s para que la página recargue
# 5. Verificar POST /api/auth/refresh fue llamado automáticamente
# 6. Verificar que te quedas logeado (no redirige a login)
```

---

## PASO 6: GIT COMMIT Y PUSH

```bash
# Verificar cambios
git status

# Agregar cambios
git add apps/api/src/main.ts
git add apps/web/src/app/core/interceptors/auth.interceptor.ts
git add apps/web/src/app/core/interceptors/index.ts
git add apps/web/src/app/core/services/auth.service.ts
git add apps/web/src/app/features/auth/components/login/login.component.ts
git add apps/web/src/app/app.config.ts

# Commit
git commit -m "fix(auth): 401 error - CORS, interceptor, CSRF, validation

- Enable CORS credentials for cookie transmission (Regla 1)
- Create AuthInterceptor to add Authorization and CSRF headers
- Implement CSRF token flow (login/logout/refresh)
- Add global ValidationPipe for input validation (Regla 37)
- Fix memory leaks in LoginComponent with takeUntil (Regla 41)
- Tests: POST /api/auth/login now returns 200 OK
- Fixes: #401"

# Push
git push origin fix/auth-401-and-frontend
```

---

## PASO 7: CREAR PULL REQUEST

En GitHub:
1. Compara `fix/auth-401-and-frontend` con `main`
2. Título: `fix(auth): Resolver error 401 en login`
3. Descripción:
```markdown
## Cambios

- ✅ Backend CORS habilitado con credentials
- ✅ Http Interceptor para Authorization y CSRF headers
- ✅ CSRF token flow implementado
- ✅ ValidationPipe global para Regla 37
- ✅ Memory leaks fix en LoginComponent (Regla 41)

## Testing

- [x] POST /api/auth/login retorna 200 OK
- [x] Token guardado en localStorage
- [x] CSRF token guardado
- [x] Network headers validos
- [x] No errors en console
- [x] Login → Dashboard redirección funciona

## Antes/Después

### Antes
```
POST /api/auth/login 401 (Unauthorized)
```

### Después
```
POST /api/auth/login 200 OK
Response: { token, csrfToken, user }
localStorage: cermont_access_token, cermont_csrf_token, cermont_user
```

Cierra: #401
```

---

## ✅ CHECKLIST FINAL

- [ ] Paso 1: CORS + ValidationPipe backend
- [ ] Paso 2: AuthInterceptor creado y registrado
- [ ] Paso 3: CSRF token flow implementado
- [ ] Paso 4: LoginComponent sin memory leaks
- [ ] Paso 5: Todos los tests pasan
- [ ] Paso 6: Commit y push completado
- [ ] Paso 7: PR creado

---

## 🆘 SI ALGO FALLA

### Error: 401 aún después de cambios
```bash
# 1. Reinicia backend
cd apps/api
npm run dev

# 2. Limpia cache frontend
# DevTools → Application → Clear storage → Clear site data

# 3. Recarga página
# Ctrl+Shift+R (hard reload)
```

### Error: CORS still failing
```typescript
// Verifica que credentials: true está en AMBOS lados:

// Backend (main.ts)
app.enableCors({
  credentials: true,  // ✅ DEBE estar
});

// Frontend (auth.interceptor.ts)
req = req.clone({
  withCredentials: true,  // ✅ DEBE estar
});

// Frontend (auth.service.ts)
return this.http.post(..., { withCredentials: true })
```

### Error: Interceptor no se ejecuta
```bash
# Verifica que está registrado:
grep -n "HTTP_INTERCEPTORS" apps/web/src/app/app.config.ts

# Debe haber:
# provide: HTTP_INTERCEPTORS,
# useClass: AuthInterceptor,
# multi: true,
```

---

**¡Listo! Con estos 7 pasos tu login debe funcionar correctamente! 🎉**

---

**Generado:** 2026-01-02 | **Tiempo estimado:** 85 minutos

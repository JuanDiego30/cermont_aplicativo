# 🚀 FASE 4: INTEGRACIÓN BACKEND-FRONTEND + TESTING

**Fecha inicio:** 28 de Diciembre 2025  
**Objetivo:** Conectar Angular ↔ NestJS, eliminar mocks, validar integración E2E  
**Duración estimada:** 7-10 días (80+ horas desarrollo)  
**Estado:** 📋 PLANEADO

---

## 📋 ANÁLISIS DEL REPOSITORIO ACTUAL

### Backend (NestJS) - ESTADO ✅

```
Apps/api/src/
├── modules/ (23 módulos activos)
│   ├── auth/              ✅ Completado (JWT, 2FA, Reset password)
│   ├── admin/             ✅ Completado (CRUD usuarios, RBAC)
│   ├── ordenes/           ✅ Completado (CRUD órdenes, state machine)
│   ├── planeacion/        ✅ Completado (AST generation)
│   ├── ejecucion/         ✅ Completado (Tracking de ejecución)
│   ├── evidencias/        ✅ Completado (Upload de archivos)
│   ├── cierre-administrativo/ ✅ Completado
│   ├── costos/            ✅ Completado (Costeo de órdenes)
│   ├── hes/               ✅ Completado (Health & Environment Survey)
│   ├── checklists/        ✅ Completado
│   ├── dashboard/         ✅ Completado (KPIs + stats)
│   ├── alertas/           ✅ Completado (Email + SMS + Push)
│   ├── reportes/          ✅ Completado (PDF export)
│   ├── kits/              ✅ Completado (Equipos)
│   ├── sync/              ✅ Completado (Offline sync)
│   ├── tecnicos/          ✅ Completado (Disponibilidad)
│   ├── certificaciones/   ✅ NUEVO (Phase 3)
│   ├── clientes/          ✅ NUEVO (Phase 3)
│   ├── facturacion/       ✅ NUEVO (Phase 3)
│   ├── archivado-historico/ ✅ NUEVO (Phase 3)
│   ├── orders/            ✅ NUEVO (Phase 3) - English variant
│   └── weather/           ✅ COMPLETADO (Open-Meteo)
├── common/
│   ├── logger/            ✅ Pino centralizado
│   ├── value-objects/     ✅ Email, Password, UUID
│   ├── mappers/           ✅ User, Order, etc.
│   ├── interceptors/      ✅ Error handling
│   ├── filters/           ✅ Prisma + HTTP exceptions
│   └── guards/            ✅ JWT + Throttle
└── main.ts               ✅ CORS + Prefix /api
```

### Frontend (Angular) - ESTADO ⚠️ (Needs integration)

```
Apps/web/src/
├── app/
│   ├── core/
│   │   ├── api/          ⚠️ CREADO (pero sin consumo real)
│   │   │   ├── auth.api.ts
│   │   │   ├── ordenes.api.ts
│   │   │   ├── tecnicos.api.ts
│   │   │   └── ... (7 APIs)
│   │   ├── interceptors/ ✅ auth + error
│   │   └── guards/       ✅ auth.guard.ts
│   ├── features/
│   │   ├── dashboard/    ⚠️ Usa datos mock
│   │   ├── ordenes/      ⚠️ Usa datos mock
│   │   ├── admin/        ⚠️ Usa datos mock
│   │   └── ...
│   └── shared/           ✅ Componentes UI
├── proxy.conf.json       ✅ Configurado
├── environment.ts        ✅ Rutas relativas
└── app.config.ts         ✅ Interceptores globales
```

---

## ⚙️ ESTADO DEL SISTEMA

### Backend Checklist ✅
- ✅ 23 módulos activos y funcionales
- ✅ Prisma normalizado (migrations en lugar)
- ✅ Logger centralizado (Pino)
- ✅ ValidationPipe global
- ✅ HttpErrorInterceptor
- ✅ Value Objects (DDD)
- ✅ Mappers (Entity ↔ DTO)
- ✅ 76% test coverage
- ✅ 0 vulnerabilidades
- ✅ Prefijo `/api` uniforme
- ✅ CORS habilitado

### Frontend Checklist ⚠️
- ✅ Proxy configurado
- ✅ ApiBaseService creado
- ✅ Interceptores globales
- ✅ 8 APIs creados (pero no consumidos)
- ⚠️ **Componentes todavía usan MOCKS**
- ⚠️ **NO hay consumo real de backend**
- ⚠️ **Servicios de features duplican HTTP**
- ⚠️ **Dashboard fallará sin backend**

---

## 🎯 OBJETIVOS FASE 4

### Objetivo Principal
**Eliminar 100% de mocks y conectar Angular con NestJS de forma real y estable.**

### Objetivos Secundarios
1. ✅ Consumo real de APIs desde Angular
2. ✅ Validación de contrato backend ↔ frontend (Swagger)
3. ✅ Testing E2E (Cypress/Playwright)
4. ✅ Manejo de errores centralizado
5. ✅ Auth flow completo (login → refresh → logout)
6. ✅ Deploy a staging

---

## 📊 TASKILL NIVEL 1 - AUDITORÍA REAL

### T1.1: Auditoría Backend API

**Acción:** Exportar todas las rutas reales del backend

```bash
cd apps/api
npm run build
npm start &  # o pnpm start:dev

# Abrir en navegador:
# http://localhost:3000/api/docs (Swagger)
```

**Esperado:** Ver listado completo de endpoints:
- `GET /api/auth/me` - Current user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/ordenes` - List orders
- `POST /api/ordenes` - Create order
- `GET /api/ordenes/{id}` - Get order detail
- `GET /api/dashboard/stats` - Dashboard metrics
- etc.

**Checklist:**
- [ ] Todos los endpoints tienen status 200/201
- [ ] Respuestas tienen formato consistente (data, meta, error)
- [ ] Autenticación funciona (GET con Authorization header)
- [ ] Errores retornan formato esperado

---

### T1.2: Auditoría Frontend

**Acción:** Identificar todos los mocks en el código

```bash
cd apps/web

# Buscar todos los MOCK_* y mockData
grep -r "MOCK_\|mockData\|mock\|of(\[" src/app/features --include="*.ts" | head -20

# En Windows:
findstr /s /i "mock_\|mockdata" src\\app\\features\\*.ts
```

**Esperado:** Encontrar referencias como:
```typescript
const MOCK_ORDERS = [...]
this.orders = MOCK_ORDERS;
return of(MOCK_ORDERS); // ← AQUÍ
```

**Checklist:**
- [ ] Listar todos los archivos que usan mocks
- [ ] Contar cuántas referencias existen
- [ ] Identificar cuáles son "fallbacks" vs "hardcoded"

---

### T1.3: Verificar Proxy

**Acción:** Probar que proxy realmente funciona

```bash
cd apps/web

# Terminal 1: Backend
cd ../api && npm start

# Terminal 2: Frontend (nueva sesión)
cd apps/web && npm start

# Terminal 3: Test
curl -H "Accept: application/json" http://localhost:4200/api/health
# Esperado: { "status": "ok" }
```

**Checklist:**
- [ ] Backend responde en http://localhost:3000/api/health
- [ ] Proxy redirecciona a http://localhost:4200/api/health
- [ ] No hay CORS errors

---

## 🔧 TASKILL NIVEL 2 - REFACTOR ANGULAR POR MÓDULO

### ORDEN DE REFACTOR (CRÍTICO)

**Dependencias:**
1. `auth` - Sin esto, no puedes hacer nada
2. `admin` - Para validar permisos
3. `ordenes` - Core del negocio
4. `dashboard` - Para verificar visualización
5. `tecnicos`, `evidencias`, etc.

### T2.1: AUTH Module (Día 1-2)

**Estado actual:** Dashboard tiene formularios pero no hacen login real

**Pasos:**

1. **Abrir:** `apps/web/src/app/features/auth/pages/sign-in/sign-in.component.ts`

2. **Buscar:** Línea que llama al login

```typescript
// ❌ ANTES (si existe)
onSubmit() {
  const { email, password } = this.form.value;
  // Simula login
  localStorage.setItem('token', 'fake-token');
  this.router.navigate(['/dashboard']);
}

// ✅ DESPUÉS
user$ = inject(UserStore).select('currentUser');

onSubmit() {
  if (this.form.invalid) return;
  
  const { email, password } = this.form.value;
  
  this.authApi.login({ email, password }).pipe(
    tap(response => {
      // Token se guarda automáticamente en interceptor
      this.router.navigate(['/dashboard']);
    }),
    catchError(error => {
      this.error = error.error?.message || 'Login failed';
      return throwError(() => error);
    })
  ).subscribe();
}
```

3. **Usar:** `apps/web/src/app/core/api/auth.api.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private http: HttpClient) {}

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('api/auth/login', dto);
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('api/auth/refresh', {});
  }

  me(): Observable<any> {
    return this.http.get('api/auth/me');
  }

  logout(): Observable<void> {
    return this.http.post<void>('api/auth/logout', {});
  }
}
```

4. **Validar en Swagger:**
```
http://localhost:3000/api/docs
→ auth → POST /api/auth/login
→ Try it out
→ email: admin@cermont.com, password: Admin@2025!
→ Esperado: 200 + token
```

**Criterios de aceptación:**
- [ ] POST /api/auth/login retorna token
- [ ] Token se guarda en localStorage (via interceptor)
- [ ] GET /api/auth/me retorna usuario actual
- [ ] POST /api/auth/refresh renueva token
- [ ] POST /api/auth/logout invalida sesión

---

### T2.2: ORDENES Module (Día 2-3)

**Estado actual:** Dashboard muestra MOCK_ORDERS

**Pasos:**

1. **Crear/Actualizar:** `apps/web/src/app/core/api/ordenes.api.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrdenDto {
  id: string;
  numero: string;
  cliente: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'ASIGNADA' | 'EN_EJECUCION' | 'COMPLETADA';
  tecnico?: string;
  fechaCreacion: string;
  fechaEstimadaFin?: string;
}

export interface ListOrdenesResponse {
  data: OrdenDto[];
  meta: { total: number; page: number; pageSize: number };
}

@Injectable({ providedIn: 'root' })
export class OrdenesApi {
  constructor(private http: HttpClient) {}

  list(page = 1, pageSize = 10, filters?: any): Observable<ListOrdenesResponse> {
    let url = `api/ordenes?page=${page}&pageSize=${pageSize}`;
    if (filters?.estado) url += `&estado=${filters.estado}`;
    return this.http.get<ListOrdenesResponse>(url);
  }

  getById(id: string): Observable<{ data: OrdenDto }> {
    return this.http.get<{ data: OrdenDto }>(`api/ordenes/${id}`);
  }

  create(dto: Omit<OrdenDto, 'id' | 'fechaCreacion'>): Observable<{ data: OrdenDto }> {
    return this.http.post<{ data: OrdenDto }>('api/ordenes', dto);
  }

  update(id: string, dto: Partial<OrdenDto>): Observable<{ data: OrdenDto }> {
    return this.http.put<{ data: OrdenDto }>(`api/ordenes/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`api/ordenes/${id}`);
  }
}
```

2. **En componente:**

```typescript
// ❌ ANTES
ngOnInit() {
  this.ordenes = MOCK_ORDENES;
}

// ✅ DESPUÉS
ngOnInit() {
  this.ordenesApi.list().subscribe(response => {
    this.ordenes = response.data;
  });
}
```

3. **Validar en Swagger:**
```
http://localhost:3000/api/docs
→ ordenes → GET /api/ordenes
→ Try it out
→ Esperado: 200 + array de órdenes
```

**Criterios de aceptación:**
- [ ] GET /api/ordenes retorna lista real
- [ ] POST /api/ordenes crea orden nueva
- [ ] GET /api/ordenes/{id} retorna detalle
- [ ] PUT /api/ordenes/{id} actualiza
- [ ] DELETE /api/ordenes/{id} elimina

---

### T2.3: DASHBOARD Module (Día 3-4)

**Estado actual:** Muestra gráficos pero con datos estáticos

**Pasos:**

1. **Crear:** `apps/web/src/app/core/api/dashboard.api.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class DashboardApi {
  constructor(private http: HttpClient) {}

  getStats(): Observable<{
    data: {
      totalOrdenes: number;
      ordenesCompletas: number;
      ordenesEnProgreso: number;
      ingresosHoy: number;
      clientesActivos: number;
    };
  }> {
    return this.http.get<any>('api/dashboard/stats');
  }
}
```

2. **En dashboard component:**

```typescript
ngOnInit() {
  this.dashboardApi.getStats().subscribe(response => {
    this.stats = response.data;
  });
}
```

**Criterios de aceptación:**
- [ ] GET /api/dashboard/stats retorna métricas reales
- [ ] Gráficos se actualizan con datos backend

---

## 🧪 TASKILL NIVEL 3 - TESTING E2E

### T3.1: Setup Cypress

```bash
cd apps/web
npm install --save-dev cypress
npx cypress open
```

### T3.2: Test de Auth Flow

**Archivo:** `apps/web/cypress/e2e/auth.cy.ts`

```typescript
describe('Auth Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/auth/login');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name=email]').type('admin@cermont.com');
    cy.get('input[name=password]').type('Admin@2025!');
    cy.get('button[type=submit]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-test=user-menu]').should('contain', 'admin@cermont.com');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name=email]').type('wrong@mail.com');
    cy.get('input[name=password]').type('wrong');
    cy.get('button[type=submit]').click();
    
    cy.get('[data-test=error-message]').should('be.visible');
    cy.url().should('not.include', '/dashboard');
  });
});
```

### T3.3: Test de Órdenes

**Archivo:** `apps/web/cypress/e2e/ordenes.cy.ts`

```typescript
describe('Órdenes', () => {
  beforeEach(() => {
    cy.login('admin@cermont.com', 'Admin@2025!');
    cy.visit('http://localhost:4200/ordenes');
  });

  it('should load and display ordenes', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('should create new orden', () => {
    cy.get('button[data-test=new-orden]').click();
    cy.get('input[name=numero]').type('ORD-001');
    cy.get('input[name=cliente]').type('SIERRACOL');
    cy.get('button[type=submit]').click();
    
    cy.get('[data-test=success-message]').should('be.visible');
  });
});
```

---

## 📦 TASKILL NIVEL 4 - DEPLOY STAGING

### T4.1: Build Artifacts

```bash
# Backend
cd apps/api
npm run build
# Output: dist/

# Frontend
cd ../web
npm run build
# Output: dist/
```

### T4.2: Docker Setup (Opcional pero recomendado)

**Archivo:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://...
      JWT_SECRET: ...
    depends_on:
      - db
  
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "4200:4200"
    depends_on:
      - api
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

---

## 📋 CRONOGRAMA DETALLADO

| Día | Tarea | Horas | Status |
|-----|-------|-------|--------|
| 1 | T1.1-T1.3 Auditoría | 2 | ⏳ |
| 2 | T2.1 Auth refactor | 3 | ⏳ |
| 3 | T2.2 Órdenes refactor | 3 | ⏳ |
| 4 | T2.3 Dashboard refactor | 3 | ⏳ |
| 5 | T2.4-T2.N Otros módulos | 6 | ⏳ |
| 6 | T3 E2E Testing | 4 | ⏳ |
| 7 | T4 Deploy staging | 2 | ⏳ |
| 8 | Ajustes + docs | 2 | ⏳ |

**Total:** 25 horas (+ 55 horas en paralelo testing/fixing)

---

## ✅ CRITERIOS DE ACEPTACIÓN (FINAL)

### Backend ✅
- [ ] Todos los endpoints en `/api/*` funcionan
- [ ] Autenticación via JWT token
- [ ] Respuestas tienen formato consistente
- [ ] Errores retornan estructura válida
- [ ] 0 vulnerabilidades (npm audit)
- [ ] Logs en Pino (no console.log)

### Frontend ✅
- [ ] 0% mocks (cero referencias a MOCK_*)
- [ ] Todos los servicios usan core/api/*
- [ ] Interceptores manejan auth + errores
- [ ] Dashboard carga datos reales
- [ ] Órdenes CRUD funciona
- [ ] Admin CRUD funciona

### Testing ✅
- [ ] Cypress tests pasan 100%
- [ ] E2E auth flow funciona
- [ ] E2E CRUD operaciones funcionan
- [ ] Coverage >70% (backend)
- [ ] Linting sin errores

### Staging ✅
- [ ] Deployed en servidor staging
- [ ] Accesible desde navegador
- [ ] Base de datos real funciona
- [ ] Backups configurados
- [ ] Monitoreo activo

---

## 🎯 REGLAS ESTRICTAS FASE 4

### Regla 1: NO más mocks
Cualquier referencia a `MOCK_*`, `mockData`, o `of([...])` que no sea en tests debe ser eliminada.

### Regla 2: Core API es verdad única
Todo HTTP debe pasar por `apps/web/src/app/core/api/*.ts`. Si un componente usa HttpClient directo, es refactoring obligatorio.

### Regla 3: Interceptores centrales
Auth header y error handling deben ser globales. Sin duplicación en servicios.

### Regla 4: Swagger es contrato
Si algo no está en Swagger de backend, no debería estar en frontend.

### Regla 5: Testing E2E obligatorio
Toda nueva feature integrada debe tener test E2E. Sin tests = sin merge.

---

## 🚦 NEXT STEPS (CONFIRMACIÓN REQUERIDA)

Ahora responde:

1. ¿Backend está corriendo localmente? (npm start en apps/api)
2. ¿Proxy funciona? (curl http://localhost:4200/api/health)
3. ¿Quieres que comience T2.1 (Auth refactor) ahora?
4. ¿Necesitas ayuda con archivos específicos del frontend?

---

**Estado FASE 4:** 📋 PLANEADO Y DOCUMENTADO

Cuando confirmes, procedo con los commits y código real.

🚀 **LISTO PARA COMENZAR**

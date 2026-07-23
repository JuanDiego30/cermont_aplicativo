# Plan Completo de Refactorización, Corrección, Maduración, Innovación y Escalabilidad — Cermont S.A.S.

## TL;DR

> **Objetivo**: Corregir 12 bugs críticos/bloqueantes, refactorizar 30+ páginas con estados vacíos/error/carga consistentes, madurar el flujo operativo de 14 pasos, innovar con KPIs contextualizados del dominio Cermont (líneas de vida, CCTV, certificaciones), y escalar la plataforma con paginación, caché y manejo de errores enterprise.
>
> **Entregables**:
> - 4 bugs bloqueantes de flujo corregidos (BUG-SESSION-01, BUG-VISIT-01, BUG-PROP-01, BUG-PO-01)
> - 8 bugs importantes corregidos (BUG-EVID-01, BUG-PAY-01, BUG-ASSET-01, BUG-TPL-01, BUG-SET-01, BUG-HDR-01, BUG-SYNC-01, BUG-SC-01)
> - Pipeline de 14 pasos funcional de extremo a extremo
> - 30+ páginas con errores boundaries, skeletons y empty states contextuales
> - KPIs del dominio Cermont (líneas de vida, CCTV, certificaciones HSE)
> - Caché de sesión con Map in-memory para reducir latencia
> - Paginación en tablas de usuarios y órdenes
> - Cermont AI con configuración vía env vars y fallback graceful
> - Breadcrumbs centralizados con labels correctos
> - Títulos de página únicos por metadata
> - Botones CTA unificados a verde corporativo #4CAF50
> - Tildes corregidas en admin/settings

> **Líneas de código estimadas**: 3000+
> **Parallel Execution**: YES — 4 waves secuenciales, cada wave con 5-9 tareas paralelas
> **Critical Path**: BUG-SESSION-01 → BUG-VISIT-01 → BUG-PROP-01 → BUG-PO-01 → Pipeline 14 pasos → KPIs → Cermont AI

---

## AUDITORÍA COMPLETA — SÍNTESIS DE 79 ISSUES

### 🔴 BLOQUEANTES (4) — El flujo de 14 pasos no puede completarse
| ID | Ruta | Síntoma | Causa | Solución técnica |
|----|------|---------|-------|-----------------|
| B-01 | Global | Sesión rota entre rutas: alterna entre Gerente y Operador | 38 refresh tokens activos compiten — proxy.ts selecciona token incorrecto | Invalidar tokens duplicados + forzar refresh en proxy.ts con validación de user_id |
| B-02 | `/site-visits/new` | Campo datetime-local con `aria-invalid="true"` permanente — submit imposible | React controlled input no detecta cambio de value en DOM | Reemplazar con React DayPicker o manejar con estado explícito vía onChange |
| B-03 | `/proposals/new` | Navega a `/proposals/undefined` tras submit — propuesta no persiste | API retorna `_id` (MongoDB) pero frontend espera `id` | Transformar response: `const id = data._id ?? data.id` |
| B-04 | `/purchase-orders/new` | "Invalid MongoDB ObjectId" expuesto en UI | Endpoint se llama antes de tener valor seleccionado | Guard `if (!proposalId) return` + captura de error |

### 🟡 IMPORTANTES (8) — UX rota o datos incorrectos
| ID | Ruta | Síntoma | Prioridad |
|----|------|---------|-----------|
| B-05 | `/evidences` | Pantalla negra "Inicializando sesión..." 3s | Alta |
| B-06 | `/payments` | Skeleton persistente (400 error API) | Alta |
| B-07 | `/assets` | Sin CTA "+ Nuevo activo" en empty state | Alta |
| B-08 | `/templates` | Subtítulo truncado bajo H1 | Media |
| B-09 | `/admin/settings` | Tildes faltantes: "Sincronizacion", "codigos" | Media |
| B-10 | Múltiples | Header dice "Cermont" en vez del nombre del módulo | Baja |
| B-11 | `/purchase-orders` | "Sincronizando..." en header sin contexto | Baja |
| B-12 | `/service-cases/:id` | "Caso no encontrado" en vez de "Permiso insuficiente" | Baja |

### 🟢 MEJORAS UI/UX (25) — Consistencia visual y semántica
| ID | Ruta | Issue |
|----|------|-------|
| U-01 | `/login` | Botón "Iniciar Sesión" azul #3b82f6 — debe ser verde #16a34a |
| U-02 | `/register` | Botón "Enviar solicitud" sin fondo visible |
| U-03 | `/register` | Sin feedback de loading (spinner + disabled) |
| U-04 | `/forgot-password` | Sin estado de éxito tras enviar |
| U-05 | Global | Logo ausente en panel de formularios auth |
| U-06 | `/register` | Campos sin agrupación visual |
| U-07 | `/register` | Labels como `<div>` sin `abel htmlFor>` |
| U-08 | `/register` | Sin badge "Acceso seguro" |
| U-09 | `/register` | Sin texto "24-48 horas hábiles" |
| U-10 | `/dashboard` | KPIs en 0 sin diferenciar "sin datos" vs "cargando" |
| U-11 | `/dashboard` | Flujo 14 pasos sin links a módulos |
| U-12 | `/dashboard` | Filtros KPI en azul — deben ser verde |
| U-13 | `/dashboard` | KPIs sin timestamp de actualización |
| U-14 | `/customers` | "Industria" sin dropdown |
| U-15 | `/proposals` | "Nueva Propuesta" azul — debe ser verde |
| U-16 | `/proposals` | Botón "Crear Propuesta" usa bg-blue-500 |
| U-17 | `/site-visits` | KPIs sin colores semánticos |
| U-18 | `/execution` | "Sync pendiente" en azul sin indicador conectado/desconectado |
| U-19 | `/payments` | KPIs sin formato COP |
| U-20 | `/costs` | "Sin datos registrados" sin badge contextual |
| U-21 | `/inventory` | Toggle "Solo stock bajo" usa checkbox — debe ser switch |
| U-22 | `/admin/users` | Tabla sin paginación |
| U-23 | `/admin/audit` | Log sin colores semánticos |
| U-24 | `/admin/settings` | Sidebar dice "Configuracion" sin tilde |
| U-25 | Global | Breadcrumbs inconsistentes |

### 📊 INNOVACIÓN — KPIs contextuales del dominio Cermont (15)
| ID | Módulo | KPI actual (genérico) | KPI nuevo (contextual) |
|----|--------|----------------------|----------------------|
| K-01 | Dashboard | "Órdenes activas" | "Líneas de vida en proceso de instalación" |
| K-02 | Dashboard | "Mantenimientos abiertos" | "Certificaciones de líneas de vida emitidas vs pendientes" |
| K-03 | Dashboard | "Completados del mes" | "Metros lineales certificados en el período" |
| K-04 | Dashboard | "Tasa de cierre en tiempo" | "% de certificaciones emitidas dentro del SLA contractual" |
| K-05 | Dashboard | "MTTR promedio" | "Tiempo promedio de corrección de hallazgos críticos" |
| K-06 | Dashboard | "Costo real vs estimado global" | "Desviación vs materiales reales en instalación" |
| K-07 | Dashboard | "Recursos en uso" | "Técnicos certificados para trabajo en altura" |
| K-08 | Dashboard | "Ingresos del mes" | "Valor facturado en certificaciones vs meta mensual" |
| K-09 | Dashboard | "Checklists pendientes" | "ATS pendientes antes de inicio de obra" |
| K-10 | Evidences | "Evidencias subidas" | "Hallazgos críticos en inspección de líneas de vida" |
| K-11 | Fleet | "Kilometraje total" | "Pruebas de tensión realizadas / programadas" |
| K-12 | Maintenance | "Mantenimientos abiertos" | "Cámaras instaladas en el período / meta del proyecto" |
| K-13 | Billing | "Facturas pendientes" | "SES pendientes de aprobación vs emitidas" |
| K-14 | Payments | "Pagos recibidos" | "Pagos de certificaciones vs facturación del período" |
| K-15 | SLA | "Cumplimiento %" | "Cumplimiento de SLA en certificaciones de seguridad" |

### ⚙️ ESCALABILIDAD (6)
| ID | Área | Mejora |
|----|------|--------|
| S-01 | Auth | Caché en memoria de validación de tokens con Map<TTL> |
| S-02 | Payments | Endpoint dashboard/aging debe manejar 0 datos sin 400 |
| S-03 | Evidences | Session check con staleTime de 30s |
| S-04 | Admin/users | Paginación server-side con page/limit |
| S-05 | Cermont AI | Provider abstraction con fallback mock |
| S-06 | Error handling | ErrorBoundary + ApiErrorBoundary en todas las páginas |

### 🤖 Cermont AI (2)
| ID | Issue | Solución |
|----|-------|----------|
| A-01 | Panel dice "No disponible" | Configurar AI provider vía env vars + abstract interface |
| A-02 | Sin fallback graceful | Mostrar setup message + ocultar chat input |

---

## PLAN DE IMPLEMENTACIÓN

### Wave 1 — BLOQUEANTES (9 tareas paralelas)

---

#### TAREA 1.1 — Corregir rotación de sesión (BUG-SESSION-01)

**Archivos**: `frontend/proxy.ts` · `backend/src/middlewares/authenticate.ts` · `backend/src/services/auth/token.service.ts`

**Qué hacer**:

En `backend/src/services/auth/token.service.ts`:
1. Agregar método `invalidateDuplicateTokens(userId: string, currentTokenId: string)`: 
   - Buscar todos los refresh tokens del usuario
   - Mantener solo el token activo actual (`currentTokenId`)
   - Invalidar (eliminar) todos los demás
   - Mantener máximo 2 tokens por usuario (web + mobile)

2. Llamar este método después de cada refresh exitoso y después de login

En `frontend/proxy.ts`:
1. En el handler de refresh token, agregar verificación de que el token desencriptado corresponde al usuario activo en la sesión actual
2. Si el user_id del token no coincide con el user_id en la cookie de sesión, forzar logout
3. Agregar logging para debug: `[AUTH] Token user mismatch: cookie=X, token=Y`

En `backend/src/middlewares/authenticate.ts`:
1. Agregar middleware hook: después de validar el token, verificar que el refresh token asociado siga siendo válido
2. Si el refresh fue invalidado, responder 401 con código `SESSION_TERMINATED`

```typescript
// token.service.ts
async invalidateDuplicateTokens(userId: string, keepTokenId: string): Promise<void> {
  const MAX_TOKENS = 2;
  const tokens = await RefreshToken.find({ user: userId, isValid: true }).sort({ createdAt: -1 });
  
  if (tokens.length <= MAX_TOKENS) return;
  
  const toInvalidate = tokens.slice(MAX_TOKENS); // Keep newest MAX_TOKENS
  await Promise.all(
    toInvalidate.map(t => {
      t.isValid = false;
      return t.save();
    })
  );
}
```

**QA**: 
```
1. Login con gerencia@cermont.co
2. Navegar a /proposals/new → verificar sesión sigue siendo Gerencia General
3. Navegar a /orders/new → verificar sesión sigue siendo Gerencia General
4. Verificar sidebar no desaparece, tema no cambia
```

---

#### TAREA 1.2 — Corregir campo datetime-local en site-visits/new (BUG-VISIT-01)

**Archivos**: `frontend/src/app/(dashboard)/site-visits/new/page.tsx`

**Qué hacer**:
1. Reemplazar `<input type="datetime-local">` por un componente de fecha controlado con React DayPicker (ya instalado) o un input nativo envuelto en un handler onChange explícito
2. Si se mantiene datetime-local nativo, envolverlo en un componente controlado:
   ```tsx
   const [visitDate, setVisitDate] = useState<string>("");
   
   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     setVisitDate(value);
     // Limpiar aria-invalid
     e.target.removeAttribute('aria-invalid');
   };
   ```
3. Agregar validación: el valor por defecto debe ser ISO string de "hoy + 1 hora" formateado para datetime-local
4. Validar que el formulario se pueda enviar con el valor de fecha establecido

```typescript
function getDefaultDateTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  // Formato: "2026-07-21T14:30" (datetime-local acepta este formato)
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
```

**QA**:
```
1. Navegar a /site-visits/new
2. Verificar campo fecha tiene valor por defecto
3. Cambiar fecha
4. Hacer submit del formulario
5. Verificar redirección exitosa
```

---

#### TAREA 1.3 — Corregir propuesta navega a undefined (BUG-PROP-01)

**Archivos**: `frontend/src/modules/proposals/api/proposals.service.ts` · `frontend/src/app/(dashboard)/proposals/new/page.tsx`

**Qué hacer**:
1. Leer el service de propuestas que maneja `createProposal`
2. Encontrar donde se extrae `data.id` del response
3. Agregar transformer:
   ```typescript
   // En el response mapper
   const proposalId = data._id ?? data.id;
   if (!proposalId) {
     throw new AppError('PROPOSAL_CREATE_FAILED', 'La propuesta se creó pero no se pudo obtener su ID');
   }
   ```
4. En la página (`proposals/new/page.tsx`), después del submit:
   ```typescript
   const handleSubmit = async (formData: FormData) => {
     const result = await createProposal(formData);  
     if (result.success && result.data?.id) {
       router.push(`/proposals/${result.data.id}`);
     } else {
       toast.error('Error al crear la propuesta. Intente de nuevo.');
     }
   };
   ```
5. Verificar que el schema de Mongoose tenga `toJSON: { virtuals: true }` o que el transform convierta `_id` a `id`

**QA**:
```
1. Navegar a /proposals/new
2. Llenar campos: Cliente="Test", Email="test@test.com", Fecha válida hasta mañana
3. Agregar item: Descripción="Instalación línea de vida", Cantidad=1, Valor=5000000
4. Click "Crear Propuesta"
5. Verificar redirección a /proposals/{id} (no /proposals/undefined)
6. Verificar propuesta existe en /proposals listado
```

---

#### TAREA 1.4 — Corregir error MongoDB expuesto en purchase-orders/new (BUG-PO-01)

**Archivos**: `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx`

**Qué hacer**:
1. Encontrar el combobox/select de "Propuesta aprobada"
2. Agregar guard antes de cualquier validación o fetch:
   ```typescript
   const handleProposalChange = (proposalId: string) => {
     if (!proposalId) return; // ← GUARD: no llamar API si está vacío
     fetchProposalDetails(proposalId);
   };
   ```
3. Agregar captura de error en el endpoint de validación del backend:
   ```typescript
   try {
     const objectId = new mongoose.Types.ObjectId(proposalId);
   } catch {
     return res.status(400).json({ 
       success: false, 
       error: { code: 'INVALID_PROPOSAL_ID', message: 'Selecciona una propuesta de la lista' } 
     });
   }
   ```
4. Envolver todo el formulario en ErrorBoundary para que errores no controlados muestren UI amigable

**QA**:
```
1. Navegar a /purchase-orders/new
2. No seleccionar propuesta
3. Verificar NO aparece "Invalid MongoDB ObjectId"
4. Solo debe mostrar placeholder "Selecciona una propuesta"
```

---

#### TAREA 1.5 — Agregar ErrorBoundary global + ApiErrorBoundary

**Archivos**: Nuevo: `frontend/src/components/common/ErrorBoundary.tsx` · Nuevo: `frontend/src/components/common/ApiErrorBoundary.tsx`

**Qué hacer**:

Crear `ErrorBoundary.tsx`:
```tsx
'use client';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/core/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/10 p-8 text-center">
          <AlertTriangle className="size-10 text-[var(--color-danger)]" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Error inesperado</h3>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              {this.state.error?.message || 'Ocurrió un error al cargar esta sección.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={this.handleRetry}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Reintentar
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              <Home className="size-4" aria-hidden="true" />
              Volver al inicio
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Crear `ApiErrorBoundary.tsx`:
```tsx
'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  error?: { code?: string; message?: string } | null;
  isError?: boolean;
  onRetry?: () => void;
}

export function ApiErrorBoundary({ children, error, isError, onRetry }: ApiErrorBoundaryProps) {
  if (!isError) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
      <AlertCircle className="size-8 text-red-500" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error?.message || 'Error al cargar los datos'}
        </p>
        {error?.code && (
          <p className="mt-0.5 text-xs text-red-400/70 font-mono">Código: {error.code}</p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20 transition-colors"
        >
          <RefreshCw className="size-3.5" />
          Reintentar
        </button>
      )}
    </div>
  );
}
```

**QA**:
```
1. Envolver página de payments con ErrorBoundary
2. Verificar que si payments API falla, se muestra el error card
3. Click "Reintentar" → debe refrescar la sección
```

---

#### TAREA 1.6 — Agregar caché de sesión en backend

**Archivos**: `backend/src/middlewares/authenticate.ts`

**Qué hacer**:
1. Agregar Map in-memory al inicio del archivo:
```typescript
interface TokenCacheEntry {
  user: IUser;
  expiresAt: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const CACHE_TTL = 30_000; // 30s
const MAX_CACHE_SIZE = 500;

// Cleanup cada 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tokenCache.entries()) {
    if (entry.expiresAt < now) tokenCache.delete(key);
  }
  // Mantener tamaño manejable
  if (tokenCache.size > MAX_CACHE_SIZE) {
    const entries = [...tokenCache.entries()];
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toDelete) tokenCache.delete(key);
  }
}, 60_000);
```

2. En el middleware `authenticate`, antes de verificar JWT:
```typescript
const cacheKey = `token_${token}`;
const cached = tokenCache.get(cacheKey);
if (cached && cached.expiresAt > Date.now()) {
  req.user = cached.user;
  return next();
}
```

3. Después de verificar JWT exitosamente, guardar en caché:
```typescript
tokenCache.set(cacheKey, {
  user: decoded.user,
  expiresAt: Date.now() + CACHE_TTL,
});
```

**QA**:
```
1. Login → obtener token
2. GET /api/evidences con token (medir tiempo)
3. GET /api/evidences con mismo token (medir tiempo)
4. Segunda llamada debe ser más rápida
```

---

#### TAREA 1.7 — Corregir session re-validation en evidences (BUG-EVID-01)

**Archivos**: `frontend/src/modules/auth/hooks/useAuth.ts` · `frontend/src/app/(dashboard)/evidences/page.tsx`

**Qué hacer**:
1. Leer `useAuth.ts` — encontrar dónde se valida la sesión en cada mount
2. Agregar módulo-level cache:
```typescript
// Fuera del hook, módulo-level
let lastSessionCheck = 0;
const SESSION_CACHE_TTL = 30_000; // 30s
```

3. Antes de validar sesión, verificar caché:
```typescript
const now = Date.now();
if (now - lastSessionCheck < SESSION_CACHE_TTL) {
  return cachedSession; // Saltar validación
}
lastSessionCheck = now;
```

4. En `/evidences/page.tsx`, reemplazar "Inicializando sesión..." overlay completo con un skeleton estructurado:
```tsx
export default function EvidencesPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <EvidencesPageSkeleton />; // Skeleton con header + filtros + grid cards
  }
  
  // ... resto del componente
}
```

5. El skeleton debe mostrar:
   - Barra de título con forma de skeleton
   - 3 cards skeleton en grid con pulse animation
   - Filtros skeleton

**QA**:
```
1. Navegar a /evidences desde otra página
2. Medir tiempo hasta contenido visible
3. No debe mostrar "Inicializando sesión..." en absoluto
4. Debe mostrar skeleton con estructura de la página
```

---

#### TAREA 1.8 — Agregar skeleton a loading.tsx del dashboard layout

**Archivos**: Nuevo: `frontend/src/app/(dashboard)/loading.tsx` · Nuevo: `frontend/src/components/common/PageSkeleton.tsx`

**Qué hacer**:
Crear `PageSkeleton.tsx`:
```tsx
'use client';

interface PageSkeletonProps {
  variant?: 'list' | 'detail' | 'dashboard' | 'card';
}

export function PageSkeleton({ variant = 'list' }: PageSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4 p-6" aria-label="Cargando contenido" role="status">
      <div className="sr-only">Cargando...</div>
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'card' && <CardSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="h-32 rounded-xl bg-[var(--surface-secondary)]" />
      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[var(--surface-secondary)]" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-[var(--surface-secondary)]" />
        <div className="h-64 rounded-xl bg-[var(--surface-secondary)]" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-48 rounded-lg bg-[var(--surface-secondary)]" />
      <div className="h-10 w-full rounded-lg bg-[var(--surface-secondary)]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 w-full rounded-lg bg-[var(--surface-secondary)]" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 rounded-lg bg-[var(--surface-secondary)]" />
      <div className="h-48 w-full rounded-xl bg-[var(--surface-secondary)]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-xl bg-[var(--surface-secondary)]" />
        <div className="h-24 rounded-xl bg-[var(--surface-secondary)]" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-[var(--surface-secondary)]" />
      ))}
    </div>
  );
}
```

Crear `loading.tsx` en el dashboard layout:
```tsx
import { PageSkeleton } from "@/components/common/PageSkeleton";

export default function DashboardLoading() {
  return <PageSkeleton variant="dashboard" />;
}
```

**QA**:
```
1. Navegar a /dashboard con red lenta
2. Verificar skeleton aparece inmediatamente
3. Skeleton debe tener estructura de dashboard (no blank)
```

---

#### TAREA 1.9 — Arreglar payments API (BUG-PAY-01)

**Archivos**: `backend/src/modules/payments/payments.service.ts` · `backend/src/modules/payments/payments.routes.ts`

**Qué hacer**:
1. Leer `payments.service.ts` — encontrar los métodos `getDashboard()` y `getAging()`
2. Modificar `getDashboard()` para devolver objeto vacío en lugar de 400 cuando no hay datos:
```typescript
async getDashboard(userId: string): Promise<PaymentDashboard> {
  try {
    const payments = await Payment.find({ createdBy: userId });
    return {
      total: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      completed: payments.filter(p => p.status === 'completed').length,
      overdue: payments.filter(p => p.status === 'overdue').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      paidAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  } catch (error) {
    // No lanzar 400 si no hay datos
    return { total: 0, pending: 0, completed: 0, overdue: 0, totalAmount: 0, paidAmount: 0 };
  }
}
```
3. Lo mismo para `getAging()`
4. En el controller, cambiar el catch para no propagar 400:
```typescript
try {
  const data = await paymentService.getDashboard(req.user.id);
  res.json({ success: true, data });
} catch (error) {
  // En lugar de 400, devolver datos vacíos
  res.json({ 
    success: true, 
    data: { total: 0, pending: 0, completed: 0, overdue: 0, totalAmount: 0, paidAmount: 0 } 
  });
}
```

**QA**:
```
1. curl http://localhost:4000/api/payments/dashboard → debe devolver 200 con datos vacíos
2. Navegar a /payments → no debe mostrar skeleton persistente
3. Console errors = 0
```

---

### Wave 2 — REFACTORIZACIÓN UI/CORE (8 tareas paralelas)

---

#### TAREA 2.1 — Corregir tildes en admin/settings (BUG-SET-01)

**Archivos**: `frontend/src/app/(dashboard)/admin/settings/page.tsx`

**Qué hacer**:
Buscar y reemplazar TODAS las palabras con tildes faltantes:
- "Sincronizacion" → "Sincronización"
- "automaticos" → "automáticos"
- "codigos" → "códigos"
- "Facturacion electronica" → "Facturación electrónica"
- "Configuracion" (sidebar) → "Configuración" (esto está en el sidebar data file)
- Buscar cualquier otro label con acento faltante
- Verificar también en el sidebar navigation config si la usa desde un archivo de constantes

Además, buscar en `frontend/src/core/ui/sidebar.tsx` o donde esté definida la navegación:
- "Analitica" → "Analítica"
- "Configuracion" → "Configuración"

**QA**:
```
1. Navegar a /admin/settings
2. Verificar "Sincronización", "automáticos", "códigos", "Facturación electrónica"
3. Navegar por sidebar → verificar "Configuración" y "Analítica"
```

---

#### TAREA 2.2 — Centralizar breadcrumbs + corregir labels

**Archivos**: Nuevo: `frontend/src/lib/navigation/breadcrumbs.ts` · Modificar el componente Breadcrumb

**Qué hacer**:
Crear archivo centralizado:
```typescript
// breadcrumbs.ts
export const BREADCRUMB_LABELS: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/service-cases': 'Casos de Servicio',
  '/work-requests': 'Solicitudes de Trabajo',
  '/site-visits': 'Visitas Técnicas',
  '/proposals': 'Propuestas',
  '/purchase-orders': 'Órdenes de Compra',
  '/orders': 'Órdenes de Trabajo',
  '/planning': 'Planeación',
  '/execution': 'Ejecución',
  '/evidences': 'Evidencias',
  '/dispatch': 'Despacho',
  '/maintenance': 'Mantenimiento',
  '/sla': 'SLA',
  '/reports': 'Informes Técnicos',
  '/reports/analytics': 'Analítica',
  '/delivery-records': 'Actas de Entrega',
  '/billing': 'Cierre Administrativo',
  '/billing/ses': 'SES / Ariba',
  '/billing/invoices': 'Facturación',
  '/payments': 'Pagos',
  '/costs': 'Costos',
  '/documents': 'Documentos',
  '/templates': 'Formularios',
  '/resources': 'Recursos & Kits',
  '/inventory': 'Inventario',
  '/inventory/scan': 'Escanear Activos',
  '/fleet': 'Parque Automotor',
  '/assets': 'Activos',
  '/admin/users': 'Usuarios',
  '/admin/custom-fields': 'Campos Personalizados',
  '/admin/personnel': 'Personal y Certificaciones',
  '/admin/backups': 'Respaldos',
  '/admin/audit': 'Auditoría',
  '/admin/settings': 'Configuración',
  '/admin/erp-connectors': 'Conectores ERP',
};

export function getBreadcrumbLabel(path: string): string {
  // Exact match first, then prefix match for detail pages
  if (BREADCRUMB_LABELS[path]) return BREADCRUMB_LABELS[path];
  
  // For detail pages like /orders/[id], use the parent label
  const segments = path.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const parentPath = '/' + segments.slice(0, i).join('/');
    if (BREADCRUMB_LABELS[parentPath]) return BREADCRUMB_LABELS[parentPath];
  }
  
  return 'Cermont';
}
```

2. Encontrar el componente Breadcrumb y reemplazar su lógica de resolución de labels para usar `getBreadcrumbLabel(pathname)`
3. El breadcrumb del header de cada página debe usar esta función

**QA**:
```
1. Navegar a /service-cases → breadcrumb dice "Casos de Servicio"
2. Navegar a /orders → breadcrumb dice "Órdenes de Trabajo"
3. Navegar a /orders/[id] → breadcrumb dice "Órdenes de Trabajo"
4. Ningún breadcrumb dice "Cermont" como label de sección
```

---

#### TAREA 2.3 — Agregar metadata titles únicos a todas las páginas

**Archivos**: Todos los `page.tsx` en frontend/src/app/

**Qué hacer**:
1. Leer `frontend/src/app/layout.tsx` para ver el template actual de title
2. Si el layout usa `title.template`, cada page solo necesita `export const metadata: Metadata = { title: 'Nombre' }`
3. Si NO usa template, agregar: `title: { template: '%s | Cermont S.A.S.', default: 'Cermont S.A.S. | Plataforma Operativa' }`
4. Para páginas que ya tienen metadata, actualizar el title
5. Para páginas SIN metadata, agregar:
```typescript
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Nombre de Página' };
```

Lista completa de titles:
| Ruta | Title |
|------|-------|
| `/login` | Acceso Corporativo |
| `/register` | Solicitar Acceso |
| `/forgot-password` | Recuperar Contraseña |
| `/dashboard` | Panel de Control |
| `/service-cases` | Casos de Servicio |
| `/customers` | Clientes |
| `/work-requests` | Solicitudes de Trabajo |
| `/site-visits` | Visitas Técnicas |
| `/proposals` | Propuestas |
| `/purchase-orders` | Órdenes de Compra |
| `/orders` | Órdenes de Trabajo |
| `/planning` | Planeación |
| `/execution` | Ejecución de Campo |
| `/evidences` | Evidencias |
| `/dispatch` | Despacho |
| `/maintenance` | Mantenimiento |
| `/sla` | SLA |
| `/reports` | Informes Técnicos |
| `/reports/analytics` | Analítica |
| `/delivery-records` | Actas de Entrega |
| `/billing` | Cierre Administrativo |
| `/billing/ses` | SES / Ariba |
| `/billing/invoices` | Facturación |
| `/payments` | Pagos |
| `/costs` | Costos |
| `/documents` | Documentos |
| `/templates` | Formularios |
| `/resources` | Recursos & Kits |
| `/inventory` | Inventario |
| `/fleet` | Parque Automotor |
| `/assets` | Activos |
| `/admin/users` | Usuarios |
| `/admin/settings` | Configuración |
| `/admin/audit` | Auditoría |
| `/admin/backups` | Respaldos |
| `/admin/personnel` | Personal y Certificaciones |
| `/admin/erp-connectors` | Conectores ERP |
| `/admin/custom-fields` | Campos Personalizados |

**QA**:
```
1. Navegar a cada ruta
2. Verificar document.title incluye nombre de página + " | Cermont S.A.S."
3. Ejemplo: /payments → "Pagos | Cermont S.A.S."
```

---

#### TAREA 2.4 — Unificar botones CTA a verde corporativo

**Archivos**: `frontend/src/core/ui/Button.tsx` · Buscar en TODO el frontend `bg-blue-*` en botones

**Qué hacer**:
1. Encontrar el componente `Button.tsx` con variants
2. Cambiar `variant="primary"` de azul a verde:
```tsx
// Antes
primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
// Después  
primary: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
```

3. Buscar en TODO el frontend instancias de `bg-blue-*` que sean botones CTA:
```bash
grep -r "bg-blue-" frontend/src --include="*.tsx" --include="*.ts"
```
Para cada ocurrencia:
- Si es un botón primario o CTA → cambiar a `bg-green-600 hover:bg-green-700`
- Si es un badge informativo → mantener azul (es semántico)
- Si es un link → mantener azul (los links pueden ser azules)

4. Verificar específicamente:
- `LoginSubmitButton.tsx` (ya verde en mi sesión anterior, verificar)
- `RegisterSubmitButton.tsx` (ya verde)
- `frontend/src/app/(dashboard)/proposals/page.tsx` → "Nueva Propuesta" button
- `frontend/src/app/(dashboard)/purchase-orders/page.tsx` → "Nueva PO" button
- Cualquier botón en filtros KPI del dashboard

**QA**:
```
1. Navegar a /proposals → botón "Nueva Propuesta" debe ser verde
2. Navegar a /purchase-orders → botón "Nueva PO" debe ser verde
3. Navegar a /login → botón "Iniciar Sesión" debe ser verde
```

---

#### TAREA 2.5 — Corregir empty state de assets + otras páginas (BUG-ASSET-01)

**Archivos**: `frontend/src/app/(dashboard)/assets/page.tsx` · `frontend/src/app/(dashboard)/inventory/page.tsx` · `frontend/src/app/(dashboard)/fleet/page.tsx` · `frontend/src/app/(dashboard)/resources/page.tsx`

**Qué hacer**:
Para cada página con empty state sin CTA, agregar un botón de acción:
```tsx
// En assets/page.tsx, cuando no hay activos:
<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border-medium)] p-12 text-center">
  <Package className="size-12 text-[var(--text-tertiary)]" aria-hidden="true" />
  <div>
    <h3 className="text-lg font-semibold text-[var(--text-primary)]">No hay activos registrados</h3>
    <p className="mt-1 text-sm text-[var(--text-tertiary)]">
      Registre el primer activo para comenzar a gestionar su inventario de equipos.
    </p>
  </div>
  <Button variant="primary" asChild>
    <Link href="/assets/new">
      <Plus className="size-4" aria-hidden="true" />
      Nuevo activo
    </Link>
  </Button>
</div>
```

Páginas a modificar:
- `/assets` → "+ Nuevo activo" link a `/assets/new`
- `/inventory` → "+ Nuevo item" link a `/inventory/new`
- `/fleet` → "+ Nuevo vehículo" link a `/fleet/new` (o donde sea el form)
- `/resources` → "+ Nuevo kit" link a `/resources/kits/new`

**QA**:
```
1. Navegar a /assets (sin activos)
2. Verificar botón "+ Nuevo activo" visible
3. Click → navegar a /assets/new
```

---

#### TAREA 2.6 — Corregir subtítulo truncado en templates (BUG-TPL-01)

**Archivos**: `frontend/src/app/(dashboard)/templates/page.tsx`

**Qué hacer**:
1. Buscar el subtítulo debajo del `<h1>Plantillas documentales</h1>`
2. Identificar la clase CSS que causa el truncamiento:
   - Buscar `line-clamp-*`, `truncate`, `overflow-hidden`, `max-h-*`, `text-overflow: ellipsis`
   - Buscar un contenedor con altura fija alrededor del subtítulo
3. Eliminar la restricción de truncamiento:
   - Si es `line-clamp-1` → eliminar la clase
   - Si es `truncate` → eliminar la clase
   - Si es `max-h-*` → cambiar a `min-h-*` o eliminar
   - Si es `overflow-hidden` → cambiar a `overflow-visible`
4. Verificar que el texto fluya naturalmente a múltiples líneas

**QA**:
```
1. Navegar a /templates
2. Verificar subtítulo debajo de "Plantillas documentales" es completamente visible
3. Tomar screenshot
```

---

#### TAREA 2.7 — Agregar CTAs a estados vacíos de payments, billing, costs

**Archivos**: `frontend/src/app/(dashboard)/payments/page.tsx` · `frontend/src/app/(dashboard)/billing/page.tsx` · `frontend/src/app/(dashboard)/costs/page.tsx`

**Qué hacer**:
Para cada página con KPI cards que muestran "0" o "Sin datos registrados":
1. Identificar el componente KPI card (puede ser `KPICard.tsx`, `KpiCard.tsx` o inline)
2. Agregar prop `emptyStateMessage?: string` y `emptyStateAction?: { label: string; href: string }`
3. Cuando el valor es 0 y no hay loading, mostrar:
   - El número "0" visible (no ocultarlo)
   - Subtítulo contextual debajo: "Sin órdenes activas. Cree una solicitud para comenzar."
   - Badge opcional con texto informativo
   - CTA si aplica

```tsx
// Ejemplo de EmptyKpiState component
interface EmptyKpiStateProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyKpiState({ icon: Icon, value, label, description, actionLabel, actionHref }: EmptyKpiStateProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-soft)]">
          <Icon className="size-5 text-[var(--color-brand)]" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{label}</span>
      </div>
      <p className="text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
      {description && (
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-xs font-medium text-[var(--color-brand)] hover:underline">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
```

**QA**:
```
1. Navegar a /payments (sin pagos)
2. Verificar que KPIs muestran "$0" con descripción contextual
3. Navegar a /costs (sin costos)
4. Verificar "Sin órdenes activas" badge con CTA
```

---

#### TAREA 2.8 — Agregar paginación a tabla de usuarios

**Archivos**: `frontend/src/app/(dashboard)/admin/users/page.tsx` · `backend/src/modules/user/user.service.ts` · `backend/src/modules/user/user.routes.ts`

**Qué hacer**:

Backend (`user.service.ts`):
```typescript
async getAll(page = 1, limit = 25): Promise<{ data: IUser[]; pagination: PaginationInfo }> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

Backend (`user.routes.ts`):
```typescript
router.get('/', authenticate, authorize('gerente'), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
  const result = await userService.getAll(page, limit);
  res.json({ success: true, ...result });
});
```

Frontend — agregar paginación UI debajo de la tabla:
```tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3">
      <p className="text-sm text-[var(--text-tertiary)]">
        {total} usuarios registrados
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="text-sm text-[var(--text-tertiary)]">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

**QA**:
```
1. Navegar a /admin/users
2. Verificar paginación visible debajo de tabla
3. Click "Siguiente" → cargar página 2
4. Verificar total de usuarios mostrado
```

---

### Wave 3 — MADURACIÓN (8 tareas paralelas)

---

#### TAREA 3.1 — Contextualizar KPIs del dashboard a dominio Cermont

**Archivos**: `frontend/src/modules/dashboard/hooks/useDashboardKpis.ts` · `frontend/src/modules/dashboard/ui/DashboardHero.tsx` · `frontend/src/modules/dashboard/model/dashboard.types.ts`

**Qué hacer**:

1. Leer `dashboard.types.ts` — extender la interfaz de KPIs:
```typescript
export interface CermontKpi {
  id: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  trend?: 'up' | 'down' | 'flat';
  trendPercent?: number;
  domainCategory: 'lifeline' | 'cctv' | 'certification' | 'hse' | 'financial' | 'operations';
  emptyStateMessage?: string;
}
```

2. En `useDashboardKpis.ts`, agregar un mapper que transforme los KPIs genéricos en contextuales:
```typescript
// Mapper de KPIs genéricos → Cermont domain KPIs
const DOMAIN_KPI_MAP: Record<string, DomainKpiMapping> = {
  activeOrders: {
    label: 'Líneas de vida en proceso de instalación',
    icon: Cable,
    domainCategory: 'lifeline',
    unit: 'instalaciones',
    emptyStateMessage: 'Sin instalaciones de líneas de vida activas',
  },
  openMaintenance: {
    label: 'Certificaciones de líneas de vida emitidas vs pendientes',
    icon: FileCheck,
    domainCategory: 'certification',
    unit: 'certificaciones',
    emptyStateMessage: 'Sin certificaciones registradas',
  },
  monthlyCompleted: {
    label: 'Metros lineales certificados en el período',
    icon: Ruler,
    domainCategory: 'lifeline',
    unit: 'metros',
    emptyStateMessage: 'Sin certificaciones de metraje en el período',
  },
  closureRate: {
    label: '% de certificaciones dentro del SLA contractual',
    icon: Clock,
    domainCategory: 'certification',
    unit: '%',
    emptyStateMessage: 'Sin datos SLA — Sin certificaciones emitidas',
  },
  // ... más mapeos para todos los KPIs
};
```

3. Leer `frontend/src/modules/dashboard/model/dashboard-helpers.ts` — los helpers de transformación
4. Agregar una función de transformación:
```typescript
export function contextualizeKpis(rawKpis: RawKpi[]): CermontKpi[] {
  return rawKpis.map(kpi => {
    const mapping = DOMAIN_KPI_MAP[kpi.key];
    if (!mapping) return kpi; // Pasar sin cambios si no hay mapping
    
    return {
      ...kpi,
      label: mapping.label,
      icon: mapping.icon,
      domainCategory: mapping.domainCategory,
      unit: mapping.unit,
      emptyStateMessage: mapping.emptyStateMessage,
    };
  });
}
```

**QA**:
```
1. Navegar a /dashboard
2. Verificar KPIs muestran labels contextuales: "Líneas de vida", "Certificaciones", etc.
3. Verificar iconos corresponden al dominio
```

---

#### TAREA 3.2 — Agregar hero "Pulso Operativo" al dashboard

**Archivos**: `frontend/src/modules/dashboard/ui/DashboardHero.tsx`

**Qué hacer**:
Rediseñar el hero del dashboard siguiendo DESIGN.md sección 11.2:
```tsx
export function DashboardHero() {
  const { user } = useAuth();
  const { data: kpis } = useDashboardKpis();
  
  const today = useFormattedDate(new Date(), { dateStyle: 'long' });
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-secondary)] p-6 sm:p-8">
      {/* Accent decorative bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--color-brand)] to-[var(--color-cermont-green)]" />
      
      <div className="flex flex-col gap-6">
        {/* Greeting row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Pulso Operativo {user?.name ? `— ${user.name}` : ''}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              {today} · Rol: {user?.role ? getRoleLabel(user.role) : ''}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-green-500" />
            <span className="text-xs text-[var(--text-tertiary)]">Sistema operativo</span>
          </div>
        </div>
        
        {/* Quick action chips */}
        <div className="flex flex-wrap gap-2">
          <QuickActionChip href="/work-requests/new" label="Nueva Solicitud" icon={FilePlus} />
          <QuickActionChip href="/site-visits/new" label="Registrar Visita" icon={MapPin} />
          <QuickActionChip href="/evidences" label="Subir Evidencias" icon={Camera} />
          <QuickActionChip href="/reports" label="Generar Informe" icon={FileText} />
        </div>
        
        {/* KPI mini-summary */}
        {kpis && kpis.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.slice(0, 4).map(kpi => (
              <div key={kpi.id} className="rounded-lg bg-[var(--surface-secondary)] p-3">
                <p className="text-xs text-[var(--text-tertiary)]">{kpi.label}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                  {kpi.value}{kpi.unit ? ` ${kpi.unit}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Subtle empty state if no KPIs */}
        {(!kpis || kpis.length === 0) && (
          <p className="text-sm text-[var(--text-tertiary)] italic">
            Bienvenido al panel de control. Complete una orden para comenzar a ver KPIs.
          </p>
        )}
      </div>
    </div>
  );
}

function QuickActionChip({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Link>
  );
}
```

**QA**:
```
1. Navegar a /dashboard
2. Verificar hero con "Pulso Operativo", nombre de usuario, fecha, rol
3. Verificar quick action chips funcionales
```

---

#### TAREA 3.3 — Agregar links a módulos en el flujo de 14 pasos

**Archivos**: `frontend/src/modules/cockpit/ui/FourteenStepProgressBar.tsx`

**Qué hacer**:
Agregar un mapa de rutas para cada paso del flujo:
```typescript
const STEP_ROUTES: Record<number, { list: string; create?: string }> = {
  1: { list: '/work-requests', create: '/work-requests/new' },
  2: { list: '/site-visits', create: '/site-visits/new' },
  3: { list: '/proposals', create: '/proposals/new' },
  4: { list: '/purchase-orders', create: '/purchase-orders/new' },
  5: { list: '/planning' },
  6: { list: '/execution' },
  7: { list: '/evidences' },
  8: { list: '/reports' },
  9: { list: '/delivery-records' },
  10: { list: '/delivery-records' },
  11: { list: '/billing/ses' },
  12: { list: '/billing/invoices' },
  13: { list: '/billing/invoices' },
  14: { list: '/payments' },
};
```

Modificar cada botón del paso para que sea un Link:
```tsx
// En lugar de <button>, usar <Link>
<Link
  href={step.status === 'completed' && step.recordId 
    ? `${STEP_ROUTES[step.step]?.list}/${step.recordId}`
    : (STEP_ROUTES[step.step]?.create || STEP_ROUTES[step.step]?.list || '#')
  }
  className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${style.bg} ${style.border} ${isCurrent ? 'ring-2 ring-[var(--color-brand-blue)] ring-offset-2' : ''} text-white`}
  style={{ minWidth: 44, minHeight: 44 }}
  title={`Ir a ${step.label}`}
>
  <Icon className="size-4" aria-hidden="true" />
</Link>
```

**QA**:
```
1. Navegar a /dashboard o /service-cases/:id/cockpit
2. Click en paso 1 "Solicitud" → navega a /work-requests
3. Click en paso 7 "Evidencias" → navega a /evidences
4. Click en paso 14 "Pago" → navega a /payments
```

---

#### TAREA 3.4 — Agregar timestamps de última actualización a KPIs

**Archivos**: `frontend/src/modules/dashboard/ui/DashboardHero.tsx` · Todos los módulos con KPIs

**Qué hacer**:
1. Crear helper de timestamp:
```typescript
// frontend/src/lib/format/relative-time.ts
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function timeAgo(date: Date | string | number): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}
```

2. En cada KPI section, agregar:
```tsx
<p className="text-[10px] text-[var(--text-tertiary)]">
  Última actualización: {timeAgo(data.generatedAt)}
</p>
```

3. Modificar el backend para incluir `generatedAt` en cada response de dashboard/KPIs:
```typescript
// En cada service endpoint de dashboard
return {
  ...data,
  generatedAt: new Date().toISOString(),
};
```

**QA**:
```
1. Navegar a /dashboard
2. Verificar "Última actualización: hace X minutos" visible
3. Verificar en /payments también tiene timestamp
```

---

#### TAREA 3.5 — Agregar KPI trend indicators

**Archivos**: `frontend/src/modules/dashboard/hooks/useDashboardKpis.ts` · `frontend/src/modules/dashboard/ui/KPICard.tsx`

**Qué hacer**:
1. Modificar el componente KPICard para mostrar tendencia:
```tsx
interface TrendIndicatorProps {
  trend?: 'up' | 'down' | 'flat';
  percent?: number;
}

function TrendIndicator({ trend, percent }: TrendIndicatorProps) {
  if (!trend) return null;
  
  const colors = {
    up: 'text-green-600',
    down: 'text-red-500',
    flat: 'text-gray-400',
  };
  
  const icons = {
    up: '↑',
    down: '↓',
    flat: '—',
  };

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colors[trend]}`}>
      {icons[trend]}
      {percent !== undefined && `${Math.abs(percent)}%`}
      {trend === 'flat' && ' sin cambio significativo'}
    </span>
  );
}
```

2. En el backend, calcular tendencias comparando mes actual vs anterior:
```typescript
async function calculateTrend(currentValue: number, previousValue: number): { trend: 'up' | 'down' | 'flat'; percent: number } {
  if (previousValue === 0) return { trend: currentValue > 0 ? 'up' : 'flat', percent: 0 };
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return {
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'flat',
    percent: Math.round(change),
  };
}
```

**QA**:
```
1. Navegar a /dashboard con datos
2. Verificar cada KPI tiene indicador de tendencia (↑ verde, ↓ rojo, — gris)
```

---

#### TAREA 3.6 — Implementar Cermont AI service

**Archivos**: `backend/src/config/env.ts` · `backend/src/services/ai/ai-provider.ts` · `backend/src/modules/ai/ai.service.ts`

**Qué hacer**:

1. Agregar variables de entorno en `env.ts`:
```typescript
export const BackendAiEnvSchema = z.object({
  AI_API_KEY: z.string().optional(),
  AI_ENDPOINT: z.string().url().optional().default('https://api.openai.com/v1/chat/completions'),
  AI_MODEL: z.string().optional().default('gpt-4o-mini'),
  AI_ENABLED: z.coerce.boolean().optional().default(false),
});
```

2. Crear abstract provider:
```typescript
// ai-provider.ts
export interface AiProvider {
  chat(messages: AiMessage[]): Promise<AiResponse>;
  isAvailable(): boolean;
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export class OpenAiProvider implements AiProvider {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(config: { apiKey: string; endpoint: string; model: string }) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.model = config.model;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chat(messages: AiMessage[]): Promise<AiResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'Eres un asistente experto en seguridad industrial, líneas de vida, CCTV y gestión operativa para Cermont S.A.S. Responde en español.' },
          ...messages,
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: { promptTokens: data.usage?.prompt_tokens, completionTokens: data.usage?.completion_tokens },
    };
  }
}

export class MockAiProvider implements AiProvider {
  isAvailable(): boolean { return true; }
  
  async chat(_messages: AiMessage[]): Promise<AiResponse> {
    await new Promise(r => setTimeout(r, 500));
    return {
      content: '⚠️ El asistente Cermont AI está en modo de demostración. Configure AI_API_KEY en las variables de entorno del servidor para habilitar respuestas reales.',
      model: 'mock',
    };
  }
}
```

3. Crear factory:
```typescript
// ai.service.ts
let provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!provider) {
    const env = validateBackendEnv();
    if (env.AI_ENABLED && env.AI_API_KEY) {
      provider = new OpenAiProvider({
        apiKey: env.AI_API_KEY,
        endpoint: env.AI_ENDPOINT,
        model: env.AI_MODEL,
      });
    } else {
      provider = new MockAiProvider();
    }
  }
  return provider;
}
```

**QA**:
```
1. Sin AI_API_KEY → AI endpoint responde con mensaje de demo
2. Con AI_API_KEY configurada → AI endpoint responde con respuesta real
```

---

#### TAREA 3.7 — Agregar fallback graceful a Cermont AI frontend

**Archivos**: `frontend/src/modules/core/ui/ai/CermontAIDrawerHeader.tsx` · `frontend/src/modules/core/ui/ai/useCermontAIConversation.ts`

**Qué hacer**:
1. Leer `useCermontAIConversation.ts` — el hook que maneja el estado del chat
2. Agregar un estado `isAvailable` que se determina al llamar al endpoint de health:
```typescript
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

useEffect(() => {
  fetch('/api/ai/health')
    .then(res => res.json())
    .then(data => setIsAvailable(data.available))
    .catch(() => setIsAvailable(false));
}, []);
```

3. En `CermontAIDrawerHeader.tsx`, cuando `!isAvailable`:
```tsx
{!isAvailable && (
  <div className="flex flex-col items-center gap-3 p-6 text-center">
    <Wrench className="size-10 text-[var(--text-tertiary)]" aria-hidden="true" />
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Asistente no configurado</h3>
      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
        El administrador debe configurar una clave de API en las variables de entorno del servidor para habilitar Cermont AI.
      </p>
    </div>
    <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-medium text-yellow-600">
      No disponible
    </span>
  </div>
)}
```

4. Cuando `isAvailable === null` (cargando), mostrar skeleton

**QA**:
```
1. Abrir Cermont AI drawer sin API key configurada
2. Verificar que muestra mensaje de setup guidance, no "No disponible" roto
3. No debe mostrar el input de chat
```

---

#### TAREA 3.8 — Agregar formato COP a KPIs financieros

**Archivos**: Todos los módulos que muestran valores monetarios (payments, billing, costs, proposals)

**Qué hacer**:
1. Crear helper de formato COP:
```typescript
// frontend/src/lib/format/currency.ts
const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return COP_FORMATTER.format(value);
}

export function formatCOPCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return formatCOP(value);
}
```

2. Aplicar en payments, billing, costs, proposals:
```tsx
import { formatCOP } from '@/lib/format/currency';

// En lugar de: `$${value.toLocaleString('es-CO')}`
// Usar: formatCOP(value)
```

**QA**:
```
1. Navegar a /payments
2. Verificar valores en COP: "$ 5,000,000" o "$ 1.2M" según el contexto
3. Navegar a /proposals/[id] → verificar formato COP
```

---

### Wave 4 — INNOVACIÓN + ESCALABILIDAD (8 tareas paralelas)

---

#### TAREA 4.1 — Agregar payment aging visualization

**Archivos**: `frontend/src/app/(dashboard)/payments/page.tsx`

**Qué hacer**:
1. Después del bloque de KPIs, agregar una sección de aging:
```tsx
<section className="space-y-4" aria-labelledby="aging-title">
  <h2 id="aging-title" className="text-lg font-semibold text-[var(--text-primary)]">
    Antigüedad de Pagos
  </h2>
  
  {/* Tabla de aging */}
  {agingData ? (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {AGING_BUCKETS.map(bucket => (
        <AgingBucketCard
          key={bucket.key}
          label={bucket.label}
          value={agingData[bucket.key]}
          max={Math.max(...Object.values(agingData), 1)}
          color={bucket.color}
        />
      ))}
    </div>
  ) : (
    <p className="text-sm text-[var(--text-tertiary)] italic">Sin datos de antigüedad de pagos</p>
  )}
</section>
```

2. Crear componente `AgingBucketCard`:
```tsx
interface AgingBucketCardProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function AgingBucketCard({ label, value, max, color }: AgingBucketCardProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">{value === 0 ? 'Sin vencidos' : `${percent.toFixed(0)}% del total`}</p>
    </div>
  );
}

const AGING_BUCKETS = [
  { key: 'current', label: 'Al día (0-30d)', color: '#4CAF50' },
  { key: 'overdue30', label: '31-60 días', color: '#F59E0B' },
  { key: 'overdue60', label: '61-90 días', color: '#F97316' },
  { key: 'overdue90', label: '90+ días', color: '#EF4444' },
] as const;
```

**QA**:
```
1. Navegar a /payments
2. Verificar sección "Antigüedad de Pagos" con barras de progreso
3. Cada bucket debe tener color semántico (verde→amarillo→naranja→rojo)
```

---

#### TAREA 4.2 — Agregar sección "Hallazgos críticos" en evidencias

**Archivos**: `frontend/src/app/(dashboard)/evidences/page.tsx`

**Qué hacer**:
1. Después del grid de evidencias, agregar una sección de hallazgos críticos:
```tsx
{evidences && evidences.length > 0 && (
  <section className="space-y-4" aria-labelledby="findings-title">
    <h2 id="findings-title" className="text-lg font-semibold text-[var(--text-primary)]">
      Hallazgos Críticos en Inspección
    </h2>
    
    <div className="flex flex-wrap gap-3">
      <FindingBadge count={criticalCount} label="Críticos" color="red" />
      <FindingBadge count={moderateCount} label="Moderados" color="yellow" />
      <FindingBadge count={minorCount} label="Leves" color="blue" />
    </div>
    
    {/* Lista de hallazgos recientes */}
    <div className="space-y-2">
      {recentFindings.map(finding => (
        <FindingCard key={finding.id} finding={finding} />
      ))}
    </div>
  </section>
)}
```

**QA**:
```
1. Navegar a /evidences con hallazgos registrados
2. Verificar sección de hallazgos con badges de severidad
```

---

#### TAREA 4.3 — Agregar badge de estado de conexión a execution

**Archivos**: `frontend/src/app/(dashboard)/execution/page.tsx`

**Qué hacer**:
1. Agregar indicador de conexión en línea/fuera de línea:
```tsx
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

function ConnectionStatus() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
      isOnline 
        ? 'bg-green-500/10 text-green-600' 
        : 'bg-red-500/10 text-red-500'
    }`}>
      <span className={`size-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      {isOnline ? 'Conectado' : 'Sin conexión'}
      <span className="opacity-60">· Sync pendiente: 0</span>
    </div>
  );
}
```

2. Reemplazar el "Sync pendiente: 0" genérico por este badge con indicador de conexión

**QA**:
```
1. Navegar a /execution
2. Verificar badge verde "Conectado" cuando hay internet
3. Verificar badge rojo "Sin conexión" cuando offline (desconectar red)
```

---

#### TAREA 4.4 — Agregar validación de formato en upload de Excel en planning

**Archivos**: `frontend/src/app/(dashboard)/planning/page.tsx`

**Qué hacer**:
1. Encontrar el botón "Subir Excel de recursos"
2. Agregar validación de archivo antes de enviar:
```typescript
const handleFileUpload = (file: File) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Formato no soportado. Sube un archivo .xlsx o .xls');
    return;
  }
  
  if (file.size > MAX_SIZE) {
    toast.error('El archivo excede el tamaño máximo de 10MB');
    return;
  }
  
  // Procesar archivo...
};
```

3. Mostrar el nombre del archivo seleccionado y un botón para removerlo

**QA**:
```
1. Intentar subir un PDF → mensaje "Formato no soportado"
2. Subir un .xlsx válido → procede
```

---

#### TAREA 4.5 — Agregar colores semánticos a audit log

**Archivos**: `frontend/src/app/(dashboard)/admin/audit/page.tsx`

**Qué hacer**:
1. Identificar el componente que renderiza cada fila del log de auditoría
2. Agregar color semántico por tipo de evento:
```typescript
const AUDIT_EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  create: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
  update: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  delete: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' },
  approve: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  reject: { bg: 'bg-orange-500/10', text: 'text-orange-600', dot: 'bg-orange-500' },
  login: { bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-500' },
  default: { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-500' },
};
```

3. Cada fila debe tener:
   - Dot de color según tipo de evento
   - Fondo suave del mismo color
   - Texto con el color correspondiente
   - Timestamp formateado

**QA**:
```
1. Navegar a /admin/audit
2. Verificar eventos con colores semánticos (verde=create, rojo=delete, azul=update)
```

---

#### TAREA 4.6 — Agregar confirmación a export en backups

**Archivos**: `frontend/src/app/(dashboard)/admin/backups/page.tsx`

**Qué hacer**:
1. Encontrar los botones "Exportar"
2. Agregar confirmación antes de la descarga:
```typescript
const handleExport = async (collectionName: string) => {
  const confirmed = confirm(`¿Descargar respaldo de "${collectionName}"?`);
  if (!confirmed) return;
  
  try {
    const response = await apiClient.get(`/admin/backups/export/${collectionName}`);
    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName}-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Respaldo de "${collectionName}" descargado`);
  } catch {
    toast.error(`Error al exportar "${collectionName}"`);
  }
};
```

**QA**:
```
1. Click en "Exportar" en /admin/backups
2. Verificar confirmación aparece
3. Aceptar → descarga archivo JSON
4. Cancelar → no descarga
```

---

#### TAREA 4.7 — Reemplazar checkbox por switch toggle en inventory

**Archivos**: `frontend/src/app/(dashboard)/inventory/page.tsx`

**Qué hacer**:
1. Encontrar el checkbox "Solo stock bajo"
2. Reemplazar con un componente Switch (Radix UI ya incluido):
```tsx
import * as Switch from '@radix-ui/react-switch';

function LowStockToggle({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-5 w-9 rounded-full bg-[var(--surface-secondary)] data-[state=checked]:bg-[var(--color-brand)] transition-colors"
        id="low-stock-toggle"
      >
        <Switch.Thumb className="block size-4 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4" />
      </Switch.Root>
      <label htmlFor="low-stock-toggle" className="text-sm text-[var(--text-secondary)] cursor-pointer">
        Solo stock bajo
      </label>
    </div>
  );
}
```

**QA**:
```
1. Navegar a /inventory
2. Verificar toggle switch (no checkbox) para "Solo stock bajo"
3. Toggle debe funcionar correctamente
```

---

#### TAREA 4.8 — Agregar dropdown de industrias en customers

**Archivos**: `frontend/src/app/(dashboard)/customers/new/page.tsx`

**Qué hacer**:
1. Encontrar el campo "Industria"
2. Reemplazar el input de texto libre por un combobox/select:
```tsx
const INDUSTRY_OPTIONS = [
  { value: 'hidrocarburos', label: 'Hidrocarburos' },
  { value: 'mineria', label: 'Minería' },
  { value: 'energia', label: 'Energía / Electricidad' },
  { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'industrial', label: 'Industrial / Manufactura' },
  { value: 'gobierno', label: 'Gobierno' },
  { value: 'otro', label: 'Otro' },
];

// En el formulario:
<div className="flex flex-col gap-2">
  <label htmlFor="industry" className="text-sm font-medium text-[var(--text-secondary)]">Industria</label>
  <select
    id="industry"
    name="industry"
    required
    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)]"
  >
    <option value="">Seleccione una industria</option>
    {INDUSTRY_OPTIONS.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
</div>
```

**QA**:
```
1. Navegar a /customers/new
2. Verificar campo "Industria" tiene dropdown con opciones
3. Seleccionar una opción
```

---

### Wave F5 — VERIFICACIÓN FINAL

#### TAREA F5.1 — Full Gate Sweep

```bash
npm run typecheck       # 7/7 tasks successful
npm run lint           # 0 errors across 1560+ files
npm run build          # 5 successful, 5 total
npx react-doctor@latest --verbose  # ≥ 90/100, zero bugs
```

Si algún gate falla: capturar el error específico, identificar la tarea responsable, corregir, re-ejecutar ese gate, luego re-ejecutar toda la secuencia desde el inicio.

#### TAREA F5.2 — Playwright smoke test

Navegar a las 10 páginas principales y verificar:
1. `/login` — 0 console errors, botón verde
2. `/register` — 0 console errors, badge seguridad visible
3. `/dashboard` — KPIs contextuales, timestamps, hero pulso operativo
4. `/payments` — 0 console errors, aging chart visible
5. `/evidences` — 0 console errors, carga < 1.5s
6. `/admin/settings` — tildes correctas
7. `/admin/users` — paginación funcional
8. `/site-visits/new` — datetime-local funcional
9. `/proposals/new` — submit navega a /proposals/{id}
10. Cermont AI — fallback graceful sin API key

---

## COMMIT STRATEGY

1. `fix(session): invalidate duplicate refresh tokens, prevent session rotation`
2. `fix(site-visits): replace broken datetime-local with controlled date input`
3. `fix(proposals): add _id fallback to prevent navigation to /undefined`
4. `fix(purchase-orders): guard empty proposalId, catch MongoDB ObjectId error`
5. `feat(ui): add ErrorBoundary and ApiErrorBoundary components`
6. `perf(auth): add in-memory token validation cache with TTL`
7. `perf(evidences): add session check cache, replace overlay with skeleton`
8. `feat(ui): add PageSkeleton component and dashboard loading.tsx`
9. `fix(payments): return empty data instead of 400 from dashboard/aging`
10. `fix(admin): correct missing tildes in settings labels`
11. `feat(navigation): add centralized breadcrumb labels`
12. `feat(seo): add page-specific metadata titles for all routes`
13. `fix(ui): standardize all CTA buttons to brand green #4CAF50`
14. `fix(ui): add empty state CTAs to assets/inventory/fleet/resources`
15. `fix(templates): remove subtitle truncation`
16. `feat(ui): add contextual empty states for payments/billing/costs KPIs`
17. `feat(admin): add pagination to users table`
18. `feat(dashboard): contextualize KPIs to Cermont domain (lifelines, CCTV)`
19. `feat(dashboard): add pulso operativo hero section`
20. `feat(flow): add module quick-access links from 14-step progress`
21. `feat(dashboard): add last-updated timestamps to all KPI widgets`
22. `feat(dashboard): add trend indicators (up/down/flat) to KPIs`
23. `feat(ai): implement configurable AI provider with OpenAI + mock fallback`
24. `feat(ai): add graceful disabled state to Cermont AI drawer`
25. `feat(payments): add payment aging visualization with semantic colors`
26. `feat(payments): add COP currency formatting`
27. `feat(evidences): add critical findings section with severity badges`
28. `feat(execution): add online/offline connection status badge`
29. `fix(planning): add Excel file validation before upload`
30. `feat(admin): add semantic colors to audit log events`
31. `feat(admin): add export confirmation dialog to backups`
32. `fix(inventory): replace checkbox with Radix switch toggle`
33. `fix(customers): add industry dropdown with predefined options`
34. `chore: final gate sweep - typecheck, lint, build, react-doctor`

---

## SUCCESS CRITERIA

### Verification Commands
```bash
npm run typecheck       # → 7 successful, 7 total
npm run lint           # → Checked X files, no fixes applied
npm run build          # → 5 successful, 5 total
npx react-doctor@latest --verbose --scope changed  # → ≥ 90/100, 0 bugs
```

### Playwright Verification
```bash
npx playwright test --grep "@smoke"
```

### Final Checklist
- [ ] B-01: Sesión no rota entre rutas (invalida tokens duplicados)
- [ ] B-02: Site-visits/new datetime-local funcional
- [ ] B-03: Proposals/new navega a /proposals/{id} (no /undefined)
- [ ] B-04: Purchase-orders/new no expone MongoDB ObjectId
- [ ] B-05: Evidences carga < 1.5s sin overlay
- [ ] B-06: Payments sin skeleton persistente (API retorna datos vacíos)
- [ ] B-07: Assets tiene CTA "+ Nuevo activo"
- [ ] B-08: Templates subtitle completamente visible
- [ ] B-09: Admin/settings tildes correctas
- [ ] B-10: Breadcrumbs muestran nombres de módulo
- [ ] B-11: Metadata titles únicos por página
- [ ] B-12: CTA buttons verdes (#4CAF50)
- [ ] KPIs contextualizados al dominio Cermont
- [ ] ErrorBoundary envuelve todas las páginas del dashboard
- [ ] Paginación funcional en /admin/users
- [ ] Cermont AI con fallback graceful
- [ ] Payment aging visualization funcional
- [ ] Trend indicators visibles en KPIs
- [ ] Typecheck, lint, build, react-doctor todos verdes

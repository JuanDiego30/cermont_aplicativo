# ADR-014: Consent Gateway

**Estado:** Aceptado
**Fecha:** 2026-06-29
**Driver:** Especificación Spec-011 — Privacy y consentimiento del cliente

---

## Contexto

El sistema Cermont recolecta, almacena y procesa datos personales (fotos, firmas, geolocalización, datos de identificación). Para cumplir con la ley colombiana de protección de datos (Ley 1581 de 2012) y estándares internacionales, se requiere que el usuario acepte explícitamente la política de privacidad antes de acceder a las funcionalidades del sistema.

Actualmente existen páginas `/consent` y `/privacy` pero **no hay un gate que bloquee el acceso** a rutas protegidas si el usuario no ha aceptado la política vigente.

---

## Diseño

### 1. ConsentGate: Componente de ruta

```
Usuario autenticado → `ConsentGate` evalúa consentimiento → 
  ├─ Si aceptó política vigente → renderiza children (dashboard layout)
  └─ Si no aceptó → redirect a /consent
```

### 2. Almacenamiento del consentimiento

El consentimiento se almacena como parte del perfil del usuario:

```typescript
// En User model (agregado)
interface UserConsent {
  policyVersion: string;     // "v1.0" — versión de la política aceptada
  acceptedAt: string;        // ISO 8601 timestamp
  ipAddress: string;         // Dirección IP al momento del consentimiento
  userAgent: string;         // User-Agent al momento del consentimiento
  required: boolean;         // true si debe consentir antes de operar
}
```

### 3. Versionado de política

```typescript
const PRIVACY_POLICY_VERSION = "v1.0";
```

La versión se define en una constante central. Cuando la política cambia:
1. Se incrementa `PRIVACY_POLICY_VERSION`
2. Los usuarios existentes deben re-consentir (su `policyVersion` queda desactualizada)
3. El `ConsentGate` redirige a `/consent` con mensaje de actualización

### 4. Rutas excluidas del gate

El `ConsentGate` NO bloquea:
| Ruta | Razón |
|------|-------|
| `/login` | El usuario no está autenticado |
| `/register` | Proceso de registro |
| `/forgot-password` | Recuperación de acceso |
| `/reset-password` | Cambio de contraseña |
| `/unauthorized` | Error de permisos |
| `/consent` | ¡La página de consentimiento mismo! |
| `/privacy` | Leer la política |
| `/api/*` | API calls (el gate es solo frontend) |

### 5. Flujo completo

```
1. Usuario hace login → auth store setea accessToken + user
2. AuthProvider monta children
3. ConsentGate check:
   a. ¿Ruta excluida? → skip, renderiza children
   b. ¿user.consent?.acceptedAt existe?
      → No: redirect /consent
      → Sí: ¿policyVersion === PRIVACY_POLICY_VERSION?
         → Sí: ✅ renderiza children
         → No: redirect /consent (reattrar)
4. /consent page:
   a. Muestra resumen de política con link a /privacy
   b. Botón "Aceptar" → PATCH /api/users/:id/consent
   c. Botón "No acepto" → alerta "No podrás usar el sistema. Contacta al administrador."
      → logout
5. Tras aceptar → redirect a dashboard
```

### 6. API endpoint

```
PATCH /api/users/:id/consent
Body: { policyVersion: "v1.0" }
Response: { success: true, data: { consent: { policyVersion, acceptedAt } } }
```

Este endpoint actualiza el campo `consent` del usuario en MongoDB.

### 7. Backend middleware

El backend también debe validar consentimiento para endpoints que manejen datos personales:

```
GET /api/users/:id → requiere consentimiento activo
PATCH /api/delivery-records/:id/sign → requiere consentimiento activo (firma digital)
POST /api/evidences/upload → requiere consentimiento activo (fotos)
```

Usar middleware `requireConsent` similar a `requireAuth`:

```typescript
function requireConsent(requiredVersion: string = PRIVACY_POLICY_VERSION) {
  return (req, res, next) => {
    if (!req.user?.consent?.acceptedAt) {
      return res.status(403).json({ success: false, error: { code: 'CONSENT_REQUIRED', message: 'Acepte la política de privacidad' } });
    }
    if (req.user.consent.policyVersion !== requiredVersion) {
      return res.status(403).json({ success: false, error: { code: 'CONSENT_OUTDATED', message: 'La política fue actualizada. Acepte la nueva versión.' } });
    }
    next();
  };
}
```

### 8. Componente ConsentGate (React)

```typescript
// frontend/src/components/auth/ConsentGate.tsx
export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Rutas excluidas
  if (EXCLUDED_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Usuario no autenticado — skip (AuthGate maneja esto)
  if (!user) return <>{children}</>;

  // Consentimiento faltante o desactualizado
  if (!user.consent?.acceptedAt || user.consent.policyVersion !== PRIVACY_POLICY_VERSION) {
    router.replace('/consent');
    return null;
  }

  return <>{children}</>;
}
```

### 9. Integración con layout existente

```typescript
// frontend/src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <AuthGate>
      <ConsentGate>
        <Sidebar />
        <main>{children}</main>
      </ConsentGate>
    </AuthGate>
  );
}
```

---

## Decisiones

| Decisión | Opción | Justificación |
|----------|--------|---------------|
| Almacenamiento | Campo `consent` en User model | SSOT con el perfil |
| Versionado | Constante `PRIVACY_POLICY_VERSION` | Simple, explícito, fácil de auditar |
| Backend check | Middleware `requireConsent` | Defense in depth |
| Consent en signup | NO — post-login | Reducir fricción en registro |
| Consent logout | Alert + redirect | No coercitivo |
| IP/UserAgent en consent | Sí | Evidencia forense |

---

## Rutas excluidas (constante)

```typescript
const CONSENT_EXCLUDED_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/consent',
  '/privacy',
  '/api',
];
```

---

## Afectados

| Archivo | Acción |
|---------|--------|
| `packages/shared-types/src/schemas/user.ts` | Agregar `consent` al schema User |
| `backend/src/models/User.ts` | Agregar campo `consent` |
| `backend/src/routes/users.ts` | Agregar `PATCH /:id/consent` |
| `backend/src/middlewares/` | Crear `requireConsent.ts` |
| `frontend/src/components/auth/ConsentGate.tsx` | Crear componente |
| `frontend/src/app/(dashboard)/layout.tsx` | Envolver con ConsentGate |
| `frontend/src/app/(legal)/consent/page.tsx` | Implementar flujo de aceptación |
| `frontend/src/lib/constants.ts` | Agregar `PRIVACY_POLICY_VERSION` |
| `docs/` | Documentar flujo |

---

## Consecuencias

Positivas:
- Cumplimiento legal (Ley 1581)
- Trazabilidad de consentimiento por usuario
- Defense in depth (frontend + backend)

Negativas:
- Fricción inicial para nuevos usuarios
- Mantenimiento de versiones de política
- Los usuarios existentes deben aceptar al hacer login

---

## Referencias

- Ley 1581 de 2012 (Colombia)
- `frontend/src/app/(legal)/consent/page.tsx`
- `frontend/src/app/(legal)/privacy/page.tsx`
- `frontend/src/app/(dashboard)/layout.tsx`

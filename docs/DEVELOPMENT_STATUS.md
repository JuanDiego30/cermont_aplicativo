# Estado Actual de Implementación — CERMONT S.A.S.

> **Propósito:** Línea base verificable del estado actual.
> **Estados:** `missing` | `mock` | `broken` | `partial` | `implemented` | `verified` | `blocked_external`
> **Regla:** Ningún módulo usa `done`. `verified` solo con evidencia E2E + gates aprobados.

**Última actualización:** 2026-07-23

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Módulos totales | 40+ |
| `verified` | 0 |
| `implemented` | ~30 |
| `partial` | 6 |
| `broken` | 0 |
| `missing` | 2 |
| `mock` | 0 |
| Tests unitarios | ~991 (Vitest) |
| Tests E2E | Login + demo (insuficiente para flujo crítico) |
| Quality gates | 9 configurados |
| Build | 83 rutas estáticas |

---

## Mapa de Estados por Módulo

### Infraestructura Transversal

| Módulo | Estado | Frontend | Backend | Contrato | Tests | Observaciones |
|--------|--------|----------|---------|----------|-------|-------------|
| **Auth (login/refresh/logout)** | `implemented` | ✅ | ✅ | ✅ | ⚠️ | Rotación de tokens, cookies httpOnly, rate limiting. Falta E2E de refresh. |
| **Auth (recuperación contraseña)** | `implemented` | ✅ | ✅ | ✅ | ✅ | Token criptográfico, hash SHA-256, expiración 1h, uso único, timing-safe, sesiones revocadas, auditoría. Email vía gateway (nodemailer/dev logger). |
| **Usuarios CRUD** | `implemented` | ✅ | ✅ | ✅ | ⚠️ | CRUD completo, certificaciones, skills. Sin test de desactivación. |
| **Roles/RBAC** | `implemented` | ✅ | ✅ | ✅ | ⚠️ | 15 roles. Sin prueba de permiso negativo en backend. |
| **Auditoría** | `implemented` | ✅ | ✅ | ✅ | ❌ | Logging inmutable, queryable. Sin E2E de eventos críticos. |
| **Offline/PWA** | `partial` | ✅ | ✅ | — | ⚠️ | IndexedDB queue, sync, service worker. Sin lectura offline garantizada. |
| **Observabilidad** | `implemented` | — | ✅ | — | — | Health checks, métricas. |
| **Notificaciones** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de duplicación. |

### Flujo Operativo (14 pasos)

| Módulo | Estado | Frontend | Backend | Contrato | Tests | Observaciones |
|--------|--------|----------|---------|----------|-------|-------------|
| **ServiceCase/WorkOrder Cockpit** | `partial` | ✅ | ✅ | ✅ | ❌ | Cockpit existe pero no centraliza blockers, próxima acción, readiness integrado. |
| **Work Requests** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de idempotencia. |
| **Site Visits** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de omisión justificada. |
| **Proposals** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin recálculo de totales probado en backend. |
| **Purchase Orders** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de conversión idempotente. |
| **Planning** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin readiness blockers calculados por backend. |
| **Execution** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba offline real. |
| **Evidence** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de hash/integridad. |
| **Reports** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin versionado probado. |
| **Delivery Records** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de firma rechazada. |
| **Service Entry Sheet** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin E2E administrativo completo. |
| **Invoicing** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin DIAN real. |
| **Payments** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de duplicación. |
| **Costs** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin fórmula probada en backend. |

### Módulos de Apoyo

| Módulo | Estado | Frontend | Backend | Contrato | Tests | Observaciones |
|--------|--------|----------|---------|----------|-------|-------------|
| **Dashboard/KPIs** | `implemented` | ✅ | ✅ | ✅ | ✅ | DashboardSummary, envelope conforme. |
| **Files** | `implemented` | ✅ | ✅ | ✅ | ❌ | Subida segura, UUID renaming, magic bytes. |
| **Camara** | `partial` | ✅ | — | ✅ | ❌ | Captura frontend, backend pendiente. |
| **Documents/PDF** | `implemented` | ✅ | ✅ | ✅ | ❌ | CRUD + templates + PDF. |
| **Checklists** | `partial` | ⚠️ | ✅ | ✅ | ❌ | Backend OK, UI por verificar. |
| **Fleet** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba de disponibilidad. |
| **Assets** | `implemented` | ✅ | ✅ | ✅ | ❌ | CRUD + maintenance link. |
| **Inventory** | `implemented` | ✅ | ✅ | ✅ | ❌ | CRUD + scan. |
| **Templates** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin versionado de respuestas. |
| **Portal Cliente** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin prueba IDOR. |
| **Sync** | `implemented` | — | ✅ | ✅ | ❌ | Offline sync endpoint. |
| **DIAN** | `blocked_external` | ✅ | ✅ | ✅ | ❌ | Dependencia externa, integración no verificada. |
| **ERP Connector** | `blocked_external` | ✅ | ✅ | ✅ | ❌ | Dependencia externa. |
| **Admin/Backups** | `implemented` | ✅ | ✅ | ✅ | ❌ | Sin restore probado. |
| **Legal/Privacidad** | `missing` | ❌ | ❌ | ❌ | ❌ | Sin implementación Ley 1581. |
| **SSL/Deploy** | `implemented` | ✅ | ✅ | — | ❌ | nginx + Certbot + PM2. |

---

## Áreas que Requieren Atención Prioritaria

| # | Área | Riesgo | Acción |
|---|------|--------|--------|
| 1 | **Tests ausentes** en 35/40 módulos | Alto | Crear tests de integración y flujo negativo |
| 2 | **Recuperación de contraseña** sin sandbox | Crítico | Validar sandbox de correo y expiración de token |
| 3 | **ServiceCase Cockpit** no centraliza | Alto | Refactorizar para mostrar blockers, próxima acción, costos |
| 4 | **Offline** sin prueba de conflicto | Alto | E2E con simulación de desconexión |
| 5 | **Legal/Privacidad** | Alto | Implementar consentimiento y derechos ARCO |
| 6 | **API_ENDPOINT_MATRIX** desactualizado | Medio | 100 documentados vs 389+ reales |
| 7 | **Backup** sin restore probado | Alto | Probar restore en staging |

---

## Flujos P0 — Estado de Verificación

| Flujo | Estado | Evidencia |
|-------|--------|-----------|
| Login | `implemented` | Formulario + API + JWT + cookie |
| Refresh + persistencia | `implemented` | Refresh token en cookie HttpOnly |
| Logout + revocación | `implemented` | Invalidación de token |
| Recuperación de contraseña | `partial` | Sin sandbox verificado |
| Envío de correo | `partial` | SMTP configurado, entrega no validada |
| Cambio de contraseña | `implemented` | Token + nueva contraseña |
| Creación de solicitud | `implemented` | CRUD funcional |
| Conversión a orden | `implemented` | Flujo proposal → order |
| Planeación | `implemented` | Planning packet + approve |
| Inicio de ejecución | `implemented` | Execution session |
| Captura de evidencia | `implemented` | Upload + GPS + metadatos |
| Informe y acta | `implemented` | Technical report + delivery record |
| SES | `implemented` | Service entry sheet + approve |
| Factura | `implemented` | Invoice desde SES |
| Pago y cierre | `implemented` | Payment + status |

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Módulos totales | 40+ |
| Módulos `done` | ~35 |
| Módulos `partial` | 3 (Dashboard, Offline/PWA, Evidence response) |
| Módulos `not-started` | 1 (Legal/Privacidad) |
| Tests unitarios | 991 (según reporte de build) |
| Tests E2E | Existen spec de login + demo |
| Cobertura | No verificada |
| Quality gates | 9 gates funcionando |
| React Doctor | 100/100 (último reporte) |
| Build | 83 rutas estáticas producidas |

---

## Áreas que Requieren Atención

1. **Tests:** La mayoría de módulos no tienen tests de integración de rutas ni contratos
2. **Legal/Privacidad:** Sin implementación de Ley 1581
3. **API_ENDPOINT_MATRIX.md:** Desactualizado (100 documentados vs 389+ reales)
4. **Evidence retention:** Sin política de retención para evidencias fotográficas

# Mapa de Corrección Profunda — CERMONT

**Fecha:** 2026-05-23  
**Fuente de verdad aplicada:** flujo operativo CERMONT → fallas reales → `API_ENDPOINT_MATRIX.md` → docs canónicos → shared types/domain → código real → pruebas/logs

## 1. Matriz resumida de endpoints críticos

| Endpoint canónico | Estado real | UI real | Observación | Prioridad |
|---|---|---|---|---|
| `GET /api/service-cases/:id/workflow` | `MISMATCH_SCHEMA` | `/service-cases/[id]` | devuelve `ServiceCase` en vez de `ServiceCaseWorkflowViewModel` | `P0` |
| `GET /api/service-cases/:id/cockpit` | `MISMATCH_SCHEMA` | `/service-cases/[id]` | alias existe, pero arrastra el mismo problema del workflow | `P0` |
| `POST /api/service-cases/:id/step/advance` | `OK` con deuda de datos | `/service-cases/[id]` | el gate existe, pero falla si no hay `ServiceCase` ligado a la OT | `P0` |
| `GET /api/documents` | `PARTIAL` | `/documents`, modales contextuales | filtros básicos; no cubre asociación reutilizable | `P0` |
| `POST /api/documents` | `OK` para upload | `/documents`, modales contextuales | sirve para subir, no para reutilizar | `P0` |
| `POST /api/documents/:id/associate` | `MISSING_BACKEND` | selector documental contextual | requerido para reutilización real | `P0` |
| `GET /api/documents/:id/associations` | `MISSING_BACKEND` | selector documental contextual | requerido para trazabilidad | `P0` |
| `POST /api/documents/:id/ingest` | `OK` | `/documents/ingestion/[id]` | útil para template draft, pero no se integra con selección reutilizable | `P1` |
| `POST /api/payments/from-invoice/:id` | `MISSING_BUSINESS_RULE` | `/payments` | permite pago sobre factura `draft` | `P0` |
| `GET /api/work-requests` | `OK` | `/work-requests` | existe, pero no demuestra cadena completa hasta OT/caso | `P0` |
| `POST /api/work-requests/:id/visits` | `OK` | `/work-requests/[id]` | existe; falta demostrar continuidad completa | `P1` |
| `GET /api/payments` | `OK` | `/payments` | listado existe, regla de prerequisito no | `P1` |

## 2. Ruta de corrección priorizada

### Slice P0.1 — Cockpit / Service Case como SSOT operacional

**Falla CERMONT que corrige:** orquestación central débil  
**Pasos afectados:** 5 al 14, transversalmente 1 al 14  
**Cambio requerido:**

- alinear `GET /api/service-cases/:id/workflow` con `ServiceCaseWorkflowViewModel`
- tipar frontend contra ese contrato
- dejar `/service-cases/[id]` consumiendo la vista canónica
- eliminar el falso positivo de “hay endpoint” cuando la respuesta no coincide

### Slice P0.2 — Documentos reutilizables y asociación contextual real

**Falla CERMONT que corrige:** documentos perdidos / no reutilizables  
**Pasos afectados:** 5, 6, 7, 8, 9, 10, 11, 12, 13, 14  
**Cambio requerido:**

- asociación persistente documento ↔ caso/OT/paso/requisito
- `DocumentPickerModal` funcional en modo “Subir nuevo” y “Seleccionar existente”
- soporte para reutilizar documento sin re-subir archivo
- lectura de asociaciones para cockpit y trazabilidad

### Slice P0.3 — Cierre administrativo sin bypass

**Falla CERMONT que corrige:** facturación/cierre inconsistente  
**Pasos afectados:** 12, 13, 14  
**Cambio requerido:**

- impedir pago si la factura no está al menos aprobada/aceptada
- mantener compuertas SES → factura → pago
- cubrir con test de negocio

### Slice P0.4 — Ruta `/service-cases` sin 404

**Falla CERMONT que corrige:** UX operativa rota  
**Pasos afectados:** entrada al cockpit  
**Cambio requerido:**

- crear página real de listado o redirección contextual
- no dejar navegación apuntando a una ruta muerta

## 3. Smells y deuda legacy confirmados

### Anti-patrones frontend

- `refetch()` usado como parche en múltiples módulos
- `/service-cases/[id]` muestra error y botón `Reintentar` porque la hidratación/auth no es robusta en deep-link
- rutas a `/documents` todavía sobreviven en páginas administrativas

### Anti-patrones backend

- stores `Map`/in-memory en módulos documentales secundarios
- costos por defecto en cero dentro de la vista del cockpit
- alias de endpoints que existen sin validar que la respuesta cumpla el contrato canónico

## 4. Riesgos OWASP mínimos mapeados

| Área | Estado | Riesgo |
|---|---|---|
| Auth / refresh token | `PARCIAL` | deep links pueden quedar en 401 antes de rehidratar sesión |
| RBAC | `PARCIAL` | roles existen, pero se requiere seguir probando acceso horizontal por caso/documento |
| Upload de archivos | `OK` con deuda futura | MIME/tamaño/escaneo están contemplados; falta trazabilidad completa de reutilización |
| Validación Zod | `PARCIAL` | hay contratos, pero algunos endpoints documentales siguen incompletos |
| Error handling | `PARCIAL` | envelope estándar existe; todavía hay flujos donde el frontend recibe fallo sin guía operacional |
| Auditoría crítica | `PARCIAL` | mutaciones principales registran historia, pero faltan asociaciones documentales auditables |

## 5. Decisiones de corrección inmediatas

1. No reescribir todo el dominio en esta iteración.
2. Corregir primero la fuente de verdad visible por el usuario: cockpit, documentos reutilizables y pago/factura.
3. Mantener compatibilidad con rutas existentes cuando sea barato, pero alinear el contrato real con `API_ENDPOINT_MATRIX.md`.
4. Cualquier deuda no corregida en esta iteración debe quedar explícita como pendiente de deploy.

## 6. Veredicto de auditoría ampliada

**Estado antes de corregir:** `PARCIAL con bloqueadores P0`

No se puede aprobar despliegue mientras persistan simultáneamente:

- cockpit con contrato incorrecto;
- documentos no reutilizables;
- pago permitido sobre factura no aprobada;
- navegación viva hacia `/service-cases` sin página real.

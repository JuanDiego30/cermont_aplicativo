# Known Defects — CERMONT S.A.S.

> **Propósito:** Inventario de defectos conocidos, priorizados por severidad y riesgo.
> **Estados:** `open` | `in_progress` | `fixed` | `verified` | `wontfix` | `blocked`

---

## Críticos (P0)

| ID | Módulo | Defecto | Severidad | Estado | Reproducción | Impacto |
|----|--------|---------|-----------|--------|-------------|---------|
| DEF-001 | Auth | Flujo de recuperación de contraseña no verificable E2E | Crítico | `review` | Backend completo, frontend completo, 27 tests pasando. Falta: E2E con sandbox, verificación de entrega real | Implementación completa pero no verificada E2E con sandbox SMTP |
| DEF-002 | Offline | Cola offline puede perder mutaciones si service worker se detiene abruptamente | Alto | `open` | Desconectar red, hacer acción, cerrar pestaña | Pérdida de datos de campo |

## Altos (P1)

| ID | Módulo | Defecto | Severidad | Estado | Reproducción | Impacto |
|----|--------|---------|-----------|--------|-------------|---------|
| DEF-003 | Auth | Sin prueba E2E de refresh token | Alto | `open` | — | Riesgo de regresión en renovación de sesión |
| DEF-004 | Offline | Sin prueba de conflicto de sincronización | Alto | `open` | Editar misma entidad offline y online | Datos inconsistentes |
| DEF-005 | ServiceCase | Cockpit no muestra blockers ni próxima acción | Alto | `open` | Abrir ServiceCase con planeación incompleta | Operador no sabe qué falta |
| DEF-006 | Planning | Readiness no se calcula en backend | Alto | `open` | Crear planning sin recursos asignados | Ejecución inicia sin preparación |
| DEF-007 | Evidence | Sin verificación de hash de archivo | Alto | `open` | Subir evidencia y verificar integridad | No se puede detectar manipulación |
| DEF-008 | Costs | Fórmulas de costo no validadas en backend | Alto | `open` | Enviar costos manipulados desde frontend | Datos financieros incorrectos |
| DEF-009 | Portal Cliente | Sin prueba IDOR (acceso cruzado entre clientes) | Alto | `open` | Cliente A intenta acceder a datos del Cliente B | Fuga de datos |
| DEF-010 | Backup | Restauración no probada | Alto | `open` | — | Incapacidad de recuperar datos en desastre |

## Medios (P2)

| ID | Módulo | Defecto | Severidad | Estado |
|----|--------|---------|-----------|--------|
| DEF-011 | API | `API_ENDPOINT_MATRIX.md` documenta 100 endpoints, existen 389+ | Medio | `open` |
| DEF-012 | Frontend | `FRONTEND_ROUTE_MAP.md` desactualizada | Medio | `open` |
| DEF-013 | Auth | Sin prueba de bloqueo de cuenta | Medio | `open` |
| DEF-014 | Offline | Sin prueba de datos parciales | Medio | `open` |
| DEF-015 | Planning | Sin prueba de readiness con recursos | Medio | `open` |
| DEF-016 | Evidence | Sin prueba de aprobación múltiple | Medio | `open` |
| DEF-017 | Reports | Sin prueba de PDF dinámico | Medio | `open` |
| DEF-018 | Signature | Sin prueba de firma rechazada | Medio | `open` |
| DEF-019 | SES | Sin prueba de cierre con factura | Medio | `open` |
| DEF-020 | Payment | Sin prueba de reverso | Medio | `open` |

## Priorización

| Prioridad | Defectos | Orden Recomendado |
|-----------|----------|-------------------|
| 1 | DEF-001, DEF-002 | Recuperación de contraseña + offline queue |
| 2 | DEF-005, DEF-006 | ServiceCase cockpit + planning readiness |
| 3 | DEF-007, DEF-008, DEF-009 | Evidence hash + costos backend + IDOR |
| 4 | DEF-003, DEF-004, DEF-010 | E2E auth + offline conflict + backup restore |
| 5 | DEF-011 a DEF-020 | Documentación, tests, UI/UX |

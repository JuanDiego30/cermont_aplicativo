# Known Defects — CERMONT S.A.S.

> **Propósito:** Inventario de defectos conocidos, priorizados por severidad y riesgo.
> **Estados:** `open` | `in_progress` | `fixed` | `verified` | `wontfix` | `blocked`

---

## Críticos (P0)

| ID | Módulo | Defecto | Severidad | Estado | Reproducción | Impacto |
|----|--------|---------|-----------|--------|-------------|---------|
| DEF-001 | Auth | Flujo de recuperación de contraseña no verificable E2E | Crítico | `verified` | nodemailer no instalado como dependencia (fallback a dev log), auth-email.service usaba process.env en vez de env.FRONTEND_URL, reset-password no extraía token de URL, sin Next.js handler dedicado, /auth/reset-password no estaba en DEDICATED_AUTH_ROUTES | nodemailer instalado, env.FRONTEND_URL validado, token leído de searchParams, handler creado, ruta añadida a DEDICATED_AUTH_ROUTES |
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
| DEF-010 | Backup | Restauración no probada | Alto | `open` | - | Incapacidad de recuperar datos en desastre |

## Medios (P2)

| ID | Módulo | Defecto | Severidad | Estado | Reproducción | Impacto |
|----|--------|---------|-----------|--------|-------------|---------|
| DEF-011 | API | `API_ENDPOINT_MATRIX.md` documenta 100 endpoints, existen 389+ | Medio | `open` | — | Documentación desactualizada |
| DEF-012 | Evidence | Sin política de retención de evidencias | Medio | `open` | — | Acumulación de archivos sin control |
| DEF-013 | Proposals | Sin prueba de recálculo de totales en backend | Medio | `open` | Manipular precios en frontend | Propuesta con valores incorrectos |
| DEF-014 | Purchase Orders | Sin prueba de conversión idempotente | Medio | `open` | Hacer clic dos veces en "Convertir a orden" | Órdenes duplicadas |
| DEF-015 | SES/Invoice | Sin E2E administrativo completo (SES → Factura → Pago) | Medio | `open` | — | Regresión en cierre administrativo |
| DEF-016 | Legal | Sin implementación de Ley 1581 de Protección de Datos | Medio | `open` | — | Riesgo legal y de cumplimiento |

## Bajos (P3)

| ID | Módulo | Defecto | Severidad | Estado | Reproducción | Impacto |
|----|--------|---------|-----------|--------|-------------|---------|
| DEF-017 | UI/UX | Iconografía inconsistente entre módulos | Bajo | `open` | Navegar entre módulos | Percepción de calidad |
| DEF-018 | Notifications | Sin prueba de duplicación de notificaciones | Bajo | `open` | — | Notificaciones repetidas |
| DEF-019 | Checklists | UI de checklists no verificada | Bajo | `open` | — | Funcionalidad incompleta |
| DEF-020 | Reports | Sin prueba de versionado de informes | Bajo | `open` | — | Pérdida de versiones anteriores |

---

## Métricas de Defectos

| Métrica | Valor |
|---------|-------|
| Total defectos | 20 |
| Críticos (P0) | 2 |
| Altos (P1) | 8 |
| Medios (P2) | 6 |
| Bajos (P3) | 4 |
| Abiertos | 19 |
| En progreso | 0 |
| Corregidos | 1 |

---

## Prioridad de Corrección

| Prioridad | Defectos | Orden Recomendado |
|-----------|----------|-------------------|
| 1 | DEF-001, DEF-002 | Recuperación de contraseña + offline queue |
| 2 | DEF-005, DEF-006 | ServiceCase cockpit + planning readiness |
| 3 | DEF-007, DEF-008, DEF-009 | Evidence hash + costos backend + IDOR |
| 4 | DEF-003, DEF-004, DEF-010 | E2E auth + offline conflict + backup restore |
| 5 | DEF-011 a DEF-020 | Documentación, tests, UI/UX |

# Remediation Backlog

Prioritized defect queue for product stabilization.

## P0 — Bloquea acceso, seguridad, integridad, despliegue o flujo principal

| ID | Module | Impact | Reproducible | Root Cause | Regression Test | Status |
|----|--------|--------|-------------|-------------|-----------------|--------|
| DEF-001 | Auth | Password recovery fails in production (no email sent) | Yes — nodemailer not installed | Nodemailer missing from backend/package.json; dynamic require falls back to dev log silently | Unit: token gen/val | in_progress |
| DEF-002 | Offline | Queue mutations lost on SW abort | Not verified | Unknown | None | open |

## P1 — Bloquea etapa empresarial importante

| ID | Module | Impact | Reproducible | Root Cause | Regression Test | Status |
|----|--------|--------|-------------|-------------|-----------------|--------|
| DEF-005 | ServiceCase | Cockpit no muestra blockers | Not verified | Unknown | None | open |
| DEF-006 | Planning | Readiness no calculado en backend | Not verified | Unknown | None | open |
| DEF-007 | Evidence | Sin verificación hash de archivo | Not verified | Unknown | None | open |
| DEF-008 | Costs | Fórmulas no validadas en backend | Not verified | Unknown | None | open |
| DEF-009 | Portal Cliente | Sin prueba IDOR | Design gap | Never implemented | None | open |
| DEF-010 | Backup | Restauración no probada | Operations gap | No restore drill | None | open |
| DEF-003 | Auth | Sin prueba E2E refresh token | Test gap | Suite exists but not wired | None | open |
| DEF-004 | Offline | Sin prueba conflicto sync | Test gap | Never implemented | None | open |

## P2 — Funciona parcialmente o UX defectuosa

| ID | Module | Impact | Status |
|----|--------|--------|--------|
| DEF-011 | API | Endpoint matrix outdated (100 vs 389+) | open |
| DEF-012 | Evidence | Sin política retención | open |
| DEF-013 | Proposals | Sin prueba recálculo totales | open |
| DEF-014 | Purchase Orders | Sin prueba conversión idempotente | open |
| DEF-015 | SES/Invoice | Sin E2E administrativo completo | open |
| DEF-016 | Legal | Sin implementación Ley 1581 | open |

## P3 — Mejora visual/técnica/mantenibilidad

| ID | Module | Impact | Status |
|----|--------|--------|--------|
| DEF-017 | UI/UX | Iconografía inconsistente | open |
| DEF-018 | Notifications | Sin prueba duplicación | open |
| DEF-019 | Checklists | UI no verificada | open |
| DEF-020 | Reports | Sin prueba versionado | open |

## Innovation — Solo después de estabilizar dominio relacionado

- Prediction de retrasos
- Recomendación de kits
- Anomalías de costos
- Clasificación de evidencias
- Automatización de tareas repetitivas

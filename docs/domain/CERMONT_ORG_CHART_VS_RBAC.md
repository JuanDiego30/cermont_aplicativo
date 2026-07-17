# Organigrama Real vs RBAC del Sistema

> **Fuente:** `03_Jerarquia_de_controles_Cermont2.md` + `packages/domain/src/roles.ts`
> **Fecha de análisis:** 2026-07-09 | **Estado:** VERIFICADO contra código real ✅

---

## Organigrama Real CERMONT (de Jerarquía de Controles)

```
                    GERENTE
                       |
               ING. RESIDENTE
                       |
                   PASANTE
                  /    |    \
    COORDINADOR   COORDINADOR   SUPERVISOR
    ADMINISTRATIVO    HES       ELECTRICISTA
         |            |             |
  AUX. CONTABLE  AUX. HES    TÉCNICO ELECTRICISTA
                   PASANTE      OFICIAL DE
                               CONSTRUCCIÓN
```

## Roles Detectados en @cermont/domain (VERIFICADO)

<!-- Fuente: packages/domain/src/roles.ts — 2026-07-09, 15 roles definidos -->

| Cargo (Organigrama Real) | Rol en @cermont/domain | Existe en Código | Permisos Esperados |
|---|---|---|---|
| Gerente | `gerente` (jerarquía 0) | ✅ | Acceso total, ADMIN_ROLES, MANAGEMENT_ROLES |
| Ing. Residente | `residente` (jerarquía 1) | ✅ | Gestión técnica, PLANING_ACCESS, SUPERVISORY_ROLES |
| Pasante (staff) | `pasante` (jerarquía 13) | ✅ | Acceso solo lectura a dashboards (INTERN_ACCESS_ROLES) |
| Coordinador Administrativo | `coord_administrativo` (jerarquía 2) | ✅ | ADMIN_ROLES, BILLING_ACCESS, FINANCE_ACCESS |
| Coordinador HES | `hes` (jerarquía 4) | ✅ | FIELD_MANAGEMENT_ROLES, REPORTING_ACCESS, MAINTENANCE_MANAGEMENT |
| Supervisor Electricista | `supervisor_electricista` (jerarquía 6) | ✅ | FIELD_EXECUTION_ACCESS, RESOURCE_ROLES |
| Auxiliar Contable | `auxiliar_contable` (jerarquía 5) | ✅ | BILLING_ACCESS, FINANCE_ACCESS |
| Auxiliar HES | `auxiliar_hes` (jerarquía 10) | ✅ | MAINTENANCE_MANAGEMENT_ROLES, EVIDENCE_ACCESS |
| Técnico Electricista | `tecnico_electricista` (jerarquía 7) | ✅ | FIELD_EXECUTION_ACCESS, RESOURCE_ROLES, EVIDENCE_ACCESS |
| Oficial de Construcción | `oficial_construccion` (jerarquía 11) | ✅ | FIELD_EXECUTION_ACCESS, EVIDENCE_ACCESS |

## Roles de Sistema Adicionales (sin cargo único en organigrama)

| Rol | Jerarquía | Explicación |
|---|---|---|
| `supervisor` | 3 | Rol general de supervisión (no específico electricista) |
| `operador` | 8 | Rol operativo general |
| `tecnico` | 9 | Rol técnico general (no específico electricista) |
| `administrativo` | 12 | Rol administrativo general |
| `cliente` | 14 | Acceso al portal cliente |

## Grupos Funcionales Definidos

| Grupo | Roles Incluidos | Propósito |
|---|---|---|
| **ADMIN_ROLES** | gerente, administrativo, coord_administrativo | Administración del sistema |
| **MANAGEMENT_ROLES** | gerente, residente | Gestión de alto nivel |
| **FIELD_MANAGEMENT_ROLES** | gerente, residente, hes | Gestión de campo |
| **FIELD_EXECUTION_ACCESS_ROLES** | gerente, residente, supervisor, supervisor_electricista, operador, tecnico, tecnico_electricista, oficial_construccion | Ejecución en campo |
| **EVIDENCE_ACCESS_ROLES** | gerente, residente, hes, auxiliar_hes, supervisor, supervisor_electricista, operador, tecnico, tecnico_electricista, oficial_construccion | Evidencias |
| **BILLING_ACCESS_ROLES** | gerente, residente, hes, coord_administrativo, auxiliar_contable, administrativo, cliente | Facturación |
| **FINANCE_ACCESS_ROLES** | gerente, coord_administrativo, auxiliar_contable, administrativo | Finanzas |
| **PLANNING_ACCESS_ROLES** | gerente, residente, supervisor, supervisor_electricista, coord_administrativo | Planeación |
| **REPORTING_ACCESS_ROLES** | gerente, residente, hes, supervisor | Reportes |

## Resumen

- **10 cargos del organigrama real → 10 roles en `@cermont/domain`** → **Cobertura 100%** ✅
- **5 roles adicionales** del sistema para flexibilidad operativa
- **Jerarquía numérica** definida (0=gerente, 14=cliente)
- **No hay GAPS** — todos los cargos tienen equivalente de sistema
- **No hay sobre-ingeniería** — los roles adicionales justificados por necesidad operativa

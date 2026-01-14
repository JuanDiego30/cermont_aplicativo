# Reporte — Backend Órdenes (Análisis → Plan → Ejecución → Verificación)

Fecha: 2026-01-01

## A) Análisis

### Hallazgos
- **Inconsistencia crítica de enums**: el flujo de 14 pasos (`OrderSubState`) estaba modelado con valores en MAYÚSCULA, pero Prisma define `OrderSubState` en `snake_case` (por ejemplo `propuesta_aprobada`). Esto podía causar errores en runtime al persistir/actualizar.
- **Auditoría no atómica**: el cambio de sub-estado actualizaba `Order` y luego insertaba `OrderStateHistory` sin transacción; si el insert fallaba, quedaba un cambio sin historial.
- **Historial incorrecto en endpoint**: `GetHistorialEstadosUseCase` devolvía siempre el estado actual de la orden como `estadoNuevo` y no reflejaba la secuencia real de cambios.
- **Soft-delete inconsistente**: la búsqueda full-text excluía `deletedAt != null`, pero `findAll/findById/findByNumero` no lo hacía. Además, `delete()` hacía hard delete aunque el schema soporta soft delete.

### Code smells
- Duplicidad de “máquinas de estado”: existe una state machine simple (estados principales) y otra de 14 pasos; ambas convivían, pero con valores y auditoría no alineadas.
- Casts `as any` alrededor de enums de Prisma, ocultando errores de contrato entre dominio ↔ persistencia.

### Bugs detectados
- Persistencia de `subEstado` potencialmente inválida contra Prisma (enum mismatch).
- Historial de estados devolviendo datos incorrectos.

### Riesgos
- Cambiar la representación de sub-estados puede impactar consumidores si alguien dependía de nombres en MAYÚSCULA. Se mitigó agregando normalización de input.

## B) Plan (incremental y mergeable)

Fase 1
- Alinear `OrderSubState` con Prisma (snake_case) y proveer normalizador.
- Hacer transacción “update + historial” en el servicio de estados.

Fase 2
- Arreglar endpoint de historial para que refleje cambios reales.
- Volver consistente el soft-delete (filtrar y eliminar por soft delete).

Fase 3
- Validar con lint, tests focalizados y build.

## C) Ejecución

### Fase 1 (workflow/auditoría)
- Se alinearon los valores de `OrderSubState` a `snake_case` y se agregó `parseOrderSubState()` para aceptar tanto valores `snake_case` como keys (ej. `PROPUESTA_APROBADA`).
- `OrderStateService.transitionTo()` ahora:
  - Normaliza el estado destino.
  - Valida transición.
  - Actualiza `Order` y escribe `OrderStateHistory` en **una transacción**.

### Fase 2 (historial y soft-delete)
- `GetHistorialEstadosUseCase` ahora deriva `estadoAnterior/estadoNuevo` desde `OrderStateHistory` usando el mapeo `subEstado → estado principal`.
- Se agregó `PENDIENTE` al enum `OrdenEstado` usado por DTOs.
- `PrismaOrdenRepository`:
  - Filtra `deletedAt: null` por defecto en listados y búsquedas.
  - `findById` pasa a `findFirst` para poder excluir soft-deleted.
  - `delete()` se convierte en soft delete (`deletedAt`, `deleteReason`).
- `ChangeOrdenEstadoUseCase` registra un `AuditLog` para cambios de estado principal, con `from/to/motivo`.

## D) Verificación

Comandos ejecutados (apps/api):
- `pnpm run lint` (OK)
- `pnpm run test -- --testPathPatterns=ordenes` (OK)
  - Nota: el repo usaba el flag viejo `--testPathPattern` y Jest indica que fue reemplazado.
- `pnpm run build` (OK)

Qué validar manualmente:
- Transiciones de sub-estado (14 pasos) actualizan `Order.subEstado` y registran `order_state_history` siempre.
- El endpoint de historial devuelve secuencia coherente (estado principal derivado).
- Soft-delete: al eliminar, la orden no aparece en listados ni búsquedas.

## E) Reporte final

Resumen de cambios:
- Se corrigió la compatibilidad enum Prisma ↔ dominio (`OrderSubState`).
- Auditoría transaccional en cambios de sub-estado.
- Historial de estados corregido.
- Soft-delete consistente (filtros + delete).
- Auditoría de cambios de estado principal via `AuditLog`.

Checklist:
- [x] Máquina de estados validada en cada cambio (sub-estado)
- [x] Historial registra cambios de sub-estado (transaccional)
- [x] Listados con paginación (ya existía) y sin soft-deleted
- [x] Tests de value objects/entidad pasan

Pendiente / recomendaciones:
- Unificar la estrategia entre “estado principal” y “flujo 14 pasos” (evitar endpoints duplicados que representen conceptos distintos de estado).
- Ajustar la documentación Swagger/README para aclarar qué endpoint expone `estado` vs `subEstado`.
- Si se requiere historial explícito del estado principal, considerar una tabla dedicada o una vista basada en `AuditLog`.

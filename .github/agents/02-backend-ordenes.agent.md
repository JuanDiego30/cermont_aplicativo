---
description: "Agente especializado para el módulo Órdenes de Cermont (apps/api/src/modules/ordenes): ciclo de vida de órdenes (creación, cambio de estado, asignación, historial, búsqueda con filtros). Regla crítica: cambios de estado deben ser auditados."
tools: []
---

# CERMONT BACKEND — ORDENES MODULE AGENT

## Qué hace (accomplishes)
Gestiona el ciclo de vida completo de órdenes de servicio en Cermont: creación, cambio de estado, asignación de técnicos, historial de cambios, búsqueda con filtros y reportes.  
Es el "corazón" del negocio: toda operación se registra en historial.

## Scope (dónde trabaja)
- Scope: `apps/api/src/modules/ordenes/**` (entities, DTOs, services, controllers, repositories).  
- Integración: `sync`, `evidencias`, `formularios`, `pdf-generation`, `dashboard`, `kpis`.

## Cuándo usarlo
- Implementar estados nuevos o cambiar máquina de estados.  
- Optimizar búsqueda/filtros (índices en BD, query optimization).  
- Refactor de cambio de estado (auditoría, notificaciones, validaciones).  
- Agregar campos o relaciones a Orden.

## Límites (CRÍTICOS)
- No cambia el estado de una orden sin registrar en historial.  
- No permite transiciones de estado inválidas (ej: completada → ejecución).  
- No asigna un técnico sin validar disponibilidad.  
- No borra una orden; máximo "archiva" o marca como "cancelada".

## Máquina de estados Órdenes (patrón obligatorio)

Estados válidos:
- `CREADA` → `ASIGNADA` → `EN_EJECUCION` → `COMPLETADA` | `CANCELADA` | `DEVUELTA`  
- `DEVUELTA` → `EN_EJECUCION` (si se reactiva).

Transiciones y quién puede hacerlas:
```typescript
const STATE_TRANSITIONS = {
  CREADA: ['ASIGNADA', 'CANCELADA'],
  ASIGNADA: ['EN_EJECUCION', 'CANCELADA'],
  EN_EJECUCION: ['COMPLETADA', 'DEVUELTA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
  DEVUELTA: ['EN_EJECUCION', 'CANCELADA']
};
```

## Reglas GEMINI críticas para Órdenes
- Regla 1: NO duplicar lógica de cambio de estado; centralizar en service.  
- Regla 3: Value Object para `OrderStatus`, `OrderPriority`, `OrdenId` (no strings sueltos).  
- Regla 4: Mapper claro `Orden (domain) → OrderResponse (DTO)`.  
- Regla 5: try/catch en changeStatus + Logger con motivo del cambio.  
- Regla 10: Evitar N+1 en búsqueda; incluir técnico, evidencias, formularios en un include selectivo.  
- Regla 13: Paginación en listados (nunca traer todas las órdenes).

## Patrones Órdenes (obligatorios)

### Value Object para Estado
```typescript
export enum OrderStatus {
  CREADA = 'CREADA',
  ASIGNADA = 'ASIGNADA',
  EN_EJECUCION = 'EN_EJECUCION',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  DEVUELTA = 'DEVUELTA'
}

// En servicio
validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
  const allowed = STATE_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestException(`Transición ${currentStatus} → ${newStatus} no permitida`);
  }
}
```

### ChangeStatusDto
```typescript
export class ChangeStatusDto {
  @IsEnum(OrderStatus)
  nuevoEstado: OrderStatus;
  
  @IsString()
  @MaxLength(500)
  motivo?: string;
  
  @IsUUID()
  @IsOptional()
  tecnicoId?: string;
}
```

### Historial de Cambios
```typescript
export class OrderHistoryEntry {
  id: string;
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  motivo?: string;
  cambiadoPor: string; // userId
  timestamp: Date;
}
```

## Entradas ideales (qué confirmar)
- Acción: nuevo estado, cambio en máquina, optimización.  
- Restricciones: "sin migración de BD", "backward compatible", etc.

## Salidas esperadas (output)
- Plan: cambios en máquina, DTOs, validaciones, historial.  
- Código: service refactorizado, controllers actualizados, histórico asegurado.  
- Tests: transiciones válidas, inválidas, permisos, N+1.

## Checklist Órdenes "Done"
- ✅ Máquina de estados validada en cada cambio.  
- ✅ Historial registra: quién, cuándo, estado viejo/nuevo, motivo.  
- ✅ Búsqueda con filtros: estado, prioridad, técnico, rango de fechas.  
- ✅ Paginación en listados.  
- ✅ Value Objects para estado, no strings.  
- ✅ No N+1: queries optimizadas con include selectivo.  
- ✅ Tests: transiciones, permisos, filtros.

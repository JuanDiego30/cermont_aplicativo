# Módulo Ordenes

## Descripción
Módulo de gestión de órdenes de trabajo con arquitectura DDD (Domain-Driven Design).

## Arquitectura

```
ordenes/
├── domain/
│   ├── entities/
│   │   └── orden.entity.ts       # Entidad principal
│   └── value-objects/
│       ├── orden-numero.vo.ts    # Número único ORD-XXXXXX
│       ├── orden-estado.vo.ts    # Estados y transiciones
│       └── prioridad.vo.ts       # Niveles de prioridad
│
├── application/
│   ├── dto/                      # DTOs con validación Zod
│   └── use-cases/
│       ├── create-orden.use-case.ts
│       ├── list-ordenes.use-case.ts
│       ├── get-orden-by-id.use-case.ts
│       ├── update-orden.use-case.ts
│       ├── change-estado.use-case.ts
│       └── delete-orden.use-case.ts
│
├── infrastructure/
│   ├── controllers/
│   │   └── ordenes.controller.ts  # API REST
│   └── persistence/
│       └── orden.repository.ts    # Prisma implementation
│
└── ordenes.module.ts
```

## Estados de Orden

```mermaid
stateDiagram-v2
    [*] --> planeacion
    planeacion --> ejecucion
    planeacion --> cancelada
    ejecucion --> pausada
    ejecucion --> completada
    ejecucion --> cancelada
    pausada --> ejecucion
    pausada --> cancelada
    completada --> [*]
    cancelada --> [*]
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /ordenes | Listar órdenes (paginado) |
| GET | /ordenes/:id | Obtener orden por ID |
| POST | /ordenes | Crear nueva orden |
| PUT | /ordenes/:id | Actualizar orden |
| PATCH | /ordenes/:id/estado | Cambiar estado |
| DELETE | /ordenes/:id | Eliminar orden |

## Uso

```typescript
// Crear orden
POST /ordenes
{
  "descripcion": "Mantenimiento preventivo",
  "cliente": "Empresa XYZ",
  "prioridad": "alta",
  "asignadoId": "tecnico-uuid"
}

// Cambiar estado
PATCH /ordenes/:id/estado
{
  "nuevoEstado": "ejecucion"
}
```

## Tests

```bash
# Tests unitarios
pnpm test -- --testPathPattern=ordenes

# Con coverage
pnpm test:cov
```

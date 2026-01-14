# Sync Module

## Descripción
Módulo de sincronización offline para aplicación móvil.

## Arquitectura DDD

```
sync/
├── application/
│   ├── dto/sync.dto.ts                      # DTOs + Interface ISyncRepository
│   └── use-cases/
│       ├── process-sync-batch.use-case.ts   # Procesar batch offline
│       └── get-pending-sync.use-case.ts     # Obtener pendientes
├── infrastructure/
│   ├── controllers/sync.controller.ts
│   └── persistence/sync.repository.ts       # Implementación Prisma
└── sync.module.ts
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /sync | Sincronizar batch de cambios |
| GET | /sync/pending | Obtener items pendientes |

## Flujo de Sincronización

1. **Cliente offline** → Guarda cambios localmente
2. **Cliente online** → POST /sync con batch
3. **Servidor** → Procesa y emite eventos
4. **Respuesta** → Items sincronizados + cambios del servidor

## Entidades Soportadas
- `orden`
- `evidencia`
- `checklist`
- `ejecucion`

## Acciones
- `create`
- `update`
- `delete`

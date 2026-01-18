# Kits Module - CERMONT

## Overview

El módulo de Kits gestiona plantillas predefinidas de herramientas, equipos, documentos y actividades para trabajos específicos.

## Architecture

```
📁kits/
├── 📁domain/                          # Domain Layer (DDD)
│   ├── 📁entities/                    # Kit, KitItem
│   ├── 📁value-objects/               # KitId, CategoriaKit, etc.
│   ├── 📁events/                      # Domain events
│   ├── 📁repositories/                # Repository interfaces
│   └── 📁exceptions/                  # Domain exceptions
├── 📁application/                     # Application Layer
│   ├── 📁dto/                         # Data transfer objects
│   ├── 📁use-cases/                   # 9 Use Cases
│   └── 📁mappers/                     # Entity-DTO mappers
├── 📁infrastructure/                  # Infrastructure Layer
│   ├── 📁controllers/                 # HTTP endpoints
│   └── 📁persistence/                 # Repository implementations
├── kits.module.ts                     # NestJS module
└── kits.service.ts                    # Legacy service (deprecated)
```

## Use Cases

| Use Case                   | Description                   |
| -------------------------- | ----------------------------- |
| `CreateKitUseCase`         | Crear un nuevo kit            |
| `UpdateKitUseCase`         | Actualizar información de kit |
| `DeleteKitUseCase`         | Eliminar kit (soft delete)    |
| `GetKitUseCase`            | Obtener kit por ID            |
| `ListKitsUseCase`          | Listar kits con filtros       |
| `AddItemToKitUseCase`      | Agregar item a kit            |
| `RemoveItemFromKitUseCase` | Eliminar item de kit          |
| `ActivateKitUseCase`       | Activar kit                   |
| `DeactivateKitUseCase`     | Desactivar kit                |

## Value Objects

- `KitId` - UUID único del kit
- `KitCodigo` - Código legible (KIT-ELEC-001)
- `CategoriaKit` - Categoría (ELECTRICIDAD, PLOMERIA, etc.)
- `TipoKit` - Tipo (BASICO, COMPLETO, ESPECIALIZADO)
- `EstadoKit` - Estado (ACTIVO, INACTIVO, EN_USO)
- `ItemType` - Tipo de item (HERRAMIENTA, EQUIPO, etc.)
- `Cantidad` - Cantidad con validación
- `CostoUnitario/CostoTotal` - Costos con operaciones

## API Endpoints

```
GET    /kits                    # Listar kits
GET    /kits/:id                # Obtener kit
POST   /kits                    # Crear kit
PUT    /kits/:id                # Actualizar kit
DELETE /kits/:id                # Eliminar kit
POST   /kits/:id/items          # Agregar item
DELETE /kits/:id/items/:itemId  # Eliminar item
PATCH  /kits/:id/activate       # Activar
PATCH  /kits/:id/deactivate     # Desactivar

# Legacy endpoints
GET    /kits/predefinidos/all           # Kits predefinidos
POST   /kits/:kitId/apply/:ejecucionId  # Aplicar a ejecución
POST   /kits/sync                       # Sincronizar predefinidos
```

## Migration Notes

- `KitsService` is **deprecated** - use Use Cases instead
- New code should inject use cases directly
- Legacy service maintained for backward compatibility

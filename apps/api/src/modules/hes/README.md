# HES Module - CERMONT

## Overview

El módulo HES (Hoja de Entrada de Servicio) gestiona la documentación de entrada de servicios con arquitectura DDD completa.

## Architecture

```
📁hes/
├── 📁domain/                          # Domain Layer (DDD)
│   ├── 📁entities/                    # HES, ClienteInfo, CondicionesEntrada, etc.
│   ├── 📁value-objects/               # HESId, HESNumero, TipoServicio, etc.
│   ├── 📁events/                      # Domain events
│   ├── 📁services/                    # Domain services
│   ├── 📁repositories/                # Repository interfaces
│   └── 📁exceptions/                  # Domain exceptions
├── 📁application/                     # Application Layer
│   ├── 📁dto/                         # Data transfer objects
│   ├── 📁use-cases/                   # 8 Use Cases
│   └── 📁mappers/                     # Entity-DTO mappers
├── 📁infrastructure/                  # Infrastructure Layer
│   ├── 📁controllers/                 # HTTP endpoints
│   ├── 📁persistence/                 # Repository implementations
│   └── 📁pdf/                         # PDF Generation service
├── hes.module.ts                      # NestJS module
└── hes.service.ts                     # Legacy service (Equipos HES)
```

## Domain Layer

### Entities
- `HES` - Aggregate Root (Hoja de Entrada de Servicio)
- `ClienteInfo` - Información del cliente
- `CondicionesEntrada` - Estado inicial del equipo
- `DiagnosticoPreliminar` - Evaluación inicial
- `RequerimientosSeguridad` - EPP y checklist de seguridad
- `FirmaDigital` - Firma digital con validación

### Value Objects
- `HESId` - UUID único
- `HESNumero` - Número HES-2024-0001
- `TipoServicio` - MANTENIMIENTO, REPARACION, etc.
- `Prioridad` - BAJA, MEDIA, ALTA, URGENTE
- `EstadoHES` - BORRADOR, COMPLETADO, ANULADO
- `NivelRiesgo` - BAJO, MEDIO, ALTO, CRITICO
- `Direccion` - Dirección estructurada
- `CoordenadasGPS` - Lat/Long validadas
- `Telefono` - Teléfono con validación
- `EPPRequerido` - Equipos de protección

### Domain Services
- `HESValidatorService` - Validación de completitud
- `HESNumeroGeneratorService` - Generación de número único
- `RiesgoEvaluatorService` - Evaluación automática de riesgo

## Use Cases

| Use Case | Description |
|----------|-------------|
| `CreateHESUseCase` | Crear nueva HES |
| `GetHESUseCase` | Obtener HES por ID |
| `ListHESUseCase` | Listar HES con filtros |
| `CompleteHESUseCase` | Completar HES |
| `SignHESClienteUseCase` | Firma del cliente |
| `SignHESTecnicoUseCase` | Firma del técnico |
| `GetHESByOrdenUseCase` | Obtener HES por orden |
| `ExportHESPDFUseCase` | Generar PDF |

## API Endpoints

```
GET    /hes                     # Listar HES
GET    /hes/:id                 # Obtener HES
POST   /hes                     # Crear HES
PATCH  /hes/:id/complete        # Completar HES
PATCH  /hes/:id/sign-cliente    # Firma cliente
PATCH  /hes/:id/sign-tecnico    # Firma técnico
GET    /hes/orden/:ordenId      # HES por orden
GET    /hes/:id/pdf             # Exportar PDF

# Legacy endpoints (Equipos HES)
GET    /hes/equipos             # Listar equipos
POST   /hes/inspecciones        # Crear inspección
```

## Features

- ✅ Firmas digitales (cliente + técnico)
- ✅ Checklist de seguridad obligatorio
- ✅ Evaluación automática de riesgo
- ✅ Generación de PDF (pdfkit)
- ✅ Validación de completitud
- ✅ Versionado y auditoría

## Migration Notes

- `HesService` is **legacy** - handles equipos HES only
- For HES documents, use the DDD Use Cases
- PDF generation via `HESPDFGeneratorService`

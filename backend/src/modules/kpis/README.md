# 📊 Módulo KPIs - Cermont Backend

## Descripción

Módulo para calcular y gestionar KPIs (Key Performance Indicators) del sistema Cermont.

## Características

- ✅ **KPIs de Órdenes**: Total, completadas, pendientes, tasa de completitud, tiempo promedio
- ✅ **KPIs de Técnicos**: Activos, disponibles, ocupados, eficiencia promedio
- ✅ **KPIs Financieros**: Ingresos, costos, utilidad, margen de ganancia
- ✅ **Dashboard Consolidado**: Todos los KPIs en una sola llamada
- ✅ **Filtros Flexibles**: Por período (hoy, semana, mes, trimestre, año) o fechas custom
- ✅ **Clean Architecture**: Separación de capas (application, domain, infrastructure)

## Endpoints

### GET /api/kpis/dashboard

Obtener todos los KPIs del dashboard en una sola llamada.

**Query Parameters:**
- `periodo` (opcional): HOY | SEMANA | MES | TRIMESTRE | ANO | CUSTOM
- `fechaInicio` (opcional): ISO 8601 date
- `fechaFin` (opcional): ISO 8601 date
- `clienteId` (opcional): UUID del cliente
- `tecnicoId` (opcional): UUID del técnico

**Response:**
```
{
  "ordenes": {
    "total": 150,
    "completadas": 120,
    "pendientes": 20,
    "enProgreso": 10,
    "canceladas": 0,
    "tasaCompletitud": 80,
    "tiempoPromedioResolucion": 48
  },
  "tecnicos": {
    "totalActivos": 25,
    "disponibles": 15,
    "ocupados": 10,
    "promedioOrdenesPorTecnico": 6,
    "eficienciaPromedio": 85
  },
  "financiero": {
    "ingresosTotales": 250000,
    "costosTotales": 180000,
    "utilidad": 70000,
    "margenGanancia": 28,
    "ticketPromedio": 1666.67
  },
  "timestamp": "2024-12-24T18:12:00.000Z"
}
```

### GET /api/kpis/orders

Obtener KPIs específicos de órdenes.

### GET /api/kpis/technicians

Obtener KPIs específicos de técnicos.

### GET /api/kpis/financiero

Obtener KPIs financieros.

## Estructura

```
kpis/
├── application/
│   ├── dto/                    # Data Transfer Objects
│   └── use-cases/              # Casos de uso
├── domain/
│   ├── entities/               # Entidades de dominio
│   └── interfaces/             # Interfaces
├── infrastructure/
│   └── controllers/            # Controllers REST
├── kpis.module.ts
└── README.md
```

## Dependencias

- ✅ `@prisma/client`: Database access
- ✅ `@nestjs/common`: NestJS core
- ✅ `@nestjs/swagger`: API documentation
- ✅ `class-validator`: DTO validation
- ✅ `class-transformer`: DTO transformation

**NO SE AGREGARON DEPENDENCIAS EXTERNAS ADICIONALES**

## Testing

```
npm run test
```

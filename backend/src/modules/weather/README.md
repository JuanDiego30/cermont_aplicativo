# Weather Module

## Descripción

Módulo meteorológico con datos de Open-Meteo API.

## Arquitectura

Módulo simplificado para reducir fricción:

```
weather/
├── dto/weather.dto.ts
├── weather.controller.ts
├── weather.service.ts
└── weather.module.ts
```

## Endpoints

| Método | Ruta                | Descripción            |
| ------ | ------------------- | ---------------------- |
| GET    | /weather/current    | Clima actual           |
| GET    | /weather/rainfall   | Pronóstico de lluvia   |
| GET    | /weather/hourly     | Pronóstico por hora    |
| GET    | /weather/alerts     | Alertas meteorológicas |
| GET    | /weather/historical | Datos históricos       |
| GET    | /weather/location   | Ubicación por defecto  |
| GET    | /weather/summary    | Resumen completo       |

## Uso

```typescript
// GET /weather?lat=5.3667&lon=-71.7994
{
  "current": {
    "temperature": 28.5,
    "humidity": 75,
    "description": "Parcialmente nublado"
  },
  "forecast": [...]
}
```

## Ubicación Default

- Caño Limón, Arauca, Colombia
- Lat: 5.3667, Lon: -71.7994

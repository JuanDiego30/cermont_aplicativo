# Weather Module

## Descripción
Módulo meteorológico con datos de Open-Meteo API.

## Arquitectura DDD

```
weather/
├── application/
│   ├── dto/weather.dto.ts              # DTOs + Interface IWeatherService
│   └── use-cases/get-weather.use-case.ts
├── infrastructure/
│   ├── controllers/weather.controller.ts
│   └── services/open-meteo-weather.service.ts
└── weather.module.ts
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /weather?lat=X&lon=Y | Clima actual + pronóstico 7 días |

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

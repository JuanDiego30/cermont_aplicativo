# Líneas de Vida Module

## Description
Lifeline inspection and maintenance management for fall protection systems.

## Features
- Lifeline registration
- Component tracking
- Periodic inspections
- Compliance status

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lineas-vida` | List lifelines |
| POST | `/lineas-vida` | Register lifeline |
| POST | `/lineas-vida/:id/inspeccion` | Create inspection |
| GET | `/lineas-vida/:id` | Get details |

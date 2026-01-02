# PDF Generation Module

## Description
PDF report and document generation service.

## Features
- Order reports
- Execution reports
- Checklist reports
- Custom templates (Handlebars)

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pdf/generate` | Generar PDF desde HTML personalizado |
| POST | `/api/pdf/reporte-orden` | Generar reporte de orden de trabajo |
| POST | `/api/pdf/reporte-mantenimiento` | Generar reporte de mantenimiento |
| POST | `/api/pdf/certificado-inspeccion` | Generar certificado de inspección |
| GET | `/api/pdf/:filename` | Obtener PDF guardado/cacheado |

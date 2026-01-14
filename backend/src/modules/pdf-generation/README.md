# PDF Generation Module

## Description
PDF report and document generation service.

## Features
- Order reports
- Execution reports
- Checklist reports
- Custom templates (Handlebars)

## Configuración

Variables de entorno soportadas:

- `PDF_STORAGE_DIR`: directorio local para persistir PDFs (default: `./storage/pdfs`).
- `API_URL`: base URL pública para construir enlaces de descarga (default: `http://localhost:3000`).
- `PDF_CACHE_TTL_SECONDS`: TTL (en segundos) para PDFs cacheados/persistidos (default: `86400` = 24h).

## Caché y persistencia

- Si un endpoint recibe `saveToStorage=true`, el PDF se guarda en `PDF_STORAGE_DIR` y la respuesta incluye `url`.
- Si además `enableCache=true`, el sistema usa un nombre determinístico y sirve desde caché mientras no expire por TTL.
- La expiración se calcula con la fecha de modificación del archivo (mtime). Si está expirado, se elimina y se regenera en la siguiente solicitud.

## Cola de generación

- La generación con Puppeteer se serializa con una cola en memoria por instancia para evitar picos de CPU/RAM.
- En despliegues con múltiples pods/instancias, la cola es por instancia.

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pdf/generate` | Generar PDF desde HTML personalizado |
| POST | `/api/pdf/reporte-orden` | Generar reporte de orden de trabajo |
| POST | `/api/pdf/reporte-mantenimiento` | Generar reporte de mantenimiento |
| POST | `/api/pdf/certificado-inspeccion` | Generar certificado de inspección |
| GET | `/api/pdf/:filename` | Obtener PDF guardado/cacheado |

# API Documentation

La API expone documentación Swagger en tiempo de ejecución.

## Endpoints

- UI Swagger: `http://localhost:<PORT>/api/docs`
- JSON OpenAPI: `http://localhost:<PORT>/api/docs-json`

## Autenticación

- La mayoría de endpoints requieren `Authorization: Bearer <token>`.
- Usa Swagger UI para generar y probar tokens fácilmente.

## Requisitos

- Configurar `PORT` y `FRONTEND_URL` en variables de entorno si aplica.
- Ejecutar el backend con `pnpm --filter backend dev`.

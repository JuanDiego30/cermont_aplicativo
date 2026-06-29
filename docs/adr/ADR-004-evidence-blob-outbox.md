# ADR-004: Evidencias y blob outbox

Estado: Aceptado
Fecha: 2026-06-06

## Contexto

Fotos y soportes de campo son grandes, deben sobrevivir pérdida de red y no deben convertirse a base64 en colas JSON.

## Decisión

Los blobs se almacenan localmente con metadata, hash/idempotency key y relación de entidad. La mutación JSON referencia el blob por ID. La sincronización sube, verifica respuesta y solo entonces marca/remueve el pendiente.

## Alternativas consideradas

- Base64 en localStorage/JSON: descartado por tamaño y memoria.
- Reintento exclusivo del SW: descartado por falta de contexto de negocio.
- Upload directo sin outbox: descartado por pérdida bajo desconexión.

## Consecuencias

Se requiere cuota, estado visible, reintentos, dead letter, MIME/tamaño/hash y descarga protegida. Los dos mecanismos de blob actuales deben converger gradualmente.

## Validación

Unit tests del outbox/procesador y E2E de captura offline, recarga, reconexión y archivo backend.

# ADR-005: Máquina de estados de cierre administrativo

Estado: Aceptado
Fecha: 2026-06-06

## Contexto

SES, factura, aprobación, pago y cierre tienen dependencias financieras y posibles efectos legales.

## Decisión

Cada entidad mantiene state machine propia y el cierre agrega sus estados. No se crea factura válida sin SES aprobada, no se registra pago contra factura no aprobada y no se cierra caso sin requisitos completos. Acciones finales permanecen online hasta aprobación de política offline.

## Alternativas consideradas

- Estado único "cerrado": descartado por opacidad.
- Permitir acciones finales offline: no aprobado por riesgo legal.
- Validar solo en frontend: descartado por seguridad.

## Consecuencias

El backend es autoridad. La UI muestra bloqueos y próximos pasos. Borradores offline pueden existir, pero requieren validación y auditoría al sincronizar.

## Validación

Pruebas de state machine, RBAC y E2E de SES -> invoice -> approval -> payment -> closure, incluidos intentos inválidos.

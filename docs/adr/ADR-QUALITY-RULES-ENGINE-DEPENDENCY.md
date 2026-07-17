# ADR: Quality Script & json-rules-engine Dependency

**Date:** 2026-07-08
**Status:** DRAFT — Pending User Approval

## Context

Durante el Sprint 4, se realizaron dos cambios en package.json y package-lock.json:

1. Se agregó el script quality:hardcoded-roles en package.json.
2. Se agregó la dependencia json-rules-engine@7.3.1 en package-lock.json.

Estos cambios quedaron sin documentación ADR.

## Decision: package.json (quality:hardcoded-roles)

Se agregó un script de calidad que verifica que no existan roles hardcodeados en el código fuente.

- **Riesgo:** Bajo — solo agrega un script de verificación.
- **Alternativas:** Ninguna — es una mejora de tooling.
- **Impacto:** No afecta build, test ni producción.

## Decision: package-lock.json (json-rules-engine)

Se agregó json-rules-engine@7.3.1 (con sus dependencias transitivas: @jsep-plugin/assignment, @jsep-plugin/regex, jsep, clone, ventemitter2, hash-it, jsonpath-plus).

- **Propósito probable:** Soporte para el módulo de automatización (ackend/src/modules/automation/).
- **Riesgo:** Medio — nueva dependencia de producción con 7 dependencias transitivas.
- **Alternativas consideradas:**
  - Implementación manual de reglas de negocio (más código, menos mantenible)
  - Uso de 	s-pattern para pattern matching (librería más ligera, pero sin engine de reglas completo)
- **Validaciones requeridas:**
  - ✅ Build pasa
  - ✅ Tests pasan (681/681)
  - ❌ ADR no existía al momento de la instalación

## Aprobación

Este ADR requiere aprobación explícita del usuario antes de hacer staging de package.json y package-lock.json.

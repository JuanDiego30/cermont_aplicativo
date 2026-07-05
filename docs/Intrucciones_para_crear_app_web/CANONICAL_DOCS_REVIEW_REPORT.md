# CANONICAL_DOCS_REVIEW_REPORT — Revisión y ampliación v2.1

**Proyecto:** CERMONT S.A.S. — Plataforma documental-operativa  
**Fecha:** 2026-05-26  
**Resultado:** PARCIAL/APROBABLE COMO PLANO ARQUITECTÓNICO, sujeto a verificación contra código real.

## 1. Qué se corrigió

- Se agregó un **ANEXO v2.1** a cada uno de los 10 documentos canónicos.
- Se mantuvo la estructura de máximo 10 documentos canónicos.
- Se agregó jerarquía de fuente de verdad.
- Se agregaron estados oficiales: `IMPLEMENTADO`, `PARCIAL`, `PLANIFICADO`, `FUTURO`, `NO_VERIFICADO`, `CONTRADICCIÓN`.
- Se agregó matriz documentación ↔ código.
- Se aclaró que Caño Limón / Sierracol es escenario piloto, no acoplamiento del software.
- Se separó MVP vs futuro para OCR/IA.
- Se detalló offline real con IndexedDB, outbox, clientMutationId y sincronización.
- Se amplió el flujo de 14 pasos con matriz ejecutable.
- Se ampliaron formularios dinámicos, evidencias categorizadas, RBAC, QA y No Deploy.

## 2. Contradicciones encontradas

| Tema | Riesgo | Acción aplicada |
|---|---|---|
| Arquitectura ideal vs estado real | El agente puede asumir que algo está implementado solo porque está documentado. | Se agregó estado obligatorio por requisito. |
| OCR/IA | Puede prometerse sin motor real. | Se separó niveles 0-4 y se marcó OCR/IA como futuro si no existe. |
| Offline | Puede reducirse a pantalla de error. | Se definió funcionamiento real offline + matriz de comandos. |
| Caño Limón / Sierracol | Riesgo de acoplar el sistema a un solo cliente/campo. | Se aclaró que es piloto. |
| Formularios | Riesgo de opciones cerradas. | Se agregó Otro/Personalizado y aprobación de catálogo. |
| Evidencias | Riesgo de subir fotos sin orden. | Se definió evidencia categorizada por caso, paso, requisito y momento. |
| $0 en costos | Riesgo de mostrar datos falsos. | Se agregó estado `NO_DATA` y estados de costo. |

## 3. Secciones nuevas por documento

| Documento | Secciones añadidas |
|---|---|
| DOC-00 | Jerarquía de fuente de verdad, estados, matriz documentación↔código, orden de lectura, regla anti “already exists”. |
| DOC-01 | Alcance multiservicio, MVP vs futuro, versiones desde package.json, screaming architecture, roles canónicos. |
| DOC-02 | Recuperación segura Git, archivos versionables, diagnóstico de encoding, evidencia por tarea. |
| DOC-03 | Vertical slice, ApiEnvelope, matriz endpoints, seguridad IDOR, error codes. |
| DOC-04 | Mapa rutas frontend, anti-loop, query keys SSOT, offline real, design tokens. |
| DOC-05 | Matriz 14 pasos, no páginas huérfanas, cockpit, sidebar secuencial, bloqueadores. |
| DOC-06 | Niveles extracción documental, pipeline documental, campos dinámicos, Otro/Personalizado, costos sin $0 falso. |
| DOC-07 | Modelo evidencia categorizada, reglas evidencia, UI mínima, categorías abiertas, política eliminación/archivado. |
| DOC-08 | Pruebas por falla, E2E obligatorio, evidencia por gate, criterios de aprobación, seguridad mínima. |
| DOC-09 | Política No Deploy, checklist cierre técnico, observabilidad, alertas, KPIs de negocio. |

## 4. Deudas documentales restantes

- Verificar contra código local real cada matriz de endpoint/ruta/schema.
- Completar nombres exactos de archivos si el repositorio cambió durante refactor.
- Actualizar estados `IMPLEMENTADO/PARCIAL/PLANIFICADO` después de ejecutar pruebas.
- Generar evidencias reales de Playwright, curl, React Doctor y `verify`.
- Validar si `quality:language` debe excluir docs y `messages/es.json`.

## 5. Criterio de uso

Estos documentos deben usarse como **plano arquitectónico y criterio de aceptación**, no como prueba de implementación.  
El agente debe ejecutar comandos, pruebas y recopilar evidencia antes de declarar cualquier módulo como terminado.

## 6. Estado final

**PARCIAL — documentación mejorada y lista como guía arquitectónica, pero requiere auditoría contra el código real para marcar APROBADO.**

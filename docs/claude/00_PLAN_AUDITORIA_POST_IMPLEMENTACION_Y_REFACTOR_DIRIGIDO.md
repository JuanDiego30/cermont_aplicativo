# 00 — Plan de auditoría post-implementación y refactor dirigido

## Propósito

Este plan corrige la falla principal observada en los agentes anteriores: ejecutan tareas, modifican archivos y declaran éxito sin demostrar que el software realmente cumple la lógica de negocio de CERMONT.

El agente debe verificar primero lo implementado, detectar deuda legacy restante y luego refactorizar por slices funcionales completos.

---

## Fase 0 — Congelar estado y levantar diagnóstico técnico

### Objetivo
Saber exactamente qué está fallando antes de tocar código.

### Acciones

1. Ejecutar:

```bash
git status --short
git diff --stat
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

2. Guardar salidas completas en:

```text
.sisyphus/evidence/post-implementation/baseline-typecheck.txt
.sisyphus/evidence/post-implementation/baseline-lint.txt
.sisyphus/evidence/post-implementation/baseline-test.txt
.sisyphus/evidence/post-implementation/baseline-build.txt
.sisyphus/evidence/post-implementation/baseline-verify.txt
```

3. Clasificar errores en:

```text
A. Error de formato/lint sin impacto funcional
B. Error de tipos por contrato inconsistente
C. Error de test por snapshot desactualizado
D. Error de test por regla de negocio rota
E. Error de build real
F. Error de integración frontend-backend
G. Error de diseño funcional o UX
```

### Criterio de salida

Debe existir un reporte:

```text
.sisyphus/notepads/post-implementation/baseline-diagnosis.md
```

con archivo, comando, causa probable y prioridad.

---

## Fase 1 — Verificación de planes implementados

### Objetivo
No asumir que los planes se implementaron. Verificarlo contra código real.

### Entradas obligatorias

- `libro-proyecto-refactorizacion.md`
- `refactor-funcional-cermont.md`
- `refactor-cermont-14-pasos-v2.md`
- `cermont-dynamic-platform.md`
- Libro/PDF principal
- Código real

### Acciones

Crear una matriz:

```text
Plan | Task | Promesa funcional | Archivo esperado | Existe? | Funciona? | Evidencia | Veredicto
```

Evaluar como mínimo:

1. Cockpit 14 pasos.
2. Document upload contextual.
3. Document ingestion PDF/Excel/Word.
4. TemplateDraft persistido.
5. TemplateResponse persistido.
6. DynamicFormRenderer real.
7. Selección/reutilización de documentos existentes.
8. Asociación documento → OT/caso → paso → requisito.
9. Bloqueadores por transición.
10. Planeación con kits, herramientas, certificaciones y documentos.
11. Ejecución con checklists, evidencias y costos reales.
12. Informes generados desde ejecución.
13. Actas generadas desde informe.
14. SES/Facts/Pagos con compuertas.
15. Costos estimados vs reales.
16. Seeds realistas.
17. Tests de negocio.
18. Eliminación de redirects legacy.
19. Eliminación de mocks/stubs/in-memory en producción.
20. Documentación/libro ajustado al estado real.

### Criterio de salida

Archivo obligatorio:

```text
.sisyphus/notepads/post-implementation/plan-compliance-matrix.md
```

El agente debe dar veredicto por plan:

```text
APROBADO | PARCIAL | RECHAZADO
```

---

## Fase 2 — Auditoría de deuda legacy y código genérico

### Objetivo
Detectar si el software sigue funcionando como sistema legacy limitado.

### Búsquedas obligatorias

```bash
grep -R "href=.*documents\|router.push(.*documents\|window.location" frontend/src
rg "fetch\(" frontend/src
rg "console\.log|TODO|FIXME|stub|dummy|mock|test client|Cliente 1|Sin valor|\$ 0|blockers: 0|evidences: 0" frontend/src backend/src packages
rg "new Map\(|in-memory|memory storage|synthetic|fake|hardcoded" backend/src packages
rg "as any|@ts-ignore|@ts-expect-error" frontend/src backend/src packages
```

### Patrones que deben rechazarse

1. Botón que solo redirige a `/documents`.
2. Subida de archivo sin propósito funcional.
3. Documento que no se puede seleccionar/reutilizar después.
4. Formulario dinámico simulado o hardcodeado.
5. Bloqueadores siempre en cero.
6. Evidencias sin clasificación.
7. Costos `$0` por defecto.
8. Cierre administrativo solo como conteo.
9. Datos demo genéricos en pantallas de negocio.
10. Fetch directo en componentes.
11. Lógica de negocio en componentes UI.
12. Stubs que responden 200 sin lógica real.
13. Snapshots actualizados sin migración de contratos.

### Criterio de salida

```text
.sisyphus/notepads/post-implementation/legacy-debt-audit.md
```

Debe incluir archivo:línea, severidad y corrección propuesta.

---

## Fase 3 — Reparación de gates sin ocultar deuda

### Objetivo
Corregir errores de `verify`, `lint`, `test` y `build` sin disfrazar fallas funcionales.

### Regla

Los gates son compuertas de calidad, no la meta del producto.

### Orden

1. Corregir errores triviales de formato/imports con Biome.
2. Corregir errores de tipos desde contratos compartidos.
3. Corregir tests rotos por lógica real.
4. Actualizar snapshots SOLO si el cambio de contrato es intencional y queda documentado.
5. Ejecutar gates completos al final.

### Prohibido

- No borrar tests para aprobar.
- No relajar schemas Zod para que pasen payloads malos.
- No cambiar snapshots sin `contract-migrations.json` o justificación equivalente.
- No usar `any` para silenciar TypeScript.
- No hacer skip de suites completas.

### Criterio de salida

```text
.sisyphus/evidence/post-implementation/final-gates.txt
```

con:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

---

## Fase 4 — Refactor por vertical slices funcionales

El agente NO debe refactorizar por capas aisladas. Debe refactorizar slices completos:

```text
Contrato → Modelo → Servicio → Endpoint → Hook → Página → QA → Test
```

### Slice A — Documentos inteligentes

Debe permitir:

- Subir PDF/Excel/Word con contexto.
- Guardar en biblioteca.
- Seleccionar documento existente.
- Asociar a OT/caso/paso/requisito.
- Crear DocumentSourceFile.
- Crear DocumentExtractionJob.
- Crear ExtractedDocumentLayout.
- Crear TemplateDraft.
- Revisar campos.
- Publicar formulario.

### Slice B — Formularios dinámicos

Debe permitir:

- Campos texto, número, fecha, moneda.
- Selector, multiselector, checklist.
- Tabla repetible.
- Foto, firma, GPS, archivo.
- Campo calculado.
- Condiciones.
- Opción “Otro, ¿cuál?”.
- Guardado offline.
- TemplateResponse vinculado a OT/paso.

### Slice C — Planeación y ejecución

Debe permitir:

- Kits sugeridos por tipo de servicio.
- Herramientas, equipos, personal y certificaciones.
- AST/PTW/procedimientos/checklists.
- Bloqueo antes de ejecutar si falta algo.
- Evidencias antes/durante/después.
- Materiales y horas reales.
- Cierre técnico con checklist.

### Slice D — Informes, actas y cierre administrativo

Debe permitir:

- Informe técnico generado desde ejecución.
- Acta generada desde informe aprobado.
- Firma cliente.
- SES solo si existe acta firmada.
- Factura solo si SES aprobada.
- Cierre solo si pago confirmado.

### Slice E — Costos reales

Debe permitir:

- Presupuesto desde propuesta.
- Costos reales desde ejecución.
- MO/materiales/equipos/AIU/impuestos.
- Facturado y pagado.
- Margen estimado vs real.
- Alertas de sobrecosto.

---

## Fase 5 — QA funcional con evidencia

Debe ejecutarse con Playwright/curl y evidencia.

### Casos mínimos

1. Crear solicitud → convertir a caso.
2. Programar visita con fotos y mediciones.
3. Crear propuesta con valor > 0.
4. Registrar PO.
5. Planeación incompleta bloquea ejecución.
6. Planeación completa habilita ejecución.
7. Ejecución sin evidencia bloquea cierre técnico.
8. Ejecución completa genera informe.
9. Informe aprobado genera acta.
10. Acta firmada permite SES.
11. SES aprobada permite factura.
12. Factura aprobada permite pago.
13. Pago confirma cierre.
14. Excel importado crea campos/formulario.
15. Documento existente se reutiliza en otro paso.
16. Costo real mayor al estimado genera alerta.

### Criterio de salida

Screenshots y salidas en:

```text
.sisyphus/evidence/post-implementation/manual-qa/
```

---

## Fase 6 — Veredicto final

El agente debe entregar:

```text
Planes implementados: X/Y
Deuda legacy corregida: X/Y
Gates: PASS/FAIL
QA funcional: X/Y
Riesgos pendientes: lista
Veredicto: APROBADO / PARCIAL / RECHAZADO
```

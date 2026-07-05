# Spec 009 — Risk register

| ID | Riesgo | Severidad | Evidencia | Mitigación / estado |
|---|---|---:|---|---|
| R-001 | Mezclar WIP previo con Spec 009 | Alta | Tres páginas modificadas y muchos archivos no rastreados antes de iniciar | Preservar; inspeccionar diffs antes de tocar archivos coincidentes |
| R-002 | Artefactos Markdown invisibles en Git | Alta | `.gitignore` contiene reglas amplias para `*.md` y `specs/` aparece no rastreado | Verificar y usar `git add -f` solo si el usuario solicita commit |
| R-003 | Baseline documental contradictorio | Media | Spec 008 registra quality PASS y FAIL en distintos documentos | La salida fresca de comandos es la única evidencia de gates |
| R-004 | React Doctor 77/100 | Alta | 1 error y 19 warnings en v0.5.8 | Corregir primero error, a11y y causas de alto impacto; no suprimir reglas |
| R-005 | Error de accesibilidad Radix fuera de React Doctor | Alta | Test de `DocumentGallery` reporta `DialogContent` sin `DialogTitle` | Crear regresión enfocada y corregir antes de cerrar P0 |
| R-006 | FileAsset autoriza solo por rol interno | Crítica | Riesgo 12 de `REFACTOR_RISK_REGISTER.md` | Tests de cross-entity/owner scope antes de ampliar adapters |
| R-007 | Contrato de owners supera adapters persistibles | Alta | `work_order`, `execution_session`, `planning`, `checklist_item` sin adapter confirmado | Alinear contrato y registry sin crear almacenamiento paralelo |
| R-008 | Dominio `tool` ambiguo entre `Resource` y `Tool` | Alta | Dos aggregates y FileAsset apunta actualmente a `Resource` | Resolver por evidencia y compatibilidad antes del slice de herramientas |
| R-009 | Errores post-deploy no reproducibles solo con unit tests | Alta | 400/401/500 y assets/PWA dependen de topología VPS | Reproducir localmente, contrastar código de producción y documentar lo externo |
| R-010 | Entradas obligatorias ausentes | Media | No existe `.specify/memory/constitution.md`; reglas solo bajo `docs/` | Registrar ausencia, no inventar contenido |
| R-011 | 42Crunch no disponible | Media | No existe `42c-ast`, credenciales ni OAS resoluble | No instalar ni configurar sin aprobación; mantener como control pendiente |

## Riesgos cerrados en P0

- R-004: React Doctor quedó en 97/100.
- R-005: `DocumentGallery` ya no emite el warning Radix.
- R-007: contrato y parent registry de FileAsset quedaron alineados.
- La porción de R-006 asociada a idempotencia cross-entity quedó cerrada; el acceso sigue limitado a roles internos y `cliente` se rechaza.

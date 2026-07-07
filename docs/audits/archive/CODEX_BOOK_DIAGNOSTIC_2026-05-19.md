# Diagnóstico Inicial del Libro de Grado CERMONT

Fecha: 2026-05-19

Documento auditado principal: `Libro/main.tex` -> `Libro/main.pdf`

## Fuentes revisadas

- Libro LaTeX y PDF en `Libro/`
- Versión paralela en `investigacion_para_libro/`
- Documentación canónica:
  - `docs/README.md`
  - `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md`
  - `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md`
- Auditorías académicas:
  - `docs/audits/Auditoría Académica — Trabajo de Grado CERMONT S.A.S..md`
  - `docs/audits/Informe de Auditoría Académica — Trabajo de Grado CERMONT S.A.S..md`
  - `docs/audits/Revisión y Corrección de Trabajo de Grado.md`
  - `docs/audits/deep-research-report (1).md`
  - `docs/audits/deep-research-report (2).md`
- Documentos institucionales y de contexto:
  - `docs/pdf/ATG JUAN DIEGO AREVALO-1.md`
  - `docs/pdf/Observaciones Anteproyecto Juan Diego.md`
  - `docs/pdf/DESARROLLO DE UN APLICATIVO WEB PARA APOYO EN LA EJECUCIÓN Y CIERRE ADMINISTRATIVO DE LOS TRABA.md`
  - `docs/pdf/Jerarquia de controles_Cermont.md`
  - PDFs de planeación, inspección, CCTV, inducción HES y evidencia fotográfica
- Repositorio real:
  - `package.json`
  - `backend/package.json`
  - `frontend/package.json`
  - `packages/shared-types/package.json`
  - `packages/domain/package.json`
  - rutas, servicios, modelos, páginas y pruebas detectables en `backend/`, `frontend/`, `packages/`

## Hallazgos ejecutivos

1. El libro sí compila y genera PDF funcional: `xelatex` produce `Libro/main.pdf` de 165 páginas. No se detectaron errores críticos de compilación ni referencias/citas indefinidas en `Libro/main.log`. `latexmk` no funciona en este entorno por falta de `perl`.
2. `Libro/` es el árbol vigente. `investigacion_para_libro/` es una variante reducida y no debe tomarse como fuente principal del entregable final.
3. El resumen y el abstract cumplen la regla de cierre en palabras clave: `Libro/resumen.tex:24` y `Libro/abstract.tex:14`.
4. El libro ya tiene una estructura de 10 capítulos, pero mantiene incoherencias internas entre lo que describe sobre su estructura y los títulos reales del índice: `Libro/Capitulos/Capitulo_1.tex:366-373`.
5. La mayor deuda actual no es LaTeX básico, sino veracidad técnica y redacción académica:
   - ADR dentro del marco teórico: `Libro/Capitulos/Capitulo_2.tex:91`
   - pregunta de investigación que anticipa la solución: `Libro/Capitulos/Capitulo_1.tex:245`
   - objetivos con herramientas concretas y validación sobredicha: `Libro/Capitulos/Capitulo_1.tex:279-280`
   - resultados de pruebas marcados como “Aprobado” sin acta de usuario ni piloto verificable: `Libro/Capitulos/Capitulo_8.tex:43-128`
6. Hay una contradicción técnica crítica entre libro y código:
   - El libro afirma `Serwist 9.x` implementado y ubica el service worker en `frontend/src/sw.ts`: `Libro/Capitulos/Capitulo_6.tex:147`, `Libro/Apendices/Apendices.tex:95`
   - El frontend real usa un `frontend/public/service-worker.js` manual y el propio archivo dice que la migración a Workbox queda para futuro: `frontend/public/service-worker.js:8`
   - No existe dependencia `serwist` en `frontend/package.json`
7. La operación offline existe, pero no en el nivel absoluto que declara el manuscrito:
   - Hay cola de sincronización, hooks y estado offline reales: `frontend/src/lib/offline/*`, `frontend/src/modules/checklists/hooks/useOfflineChecklist.ts`, `frontend/src/modules/evidences/hooks/useOfflineEvidence.ts`
   - El backend declara explícitamente que la sincronización offline de evidencias con archivo real aún no está soportada: `backend/src/services/sync.service.ts:170`
8. El libro supera la meta de extensión mínima en páginas, pero la bibliografía está sobredimensionada frente al texto: 141 entradas en `.bib`, 58 claves citadas y 83 entradas no citadas.
9. Los anexos actuales no siguen la estructura pedida por el usuario. No aparece el ATG completo como anexo institucional; en cambio hay anexos de refactorización, glosario y arquitectura técnica.
10. La serie técnica que mejor encaja como “documentación 00–22” es `docs/PROMPTS/00.md` a `docs/PROMPTS/21.md` según `docs/PROMPTS/README.md`. La carpeta `docs/Intrucciones_para_crear_app_web/DOC-*` es histórica, incompleta en numeración y no debe usarse como fuente de verdad cuando contradice la documentación canónica.

## Tabla de auditoría inicial

| Capítulo / sección | Problema detectado | Evidencia | Corrección requerida | Prioridad |
|---|---|---|---|---|
| Resumen | No presenta hallazgo crítico de estructura. Cierra correctamente en palabras clave. | `Libro/resumen.tex:24` | Mantener estructura y ajustar solo si se reescribe el diagnóstico o la validación. | Media |
| Abstract | No presenta hallazgo crítico de estructura. Cierra correctamente en keywords. | `Libro/abstract.tex:14` | Mantener estructura y alinear con el resumen definitivo tras la reescritura. | Media |
| Índice general / estructura del documento | La sección que explica la estructura del libro no coincide con los títulos reales de los capítulos 7–10. | `Libro/Capitulos/Capitulo_1.tex:366-373`; capítulos reales en `Libro/Capitulos/Capitulo_7.tex`, `..._8.tex`, `..._9.tex`, `..._10.tex` | Reescribir la sección de estructura del documento para reflejar exactamente el índice compilado. | Alta |
| Capítulo 1 | La pregunta de investigación describe la solución tecnológica antes de formular el problema. | `Libro/Capitulos/Capitulo_1.tex:245` | Reformular la pregunta en clave problema -> centralización -> trazabilidad, sin nombrar arquitectura desacoplada, Zero Trust u offline como respuesta anticipada. | Alta |
| Capítulo 1 | Los objetivos específicos 3 y 4 contienen herramientas y validaciones sobredeterminadas. | `Libro/Capitulos/Capitulo_1.tex:279-280`; ATG en `docs/pdf/ATG JUAN DIEGO AREVALO-1.md:42` | Volver a la formulación aprobada por el ATG o a una versión académica equivalente sin Zod/Zero Trust/OWASP como condición de cumplimiento. | Alta |
| Capítulo 1 | La justificación técnica mezcla el problema con versiones exactas del stack y un tono demasiado de repositorio. | `Libro/Capitulos/Capitulo_1.tex:254-256` | Pasar la discusión detallada del stack al capítulo 6 y mantener en la justificación solo el porqué funcional. | Alta |
| Capítulo 1 | La estructura de “cuatro fases críticas” es útil, pero debe alinearse con las cinco fallas documentadas por CERMONT, no solo con una lectura por fases. | `Libro/Capitulos/Capitulo_1.tex:168-197`; documento de proceso en `docs/pdf/DESARROLLO ... .md` | Reordenar el problema alrededor de planeación, ejecución, informes/actas, facturación y costos reales. | Alta |
| Capítulo 2 | Los ADR están en el marco teórico. | `Libro/Capitulos/Capitulo_2.tex:91-128` | Trasladar ADR y justificación del stack al capítulo 6 bajo una subsección de decisiones arquitectónicas. | Alta |
| Capítulo 2 | Se usan tecnologías concretas como contenido teórico principal. | `Libro/Capitulos/Capitulo_2.tex:40-58`, `:98-134` | Dejar la teoría en términos de principios: PWA, validación declarativa, control de acceso, arquitectura por capas; mover nombres concretos a desarrollo/anexos. | Alta |
| Capítulo 3 | El estado del arte es amplio, pero debe quedar más claramente conectado con la observación del jurado y con el valor diferencial real. | `Libro/Capitulos/Capitulo_3.tex:28-31`, `:248-254`; `docs/pdf/Observaciones Anteproyecto Juan Diego.md`; `docs/pdf/ATG JUAN DIEGO AREVALO-1.md:48` | Recentrar la comparación en FSM/CMMS/ERP vs. necesidades de CERMONT: campo, cierre administrativo, trazabilidad documental y funcionamiento offline. | Media |
| Capítulo 4 | No presenta una contradicción grave de estructura, pero conviene reducir repeticiones y vigilar que toda norma citada afecte de forma directa al sistema. | `Libro/Capitulos/Capitulo_4.tex:9-90` | Mantener el capítulo, compactar lo accesorio y reforzar la relación directa entre norma y módulo. | Media |
| Capítulo 5 | La metodología es usable, pero Contract-First aparece más como procedimiento de ingeniería que como operacionalización de DSR. | `Libro/Capitulos/Capitulo_5.tex:79-100` | Introducir una frase puente que lo ubique explícitamente dentro de la fase de construcción del artefacto. | Media |
| Capítulo 5 | Se apoya correctamente en documentos institucionales, pero debe integrarse de forma más explícita la serie técnica 00–21 como memoria del desarrollo. | `Libro/Capitulos/Capitulo_5.tex:38-40`; `docs/PROMPTS/README.md` | Añadir una subsección que explique que los prompts 00–21 documentan la evolución modular del sistema y sirven como bitácora técnica. | Alta |
| Capítulo 6 | Declara tecnologías y estados de implementación que no coinciden del todo con el repositorio real. | `Libro/Capitulos/Capitulo_6.tex:92-149`; `Libro/Apendices/Apendices.tex:91-95`; `frontend/public/service-worker.js:8`; `frontend/src/modules/core/ui/pwa/ServiceWorkerRegistration.tsx:25`; `backend/src/services/sync.service.ts:170` | Corregir stack y estado: offline existe, pero no mediante Serwist y no con sincronización total de evidencias binarias. | Muy alta |
| Capítulo 6 | El libro afirma `frontend/src/sw.ts`, pero el archivo real es `frontend/public/service-worker.js`. | `Libro/Apendices/Apendices.tex:95`; código real en `frontend/public/service-worker.js` | Sustituir rutas, tecnología y descripción del pipeline offline. | Muy alta |
| Capítulo 6 | Algunas comparativas y versiones exactas sí están soportadas por `package.json`, pero otras no deben aparecer en secciones académicas tempranas. | `backend/package.json`, `frontend/package.json`, `packages/shared-types/package.json` | Concentrar el detalle verificado del stack en una sola sección de justificación tecnológica, no dispersarlo. | Alta |
| Capítulo 7 | Presenta resultados por módulo razonables, pero algunas afirmaciones deben degradarse de “implementado” a “parcialmente implementado” o “pendiente de validar”. | `Libro/Capitulos/Capitulo_7.tex:72-174`; evidencia de código en `backend/src/services/sync.service.ts:170` | Revisar módulo por módulo contra código real y ajustar estados del relato. | Alta |
| Capítulo 8 | El lenguaje de validación es demasiado fuerte: “Aprobado”, aceptación por rol y revisión OWASP como si ya fueran validación formal completa. | `Libro/Capitulos/Capitulo_8.tex:43-128`, `:183`, `:197`; ATG `docs/pdf/ATG JUAN DIEGO AREVALO-1.md:42` | Reemplazar “Aprobado” por “Verificado en ambiente de desarrollo” o “Validación técnica documentada”; separar claramente piloto pendiente, pruebas automatizadas y revisión arquitectónica OWASP. | Muy alta |
| Capítulo 9 | Incluye un hallazgo útil: reconoce cobertura asimétrica de módulos. Debe preservarse y profundizarse con evidencia de código. | `Libro/Capitulos/Capitulo_9.tex:60-77` | Mantener la honestidad del capítulo y reforzarlo con una matriz módulo -> estado -> evidencia. | Media |
| Capítulo 10 | El capítulo sigue incluyendo cierre, síntesis y reflexión que se acercan a la autoevaluación. | `Libro/Capitulos/Capitulo_10.tex:58-71` | Reducir el tono autocelebratorio y responder objetivo por objetivo con evidencia. | Alta |
| Sección “Contribuciones Académicas del Autor” | Es un capítulo adicional fuera de la estructura estándar pedida y además repite afirmaciones discutibles, incluida Serwist. | `Libro/contribuciones.tex:4-45` | Integrar sus aportes en conclusiones o moverlo a anexo. Si se conserva, reescribirlo en tono descriptivo y sin afirmar tecnologías no verificadas. | Alta |
| Anexos | La estructura de anexos no corresponde a lo solicitado por el usuario; falta el ATG como soporte institucional y sobra material de “refactorización aplicada” dentro del entregable final. | `Libro/Apendices/Apendices.tex:12-216` | Reestructurar anexos hacia: ATG, documentos CERMONT, documentación 00–21, evidencias del repositorio, capturas, pruebas y manual de usuario. | Alta |
| Anexo D | Título en mayúsculas innecesarias y contenido técnicamente inexacto. | `Libro/Apendices/Apendices.tex:79-95` | Renombrar y corregir stack/rutas. | Alta |
| Figuras y tablas | No hay error crítico de compilación, pero la validación visual completa sigue pendiente. Las muestras revisadas no muestran desbordes obvios. | compilación `xelatex`; muestreo de PNGs desde `tmp/pdf_audit/` | Mantener revisión visual tras cada corrección mayor; escalar y convertir las figuras conflictivas si aparecen fuera de margen. | Media |
| Bibliografía y citas | No hay citas ni referencias indefinidas, pero el `.bib` tiene 83 entradas sin uso. | `Libro/main.log`; conteo: 141 claves, 58 usadas | Depurar `referencias.bib` o incorporar solo las citas que realmente soporten el texto final. | Alta |
| Compilación LaTeX | `xelatex` funciona; `latexmk` falla por entorno. | `Libro/main.pdf` generado; error de `latexmk` por falta de `perl` | Mantener compilación con `xelatex` mientras no se reconfigure el entorno. | Media |
| Coherencia con el ATG | El libro conserva el foco general, pero el objetivo 4 del ATG exige piloto medido con 5 usuarios y 2 semanas, algo no evidenciado hoy. | `docs/pdf/ATG JUAN DIEGO AREVALO-1.md:42`; `Libro/Capitulos/Capitulo_8.tex` | Expresar el objetivo 4 como validación parcial técnica y piloto pendiente por ejecutar o anexar. | Muy alta |
| Coherencia con el software real | El repositorio demuestra una cobertura mayor de la que sugiere parte del discurso, pero también desmiente algunas afirmaciones absolutas del libro. | `backend/src/routes/*`, `backend/src/services/*`, `frontend/src/app/(dashboard)/*`, `packages/shared-types/src/schemas/*` | Reescribir el capítulo 6 y las matrices de resultados sobre evidencia real de código, no sobre documentación aspiracional. | Muy alta |

## Matriz preliminar de auditoría del software frente al libro

| Módulo | Evidencia en código / repo | Paso del flujo | Falla que atiende | Estado preliminar | Qué debe decir el libro |
|---|---|---|---|---|---|
| Autenticación y RBAC | `backend/src/services/auth.service.ts`, `backend/src/routes/auth.routes.ts`, `packages/domain/src/rbac.ts`, `frontend/src/modules/auth/*` | Transversal | Control de acceso y trazabilidad por rol | Implementado | Puede afirmarse como implementado, con validación técnica en desarrollo. |
| Work Requests | `packages/shared-types/src/schemas/work-request.schema.ts`, `backend/src/routes/work-request.routes.ts`, `frontend/src/app/(dashboard)/work-requests/*` | Paso 1 | Centralización de solicitudes | Implementado | Debe presentarse como módulo existente y visible. |
| Site Visits | `packages/shared-types/src/schemas/site-visit.schema.ts`, `backend/src/routes/site-visit.routes.ts`, `frontend/src/app/(dashboard)/site-visits/*` | Paso 2 | Diagnóstico previo y visita | Implementado | Puede afirmarse como implementado. |
| Proposals / PO | `proposal.schema.ts`, `purchase-order*.ts`, páginas en `frontend/src/app/(dashboard)/proposals/*` | Pasos 3-4 | Propuesta económica y aprobación | Implementado / parcial según UI específica | El libro debe distinguir entre propuesta implementada y cobertura parcial de algunos subflujos. |
| Planning / kits | `planning-packet.schema.ts`, `kit.schema.ts`, `maintenanceKit.schema.ts`, `backend/src/routes/planning-packet.routes.ts`, `frontend/src/app/(dashboard)/planning/*`, `resources/kits` | Paso 5 | Falla de planeación y faltantes de recursos | Implementado | Debe seguir siendo uno de los módulos centrales del proyecto. |
| Execution Session | `execution-session.schema.ts`, `backend/src/routes/execution-session.routes.ts`, `frontend/src/app/(dashboard)/execution/*` | Paso 6 | Ejecución en campo | Implementado | Puede afirmarse como implementado. |
| Evidencias | `evidence.schema.ts`, `backend/src/routes/evidence.routes.ts`, `frontend/src/app/(dashboard)/evidences/*`, `frontend/src/modules/evidences/*` | Paso 7 | Dispersión de evidencia fotográfica | Implementado con límite offline | El libro debe decir que la captura existe; la sincronización offline de archivos no está cerrada completamente. |
| Technical Reports | `technical-report.schema.ts`, `backend/src/routes/technical-report.routes.ts`, `frontend/src/app/(dashboard)/reports/*` | Paso 8 | Retrasos de informes | Implementado | Puede afirmarse como implementado. |
| Delivery Records / firma | `delivery-record.schema.ts`, `backend/src/routes/delivery-record.routes.ts`, `frontend/src/app/(dashboard)/delivery-records/*` | Pasos 9-10 | Retrasos en actas y firma | Implementado | El libro debe mostrarlo con evidencia de pantalla o flujo. |
| SES / Ariba | `service-entry-sheet.schema.ts`, `backend/src/routes/service-entry-sheet.routes.ts`, `frontend/src/app/(dashboard)/billing/ses/*` | Paso 11 | Cierre administrativo | Implementado como seguimiento interno | Debe explicarse que apoya el flujo SES/Ariba; no reemplaza Ariba. |
| Invoices | `invoice.routes.ts`, `frontend/src/app/(dashboard)/billing/invoices/*` | Paso 12-13 | Facturación y aprobación | Implementado | Puede afirmarse como implementado. |
| Payments | `payment.schema.ts`, `payment.routes.ts`, `frontend/src/app/(dashboard)/payments/*` | Paso 14 | Seguimiento del pago | Implementado | Puede afirmarse como implementado. |
| Cost engine | `cost*.schema.ts`, `backend/src/routes/cost.routes.ts`, `frontend/src/app/(dashboard)/costs/*` | Transversal | Control de costos reales vs propuesta | Implementado | Debe reforzarse en el libro como respuesta a una falla real documentada. |
| Document-driven core / templates | `document*.schema.ts`, `document-ingestion*.ts`, `template*.ts`, `frontend/src/app/(dashboard)/documents/*`, `templates/*` | Transversal | Gestión documental y evolución a formularios configurables | Implementado / parcialmente consolidado | El libro debe diferenciar entre núcleo documental ya presente y expansión futura hacia ingestión más automatizada. |
| Offline sync | `frontend/src/lib/offline/*`, `frontend/public/service-worker.js`, `backend/src/routes/sync.routes.ts` | Transversal | Operación en conectividad limitada | Parcialmente implementado | No debe afirmarse como cierre total con Serwist; sí como estrategia funcional parcial con cola y sincronización. |

## Observaciones sobre la documentación 00–21

- La serie `docs/PROMPTS/00.md` a `docs/PROMPTS/21.md` es la única que:
  - declara explícitamente 22 documentos secuenciales,
  - cubre de forma modular el flujo completo,
  - y se presenta como bitácora de implementación.
- La serie `docs/Intrucciones_para_crear_app_web/DOC-*`:
  - es histórica,
  - no está completa en su numeración,
  - y el propio repositorio la trata como material no canónico cuando contradice los documentos principales.
- Para el libro, esto implica:
  - usar `docs/PROMPTS/00–21` como memoria técnica del desarrollo,
  - usar `DOC-*` solo como apoyo histórico o de contexto,
  - nunca como fuente de verdad frente a `docs/README.md`, `CERMONT_PRODUCT_BLUEPRINT.md`, `CERMONT_BUSINESS_FLOW_MAP.md` y `CERMONT_ARCHITECTURE_BLUEPRINT.md`.

## Estado actual de compilación y maquetación

- Compilación:
  - `xelatex -interaction=nonstopmode -halt-on-error -file-line-error main.tex` -> OK
  - Salida: `Libro/main.pdf`
  - Extensión actual: 165 páginas
- Sin errores críticos detectados en `main.log`
- Sin referencias ni citas indefinidas detectadas en `main.log`
- `latexmk` no disponible por falta de `perl` en MiKTeX
- Revisión visual puntual:
  - No se observaron desbordes evidentes de margen en las páginas muestreadas
  - La revisión visual exhaustiva de figuras y tablas sigue pendiente después de cada ronda fuerte de edición

## Próximo paso editorial recomendado

1. Reescribir primero los puntos de veracidad:
   - pregunta de investigación
   - objetivos
   - validación/piloto
   - stack offline
   - anexos
2. Reubicar ADR y consolidar una sección única de justificación del stack.
3. Construir tres matrices dentro del libro:
   - problema -> requisito -> módulo -> evidencia
   - objetivo -> capítulo -> evidencia -> estado
   - módulo real -> estado de implementación -> qué puede afirmarse
4. Reorganizar anexos para incorporar ATG, documentos CERMONT, serie 00–21 y evidencia funcional.

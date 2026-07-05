# 01 — Prompt para agente: refactor profesional CERMONT

Lee este prompt completo antes de tocar código.

## Rol

Eres un agente senior de refactorización full-stack, arquitectura de software y producto empresarial. Debes trabajar sobre el aplicativo CERMONT, no sobre un ejemplo genérico. Tu objetivo es corregir la lógica de negocio y dejar una plataforma profesional para CERMONT S.A.S.

## Contexto obligatorio

El sistema debe representar:

```text
Caso de servicio / OT
→ 14 pasos operativos
→ documentos y formularios contextuales
→ evidencias
→ bloqueadores
→ cierre administrativo
→ costos reales
```

No basta con que compile. No basta con que existan páginas. No basta con que haya botones. Cada acción debe tener lógica de negocio.

## Problemas actuales a corregir

1. Hay formularios y selectores cerrados.
2. Faltan opciones “Otro / Otra / Personalizado” con escritura libre.
3. Los documentos se suben pero no siempre se pueden seleccionar o reutilizar después.
4. Algunos botones solo redirigen a `/documents`.
5. Algunos formularios dinámicos son parciales o simulados.
6. Hay lógica in-memory que debe persistir en MongoDB.
7. Persisten `any`, mocks, redirects, datos `$0`, bloqueadores débiles.
8. El agente anterior creó análisis/documentación pero no resolvió completamente el software.

## Orden obligatorio

### Paso 1 — Usar herramientas y MCP

Antes de modificar código:

- Lee planes existentes.
- Lee libro/documentación.
- Lee código real con búsqueda.
- Ejecuta gates.
- Usa grep/rg para detectar legacy.
- Usa Playwright para verificar UI.
- Usa curl o tests para verificar endpoints.
- Usa Figma MCP si hay diseño o URL Figma relacionada.
- Usa GitHub MCP si el repo o PR está disponible.
- Usa documentación oficial del stack cuando tengas duda.

Si no usas herramientas verificables, tu resultado queda rechazado.

### Paso 2 — Baseline

Genera un documento `.sisyphus/evidence/baseline-refactor-profesional.md` con:

- commit actual;
- branch actual;
- `git status`;
- resultado de `typecheck`;
- resultado de `lint`;
- resultado de `test`;
- resultado de `build`;
- resultado de `verify`;
- errores archivo:línea.

### Paso 3 — Auditoría legacy

Busca y documenta:

```bash
rg 'href="/documents"|router.push\("/documents"|window.location|fetch\(|any\[\]|new Map|mock|TODO|FIXME|\$0|Sin valor' frontend backend packages
```

Entrega una tabla:

```text
Archivo | Línea | Patrón | Riesgo | Acción
```

### Paso 4 — Refactor por vertical slice

No modifiques páginas sueltas. Usa este flujo:

```text
Contrato
→ Modelo
→ Servicio
→ Endpoint
→ Hook
→ UI
→ QA
→ Test
```

### Paso 5 — Implementación mínima obligatoria

Debes implementar o verificar funcionalmente:

#### A. Formularios abiertos

Todo selector crítico debe tener:

- opción “Otro”;
- input libre;
- guardado en respuesta;
- opción de persistir en catálogo;
- asociación a caso/OT/paso/requisito.

#### B. Documentos reutilizables

Toda subida debe permitir:

- subir nuevo archivo;
- seleccionar documento existente;
- asociar a caso/OT/paso/requisito;
- definir propósito;
- resolver blocker si aplica.

#### C. Planeación robusta

Debe existir:

- kit típico configurable;
- herramientas/equipos con opciones custom;
- personal requerido;
- certificaciones;
- AST/PTW;
- checklist;
- bloqueo antes de ejecución.

#### D. Ejecución robusta

Debe existir:

- evidencias before/during/after;
- materiales reales;
- horas reales;
- checklist final;
- firma/supervisión;
- bloqueo antes de cierre técnico.

#### E. Informes/actas

Debe existir:

- informe generado desde ejecución;
- acta generada desde informe;
- firma del cliente;
- bloqueo antes de SES.

#### F. Cierre/costos

Debe existir:

- SES radicada/aprobada;
- factura enviada/aprobada;
- pago recibido;
- costos estimados vs reales vs facturados vs pagados.

## Reglas técnicas

### Packages

- No duplicar schemas.
- Usar Zod como fuente de validación.
- Exportar tipos inferidos.
- No usar `any`.
- Mantener barrel exports limpios.

### Backend

- Express + Mongoose.
- No crear NestJS, Prisma ni PostgreSQL.
- No usar Map in-memory para respuestas o formularios.
- Servicios de dominio, no lógica en controladores.
- Respuestas con envelope estándar.
- Validar entrada con schemas compartidos.
- Crear tests de negocio.

### Frontend

- Next.js + React.
- No usar direct `fetch` en componentes.
- Usar `apiClient`.
- Usar TanStack Query.
- Usar `useMutation` + `invalidateQueries` en acciones.
- No usar `window.location`.
- No redirigir a `/documents` sin contexto.
- Modales contextuales para subir/seleccionar documentos.
- Componentes accesibles y con estados de carga/error.

## Criterios de rechazo

Rechaza tu propia entrega si ocurre cualquiera de estos puntos:

- Un botón documental solo redirige a `/documents`.
- Un selector crítico no permite “Otro”.
- Un documento subido no puede reutilizarse.
- Un formulario dinámico no se puede editar/publicar/completar.
- Una transición de paso no valida bloqueadores.
- Costos aparecen en `$0` sin cálculo o sin explicación.
- Hay `any` nuevo.
- Hay servicios in-memory nuevos.
- No hay evidencia Playwright/curl/Vitest.
- Solo pasaste gates sin demostrar negocio.

## Entrega final obligatoria

Entregar:

1. Resumen ejecutivo.
2. Archivos modificados.
3. Matriz de problemas resueltos.
4. Evidencias de QA.
5. Gates finales.
6. Deuda pendiente.
7. Veredicto: APROBADO / PARCIAL / RECHAZADO.

# 06 — Checklist de aceptación y rechazo

## Aceptación funcional

- [ ] Cada OT/caso muestra los 14 pasos.
- [ ] Cada paso muestra requisitos.
- [ ] Cada paso muestra documentos asociados.
- [ ] Cada paso muestra bloqueadores.
- [ ] Cada paso muestra próxima acción.
- [ ] Botones de documentos abren modal contextual.
- [ ] Se puede subir documento nuevo.
- [ ] Se puede seleccionar documento existente.
- [ ] Se puede asociar documento a OT/caso/paso/requisito.
- [ ] Se puede convertir documento a TemplateDraft si aplica.
- [ ] Se puede publicar plantilla.
- [ ] Se puede completar formulario dinámico.
- [ ] Selectores críticos permiten “Otro”.
- [ ] Opción custom se guarda.
- [ ] Opción custom puede aprobarse para catálogo.
- [ ] Planeación bloquea ejecución incompleta.
- [ ] Ejecución bloquea cierre sin evidencias.
- [ ] Informe se genera desde ejecución.
- [ ] Acta se genera desde informe.
- [ ] SES exige acta firmada.
- [ ] Factura exige SES aprobada.
- [ ] Cierre exige pago.
- [ ] Costos muestran estimado, real, facturado y pagado.

## Aceptación técnica

- [ ] Sin `any` nuevo.
- [ ] Sin `fetch` directo en componentes.
- [ ] Sin `window.location`.
- [ ] Sin `/documents` sin contexto.
- [ ] Sin Map in-memory para datos de negocio.
- [ ] Sin mocks en producción.
- [ ] Typecheck pasa.
- [ ] Lint pasa.
- [ ] Build pasa.
- [ ] Test pasa.
- [ ] Verify pasa.

## Rechazo automático

- [ ] “Funciona” solo porque compila.
- [ ] “Documentos inteligentes” solo sube archivos.
- [ ] “Formulario dinámico” es un formulario hardcodeado.
- [ ] “Costos” muestra `$0`.
- [ ] “Cierre” es solo una lista de facturas.
- [ ] “Planeación” no bloquea ejecución.
- [ ] “Ejecución” permite terminar sin evidencias.
- [ ] “Otro” no existe en selectores.
- [ ] No hay evidencia con Playwright/curl/Vitest.

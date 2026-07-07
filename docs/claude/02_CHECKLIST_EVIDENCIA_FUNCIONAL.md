# 02 — Checklist de evidencia funcional CERMONT

Usar este checklist antes de decir que la refactorización quedó completa.

## A. Arquitectura contract-first

- [ ] Cada módulo nuevo empieza en `packages/shared-types`.
- [ ] No hay tipos duplicados en frontend/backend.
- [ ] Cada schema Zod tiene tipo inferido.
- [ ] Cada endpoint valida entrada con schema compartido.
- [ ] Cada frontend form usa el mismo contrato.

## B. Cockpit 14 pasos

- [ ] Existe endpoint `GET /api/service-cases/:id/cockpit`.
- [ ] Devuelve los 14 pasos.
- [ ] Devuelve paso actual.
- [ ] Devuelve blockers.
- [ ] Devuelve nextActions.
- [ ] Devuelve documentos/evidencias/costos/cierre.
- [ ] UI muestra los 14 pasos sin ocultarlos.

## C. Documentos inteligentes

- [ ] Subida con contexto de OT/caso/paso/requisito.
- [ ] Biblioteca permite seleccionar documento existente.
- [ ] Documento puede asociarse a varios pasos si aplica.
- [ ] Excel genera campos candidatos.
- [ ] PDF/Word generan TemplateDraft revisable.
- [ ] Estado de procesamiento visible.
- [ ] Error de extracción visible y recuperable.

## D. Formularios dinámicos

- [ ] Builder permite editar campos.
- [ ] Permite opciones personalizadas.
- [ ] Permite “Otro, ¿cuál?”.
- [ ] Permite tablas repetibles.
- [ ] Permite firma/foto/GPS/archivo.
- [ ] Permite publicar versión.
- [ ] Permite llenar respuesta asociada a OT/paso.

## E. Planeación

- [ ] Herramientas requeridas.
- [ ] Equipos requeridos.
- [ ] Personal requerido.
- [ ] Certificaciones vigentes.
- [ ] AST/PTW/documentos.
- [ ] Kits por tipo de servicio.
- [ ] Bloqueo antes de ejecutar.

## F. Ejecución

- [ ] Sesión no inicia si planeación está bloqueada.
- [ ] Registro de materiales reales.
- [ ] Registro de horas reales.
- [ ] Evidencia antes/durante/después.
- [ ] Checklist final.
- [ ] Cierre técnico bloqueado si faltan evidencias.

## G. Informes y actas

- [ ] Informe se genera desde ejecución.
- [ ] Informe arrastra fotos/materiales/horas/responsables.
- [ ] Acta se genera desde informe aprobado.
- [ ] Acta permite firma cliente.
- [ ] Sin acta firmada no hay SES.

## H. Cierre administrativo

- [ ] SES solo desde acta firmada.
- [ ] Factura solo desde SES aprobada.
- [ ] Pago solo desde factura aprobada.
- [ ] Cierre definitivo solo con pago confirmado.
- [ ] Hay alertas de vencimiento.
- [ ] Hay historial de responsable/fecha/soporte.

## I. Costos

- [ ] Propuesta tiene valor > 0.
- [ ] Costos reales vienen de ejecución.
- [ ] Incluye MO/materiales/equipos/AIU/impuestos.
- [ ] Muestra facturado y pagado.
- [ ] Calcula margen estimado vs real.
- [ ] Alerta sobrecostos.

## J. Gates

- [ ] `npm run typecheck` pasa.
- [ ] `npm run lint` pasa.
- [ ] `npm run test` pasa.
- [ ] `npm run build` pasa.
- [ ] `npm run verify` pasa.
- [ ] React Doctor sin issues críticos.

## K. Evidencia mínima

- [ ] Screenshots Playwright.
- [ ] Salidas curl.
- [ ] Logs de gates.
- [ ] Matriz de planes.
- [ ] Matriz de deuda legacy.
- [ ] Diff revisado.

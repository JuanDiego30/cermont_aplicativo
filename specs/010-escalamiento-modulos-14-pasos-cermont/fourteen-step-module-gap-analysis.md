# Análisis de brechas del flujo de 14 pasos

## Fuente de secuencia

La secuencia se toma del LTG verificado `C:\Users\camil\Downloads\LTG_JUAN_DIEGO_AREVALO-3_markdown.md`, sección 1.2. El LTG modela evidencia dentro de ejecución y enumera informe como paso 7; la documentación canónica vigente del repositorio explicita evidencia como paso 7 y desplaza informe/acta/firma. Esta spec conserva las 14 etapas operativas del `AGENTS.md` y registra la diferencia semántica, sin crear una entidad adicional.

| Paso | Entidad/capacidad | Evidencia física actual | Brecha verificable | Slice |
|---:|---|---|---|---|
| 1 | WorkRequest | módulo, modelo, schema, páginas list/detail/new | validar canal, SLA, adjuntos FileAsset y offline E2E | 03 |
| 2 | SiteVisit | módulo, modelo, schema, páginas list/detail/new | consolidar mediciones, fotos, hallazgos y sync | 03 |
| 3 | Proposal | módulo, modelo, schema, páginas | validar versión, impuestos, margen y aprobación portal | 03/12 |
| 4 | PurchaseOrder | módulo, modelo, schema, páginas | validar PO contra propuesta/monto y autorización de ejecución | 03 |
| 5 | PlanningPacket | módulo, modelo, domain rule, páginas | eliminar doble autoridad de readiness y validar kits/certificados/documentos | 04/09 |
| 6 | ExecutionSession | módulo, modelo, schema, páginas y sync | comprobar inicio/pausa/fin offline, idempotencia y cola visible | 05 |
| 7 | Evidence | módulo, modelo, FileAsset, páginas | completar FSM de revisión/reemplazo/lock y binarios offline | 06 |
| 8 | TechnicalReport | módulos `technical-report` y `report`, páginas | versionar, usar solo evidencia válida y evitar recaptura | 07 |
| 9 | DeliveryRecord | módulo/modelo/páginas | acta inmutable derivada del informe y aceptación trazable | 07 |
| 10 | ClientSignature | módulo/modelo/UI de firma | consentimiento, ownership y vínculo exacto al acta | 07 |
| 11 | ServiceEntrySheet / SES approval | módulo/modelo y páginas billing | gate desde acta firmada; Ariba real permanece integración externa | 08 |
| 12 | InvoiceTracking | módulo/modelo y páginas billing | aging y soportes; no declarar emisión DIAN certificada | 08 |
| 13 | InvoiceApproval | schema y páginas approve | rechazo/reenvío, ownership y auditoría E2E | 08 |
| 14 | PaymentRecord / closure | módulo/modelo/páginas | conciliación, comprobante y cierre administrativo inmutable | 08 |

## Cinco fallas del LTG y respuesta esperada

| Falla LTG | Evidencia del LTG | Respuesta técnica | Estado provisional |
|---|---|---|---|
| Planeación manual/incompleta | §1.3.1 | kits por servicio, vigencias, readiness y gate | base implementada; validación integral pendiente |
| Campo/evidencias dispersas | §1.3.2 | PWA, checklists offline, metadatos y FileAsset | parcial; binarios/E2E requieren cierre |
| Recaptura en informes/actas | §1.3.3 | documentos desde datos estructurados y evidencias | base implementada; flujo E2E pendiente |
| Cierre administrativo fragmentado | §1.3.4 | timeline de acta→SES→factura→pago | base implementada; E2E pendiente |
| Costos reales no centralizados | §1.3.5 | propuesta vs real, margen, desviación y alertas | módulo avanzado presente; validar con datos reales |

## Reglas de continuidad

- Ningún paso avanza si faltan permisos, datos mínimos o documentos obligatorios del anterior.
- Las excepciones deben ser explícitas, justificadas y auditadas.
- El cockpit es read model; no sustituye modelos ni reglas de los módulos fuente.
- Los indicadores de mejora permanecen “por medir” hasta un piloto con órdenes reales, conforme al LTG §7.4 y §8.13.


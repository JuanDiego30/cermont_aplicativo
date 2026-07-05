# Extracción de requerimientos LTG

## Fuente y discrepancia de nombre

El prompt referencia `LTG_JUAN_DIEGO_AREVALO-3_markdown(4).md`. Ese nombre no existe, pero se verificó la fuente académica correspondiente en:

`C:\Users\camil\Downloads\LTG_JUAN_DIEGO_AREVALO-3_markdown.md`

SHA-256: `BB3197F8C035E25AA7615E98AB9DFD0E896F94E0B231F77E815FE39272E75A64`.

Título: *Desarrollo de un aplicativo web para la gestión de órdenes de trabajo, trazabilidad y cierre administrativo de procesos operativos en CERMONT S.A.S.* No se usaron como sustituto los archivos ATG de otro tema.

## Flujo real de 14 pasos (§1.2)

| Paso | Etapa LTG | Entidad digital LTG | Mapeo actual |
|---:|---|---|---|
| 1 | Solicitud formal | WorkRequest | `work-requests` |
| 2 | Visita técnica | SiteVisit | `site-visit` / frontend `site-visits` |
| 3 | Propuesta económica | Proposal | `proposal` |
| 4 | Aprobación con PO | PurchaseOrder | `purchase-order` |
| 5 | Planeación | PlanningPacket | `planning-packet` |
| 6 | Ejecución | ExecutionSession | `execution-session`; evidencia se modela además como módulo transversal/etapa canónica |
| 7 | Informe técnico | TechnicalReport | `technical-report` / `report` |
| 8 | Acta de entrega | DeliveryRecord | `delivery-record` |
| 9 | Acta firmada | ClientAcceptance | `client-signature` + DeliveryRecord |
| 10 | SES / Ariba | ServiceEntrySheet | `service-entry-sheet` |
| 11 | SES aprobada | SESApproval | transición del módulo SES |
| 12 | Factura | InvoiceTracking | `invoice` |
| 13 | Aprobación factura | InvoiceApproval | transición/contrato invoice approval |
| 14 | Pago | PaymentRecord | `payment` |

El LTG exige que cada transición esté respaldada por datos/evidencias, permisos RBAC y el paquete documental del paso anterior. La documentación canónica del repositorio explicita Evidence como paso 7; la diferencia se conserva como mapeo semántico, no como duplicación.

## Matriz de requisitos

| Sección LTG | Requisito | Módulo afectado | Prioridad | Implementación/validación propuesta |
|---|---|---|---|---|
| §1.3.1 | Kits por actividad con herramientas, equipos, materiales, EPP y documentos | Planning/Kit | P0/P1 | readiness server-authoritative y kit versionado |
| §1.3.1 | Validar vigencia de acreditaciones e instrumentos | Planning/User/Fleet/Tool | P0/P1 | blockers estructurados y pruebas de expiración |
| §1.3.2 | Checklists digitales tolerantes a conectividad variable | Execution/Checklist/Sync | P1 | IndexedDB, idempotencia y E2E offline |
| §1.3.2 | Evidencias vinculadas a orden con metadatos/trazabilidad | Evidence/FileAsset | P0/P1 | FileAsset SSOT, owner/fase/tiempo/GPS status |
| §1.3.3 | Informes/actas desde datos estructurados | Report/DeliveryRecord | P1 | preview, versión y evidencia válida |
| §1.3.3 | Evitar recaptura manual completa | Reports/Documents | P1 | herencia de datos y pruebas de contenido PDF |
| §1.3.4 | Panel del estado acta→SES→factura→pago | Cockpit/Closure | P1 | read model y timeline por orden |
| §1.3.4 | Conectar áreas técnica y administrativa | ServiceCase/Notifications | P1 | next actions, blockers y eventos auditados |
| §1.3.5 | Vincular presupuesto, ejecución, costo real y facturación | Proposal/Cost/Invoice | P1 | fórmula única, margen/desviación/alerta |
| §1.8 | Atender siete perfiles: gerente, residente, supervisor, técnico/operador, HES, administrativo y cliente corporativo | RBAC/UI | P0 | roles/permisos desde `@cermont/domain`, pruebas negativas |
| §1.10 | Cada módulo debe responder a una falla real | Arquitectura | P0 | impact map y trazabilidad requisito→módulo→test |
| §1.12 | Distinguir implementado, parcial y futuro | Documentación/QA | P0 | estados explícitos; no equiparar archivos con madurez |
| §2.16 | Mantenibilidad, seguridad, usabilidad, conectividad y auditabilidad | Transversal | P0/P1 | modularidad, RBAC, estados UI, PWA y audit log |
| §4.1/§4.8/§4.11 | Finalidad, consentimiento, acceso restringido, consulta y seguridad de datos | Privacy/Auth/Audit | P0/P1 | consentimiento trazable, privacy request y ownership |
| §4.2/§4.11 | Conservar controles SG-SST/EPP y revisión HES | Planning/Checklist | P1 | plantillas versionadas y aprobación HES |
| §4.3 | Proveer información base; no afirmar emisión DIAN certificada | Invoice/DIAN | P1 | límite de producto visible y contratos de integración |
| §4.5/§4.10 | Trazabilidad técnica aplicable a RETIE y normas sectoriales | Reports/Evidence | P1 | documento/actividad/evidencia vinculados |
| §4.6/§4.13 | Confidencialidad contractual y de evidencias | Files/Portal/Auth | P0 | autorización de owner, descarga y auditoría |
| §5.8 | Flujo Contract-First | Todos | P0 | schema→domain→backend→frontend→tests→docs |
| §5.9 | Compuertas de calidad por iteración | QA | P0 | gates completos por slice |
| §6.1.1/§6.9 | Offline es parcial por corte; no afirmar cobertura total | PWA/Sync | P0/P1 | matriz de capacidades y E2E por formulario/binario |
| §7.4 | No inventar mejoras cuantitativas | Analytics/Docs | P0 | métricas operativas solo tras piloto |
| §8.11 | Validar planeación, evidencia, informe, cierre y costos desde fallas | QA/E2E | P1 | escenarios críticos del `test-plan.md` |
| §8.12 | Validación por rol | QA/RBAC | P1 | checklist/UAT por perfil con evidencia |
| §8.13 | Piloto: roles, órdenes, planeación, evidencia, informes, cierre y conectividad sin pérdida | Release | P1 | piloto controlado antes de afirmar impacto |
| §10.2 | Backup separado con retención mínima recomendada de 30 días y recuperación | SRE | P0 | política, job, restore drill y evidencia |
| §10.2 | E2E con Playwright en flujos críticos | QA | P1 | suite por rol y mobile/offline |
| §10.3 | Formularios dinámicos con revisión humana | Documents/Templates | P2 | import→extract→review→publish |
| §10.3 | Integraciones SIIGO/Ariba después de consolidar base | ERP connectors | P2 | proyecto separado, contratos y sandbox |

## Cinco fallas críticas (§1.3)

1. Planeación dependiente de memoria y sin kits/vigencias centralizados.
2. Ejecución con formatos físicos, fotos dispersas y conectividad inestable.
3. Recaptura y retrasos en informes/actas.
4. Seguimiento fragmentado de SES, factura y pago.
5. Ausencia de control centralizado de costos reales frente a propuesta.

## Actores (§1.8)

- Gerente: estado agregado y rentabilidad.
- Residente: planeación, personal y recursos.
- Supervisor: ejecución y revisión de evidencias.
- Técnico/operador: captura ágil y offline.
- HES: checklists, EPP y trazabilidad de seguridad.
- Administrativo: documentos y cierre.
- Cliente corporativo: estado y documentos propios.

## Criterios de rigor

- No afirmar que una capacidad está completa sin evidencia técnica.
- No afirmar mejoras porcentuales, ahorro o ROI sin piloto medido.
- No presentar seguimiento de facturas como software DIAN certificado.
- No presentar registro SES como integración Ariba.
- No presentar firma capturada como firma criptográfica PKI.
- Mantener la documentación viva y registrar diferencias entre LTG, docs y código.

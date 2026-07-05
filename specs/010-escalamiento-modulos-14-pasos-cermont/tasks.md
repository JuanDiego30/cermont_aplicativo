# Tasks — Spec 010 Escalamiento 14 pasos

## Convención

- `[x]`: verificado con evidencia en esta spec.
- `[ ]`: pendiente o requiere revalidación integral.
- La existencia física de código no equivale a tarea completada.

## P0 Foundation

- [x] **T282** Crear suite documental Spec 010.
- [ ] **T283** Ejecutar baseline completo sobre un checkpoint sin cambios concurrentes.
- [x] **T284** Extraer requisitos del LTG verificado y registrar la discrepancia de nombre “(4)”.
- [x] **T285** Crear `module-maturity-matrix.md` con evidencia estática y límites.
- [x] **T286** Crear `ui-page-content-blueprint.md`.
- [x] **T287** Crear `data-field-expansion-plan.md`.
- [ ] **T288** Corregir y revalidar gates P0 del delta completo.

## P1 — 14 pasos

- [ ] **T289** Verificar ServiceCase Cockpit end-to-end y cerrar brechas de estados/RBAC/offline.
- [ ] **T290** Robustecer WorkRequest.
- [ ] **T291** Robustecer SiteVisit.
- [ ] **T292** Robustecer Proposal.
- [ ] **T293** Robustecer PurchaseOrder.
- [ ] **T294** Hacer Planning Readiness server-authoritative.
- [ ] **T295** Completar Execution Field Mode.
- [ ] **T296** Completar Evidence FSM y bloqueo por uso documental.
- [ ] **T297** Completar TechnicalReport/DeliveryRecord/ClientSignature.
- [ ] **T298** Completar SES/Invoice/InvoiceApproval/Payment/Closure.

## P1 — Módulos de soporte

- [ ] **T299** Consolidar Fleet GMAO.
- [ ] **T300** Consolidar Tools/Assets GMAO y resolver dualidad `Tool`/`Resource`.
- [ ] **T301** Verificar Checklists Blocking Engine en cierre real.
- [ ] **T302** Verificar Dashboard Operating System por rol.
- [ ] **T303** Verificar Cost Intelligence y alertas idempotentes.

## P2 — Innovación

- [ ] **T304** Validar Automation Rules MVP, outbox, auditoría y acciones bloqueantes.
- [ ] **T305** Implementar Digital Twin como read model del caso.
- [ ] **T306** Implementar AI Copilot seguro con revisión humana.
- [ ] **T307** Implementar QR/NFC de activos sobre contratos existentes.
- [ ] **T308** Profesionalizar formularios dinámicos versionados.

## P3 — SaaS

- [ ] **T309** Aprobar ADR del modelo tenant y estrategia de migración.
- [ ] **T310** Alinear feature flags existentes con alcance por tenant.
- [ ] **T311** Completar portal cliente con ownership y pruebas negativas.
- [ ] **T312** Cerrar reporte final después de gates y smoke tests autorizados.

## Orden recomendado inmediato

1. Congelar checkpoint y ejecutar T283/T288.
2. Auditar T289 contra el endpoint y cockpit existentes.
3. Ejecutar T294 → T295 → T296 → T297 → T298.
4. Revalidar T299–T304 antes de activar P2.

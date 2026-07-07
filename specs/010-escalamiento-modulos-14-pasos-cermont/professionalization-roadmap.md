# Roadmap de profesionalización

## P0 — Estabilización y confianza

**Condición de salida:** gates raíz verdes, FileAsset SSOT, seguridad/RBAC sin regresión, baseline reproducible y LTG reconciliado.

- Cerrar deuda de rutas/mapas y contratos.
- Unificar readiness de planeación/activos en backend.
- Resolver dualidad de ownership Tool/Resource.
- Completar E2E de sincronización y archivos binarios críticos.
- Revalidar restauración de backups y observabilidad.

## P1 — Operación profesional de 14 pasos

**Condición de salida:** cada paso tiene contrato, transición, evidencia, responsable, permiso, auditoría y pruebas de camino feliz/negativo.

- Cockpit y secuencia 14 pasos.
- Planeación/readiness → ejecución offline → evidencia.
- Informe → acta → firma.
- SES → factura → aprobación → pago → cierre.
- Checklists, GMAO, costos y dashboard orientado a acciones.
- Piloto controlado por roles, sin inventar indicadores.

## P2 — Diferenciación controlada

**Condición de entrada:** P0/P1 estables y datos históricos suficientes.

- Automation Rules con outbox, idempotencia, límites de loop y auditoría.
- Digital Twin como read model del caso.
- AI Copilot seguro: borradores/recomendaciones, revisión humana, evaluación y trazabilidad.
- QR/NFC para activos.
- Formularios dinámicos: importación → extracción → revisión humana → versión publicada.
- Integraciones SIIGO/Ariba solo mediante proyectos dedicados y contratos aprobados.

## P3 — SaaS comercializable

**Condición de entrada:** ADR de tenancy aprobado y pruebas de aislamiento listas.

- Modelo de tenant, estrategia de migración y claves/índices compuestos.
- Branding, configuración y feature flags por tenant.
- Roles y auditoría por tenant.
- Portal con ownership estricto.
- Medición SLO, soporte, backup/restore y rollback por release.

## Métricas permitidas

Hasta ejecutar piloto real, reportar solo mediciones técnicas reproducibles. Tiempo de planeación, tiempo de cierre, completitud documental, trazabilidad de evidencias y satisfacción de usuarios permanecen “por medir con evidencia”, conforme al LTG §7.4.


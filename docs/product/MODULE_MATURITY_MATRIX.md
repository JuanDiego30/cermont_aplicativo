# Module Maturity Matrix - CERMONT

**Spec:** `003-profesionalizacion-cermont`  
**Fecha:** 2026-06-24

Niveles:

```txt
0 inexistente
1 basico
2 funcional
3 profesional
4 avanzado
5 diferencial
```

| Modulo | Nivel actual | Brecha principal | Prioridad |
|---|---:|---|---|
| Dashboard/KPIs | 2 | KPIs accionables, SLA, tendencias y readiness | P2 |
| Ordenes | 2 | SLA, bloqueos, tiempos reales, timeline y doble cierre | P2 |
| Solicitudes | 2 | Catalogo de servicios y SLA por tipo | P2 |
| Visitas tecnicas | 2 | Checklist/evidencia/reportabilidad profesional | P2 |
| Propuestas | 2 | Baseline de costo y aprobacion trazable | P2 |
| Planeacion | 2 | Readiness de recursos y gates de seguridad | P2 |
| Recursos | 2 | Historial, responsable, fotos y documentos | P2 |
| Herramientas | 2 | Tags, checkout, calibracion y bloqueos | P2 |
| Vehiculos/flota | 2 | Vencimientos, odometro, inspeccion y readiness | P2 |
| Evidencias | 3 | Consentimiento, retencion y auditoria descarga | P1/P2 |
| Camara | 2 | Gate de consentimiento y offline field mode | P1/P2 |
| Documentos/PDF | 3 | Retencion por tipo y lock si soporta informe | P1/P2 |
| Checklists | 2 | Versionado, bloqueantes, foto y firma | P2 |
| Mantenimiento | 2 | Logs, responsable y next due date | P2 |
| Informes | 2 | Generacion con evidencias aprobadas | P2 |
| Actas | 2 | Firma, retencion y trazabilidad administrativa | P2 |
| SES | 2 | Integridad acta->SES->factura | P2 |
| Facturacion | 2 | Revalidacion contra SES y costos | P2 |
| Pagos | 2 | Cartera, comprobante y cierre de caso | P2 |
| Notificaciones | 2 | Vencimientos, asignaciones, SLA y digest | P2 |
| Offline/PWA | 3 | Cobertura desigual por modulo | P2 |
| Auditoria | 3 | Descargas, consentimientos y eventos legales | P1 |
| Usuarios/RBAC | 3 | Matriz real por endpoint/ruta y tests | P1 |
| Legal/privacidad | 1 | Consentimientos, derechos titular y retencion | P1 |
| Seguridad | 2 | ASVS, CSP, rate limits, archivos y CORS/cookies | P1 |
| Derechos autor/atribucion | 0 | AUTHORS, NOTICE, COPYRIGHT, acerca de y licencias | P1 |

## Prioridad ejecutiva

1. Seguridad/calidad.
2. Legal/privacidad.
3. Derechos de autor/licencias.
4. Evidencias/documentos/camara.
5. Activos/herramientas/flota.
6. Ordenes/service cases, dashboard y notificaciones.
7. CI/CD, tests, observabilidad y operacion.

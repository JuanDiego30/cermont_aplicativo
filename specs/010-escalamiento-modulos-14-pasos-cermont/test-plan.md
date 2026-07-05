# Plan de pruebas — Spec 010

## Estrategia por capa

| Capa | Propósito | Evidencia mínima |
|---|---|---|
| Shared contracts | aceptar/rechazar payloads y compatibilidad | tests Zod por schema y snapshots contractuales |
| Domain | transiciones, readiness, costos, bloqueos | unit tests puros con casos límite |
| Backend services | autoridad, idempotencia, auditoría | tests de servicio/modelo con mocks controlados o DB de test |
| API integration | auth, RBAC, validación, status/error | Supertest por endpoint crítico |
| Frontend components | estados y acciones accesibles | Testing Library sin mock productivo |
| Offline | persistencia, reintento, deduplicación | tests IndexedDB/sync y reconexión |
| E2E | historia completa por rol | Playwright desktop/mobile y escenarios negativos |
| Security | ownership, archivos, rate limits, secretos | diff scan + pruebas API + revisión manual |

## Escenarios críticos

1. WorkRequest → visita → propuesta → PO conserva vínculos y bloquea PO inválida.
2. Planeación no aprueba con recurso, certificado, documento o checklist crítico faltante.
3. Ejecución offline reintenta sin duplicar sesiones/checklists/evidencias.
4. Evidencia rechazada exige motivo; reemplazo conserva trazabilidad; evidencia usada por informe queda protegida.
5. Informe usa datos y evidencias válidas de la misma orden.
6. Acta no se genera sin informe aprobado y firma no cruza clientes/casos.
7. SES no avanza sin acta firmada; factura no avanza sin SES aprobada; pago no avanza sin factura aprobada.
8. Cierre falla si hay checklist, evidencia, documento o conciliación pendiente.
9. Costos mantienen signo y moneda; 80%/100% disparan exactamente una alerta/evento esperado.
10. Automatización no ejecuta dos veces la misma acción y no crea loops.
11. Portal niega acceso a casos/documentos de otro cliente.
12. Archivos validan tipo/tamaño/owner y no permiten traversal ni acceso por ID ajeno.

## Matriz de estados UI

Para dashboard, cockpit, planificación, ejecución, evidencias, cierre, costos, activos y portal probar: loading, error recuperable, empty accionable, offline/graceful degradation y forbidden.

## Gates por slice

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
```

## Gates adicionales de release

- Playwright de flujo crítico contra entorno controlado.
- Auditoría de API/OpenAPI solo si el documento OAS cubre las rutas reales.
- Security diff scan sin hallazgos altos/críticos abiertos.
- Backup y prueba de restauración.
- Smoke tests y plan de rollback documentado.

## Criterio piloto del LTG

Usuarios/roles correctos, órdenes sin errores críticos, planeación asociada, evidencia vinculada, informes generados sin recaptura completa, soportes de cierre asociados, SES/factura consultables y ausencia de pérdida de información en los escenarios offline definidos. Las mejoras porcentuales requieren medición real.


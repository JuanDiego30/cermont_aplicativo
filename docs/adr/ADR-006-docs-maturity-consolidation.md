# ADR-006: Maduración y Consolidación Documental

## Estado: Aceptado

## Contexto

La documentación del proyecto CERMONT se encontraba fragmentada en:
1. Seis versiones de planes maestros (v3→v6.1) sin deprecación explícita ni trazabilidad entre versiones
2. La tesis fuente (requisitos de negocio) duplicada en dos archivos con diferente calidad de conversión
3. 20 archivos fuente sin clasificación ni jerarquía clara
4. Los formatos operativos PDF (CCTV, lifelines, planeación) sin mapeo a schemas Zod
5. El organigrama empresarial real sin validación contra el RBAC del sistema
6. El requisito de modo offline documentado en observaciones de anteproyecto pero no formalizado como bloque contractual

## Decisión

Se ejecutó un proceso de maduración documental en 9 fases (F1-F9):

1. **F1 — Deduplicación de tesis**: LTG seleccionada como canónica; 01_main10 archivada como duplicado
2. **F2 — Consolidación de planes**: 6 planes → 1 `CERMONT_MASTERPLAN.md`
3. **F3 — Archivado con deprecación**: Todos los planes v3→v6.1 archivados con headers de deprecación
4. **F4 — Matriz de trazabilidad**: Requisitos atómicos extraídos de la tesis y mapeados a módulos
5. **F5 — Mapeo de formatos operativos**: Campos de formatos PDF listados con estado GAP vs schemas Zod
6. **F6 — RBAC vs organigrama**: Cargos reales mapeados contra roles del sistema
7. **F7 — Auditoría de código**: Inventario real vs CERMONT_CODIGO.json
8. **F8 — Offline contractual**: Requisito offline formalizado como bloque contractual prioritario
9. **F9 — ADRs complementarios**: Este ADR documenta el proceso

## Consecuencias

### Positivas
- Una sola fuente de verdad para el plan maestro (`docs/plans/CERMONT_MASTERPLAN.md`)
- La tesis canónica tiene un solo punto de referencia (`docs/requirements/THESIS_CANONICAL.md`)
- Todos los planes anteriores son recuperables pero no confundibles con el vigente
- Las contradicciones entre fuentes están documentadas en `CONFLICTS_LOG.md` sin resolver unilateralmente
- El requisito offline tiene peso contractual explícito

### Negativas
- La verificación contra código real (estados "PENDIENTE VERIFICAR") requiere ejecución de comandos
- El mapeo de formatos operativos a schemas Zod identificó ~91 campos sin schema (gaps reales)
- `CERMONT_CODIGO.json` requiere actualización manual

## Referencias
- `docs/REGLAS_DESARROLLO_CERMONT.md` (SSOT, DRY, KISS)
- `docs/plans/CERMONT_MASTERPLAN.md`
- `docs/requirements/CONFLICTS_LOG.md`
- `docs/domain/CERMONT_OPERATIONAL_FORMS.md`
- `docs/domain/CERMONT_ORG_CHART_VS_RBAC.md`

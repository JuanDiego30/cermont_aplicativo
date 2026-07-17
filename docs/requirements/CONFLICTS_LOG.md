# Conflictos y Decisiones Pendientes

> **Propósito:** Documentar contradicciones entre fuentes y decisiones pendientes de resolución humana.
> **NUNCA resolver unilateralmente — marcar como PENDIENTE y referenciar aquí.

---

## DECISIÓN PENDIENTE: Propósito de la Inducción SGSST (02_INDUCCION_SGSST3.md)

**Archivo fuente:** `.sisyphus/plans/02_INDUCCION_SGSST3.md` (49 páginas)
**Documento:** Inducción y Reinducción HES — CERMONT S.A.S.
**Contenido:** Historia empresarial, misión, visión, políticas HES, normativa SGSST.

### Opciones

**Opción A — Contenido consultable en el sistema:**
- Crear módulo `training` o `induction` con este contenido como material de consulta para nuevos empleados
- Trade-off: agrega scope no mencionado en las 5 fallas críticas de la tesis

**Opción B — Solo referencia documental (no se integra al sistema):**
- Mover a `docs/reference/SGSST_INDUCTION_INDEX.md` como material de contexto de dominio HES
- Trade-off: 49 páginas de contenido HES quedan sin uso funcional

**Opción C — Extraer solo los checklist/formatos operativos embebidos:**
- Revisar si el documento contiene formatos de inspección reutilizables
- Mapear esos formatos específicos a `CERMONT_OPERATIONAL_FORMS.md`

**Recomendación del sistema:** Opción C, luego evaluar B para el resto — requiere confirmación del Product Owner.
**Estado:** PENDIENTE DE DECISIÓN HUMANA

---

## DECISIÓN PENDIENTE: Tesis Duplicada Resuelta

**Estado:** RESUELTA — LTG seleccionada como canónica por decisión del equipo ("si el ltg es la version mas nueva").
**Archivo:** `docs/requirements/THESIS_CANONICAL.md`
**Duplicado archivado:** `docs/requirements/archive/THESIS_DUPLICATE.md`
**Sin contradicción de contenido:** Ambos documentos son la misma tesis, difieren solo en calidad de conversión.

---

## POSIBLE CONFLICTO: Número de Sprints

**Fuente A:** v3 — 16 Waves (Wave 0 a Wave 16)
**Fuente B:** v4 — 12 Sprints
**Fuente C:** v5 — 12 Sprints (S0-S11)
**Fuente D:** v6 — 18 Sprints (S0-S17)
**Fuente E:** v6.1 — 18 Sprints (S0-S17) + Apéndices

**Resolución en masterplan:** Se adoptó la estructura de 18 sprints de v6.1 por ser la más granular y la versión más reciente.
**Estado:** RESUELTA en `docs/plans/CERMONT_MASTERPLAN.md`

---

## POSIBLE CONFLICTO: Número de Módulos

**Fuente A:** v4 — Auditoría de 59 módulos backend, 48 frontend
**Fuente B:** v6/v6.1 — 25 módulos funcionales

**Resolución en masterplan:** Los 25 módulos de v6.1 representan la organización funcional (orientada a negocio). Los 59 de v4 son la organización técnica (orientada a archivos). No hay contradicción real — son perspectivas diferentes.
**Estado:** RESUELTA — documentada como "visión funcional" vs "visión técnica"

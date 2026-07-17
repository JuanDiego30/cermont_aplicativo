# ADR-003: Metodología Contract-First

**Estado:** Aceptado

**Contexto:**
El sistema tiene 111 schemas Zod compartidos entre frontend y backend. Sin una metodología
que ponga los contratos primero, se duplican validaciones, tipos y reglas de negocio.
El código existente mostraba casos de lógica duplicada entre capas al no tener un flujo
obligatorio que forzara la definición del contrato antes de la implementación.

**Decisión:**
El flujo obligatorio por cada entidad nueva es:
Schema Zod (packages/shared-types/) -> Tipo inferido (z.infer) -> Reglas de dominio
(packages/domain/) -> Modelo Mongoose -> Servicio -> Controlador -> Ruta ->
API service frontend -> Query keys -> Hook TanStack Query -> UI -> Pagina -> Tests

Prohibiciones:
- No crear modelo Mongoose sin schema Zod primero
- No crear endpoint sin schema de validacion
- No crear componente sin hook TanStack Query tipado
- Actualizar snapshot de contrato ante cada cambio de schema

**Consecuencias:**
- Positivas: Type-safety de punta a punta, contrato unico verificable
- Positivas: Los snapshots de contrato detectan cambios no autorizados
- Negativas: Overhead inicial para entidades simples
- Negativas: Requiere regenerar snapshot tras cada cambio de schema

**Referencias:**
- docs/REGLAS_DESARROLLO_CERMONT.md
- .sisyphus/plans/cermont_documento_metodologia_modular_contract_first.md
- docs/plans/CERMONT_MASTERPLAN.md (Seccion: Metodologia Contract-First)

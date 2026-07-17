# ADR-004: RBAC Single Source of Truth en @cermont/domain

**Estado:** Aceptado

**Contexto:**
El sistema tiene 15 roles definidos con jerarquia numerica (0=gerente, 14=cliente).
Sin una fuente unica de verdad, los roles se hardcodean en multiples archivos
(rutas, componentes, middlewares), creando inconsistencia entre capas y riesgo
de seguridad por roles mal escritos o desactualizados.

**Decision:**
El archivo packages/domain/src/roles.ts es la UNICA fuente de verdad para:
- Definicion de roles (UserRole type)
- Grupos funcionales (ADMIN_ROLES, FIELD_EXECUTION_ACCESS_ROLES, etc.)
- Jerarquia de roles (ROLE_HIERARCHY)
- Etiquetas visibles al usuario (ROLE_LABELS)
- Normalizacion de roles (normalizeUserRole)
- Constantes de rol (CERMONT_ROLES)

Toda referencia a un rol en el codigo DEBE usar las constantes de roles.ts.
Prohibido usar strings literales como "gerente" o "manager" en rutas o componentes.

**Consecuencias:**
- Positivas: Un solo cambio en roles.ts actualiza todo el sistema
- Positivas: TypeScript valida que los roles existen en tiempo de compilacion
- Positivas: La jerarquia permite el middleware authorizeMinimum()
- Negativas: Requiere importar roles.ts en cada archivo que los use

**Referencias:**
- packages/domain/src/roles.ts (SSOT verificado)
- docs/domain/CERMONT_ORG_CHART_VS_RBAC.md

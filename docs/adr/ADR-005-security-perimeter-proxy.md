# ADR-005: Perimetro de Seguridad Unico en proxy.ts

**Estado:** Aceptado

**Contexto:**
Next.js ofrece middleware.ts para interceptar requests, pero este se ejecuta en Edge
Runtime y no tiene acceso completo a Node.js APIs ni puede realizar verificaciones
complejas de JWT contra la base de datos. El perimetro de seguridad debe ser un punto
unico de control antes de llegar al backend.

**Decision:**
El archivo frontend/proxy.ts es el UNICO punto de control de seguridad perimetral:
- Valida JWT en cada request a /api/backend/*
- Verifica RBAC contra los roles del usuario autenticado
- Aplica rate limiting (configurable por ruta)
- Rechaza requests sin autenticacion antes de llegar al backend
- middleware.ts de Next.js solo se usa para redirecciones de navegacion (login, landing)

**Consecuencias:**
- Positivas: Un solo punto de entrada para toda la seguridad de API
- Positivas: El backend no necesita validar JWT nuevamente (confianza delegada)
- Negativas: proxy.ts es un punto unico de falla potencial
- Negativas: Cambios en auth requieren modificar proxy.ts

**Referencias:**
- docs/REGLAS_DESARROLLO_CERMONT.md (Perimetro de Seguridad)
- .sisyphus/plans/cermont_documento_metodologia_modular_contract_first.md
- frontend/proxy.ts (archivo real)

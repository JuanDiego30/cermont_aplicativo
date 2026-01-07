# Sprint 1.1 — UserRole canónico (backend) + alineación frontend

## Problema objetivo
UserRole duplicado/desalineado.

## Estado actual

### Backend
- ✅ Enum canónico ya existe: `apps/api/src/common/enums/user-role.enum.ts`
- ✅ 5 roles definidos: ADMIN, SUPERVISOR, TECNICO, ADMINISTRATIVO, GERENTE
- ✅ Helpers: `isValidUserRole()`, `ADMIN_ROLES`, `SUPERVISOR_ROLES`, `OPERATIVE_ROLES`, labels/descriptions

### Cambios realizados

#### Archivos actualizados (imports y comparaciones):

1. **admin.service.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `user.role === "admin"` → `user.role === UserRole.ADMIN`
   - Cambiar: `dto.role !== "admin"` → `dto.role !== UserRole.ADMIN`

2. **change-user-role.use-case.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `command.newRole !== "admin"` → `command.newRole !== UserRole.ADMIN`
   - Cambiar: `role` type de command a `UserRole`

3. **toggle-2fa.use-case.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `user.role === "tecnico"` → `user.role === UserRole.TECNICO`

4. **download-evidencia.use-case.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `role === "admin"` → `role === UserRole.ADMIN`
   - Cambiar: `role === "supervisor"` → `role === UserRole.SUPERVISOR`

5. **generate-evidencia-download-token.use-case.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `role === "admin"` → `role === UserRole.ADMIN`
   - Cambiar: `role === "supervisor"` → `role === UserRole.SUPERVISOR`

6. **upload-evidencia.use-case.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `role === "admin"` → `role === UserRole.ADMIN`
   - Cambiar: `role === "supervisor"` → `role === UserRole.SUPERVISOR`

7. **ordenes-evidencias.controller.ts** - Importar UserRole enum
   - Agregar: `import { UserRole } from "../../../../common/enums/user-role.enum"`
   - Cambiar: `role === "admin"` → `role === UserRole.ADMIN`
   - Cambiar: `role === "supervisor"` → `role === UserRole.SUPERVISOR`

### Pendiente

**Frontend:**
- Verificar enum en `apps/web/src/app/core/models/user-role.enum.ts`
- Alinear con backend si hay diferencias
- Agregar `ADMINISTRATIVO` si falta en frontend

### Próximos pasos

1. Revisar enums frontend para asegurar alineación completa
2. Agregar tests para validar consistencia enums backend-frontend
3. Documentar en README.md la migración a UserRole canónico

### Verificación requerida

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

### Archivos modificados

- `apps/api/src/modules/admin/admin.service.ts`
- `apps/api/src/modules/admin/application/use-cases/change-user-role.use-case.ts`
- `apps/api/src/modules/auth/application/use-cases/toggle-2fa.use-case.ts`
- `apps/api/src/modules/evidencias/application/use-cases/download-evidencia.use-case.ts`
- `apps/api/src/modules/evidencias/application/use-cases/generate-evidencia-download-token.use-case.ts`
- `apps/api/src/modules/evidencias/application/use-cases/upload-evidencia.use-case.ts`
- `apps/api/src/modules/evidencias/infrastructure/controllers/ordenes-evidencias.controller.ts`

### Archivos nuevos

- N/A (enum canónico ya existía)

---

**Estado:** ✅ Backend actualizado, frontend pendiente de verificación
**Prioridad:** Alta (P0 - Sprint 1.1)
**Branch sugerido:** `fix/enum-userrole-canonical-backend`

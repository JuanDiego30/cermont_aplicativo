# FASE 2: INTEGRACIÓN SHARED-TYPES (Principio DRY)

**Duración:** 2-3 días  
**Objetivo:** Backend + Frontend consumen `@cermont/shared-types` como source of truth  
**Entregable:** 0 DTOs duplicados, Shared types consumida

---

## 🎯 ESTRATEGIA

```
ANTES (Duplicación):
backend/src/modules/auth/dto/login.dto.ts
frontend/src/app/auth/models/login.model.ts
↓
Cambio en uno → rompe el otro → bugs silenciosos

DESPUÉS (DRY):
packages/shared-types/src/dtos/auth.dto.ts
backend/imports { LoginDto }
frontend/imports { LoginDto }
↓
Cambio en shared-types → compile error en ambos
```

---

## 📋 PASO 1: AUDIT DTOs BACKEND

**Objetivo:** Listar todos los DTOs en backend

```bash
cd backend

# Listar DTOs
find src/modules -name "*.dto.ts" | sort

# Esperado output:
# src/modules/auth/dto/login.dto.ts
# src/modules/auth/dto/auth-response.dto.ts
# src/modules/auth/dto/register.dto.ts
# src/modules/clientes/dto/cliente-response.dto.ts
# src/modules/clientes/dto/create-cliente.dto.ts
# src/modules/orders/dto/create-order.dto.ts
# src/modules/orders/dto/order-response.dto.ts
# ... más
```

**Crear matriz (spreadsheet o documento):**

| Archivo                 | Tipo                       | Ubicación | Existe en Shared? | Acción                      |
| ----------------------- | -------------------------- | --------- | ----------------- | --------------------------- |
| login.dto.ts            | LoginDto, LoginResponseDto | auth/     | ✅ Sí             | DELETE local, IMPORT shared |
| register.dto.ts         | RegisterDto                | auth/     | ❌ No             | MOVER a shared              |
| cliente-response.dto.ts | ClienteResponseDto         | clientes/ | ❌ No             | MOVER a shared              |
| create-order.dto.ts     | CreateOrderDto             | orders/   | ❌ No             | MOVER a shared              |

---

## 📋 PASO 2: MIGRATE BACKEND DTOs

Para cada DTO en la tabla:

### Caso 1: DTO ya existe en shared-types

**Ejemplo:** `LoginDto` ya está en `packages/shared-types/src/dtos/auth.dto.ts`

```bash
# 1. Eliminar archivo local
rm backend/src/modules/auth/dto/login.dto.ts

# 2. En auth.module.ts, actualizar imports
# ❌ ANTES
import { LoginDto } from './dto/login.dto';

# ✅ DESPUÉS
import { LoginDto } from '@cermont/shared-types';

# 3. En auth.controller.ts
# ❌ ANTES
import { LoginDto } from '../dto/login.dto';

# ✅ DESPUÉS
import { LoginDto } from '@cermont/shared-types';
```

### Caso 2: DTO no existe en shared-types

**Ejemplo:** `ClienteResponseDto` no existe

```bash
# 1. MOVER archivo a shared-types
cp backend/src/modules/clientes/dto/cliente-response.dto.ts \
   packages/shared-types/src/dtos/clientes.dto.ts

# 2. En backend, reemplazar con import
# Archivo: backend/src/modules/clientes/dto/cliente-response.dto.ts
# Contenido:
export { ClienteResponseDto } from '@cermont/shared-types';

# 3. Actualizar all imports en backend
grep -r "from.*cliente.*dto" backend/src/modules/clientes/ | grep -v node_modules
# Para cada resultado:
# ❌ ANTES
import { ClienteResponseDto } from '../dto/cliente-response.dto';

# ✅ DESPUÉS
import { ClienteResponseDto } from '@cermont/shared-types';
```

---

### ✅ CHECKLIST BACKEND DTOs

```bash
# 1. Listar DTOs
find backend/src/modules -name "*.dto.ts" | wc -l
# Antes: X archivos
# Objetivo: 0-2 archivos (solo re-exports si aplica)

# 2. Verificar imports
grep -r "from.*\.dto" backend/src/modules | grep -v node_modules
# Objetivo: 0 resultados (todos deben importar de @cermont/shared-types)

# 3. Build
pnpm --filter @cermont/backend build

# 4. Test
pnpm --filter @cermont/backend test
```

---

## 📋 PASO 3: AUDIT INTERFACES FRONTEND

**Objetivo:** Listar todas las interfaces/models en frontend

```bash
cd frontend

# Listar modelos e interfaces
find src/app -name "*.model.ts" -o -name "*.interface.ts" | sort

# Esperado output:
# src/app/auth/models/user.model.ts
# src/app/core/models/auth.interface.ts
# src/app/features/orders/models/order.model.ts
# src/app/shared/models/cliente.interface.ts
# ... más
```

**Crear matriz:**

| Archivo           | Tipo/Interface | Ubicación | Existe en Shared? | Acción               |
| ----------------- | -------------- | --------- | ----------------- | -------------------- |
| user.model.ts     | User           | auth/     | ❌ No             | MOVER a shared       |
| auth.interface.ts | AuthResponse   | core/     | ✅ Sí             | DELETE local, IMPORT |
| order.model.ts    | Order          | orders/   | ❌ No             | MOVER a shared       |

---

## 📋 PASO 4: MIGRATE FRONTEND INTERFACES

### Caso 1: Interface ya existe en shared-types

**Ejemplo:** `AuthResponse` ya está en shared

```bash
# 1. Eliminar archivo local
rm frontend/src/app/core/models/auth.interface.ts

# 2. En componentes, servicios que la usen:
# ❌ ANTES
import { AuthResponse } from '../models/auth.interface';

# ✅ DESPUÉS
import { AuthResponse } from '@cermont/shared-types';
```

### Caso 2: Interface no existe en shared-types

**Ejemplo:** `Order` model no existe

```bash
# 1. MOVER archivo a shared-types
cp frontend/src/app/features/orders/models/order.model.ts \
   packages/shared-types/src/types/order.types.ts

# 2. En frontend, crear barrel export
# Archivo: frontend/src/app/features/orders/models/order.model.ts
export { Order, OrderStatus, OrderItem } from '@cermont/shared-types';

# 3. Actualizar imports en frontend
grep -r "from.*order.*model" frontend/src/app/ | grep -v node_modules
# Para cada resultado:
# ❌ ANTES
import { Order } from '../models/order.model';

# ✅ DESPUÉS
import { Order } from '@cermont/shared-types';
```

---

### ✅ CHECKLIST FRONTEND INTERFACES

```bash
# 1. Contar modelos/interfaces
find frontend/src/app -name "*.model.ts" -o -name "*.interface.ts" | wc -l
# Antes: X archivos
# Objetivo: 0-2 archivos (solo re-exports)

# 2. Verificar imports
grep -r "from.*\.model\|from.*\.interface" frontend/src/app | grep -v node_modules
# Objetivo: 0 resultados

# 3. Build
pnpm --filter @cermont/frontend build

# 4. Lint
pnpm --filter @cermont/frontend lint
```

---

## 📋 PASO 5: CENTRALIZAR ENUMS Y CONSTANTES

**Objetivo:** Un único lugar para enums (OrderStatus, ClienteType, etc.)

```bash
# 1. Buscar enums duplicados
grep -r "enum OrderStatus" backend/src
grep -r "enum OrderStatus\|const OrderStatus" frontend/src
# Si aparecen en ambos → están duplicados

# 2. Ejemplo: OrderStatus
# ❌ ANTES
// backend/src/modules/orders/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

// frontend/src/app/shared/constants/order-status.const.ts
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
} as const;

# ✅ DESPUÉS
// packages/shared-types/src/enums/orders.enum.ts
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

// backend/src/modules/orders/enums/order-status.enum.ts
export { OrderStatus } from '@cermont/shared-types';

// frontend/src/app/shared/constants/order-status.const.ts
export { OrderStatus } from '@cermont/shared-types';
```

---

## 🔧 VERIFICAR DEPENDENCIA EN FRONTEND

**Asegurarse que `@cermont/shared-types` está linkada:**

```bash
# Verificar frontend/package.json
cat frontend/package.json | grep "@cermont/shared-types"

# Esperado:
# "@cermont/shared-types": "workspace:*"

# Si NO está, agregar:
cd frontend
pnpm add @cermont/shared-types

# Instalar
pnpm install

# Verificar
ls -la node_modules/@cermont/shared-types
# Debe ser un symlink al packages/shared-types
```

---

## ✅ VALIDACIÓN FASE 2

```bash
cd /path/to/cermont_aplicativo

# 1. Build backend
pnpm --filter @cermont/backend build
# ✅ 0 errors

# 2. Build frontend
pnpm --filter @cermont/frontend build
# ✅ 0 errors

# 3. Verificar shared-types se consume
grep -r "@cermont/shared-types" backend/src/modules | head -5
grep -r "@cermont/shared-types" frontend/src/app | head -5
# Ambos deben tener resultados

# 4. Verificar 0 DTOs duplicados
find backend/src/modules -name "*.dto.ts" -exec grep -l "^export.*class\|^export.*interface\|^export.*enum" {} \;
# Objetivo: máximo 1-2 archivo de re-exports

# 5. Tests
pnpm test
```

---

## 📝 COMMIT

```bash
git add -A
git commit -m "feat: shared-types integration complete

- Migrate 20+ DTOs from backend to @cermont/shared-types
- Migrate 15+ models/interfaces from frontend to @cermont/shared-types
- Centralize enums (OrderStatus, ClienteType, etc.)
- Update all imports in backend and frontend
- Remove local DTO/model files (moved to shared)

Affected:
- backend/src/modules/*: DTOs → shared-types
- frontend/src/app/*: Models → shared-types
- packages/shared-types: +35 new exports

Result:
- Single source of truth for types
- Frontend + Backend type-safe coupling
- No more duplicate definitions"

git push origin feat/shared-types-integration
```

---

## 🚨 SI ALGO FALLA

### "Cannot find module '@cermont/shared-types'"

```bash
# 1. Verificar instalación
pnpm install

# 2. Verificar symlink
ls -la node_modules/@cermont/

# 3. Si no está, reinstalar
cd packages/shared-types
pnpm install
cd ../..
pnpm install
```

### "Module '@cermont/shared-types' has no exported member 'LoginDto'"

**Significa:** El DTO está en shared-types pero NO está exportado en `packages/shared-types/src/index.ts`

```bash
# Agregar a packages/shared-types/src/index.ts
export { LoginDto } from './dtos/auth.dto';
```

### "Build fails after migration"

```bash
# Buscar imports rotos
grep -r "from.*undefined\|from.*'\./" backend/src/modules | grep -v node_modules

# Reparar manualmente o usar find/replace
```

---

## ✅ COMPLETAR FASE 2

Cuando veas:

```
✅ pnpm --filter @cermont/backend build → 0 errors
✅ pnpm --filter @cermont/frontend build → 0 errors
✅ Todos los imports usan @cermont/shared-types
✅ Commit pushed
```

**Eres listo para Fase 3: CQRS Architecture**

---

**Duración Total Fase 2:** 2-3 horas  
**Dificultad:** MEDIA  
**Riesgo:** BAJO (refactor mecánico, bien testeable)

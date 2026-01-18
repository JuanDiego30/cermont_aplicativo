# FASE 1: ESTABILIZACIÓN BUILD (Resolver 23 errores TS)

**Duración:** 3 días  
**Objetivo:** `pnpm build` ✅ sin errores  
**Entregable:** Commit con todos los fixes

---

## 🔴 PROBLEMAS A RESOLVER

### 1.1 Decimal.js (12 errores TS2351)

**Error Típico:**

```
Error TS2351: This expression is not constructable
```

**Causa:** ESM imports de CommonJS library

**PASO 1: Crear Wrapper**

```bash
mkdir -p backend/src/shared/utils
touch backend/src/shared/utils/decimal.ts
```

Contenido: [backend/src/shared/utils/decimal.ts](backend/src/shared/utils/decimal.ts)

```typescript
// Opción A: Async Import (Recomendado)
export async function createDecimal(value: string | number | Decimal) {
  const { default: Decimal } = await import('decimal.js');
  if (value instanceof Decimal || typeof value === 'string' || typeof value === 'number') {
    return new Decimal(value);
  }
  throw new Error('Invalid decimal value');
}

export type Decimal = typeof import('decimal.js').default;

// Opción B: Lazy Static (Si necesitas sync)
let DecimalCtor: any = null;

export function getDecimalCtor() {
  if (!DecimalCtor) {
    DecimalCtor = require('decimal.js'); // Fallback a CJS
  }
  return DecimalCtor;
}

export function createDecimalSync(value: string | number) {
  const Decimal = getDecimalCtor();
  return new Decimal(value);
}
```

**PASO 2: Actualizar 4 archivos en costos/**

Archivo 1: [backend/src/modules/costos/domain/value-objects/money.vo.ts](backend/src/modules/costos/domain/value-objects/money.vo.ts)

```typescript
// ❌ ANTES
import Decimal from 'decimal.js';

export class Money {
  constructor(private readonly amount: Decimal) {}
}

// ✅ DESPUÉS
import type { Decimal } from '@shared/utils/decimal';
import { createDecimal } from '@shared/utils/decimal';

export class Money {
  private readonly amount: any; // Decimal type

  static async create(amount: string | number): Promise<Money> {
    const decimal = await createDecimal(amount);
    return new Money(decimal);
  }

  constructor(amount: any) {
    this.amount = amount;
  }
}
```

Aplicar lo mismo a:

- `backend/src/modules/costos/domain/value-objects/budget-limit.vo.ts`
- `backend/src/modules/costos/domain/value-objects/cost-variance.vo.ts`
- `backend/src/modules/costos/domain/services/cost-calculator.service.ts`

---

### 1.2 Null/Undefined (7 errores TS2322)

**Archivo:** [backend/src/modules/clientes/clientes.service.ts](backend/src/modules/clientes/clientes.service.ts) (líneas 257-271)

**PASO 1: Crear Mappers**

```bash
touch backend/src/shared/utils/mappers.ts
```

Contenido:

```typescript
/**
 * Mapea Prisma null → DTO undefined
 * Prisma devuelve null para nullable fields
 * DTOs usan undefined para optional fields
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapNullableArray<T>(
  array: T[] | null | undefined,
  mapper?: (item: T) => any
): T[] | undefined {
  if (!array) return undefined;
  return mapper ? array.map(mapper) : array;
}

export function mapNullableObject<T extends Record<string, any>>(
  obj: T | null | undefined,
  nullableFields: (keyof T)[]
): Partial<T> | undefined {
  if (!obj) return undefined;

  const result = { ...obj } as Partial<T>;
  nullableFields.forEach(field => {
    if (result[field] === null) {
      delete result[field];
    }
  });
  return result;
}
```

**PASO 2: Usar en clientes.service.ts**

```typescript
// ❌ ANTES (líneas 257-271)
return {
  direccion: cliente.direccion, // TS2322 error: null | string → string | undefined
  telefono: cliente.telefono,
  email: cliente.email,
  contactos:
    cliente.contactos?.map(c => ({
      ...c,
      telefono: c.telefono, // Error
    })) ?? [],
  ubicaciones:
    cliente.ubicaciones?.map(u => ({
      ...u,
      direccion: u.direccion, // Error
      ciudad: u.ciudad,
    })) ?? [],
};

// ✅ DESPUÉS
import { nullToUndefined, mapNullableArray } from '@shared/utils/mappers';

return {
  direccion: nullToUndefined(cliente.direccion),
  telefono: nullToUndefined(cliente.telefono),
  email: nullToUndefined(cliente.email),
  contactos: mapNullableArray(cliente.contactos, c => ({
    id: c.id,
    nombre: c.nombre,
    telefono: nullToUndefined(c.telefono),
    // ... otros campos
  })),
  ubicaciones: mapNullableArray(cliente.ubicaciones, u => ({
    id: u.id,
    direccion: nullToUndefined(u.direccion),
    ciudad: nullToUndefined(u.ciudad),
    departamento: nullToUndefined(u.departamento),
    latitud: nullToUndefined(u.latitud),
    longitud: nullToUndefined(u.longitud),
    // ... otros campos
  })),
};
```

---

### 1.3 Dependencias Faltantes (3 errores TS2307)

**Archivo:** `backend/package.json`

**PASO ÚNICO:**

```bash
cd backend

# 1. Instalar pdf-parse (falta completamente)
pnpm add pdf-parse

# 2. Verificar/agregar tipos para bullmq
pnpm add -D @types/bullmq

# 3. Actualizar lock file
pnpm install
```

**Verificar:**

```bash
grep -E "pdf-parse|bullmq" backend/package.json
# Debe mostrar ambos

pnpm list pdf-parse
pnpm list bullmq
# Ambos en verde
```

---

### 1.4 JWT Generics (6 errores TS2345)

**Archivos:**

- `backend/src/modules/auth/domain/ports/jwt-signer.port.ts`
- `backend/src/modules/auth/infrastructure/jwt.service.ts`
- `backend/src/modules/auth/__tests__/jwt-token.vo.spec.ts`

**PASO 1: Actualizar Port**

```typescript
// ❌ ANTES
export interface JwtSignerPort<T = any> {
  sign(payload: T): string;
  verify<T extends object = object>(token: string): T;
}

// ✅ DESPUÉS
export interface JwtSignerPort<T extends object = any> {
  sign(payload: T): string;
  verify<R extends object = any>(token: string): Promise<R>;
}
```

**PASO 2: Crear Adapter**

Crear: [backend/src/modules/auth/infrastructure/nest-jwt-signer.adapter.ts](backend/src/modules/auth/infrastructure/nest-jwt-signer.adapter.ts)

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtSignerPort } from '../domain/ports/jwt-signer.port';

/**
 * Adapter que envuelve @nestjs/jwt y satisface JwtSignerPort
 * Esto desacopla la arquitectura hexagonal de la implementación NestJS
 */
@Injectable()
export class NestJwtSignerAdapter implements JwtSignerPort {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async verify<T extends object = any>(token: string): Promise<T> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return decoded as T;
    } catch (error) {
      throw new Error(`Invalid token: ${(error as Error).message}`);
    }
  }
}
```

**PASO 3: Actualizar Auth Module**

```typescript
// backend/src/modules/auth/auth.module.ts

@Module({
  imports: [JwtModule.register({...})],
  providers: [
    // ❌ Eliminar: JwtService (esto era el mock directo)
    // ✅ Agregar: Adapter
    NestJwtSignerAdapter,
    // ... otros providers
  ],
  exports: [NestJwtSignerAdapter],
})
export class AuthModule {}
```

**PASO 4: Actualizar Tests**

```typescript
// backend/src/modules/auth/__tests__/jwt-token.vo.spec.ts

// ❌ ANTES
const mockJwtService = {
  verify: jest.fn().mockReturnValue({ userId: '123' }),
};

// ✅ DESPUÉS
const mockJwtSignerPort = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn().mockResolvedValue({ userId: '123' }), // Promise
};

describe('JwtToken VO', () => {
  let jwtPort: JwtSignerPort;

  beforeEach(() => {
    jwtPort = mockJwtSignerPort;
  });

  it('should verify token', async () => {
    const result = await jwtPort.verify<{ userId: string }>('valid-token');
    expect(result.userId).toBe('123');
  });
});
```

---

## ✅ VALIDACIÓN FASE 1

**Ejecutar después de todos los fixes:**

```bash
cd /path/to/cermont_aplicativo

# Limpieza completa
pnpm clean
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

# Reinstalar
pnpm install

# Build backend
pnpm --filter @cermont/backend build

# Check: 0 errors
echo "Frontend:"
pnpm --filter @cermont/frontend build

# Lint
pnpm lint

# Tests (puede fallar, pero no debe haber TS errors)
pnpm test 2>&1 | grep -E "TS[0-9]{4}" || echo "✅ No TypeScript errors"
```

**Esperado:**

```
✅ pnpm build → exit code 0
✅ 0 TypeScript errors
✅ 0 critical lint errors
```

---

## 📝 COMMIT

```bash
git add -A
git commit -m "fix: resolve 23 TypeScript errors

- Fix 12x Decimal.js ESM import errors with dynamic import wrapper
- Fix 7x null/undefined type mismatches with helper functions
- Add missing pdf-parse and @types/bullmq dependencies
- Fix 6x JWT generics incompatibility with adapter pattern

Affected files:
- Created: backend/src/shared/utils/decimal.ts
- Created: backend/src/shared/utils/mappers.ts
- Created: backend/src/modules/auth/infrastructure/nest-jwt-signer.adapter.ts
- Modified: 4 files in backend/src/modules/costos/
- Modified: backend/src/modules/clientes/clientes.service.ts
- Modified: backend/src/modules/auth/ (port, tests)
- Modified: backend/package.json

Build Status: ✅ All green (pnpm build passes)"

git push origin fix/build-green
```

---

## 🚨 SI ALGO FALLA

### "Error: Cannot find module 'decimal.js'"

```bash
# En backend/
pnpm list decimal.js
# Si no aparece:
pnpm add decimal.js
```

### "TS2322: Type 'string | null' is not assignable"

- Revisar que se importó `nullToUndefined` en clientes.service.ts
- Verificar todas las líneas 257-271 tienen `.nullToUndefined(...)`

### "TS2345: Argument not assignable to JwtSignerPort"

- Verificar que NestJwtSignerAdapter extiende `implements JwtSignerPort`
- Revisar que `verify()` retorna `Promise<T>` (async)

### "pnpm build" aún con errores

```bash
# Get detailed errors
pnpm --filter @cermont/backend build 2>&1 | head -50

# Si es en frontend
pnpm --filter @cermont/frontend build 2>&1 | head -50
```

---

## ✅ COMPLETAR FASE 1

Cuando veas:

```
✅ Build: 0 errors
✅ Lint: 0 critical errors
✅ Commit pushed
```

**Eres listo para Fase 2: Shared Types Integration**

---

**Duración Total Fase 1:** 3-4 horas  
**Dificultad:** MEDIA  
**Riesgo:** BAJO (cambios localizados, bien documentados)

---
name: typescript-advanced
description: Experto en TypeScript avanzado. Usar para tipos genéricos, utility types, type guards, decoradores, patrones avanzados y inferencia de tipos.
triggers:
  - TypeScript
  - types
  - generics
  - utility types
  - type guard
  - infer
  - mapped types
role: specialist
scope: language
output-format: code
---

# TypeScript Advanced Patterns

Especialista en TypeScript avanzado y sistema de tipos.

## Rol

Ingeniero de software con 8+ años de experiencia en TypeScript. Experto en tipos avanzados, genéricos, decoradores y patrones de tipado seguro.

## Cuándo Usar Este Skill

- Crear tipos genéricos reutilizables
- Implementar utility types
- Type guards y narrowing
- Decoradores personalizados
- Mapped y conditional types
- Template literal types
- Inferencia avanzada
- Branded types

## Utility Types Personalizados

### DeepPartial

```typescript
// Hace todas las propiedades opcionales recursivamente
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Uso
interface User {
  id: number;
  profile: {
    name: string;
    address: {
      city: string;
      country: string;
    };
  };
}

type PartialUser = DeepPartial<User>;
// Ahora profile.address.city es opcional
```

### DeepReadonly

```typescript
type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// Uso
const config: DeepReadonly<Config> = loadConfig();
config.database.host = 'new'; // Error: readonly
```

### NonNullableDeep

```typescript
type NonNullableDeep<T> = T extends object
  ? { [P in keyof T]: NonNullableDeep<NonNullable<T[P]>> }
  : NonNullable<T>;

// Uso
interface ApiResponse {
  data: User | null;
  meta: {
    total: number | null;
  } | null;
}

type SafeResponse = NonNullableDeep<ApiResponse>;
// Todas las propiedades garantizadas no-null
```

### PathKeys (para acceso a propiedades anidadas)

```typescript
type PathKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | PathKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

// Uso
interface Config {
  database: {
    host: string;
    port: number;
  };
  cache: {
    enabled: boolean;
  };
}

type ConfigPaths = PathKeys<Config>;
// 'database' | 'database.host' | 'database.port' | 'cache' | 'cache.enabled'
```

### ValueAtPath

```typescript
type ValueAtPath<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? ValueAtPath<T[Key], Rest>
    : never
  : Path extends keyof T
  ? T[Path]
  : never;

// Uso
function getConfig<P extends PathKeys<Config>>(
  path: P,
): ValueAtPath<Config, P> {
  // Implementación
}

const host = getConfig('database.host'); // tipo: string
const port = getConfig('database.port'); // tipo: number
```

## Type Guards

### Basic Type Guards

```typescript
// Verificar si es un tipo específico
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Para objetos con discriminated unions
interface SuccessResponse {
  type: 'success';
  data: unknown;
}

interface ErrorResponse {
  type: 'error';
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function isSuccess(response: ApiResponse): response is SuccessResponse {
  return response.type === 'success';
}

// Uso
function handleResponse(response: ApiResponse) {
  if (isSuccess(response)) {
    console.log(response.data); // TypeScript sabe que es SuccessResponse
  } else {
    console.log(response.error); // TypeScript sabe que es ErrorResponse
  }
}
```

### Assertion Functions

```typescript
function assertIsDefined<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value is null or undefined');
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Expected string');
  }
}

// Uso
function processUser(user: User | null) {
  assertIsDefined(user, 'User must be defined');
  // Después de esta línea, user es User (no null)
  console.log(user.name);
}
```

### Object Shape Guards

```typescript
// Verificar forma de objeto
function hasProperty<K extends string>(
  obj: unknown,
  key: K,
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Guard para interface específica
interface User {
  id: number;
  email: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as User).id === 'number' &&
    'email' in value &&
    typeof (value as User).email === 'string' &&
    'name' in value &&
    typeof (value as User).name === 'string'
  );
}

// Guard generator
function createTypeGuard<T>(
  check: (value: unknown) => boolean,
): (value: unknown) => value is T {
  return (value: unknown): value is T => check(value);
}
```

## Generics Avanzados

### Constrainted Generics

```typescript
// Con constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Con defaults
function createEntity<T extends object, K extends keyof T = keyof T>(
  data: Pick<T, K>,
): T {
  return data as T;
}

// Con infer
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

type PromiseType<T> = T extends Promise<infer U> ? U : T;

// Uso
type Resolved = PromiseType<Promise<string>>; // string
```

### Builder Pattern con Generics

```typescript
class QueryBuilder<T extends object, Selected extends keyof T = never> {
  private selectFields: (keyof T)[] = [];
  private whereConditions: Partial<T> = {};

  select<K extends keyof T>(
    ...fields: K[]
  ): QueryBuilder<T, Selected | K> {
    this.selectFields.push(...fields);
    return this as QueryBuilder<T, Selected | K>;
  }

  where<K extends keyof T>(
    field: K,
    value: T[K],
  ): QueryBuilder<T, Selected> {
    (this.whereConditions as any)[field] = value;
    return this;
  }

  execute(): Pick<T, Selected>[] {
    // Implementación
    return [] as Pick<T, Selected>[];
  }
}

// Uso - el tipo de retorno es exacto
const result = new QueryBuilder<User>()
  .select('id', 'name')
  .where('active', true)
  .execute();
// result: Pick<User, 'id' | 'name'>[]
```

### Factory con Generics

```typescript
interface EntityConfig<T> {
  schema: Record<keyof T, 'string' | 'number' | 'boolean'>;
  defaults?: Partial<T>;
}

function createFactory<T extends object>(config: EntityConfig<T>) {
  return {
    create(data: Partial<T>): T {
      return { ...config.defaults, ...data } as T;
    },
    validate(data: unknown): data is T {
      if (typeof data !== 'object' || data === null) return false;
      for (const [key, type] of Object.entries(config.schema)) {
        if (typeof (data as any)[key] !== type) return false;
      }
      return true;
    },
  };
}

// Uso
interface Product {
  id: number;
  name: string;
  active: boolean;
}

const productFactory = createFactory<Product>({
  schema: { id: 'number', name: 'string', active: 'boolean' },
  defaults: { active: true },
});

const product = productFactory.create({ id: 1, name: 'Test' });
```

## Branded Types

```typescript
// Tipos nominales para evitar confusión de primitivos
declare const brand: unique symbol;

type Brand<T, B> = T & { [brand]: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email = Brand<string, 'Email'>;

// Constructores
function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

// Uso - previene errores
function getUser(id: UserId): User {
  // ...
}

function getOrder(id: OrderId): Order {
  // ...
}

const userId = createUserId('user-123');
const orderId = createUserId('order-456') as OrderId; // Necesita cast explícito

getUser(userId); // ✅ OK
getUser(orderId); // ❌ Error: OrderId no es asignable a UserId
```

## Mapped Types Avanzados

```typescript
// Hacer campos opcionales condicionales
type OptionalIf<T, Condition extends boolean> = Condition extends true
  ? Partial<T>
  : T;

// Excluir campos readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Solo campos de cierto tipo
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

// Uso
type NumberFields = PickByType<User, number>; // Solo campos numéricos

// Prefixar keys
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<K & string>}`]: T[K];
};

type ApiUser = Prefixed<User, 'api'>;
// { apiId: number; apiName: string; apiEmail: string }
```

## Template Literal Types

```typescript
// Event handlers
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// CSS properties
type CSSProperty = 'margin' | 'padding';
type CSSDirection = 'Top' | 'Right' | 'Bottom' | 'Left';
type CSSSpacing = `${CSSProperty}${CSSDirection}`;
// 'marginTop' | 'marginRight' | ... | 'paddingLeft'

// API routes
type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIResource = 'users' | 'orders' | 'products';
type APIEndpoint = `${Lowercase<APIMethod>}${Capitalize<APIResource>}`;

// Route builder
type Route<T extends string> = T extends `${infer _}/:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof Route<`/${Rest}`>]: string }
  : T extends `${infer _}/:${infer Param}`
  ? { [K in Param]: string }
  : Record<string, never>;

type UserRoute = Route<'/users/:userId/posts/:postId'>;
// { userId: string; postId: string }
```

## Decoradores (TypeScript 5.0+)

```typescript
// Class decorator
function Singleton<T extends new (...args: any[]) => any>(target: T) {
  let instance: InstanceType<T>;
  return class extends target {
    constructor(...args: any[]) {
      if (instance) return instance;
      super(...args);
      instance = this;
    }
  } as T;
}

// Method decorator
function Log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log(`Calling ${propertyKey} with:`, args);
      const result = original.apply(this, args);
      console.log(`Result:`, result);
      return result;
    };
  };
}

// Property decorator
function Required(target: any, propertyKey: string) {
  const requiredFields = Reflect.getMetadata('required', target) || [];
  Reflect.defineMetadata('required', [...requiredFields, propertyKey], target);
}

// Uso
@Singleton
class ConfigService {
  @Log()
  getValue(key: string): string {
    return process.env[key] || '';
  }
}
```

## Restricciones

### DEBE HACER
- Usar tipos estrictos (strict: true)
- Preferir tipos sobre interfaces para unions
- Usar branded types para IDs
- Type guards para narrowing seguro
- Documentar tipos complejos

### NO DEBE HACER
- Usar `any` sin justificación
- Type assertions innecesarias
- Ignorar errores de tipos
- Tipos demasiado genéricos
- Circular dependencies en tipos

## Skills Relacionados

- **nestjs-expert** - Decoradores NestJS
- **angular-architect** - Tipos en Angular
- **clean-architecture** - Tipos de dominio

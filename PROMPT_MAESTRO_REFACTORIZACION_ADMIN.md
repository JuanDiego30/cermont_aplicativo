# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/admin` - CERMONT APLICATIVO**

**Versión:** 1.0  
**Fecha:** 2024-12-22  
**Autor:** Sistema de Refactorización Cermont  
**Estado:** ✅ Listo para ejecución

---

## 📋 **CONTEXTO DEL MÓDULO**

El módulo **`/admin`** es un **bounded context crítico** responsable de la gestión completa de usuarios del sistema Cermont. Implementa arquitectura DDD (Domain-Driven Design) con capas claramente separadas: Domain, Application, Infrastructure.

### **Responsabilidades del Módulo:**
- ✅ **CRUD de Usuarios** (Create, Read, Update, Delete)
- ✅ **Gestión de Roles** (ADMIN, COORDINADOR, TECNICO, CLIENTE)
- ✅ **Cambio de Contraseñas** (reset password)
- ✅ **Activación/Desactivación** de usuarios
- ✅ **Estadísticas de Usuarios** (dashboards)
- ✅ **Domain Events** (user-created, role-changed, password-reset, etc.)
- ✅ **Validaciones de Negocio** (Value Objects: Email, Password, UserRole)
- ✅ **RBAC** (Role-Based Access Control)

### **Arquitectura Actual (DDD):**

```
📁admin/
├── 📁domain/           # Capa de Dominio (reglas de negocio puras)
│   ├── entities/       # User.entity.ts
│   ├── value-objects/  # Email.vo, Password.vo, UserRole.vo, UserId.vo
│   ├── events/         # UserCreated, RoleChanged, PasswordReset, etc.
│   └── repositories/   # IUserRepository (interface)
├── 📁application/      # Capa de Aplicación (casos de uso)
│   ├── use-cases/      # CreateUser, UpdateUser, ChangeRole, etc.
│   ├── dto/            # DTOs de entrada/salida
│   ├── mappers/        # User.mapper (Domain ↔ DTO)
│   └── event-handlers/ # Handlers para domain events
├── 📁infrastructure/   # Capa de Infraestructura (implementaciones técnicas)
│   ├── controllers/    # AdminController (HTTP endpoints)
│   └── persistence/    # UserRepository (Prisma), PrismaMapper
├── 📁interfaces/       # Permissions.interface.ts (RBAC)
├── admin.module.ts     # NestJS Module
├── admin.service.ts    # Service principal (legacy - mantener por compatibilidad)
└── README.md
```

### **Stack Tecnológico:**
- **Framework:** NestJS 11.x + TypeScript 5.x
- **ORM:** Prisma (PostgreSQL)
- **Arquitectura:** Clean Architecture + DDD
- **Patrones:** Repository Pattern, Use Case Pattern, Mapper Pattern, Event-Driven
- **Validación:** class-validator, Zod
- **Testing:** Jest
- **Security:** bcryptjs (password hashing), JWT

---

## 🎯 **OBJETIVOS DE LA REFACTORIZACIÓN**

Refactorizar **TODO** el módulo `/admin` aplicando:

1. ✅ **SOLID Principles** (SRP, OCP, LSP, ISP, DIP)
2. ✅ **Clean Architecture** (dependencias siempre apuntan hacia adentro)
3. ✅ **DDD Tactical Patterns** (Entities, Value Objects, Aggregates, Domain Events)
4. ✅ **TypeScript Best Practices** (tipos estrictos, no `any`, generics)
5. ✅ **Security** (OWASP Top 10, password hashing bcrypt 12 rounds, input validation)
6. ✅ **Error Handling** (excepciones de dominio, contexto estructurado)
7. ✅ **Testing** (unit tests, integration tests, E2E tests)
8. ✅ **Observability** (logging estructurado, métricas, auditoría)
9. ✅ **Performance** (caching, optimización de queries, paginación eficiente)

---

## 📝 **PLAN DE TRABAJO COMPLETO (TASK LIST)**

---

### **FASE 1: ANÁLISIS Y AUDITORÍA (2 días)**

---

#### **TASK 1.1: Auditoría de Arquitectura DDD**

**Prompt:**
```
Analiza TODA la arquitectura del módulo `/admin` bajo la lente de DDD y Clean Architecture.

**AUDITORÍA DE CAPAS:**

### 1. **DOMAIN LAYER** (Capa de Dominio)

#### **Entities:**
- ¿`User.entity.ts` tiene lógica de negocio PURA?
- ¿Usa Value Objects en lugar de primitivos (string, number)?
- ¿Mantiene invariantes de negocio?
- ¿Tiene métodos factory para creación segura?
- ¿Es inmutable (excepto métodos específicos)?
- ¿Publica Domain Events correctamente?

#### **Value Objects:**
- ¿`Email.vo.ts` valida formato de email correctamente (RFC 5322)?
- ¿`Password.vo.ts` valida complejidad (min 8 chars, mayúsculas, números, especiales)?
- ¿`UserRole.vo.ts` usa enum con validación y jerarquía?
- ¿`UserId.vo.ts` valida formato UUID?
- ¿Son inmutables (`Object.freeze`)?
- ¿Implementan `equals()` para comparación por valor?
- ¿Tienen métodos de negocio (ej: `UserRole.canManageUsers()`)?

#### **Domain Events:**
- ¿Los eventos tienen timestamp, aggregateId, metadata?
- ¿Son inmutables?
- ¿Nombres en pasado (UserCreated, RoleChanged)?
- ¿Se publican en el momento correcto?

#### **Repository Interface:**
- ¿`IUserRepository` define SOLO el contrato (interface)?
- ¿No tiene implementación técnica?
- ¿Métodos retornan entidades de dominio (no Prisma models)?
- ¿Está en la capa de dominio (no en infrastructure)?

### 2. **APPLICATION LAYER** (Capa de Aplicación)

#### **Use Cases:**
- ¿Cada use case tiene una ÚNICA responsabilidad?
- ¿Orquestan lógica de dominio sin contener reglas de negocio?
- ¿Usan repositorio a través de interface (DIP)?
- ¿Publican domain events?
- ¿Manejan transacciones?
- ¿Validan permisos antes de ejecutar?

#### **DTOs:**
- ¿Están bien validados (class-validator decorators + Zod schemas)?
- ¿Separados entre entrada (CreateUserDto) y salida (UserResponseDto)?
- ¿No exponen entidades de dominio directamente?
- ¿Tienen documentación Swagger completa?

#### **Mappers:**
- ¿Mapean entre Domain ↔ DTO bidireccionalmente?
- ¿Son pure functions (sin efectos secundarios)?
- ¿Manejan casos edge (valores null, undefined)?

#### **Event Handlers:**
- ¿Reaccionan a domain events correctamente?
- ¿Son idempotentes?
- ¿Manejan errores sin romper flujo principal?
- ¿Tienen logging estructurado?

### 3. **INFRASTRUCTURE LAYER** (Capa de Infraestructura)

#### **Controllers:**
- ¿Solo reciben requests HTTP y delegan a use cases?
- ¿Usan guards (JwtAuthGuard, RolesGuard)?
- ¿Documentados con Swagger decorators?
- ¿Manejo de errores con exception filters?
- ¿Validación de entrada con ValidationPipe?

#### **Repositories:**
- ¿Implementan interface del dominio?
- ¿Mapean entre Prisma models y entidades de dominio?
- ¿Manejo de errores Prisma correctamente?
- ¿Optimización de queries (evitar N+1)?

#### **Prisma Mappers:**
- ¿Mapean correctamente Prisma → Domain Entity?
- ¿Manejan relaciones correctamente?
- ¿Validan datos antes de mapear?

**PROBLEMAS A IDENTIFICAR:**

1. **Violations de SOLID:**
   - SRP: ¿Clases con múltiples responsabilidades?
   - OCP: ¿Código difícil de extender sin modificar?
   - DIP: ¿Dependencias de implementaciones concretas?
   - ISP: ¿Interfaces demasiado grandes?

2. **Anemic Domain Model:**
   - ¿Entidades solo con getters/setters sin lógica?
   - ¿Lógica de negocio en servicios en lugar de entidades?

3. **Leaky Abstractions:**
   - ¿Domain layer depende de Prisma?
   - ¿DTOs expuestos en domain?
   - ¿HTTP concerns en application layer?

4. **Security Issues:**
   - ¿Passwords hasheados con bcrypt (min 12 rounds)?
   - ¿Validación de input completa?
   - ¿Rate limiting en endpoints sensibles?
   - ¿Audit log de cambios críticos (cambio de rol, reset password)?
   - ¿Validación de permisos en cada operación?

5. **Performance:**
   - ¿N+1 queries en listado de usuarios?
   - ¿Falta de caching en operaciones de lectura?
   - ¿Paginación eficiente?

6. **Testing:**
   - ¿Código testeable (desacoplado, interfaces)?
   - ¿Tests unitarios para use cases?
   - ¿Tests de integración para repositories?
   - ¿Tests E2E para controllers?

7. **Legacy Code:**
   - ¿`admin.service.ts` todavía se usa?
   - ¿Puede ser eliminado o debe mantenerse por compatibilidad?
   - ¿Hay duplicación entre service y use cases?

**ENTREGABLES:**
Genera un reporte Markdown con:
- Tabla de hallazgos por prioridad (P0/P1/P2)
- Diagrama Mermaid de arquitectura actual
- Lista de violaciones de SOLID/DDD
- Recomendaciones de refactorización
- Matriz de priorización (Impacto vs Esfuerzo)
```

**Entregables:**
- `ADMIN_AUDIT_REPORT.md`
- `ADMIN_ARCHITECTURE_DIAGRAM.md` (Mermaid)
- `ADMIN_PRIORITY_MATRIX.md`
- `ADMIN_SOLID_VIOLATIONS.md`

---

#### **TASK 1.2: Análisis de Flujos de Negocio**

**Prompt:**
```
Documenta TODOS los flujos de negocio del módulo `/admin`:

**FLUJOS PRINCIPALES:**

### 1. **Crear Usuario**
```
1. Controller recibe CreateUserDto
2. JwtAuthGuard valida token
3. RolesGuard verifica rol ADMIN
4. ValidationPipe valida DTO (Zod schema)
5. CreateUserUseCase ejecuta:
   a. Validar Email.vo (formato, no duplicado)
   b. Validar Password.vo (complejidad)
   c. Hash password con bcrypt (12 rounds)
   d. Crear User.entity (factory method)
   e. Guardar en BD via repository (transacción)
   f. Publicar UserCreatedEvent
6. UserCreatedHandler envía email de bienvenida
7. Controller retorna UserResponseDto
```

### 2. **Cambiar Rol de Usuario**
```
1. Controller recibe ChangeRoleDto
2. Validar permisos (solo ADMIN puede cambiar roles)
3. ChangeUserRoleUseCase ejecuta:
   a. Buscar usuario en BD (repository.findById)
   b. Validar nueva role con UserRole.vo
   c. User.changeRole() (validar transiciones permitidas)
   d. Guardar cambios (transacción)
   e. Publicar RoleChangedEvent
4. RoleChangedHandler audita cambio en log
5. Notificar al usuario del cambio (email opcional)
```

### 3. **Reset Password**
```
1. Controller recibe ResetPasswordDto
2. ResetPasswordUseCase ejecuta:
   a. Buscar usuario por email (repository.findByEmail)
   b. Generar token seguro (crypto.randomBytes, 32 bytes)
   c. Guardar token en BD con expiración (15 min)
   d. Publicar PasswordResetEvent
3. PasswordResetHandler envía email con link de reset
4. Controller retorna mensaje de éxito (no expone token)
```

### 4. **Activar/Desactivar Usuario**
```
1. Controller recibe ToggleActiveDto
2. Validar permisos (ADMIN/COORDINADOR)
3. ToggleUserActiveUseCase ejecuta:
   a. Buscar usuario
   b. Validar que no se desactive a sí mismo
   c. User.activate() o User.deactivate()
   d. Guardar cambios (transacción)
   e. Publicar UserDeactivatedEvent (si aplica)
4. UserDeactivatedHandler audita cambio
```

### 5. **Listar Usuarios (con paginación)**
```
1. Controller recibe UserQueryDto (page, limit, filters)
2. ListUsersUseCase ejecuta:
   a. Construir query con filtros (rol, activo, búsqueda)
   b. Validar paginación (max 100 por página)
   c. Obtener usuarios paginados de repository
   d. Mapear a UserResponseDto[] (mapper)
3. Controller retorna PaginatedResponse<UserResponseDto>
```

### 6. **Obtener Estadísticas de Usuarios**
```
1. Controller llama GetUserStatsUseCase
2. UseCase ejecuta queries agregadas:
   - Total usuarios por rol
   - Usuarios activos vs inactivos
   - Usuarios creados últimos 30 días
   - Distribución geográfica (opcional)
3. Retorna estadísticas formateadas
```

### 7. **Actualizar Usuario**
```
1. Controller recibe UpdateUserDto
2. Validar permisos (ADMIN o el mismo usuario)
3. UpdateUserUseCase ejecuta:
   a. Buscar usuario
   b. Validar cambios permitidos
   c. User.updateInfo() (método de dominio)
   d. Guardar cambios
   e. Publicar UserUpdatedEvent
4. Retornar usuario actualizado
```

**ANALIZAR:**
- ¿Todos los flujos siguen el patrón correcto?
- ¿Hay lógica de negocio en controllers (BAD)?
- ¿Los use cases orquestan correctamente?
- ¿Los eventos se publican en el momento correcto?
- ¿Hay validaciones faltantes?
- ¿Hay casos edge no contemplados?
- ¿Manejo de errores consistente?
- ¿Transacciones donde son necesarias?

**ENTREGABLES:**
- Diagramas de secuencia (Mermaid) para cada flujo
- Documentación de casos edge
- Lista de validaciones faltantes
- Matriz de permisos por operación
```

**Entregables:**
- `ADMIN_BUSINESS_FLOWS.md`
- Diagramas de secuencia Mermaid por cada flujo
- `ADMIN_EDGE_CASES.md`
- `ADMIN_PERMISSIONS_MATRIX.md`

---

### **FASE 2: REFACTORIZACIÓN DOMAIN LAYER (3 días)**

---

#### **TASK 2.1: Refactorizar Value Objects**

**Prompt:**
```typescript
Refactoriza TODOS los Value Objects del módulo `/admin` siguiendo patrones DDD:

**ESTRUCTURA DE VALUE OBJECT (Template):**

```typescript
/**
 * Value Object: [Nombre]
 * 
 * Representa [descripción del concepto de negocio]
 * 
 * Invariantes:
 * - [Lista de reglas que siempre deben cumplirse]
 * 
 * @example
 * const email = Email.create('user@example.com'); // ✅ OK
 * const invalid = Email.create('invalid'); // ❌ Lanza ValidationError
 */
export class [Nombre]ValueObject {
  // Constructor privado (patrón factory)
  private constructor(private readonly _value: T) {
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Factory method para crear instancia validada
   * @throws {ValidationError} si no pasa validación
   */
  public static create(value: T): [Nombre]ValueObject {
    this.validate(value);
    return new [Nombre]ValueObject(value);
  }

  /**
   * Validación de reglas de negocio
   */
  private static validate(value: T): void {
    // Implementar validaciones específicas
  }

  /**
   * Obtener valor primitivo
   */
  public getValue(): T {
    return this._value;
  }

  /**
   * Comparación por valor (no por referencia)
   */
  public equals(other: [Nombre]ValueObject): boolean {
    if (!other || !(other instanceof [Nombre]ValueObject)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Representación en string (para logs)
   */
  public toString(): string {
    return String(this._value);
  }

  /**
   * Serialización (para BD/API)
   */
  public toJSON(): T {
    return this._value;
  }
}
```

---

### **TASK 2.1.1: Refactorizar `Email.vo.ts`**

**Requisitos:**
- Validación RFC 5322 completa
- Normalización a lowercase
- Máximo 255 caracteres
- Opcional: Bloquear dominios desechables
- Métodos helper: `getDomain()`, `getLocalPart()`

**Código esperado:**
```typescript
/**
 * Value Object: Email
 * 
 * Representa un email válido del sistema Cermont
 * 
 * Invariantes:
 * - Debe tener formato válido (RFC 5322)
 * - Debe estar en lowercase
 * - Máximo 255 caracteres
 * - No permite emails desechables (opcional)
 * 
 * @example
 * const email = Email.create('user@example.com');
 * console.log(email.getValue()); // 'user@example.com'
 * console.log(email.getDomain()); // 'example.com'
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private static readonly MAX_LENGTH = 255;
  
  // Dominios desechables bloqueados (opcional)
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
  ];

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static create(value: string): Email {
    this.validate(value);
    const normalized = value.toLowerCase().trim();
    return new Email(normalized);
  }

  private static validate(value: string): void {
    // 1. Validar no vacío
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError('Email es requerido');
    }

    // 2. Validar longitud
    if (value.length > this.MAX_LENGTH) {
      throw new ValidationError(
        `Email no puede exceder ${this.MAX_LENGTH} caracteres`
      );
    }

    // 3. Validar formato RFC 5322
    if (!this.EMAIL_REGEX.test(value)) {
      throw new ValidationError('Formato de email inválido');
    }

    // 4. Validar dominio no desechable (opcional)
    const domain = value.split('@')[1]?.toLowerCase();
    if (domain && this.DISPOSABLE_DOMAINS.includes(domain)) {
      throw new ValidationError('No se permiten emails desechables');
    }
  }

  public getValue(): string {
    return this._value;
  }

  public getDomain(): string {
    return this._value.split('@')[1] || '';
  }

  public getLocalPart(): string {
    return this._value.split('@')[0] || '';
  }

  public equals(other: Email): boolean {
    if (!other || !(other instanceof Email)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
```

---

### **TASK 2.1.2: Refactorizar `Password.vo.ts`**

**Requisitos:**
- Validación de complejidad (min 8 chars, mayúscula, minúscula, número, especial)
- Hash con bcrypt (12 rounds mínimo)
- Método `fromHash()` para recrear desde BD
- Método `compare()` para verificar
- NO exponer hash en logs/JSON

**Código esperado:**
```typescript
import * as bcrypt from 'bcryptjs';

/**
 * Value Object: Password
 * 
 * Representa una contraseña hasheada del sistema
 * 
 * Invariantes:
 * - Mínimo 8 caracteres (raw)
 * - Debe contener: mayúscula, minúscula, número, carácter especial
 * - Se hashea con bcrypt (12 rounds)
 * - No se almacena en texto plano
 * 
 * @example
 * // Crear desde password en texto plano
 * const password = await Password.create('MyP@ssw0rd');
 * 
 * // Recrear desde hash en BD
 * const password = Password.fromHash('$2b$12$...');
 * 
 * // Comparar
 * const isValid = await password.compare('MyP@ssw0rd'); // true
 */
export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  private static readonly HASH_ROUNDS = 12;

  // Regex para validar complejidad
  private static readonly COMPLEXITY_REGEX = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
  };

  private constructor(private readonly _hashedValue: string) {
    Object.freeze(this);
  }

  /**
   * Crear desde password en texto plano (hashear)
   */
  public static async create(plainPassword: string): Promise<Password> {
    this.validateComplexity(plainPassword);
    const hashed = await bcrypt.hash(plainPassword, this.HASH_ROUNDS);
    return new Password(hashed);
  }

  /**
   * Recrear desde hash almacenado en BD
   */
  public static fromHash(hashedPassword: string): Password {
    if (!hashedPassword || !hashedPassword.startsWith('$2b$')) {
      throw new ValidationError('Hash de password inválido');
    }
    return new Password(hashedPassword);
  }

  /**
   * Validar complejidad de password
   */
  private static validateComplexity(plainPassword: string): void {
    if (!plainPassword || plainPassword.length < this.MIN_LENGTH) {
      throw new ValidationError(
        `Password debe tener al menos ${this.MIN_LENGTH} caracteres`
      );
    }

    if (plainPassword.length > this.MAX_LENGTH) {
      throw new ValidationError(
        `Password no puede exceder ${this.MAX_LENGTH} caracteres`
      );
    }

    const errors: string[] = [];

    if (!this.COMPLEXITY_REGEX.uppercase.test(plainPassword)) {
      errors.push('al menos una mayúscula');
    }
    if (!this.COMPLEXITY_REGEX.lowercase.test(plainPassword)) {
      errors.push('al menos una minúscula');
    }
    if (!this.COMPLEXITY_REGEX.number.test(plainPassword)) {
      errors.push('al menos un número');
    }
    if (!this.COMPLEXITY_REGEX.special.test(plainPassword)) {
      errors.push('al menos un carácter especial');
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Password debe contener: ${errors.join(', ')}`
      );
    }
  }

  /**
   * Comparar password en texto plano con hash
   */
  public async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hashedValue);
  }

  /**
   * Obtener hash (para guardar en BD)
   */
  public getHash(): string {
    return this._hashedValue;
  }

  /**
   * NO exponer valor hasheado en logs/JSON
   */
  public toString(): string {
    return '[PROTECTED]';
  }

  public toJSON(): string {
    return '[PROTECTED]';
  }

  /**
   * Para serializar a BD
   */
  public toPersistence(): string {
    return this._hashedValue;
  }
}
```

---

### **TASK 2.1.3: Refactorizar `UserRole.vo.ts`**

**Requisitos:**
- Enum con roles válidos
- Jerarquía de roles (ADMIN > COORDINADOR > TECNICO > CLIENTE)
- Métodos de negocio: `isAdmin()`, `canManageUsers()`, `isHigherThan()`
- Validación de transiciones de rol

**Código esperado:**
```typescript
/**
 * Value Object: UserRole
 * 
 * Representa un rol de usuario en el sistema Cermont
 * 
 * Roles:
 * - ADMIN: Acceso total al sistema
 * - COORDINADOR: Gestiona órdenes y técnicos
 * - TECNICO: Ejecuta trabajos en campo
 * - CLIENTE: Solo visualiza sus órdenes
 * 
 * Jerarquía:
 * ADMIN > COORDINADOR > TECNICO > CLIENTE
 * 
 * @example
 * const role = UserRole.create('ADMIN');
 * role.isAdmin(); // true
 * role.canManageUsers(); // true
 * role.isHigherThan(UserRole.create('TECNICO')); // true
 */
export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  COORDINADOR = 'COORDINADOR',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE',
}

export class UserRole {
  // Jerarquía de roles (orden descendente de privilegios)
  private static readonly HIERARCHY: UserRoleEnum[] = [
    UserRoleEnum.ADMIN,
    UserRoleEnum.COORDINADOR,
    UserRoleEnum.TECNICO,
    UserRoleEnum.CLIENTE,
  ];

  private constructor(private readonly _value: UserRoleEnum) {
    Object.freeze(this);
  }

  public static create(value: string): UserRole {
    this.validate(value);
    return new UserRole(value as UserRoleEnum);
  }

  private static validate(value: string): void {
    if (!Object.values(UserRoleEnum).includes(value as UserRoleEnum)) {
      throw new ValidationError(
        `Rol inválido. Roles permitidos: ${Object.values(UserRoleEnum).join(', ')}`
      );
    }
  }

  public getValue(): UserRoleEnum {
    return this._value;
  }

  // Métodos de negocio

  public isAdmin(): boolean {
    return this._value === UserRoleEnum.ADMIN;
  }

  public isCoordinador(): boolean {
    return this._value === UserRoleEnum.COORDINADOR;
  }

  public isTecnico(): boolean {
    return this._value === UserRoleEnum.TECNICO;
  }

  public isCliente(): boolean {
    return this._value === UserRoleEnum.CLIENTE;
  }

  /**
   * Verificar si este rol es superior a otro en la jerarquía
   */
  public isHigherThan(other: UserRole): boolean {
    const thisIndex = UserRole.HIERARCHY.indexOf(this._value);
    const otherIndex = UserRole.HIERARCHY.indexOf(other._value);
    return thisIndex < otherIndex; // Menor índice = mayor privilegio
  }

  /**
   * Verificar si puede gestionar usuarios
   */
  public canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Verificar si puede gestionar órdenes
   */
  public canManageOrders(): boolean {
    return this.isAdmin() || this.isCoordinador();
  }

  /**
   * Verificar si puede ejecutar trabajos
   */
  public canExecuteOrders(): boolean {
    return this.isTecnico();
  }

  /**
   * Verificar si puede ver dashboard completo
   */
  public canViewFullDashboard(): boolean {
    return this.isAdmin() || this.isCoordinador();
  }

  public equals(other: UserRole): boolean {
    if (!other || !(other instanceof UserRole)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
```

---

### **TASK 2.1.4: Refactorizar `UserId.vo.ts`**

**Requisitos:**
- Validación UUID v4
- Factory method `generate()` para crear nuevo
- Factory method `create()` para recrear desde existente

**Código esperado:**
```typescript
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * Value Object: UserId
 * 
 * Representa un identificador único de usuario (UUID v4)
 * 
 * Invariantes:
 * - Debe ser un UUID válido (formato 8-4-4-4-12)
 * - Inmutable
 * 
 * @example
 * // Generar nuevo
 * const id = UserId.generate();
 * 
 * // Desde existente
 * const id = UserId.create('123e4567-e89b-12d3-a456-426614174000');
 */
export class UserId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  /**
   * Generar un nuevo UserId (UUID v4)
   */
  public static generate(): UserId {
    return new UserId(uuidv4());
  }

  /**
   * Crear desde UUID existente
   */
  public static create(value: string): UserId {
    this.validate(value);
    return new UserId(value);
  }

  private static validate(value: string): void {
    if (!value || typeof value !== 'string' || !uuidValidate(value)) {
      throw new ValidationError('UserId debe ser un UUID válido');
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: UserId): boolean {
    if (!other || !(other instanceof UserId)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
```

**REQUISITOS GENERALES PARA TODOS LOS VOs:**
- ✅ Inmutables (`Object.freeze`)
- ✅ Factory methods en lugar de constructor público
- ✅ Validaciones de negocio completas
- ✅ Métodos `equals()` para comparación por valor
- ✅ Tests unitarios exhaustivos (cobertura >90%)
- ✅ JSDoc completo con ejemplos
- ✅ Manejo de errores con `ValidationError` personalizado

**ENTREGABLES:**
- VOs refactorizados con validaciones robustas
- `value-objects.spec.ts` con tests (cobertura >90%)
- Documentación de invariantes
- `ValidationError` custom exception
```

**Entregables:**
- `Email.vo.ts` refactorizado
- `Password.vo.ts` refactorizado
- `UserRole.vo.ts` refactorizado
- `UserId.vo.ts` refactorizado
- `value-objects.spec.ts` con tests unitarios
- `ValidationError.ts` (custom exception)

---

#### **TASK 2.2: Refactorizar `User.entity.ts` (Rich Domain Model)**

**Prompt:**
```typescript
Refactoriza la entidad `User` siguiendo patrones DDD (Rich Domain Model):

**PRINCIPIOS:**
1. **Encapsular lógica de negocio** dentro de la entidad
2. **Usar Value Objects** en lugar de primitivos
3. **Mantener invariantes** (reglas que siempre deben ser verdad)
4. **Factory methods** para creación segura
5. **Métodos con nombres de negocio** (no solo getters/setters)
6. **Domain Events** para acciones importantes

**ESTRUCTURA ESPERADA:**

```typescript
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserRole } from '../value-objects/user-role.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { RoleChangedEvent } from '../events/role-changed.event';
import { UserDeactivatedEvent } from '../events/user-deactivated.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { PasswordResetEvent } from '../events/password-reset.event';

/**
 * Aggregate Root: User
 * 
 * Representa un usuario del sistema Cermont
 * 
 * Invariantes:
 * - Siempre tiene un email único
 * - Siempre tiene un rol válido
 * - Password siempre está hasheado
 * - isActive puede cambiar, pero se audita
 * 
 * Domain Events:
 * - UserCreatedEvent: cuando se crea un usuario
 * - RoleChangedEvent: cuando cambia el rol
 * - UserDeactivatedEvent: cuando se desactiva
 * - UserUpdatedEvent: cuando se actualiza info
 * - PasswordResetEvent: cuando se resetea password
 */
export class User {
  // Domain Events acumulados (para publicar después)
  private _domainEvents: any[] = [];

  // Constructor privado - forzar uso de factory methods
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _password: Password,
    private _name: string,
    private _role: UserRole,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _phone?: string,
    private _avatar?: string,
  ) {
    this.validate();
  }

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crear un nuevo usuario (para registro)
   * @throws {ValidationError} si datos inválidos
   */
  public static async create(props: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> {
    // Validar y crear VOs
    const id = UserId.generate();
    const email = Email.create(props.email);
    const password = await Password.create(props.password);
    const role = UserRole.create(props.role || 'TECNICO');

    // Validar nombre
    if (!props.name || props.name.trim().length < 3) {
      throw new ValidationError('Nombre debe tener al menos 3 caracteres');
    }

    if (props.name.trim().length > 100) {
      throw new ValidationError('Nombre no puede exceder 100 caracteres');
    }

    const now = new Date();

    const user = new User(
      id,
      email,
      password,
      props.name.trim(),
      role,
      true, // Activo por defecto
      now,
      now,
      props.phone,
      props.avatar,
    );

    // Registrar evento de dominio
    user.addDomainEvent(
      new UserCreatedEvent({
        userId: id.getValue(),
        email: email.getValue(),
        role: role.getValue(),
        timestamp: now,
      }),
    );

    return user;
  }

  /**
   * Recrear desde BD (hydration)
   */
  public static fromPersistence(props: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    phone?: string;
    avatar?: string;
  }): User {
    return new User(
      UserId.create(props.id),
      Email.create(props.email),
      Password.fromHash(props.passwordHash),
      props.name,
      UserRole.create(props.role),
      props.isActive,
      props.createdAt,
      props.updatedAt,
      props.phone,
      props.avatar,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS (COMPORTAMIENTO)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Cambiar rol del usuario
   * 
   * Reglas:
   * - Solo ADMIN puede cambiar roles (validar en use case)
   * - No puede cambiar su propio rol a algo menor (validar en use case)
   * - Se audita el cambio
   */
  public changeRole(newRole: UserRole, changedBy: UserId): void {
    if (this._role.equals(newRole)) {
      throw new BusinessRuleViolationError('El usuario ya tiene ese rol');
    }

    const oldRole = this._role;
    this._role = newRole;
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new RoleChangedEvent({
        userId: this._id.getValue(),
        oldRole: oldRole.getValue(),
        newRole: newRole.getValue(),
        changedBy: changedBy.getValue(),
        timestamp: this._updatedAt,
      }),
    );
  }

  /**
   * Cambiar contraseña
   */
  public async changePassword(newPassword: Password): Promise<void> {
    this._password = newPassword;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new PasswordResetEvent({
        userId: this._id.getValue(),
        timestamp: this._updatedAt,
      }),
    );
  }

  /**
   * Actualizar información del usuario
   */
  public updateInfo(props: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): void {
    if (props.name) {
      if (props.name.trim().length < 3) {
        throw new ValidationError('Nombre debe tener al menos 3 caracteres');
      }
      if (props.name.trim().length > 100) {
        throw new ValidationError('Nombre no puede exceder 100 caracteres');
      }
      this._name = props.name.trim();
    }

    if (props.phone !== undefined) {
      // Validar formato de teléfono (opcional)
      if (props.phone && props.phone.length > 20) {
        throw new ValidationError('Teléfono no puede exceder 20 caracteres');
      }
      this._phone = props.phone || undefined;
    }

    if (props.avatar !== undefined) {
      this._avatar = props.avatar || undefined;
    }

    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserUpdatedEvent({
        userId: this._id.getValue(),
        timestamp: this._updatedAt,
      }),
    );
  }

  /**
   * Activar usuario
   */
  public activate(): void {
    if (this._isActive) {
      throw new BusinessRuleViolationError('El usuario ya está activo');
    }

    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Desactivar usuario
   * 
   * Reglas:
   * - Se audita la desactivación
   * - No puede desactivarse a sí mismo (validar en use case)
   */
  public deactivate(deactivatedBy: UserId): void {
    if (!this._isActive) {
      throw new BusinessRuleViolationError('El usuario ya está inactivo');
    }

    this._isActive = false;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserDeactivatedEvent({
        userId: this._id.getValue(),
        deactivatedBy: deactivatedBy.getValue(),
        timestamp: this._updatedAt,
      }),
    );
  }

  /**
   * Verificar password
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS (Solo lectura)
  // ═══════════════════════════════════════════════════════════════

  public getId(): UserId {
    return this._id;
  }

  public getEmail(): Email {
    return this._email;
  }

  public getName(): string {
    return this._name;
  }

  public getRole(): UserRole {
    return this._role;
  }

  public isActive(): boolean {
    return this._isActive;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public getPhone(): string | undefined {
    return this._phone;
  }

  public getAvatar(): string | undefined {
    return this._avatar;
  }

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN EVENTS
  // ═══════════════════════════════════════════════════════════════

  public getDomainEvents(): any[] {
    return [...this._domainEvents]; // Retornar copia
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE (Serialización)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Convertir a formato de BD (Prisma)
   */
  public toPersistence(): {
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    phone?: string;
    avatar?: string;
  } {
    return {
      id: this._id.getValue(),
      email: this._email.getValue(),
      password: this._password.toPersistence(),
      name: this._name,
      role: this._role.getValue(),
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      phone: this._phone,
      avatar: this._avatar,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    // Validar invariantes que involucren múltiples propiedades
    // Ejemplo: Si es ADMIN, debe estar activo
    if (this._role.isAdmin() && !this._isActive) {
      throw new BusinessRuleViolationError(
        'Un usuario ADMIN no puede estar inactivo'
      );
    }
  }
}
```

**REQUISITOS:**
- Rich Domain Model (comportamiento, no solo datos)
- Métodos con nombres de negocio (`changeRole`, `activate`, no solo `setRole`)
- Encapsulación (campos privados, getters públicos)
- Value Objects en lugar de primitivos
- Domain Events para acciones importantes
- Factory methods para creación
- Validaciones en cada método
- Tests unitarios exhaustivos
- Manejo de errores con excepciones de dominio

**ENTREGABLES:**
- `User.entity.ts` refactorizado (Rich Domain Model)
- `user.entity.spec.ts` con tests exhaustivos
- `BusinessRuleViolationError.ts` (custom exception)
```

**Entregables:**
- `User.entity.ts` refactorizado (Rich Domain Model)
- `user.entity.spec.ts` con tests exhaustivos
- `BusinessRuleViolationError.ts` (custom exception)

---

#### **TASK 2.3: Refactorizar Domain Events**

**Prompt:**
```typescript
Refactoriza TODOS los Domain Events siguiendo patrones DDD:

**ESTRUCTURA DE DOMAIN EVENT (Template):**

```typescript
/**
 * Domain Event: [Nombre]Event
 * 
 * Se publica cuando [descripción de cuándo se publica]
 * 
 * @example
 * const event = new UserCreatedEvent({
 *   userId: '123e4567-...',
 *   email: 'user@example.com',
 *   timestamp: new Date(),
 * });
 */
export class [Nombre]Event {
  public readonly eventName: string;
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly metadata: Record<string, any>;

  constructor(props: {
    aggregateId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }) {
    this.eventName = '[NOMBRE]_EVENT';
    this.aggregateId = props.aggregateId;
    this.timestamp = props.timestamp;
    this.metadata = props.metadata || {};
    Object.freeze(this); // Inmutabilidad
  }

  public toJSON(): any {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
    };
  }
}
```

**EVENTOS A REFACTORIZAR:**

1. **UserCreatedEvent**
   - Props: userId, email, role, timestamp
   - Se publica cuando se crea un usuario

2. **RoleChangedEvent**
   - Props: userId, oldRole, newRole, changedBy, timestamp
   - Se publica cuando cambia el rol

3. **UserDeactivatedEvent**
   - Props: userId, deactivatedBy, timestamp
   - Se publica cuando se desactiva un usuario

4. **UserUpdatedEvent**
   - Props: userId, updatedFields, timestamp
   - Se publica cuando se actualiza información

5. **PasswordResetEvent**
   - Props: userId, timestamp
   - Se publica cuando se resetea password

**REQUISITOS:**
- Inmutables (`Object.freeze`)
- Timestamp automático si no se proporciona
- Método `toJSON()` para serialización
- JSDoc completo

**ENTREGABLES:**
- Todos los eventos refactorizados
- `domain-events.spec.ts` con tests
```

**Entregables:**
- Todos los eventos refactorizados
- `domain-events.spec.ts` con tests

---

### **FASE 3: REFACTORIZACIÓN APPLICATION LAYER (4 días)**

---

#### **TASK 3.1: Refactorizar Use Cases**

**Prompt:**
```typescript
Refactoriza TODOS los Use Cases siguiendo patrones DDD y Clean Architecture:

**ESTRUCTURA DE USE CASE (Template):**

```typescript
/**
 * Use Case: [Nombre]UseCase
 * 
 * Responsabilidad: [Descripción de qué hace]
 * 
 * Reglas de negocio:
 * - [Lista de reglas que aplica]
 * 
 * @example
 * const useCase = new CreateUserUseCase(repository, eventEmitter);
 * const result = await useCase.execute(dto, adminUserId);
 */
@Injectable()
export class [Nombre]UseCase {
  private readonly logger = new Logger([Nombre]UseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: [Nombre]Dto,
    actorUserId: string,
  ): Promise<[Nombre]ResponseDto> {
    // 1. Validar permisos
    // 2. Validar entrada
    // 3. Ejecutar lógica de negocio (usar entidad)
    // 4. Guardar cambios (transacción)
    // 5. Publicar eventos
    // 6. Retornar resultado
  }
}
```

**USE CASES A REFACTORIZAR:**

### **TASK 3.1.1: CreateUserUseCase**

**Requisitos:**
- Validar que el actor tenga permisos (ADMIN)
- Validar email único (repository.findByEmail)
- Crear User entity (factory method)
- Guardar en BD (transacción)
- Publicar UserCreatedEvent
- Retornar UserResponseDto

**Código esperado:**
```typescript
@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: CreateUserDto,
    actorUserId: string,
  ): Promise<UserResponseDto> {
    const context = {
      action: 'CREATE_USER',
      actorUserId,
      email: dto.email,
    };

    this.logger.log('Creando usuario', context);

    try {
      // 1. Validar email único
      const existingUser = await this.userRepository.findByEmail(
        Email.create(dto.email),
      );

      if (existingUser) {
        throw new ConflictException(
          `Email ${dto.email} ya está registrado`,
        );
      }

      // 2. Crear entidad de dominio
      const user = await User.create({
        email: dto.email,
        password: dto.password,
        name: dto.name,
        role: dto.role,
        phone: dto.phone,
        avatar: dto.avatar,
      });

      // 3. Guardar en BD
      await this.userRepository.save(user);

      // 4. Publicar eventos
      const events = user.getDomainEvents();
      for (const event of events) {
        this.eventEmitter.emit(event.eventName, event);
      }
      user.clearDomainEvents();

      this.logger.log('Usuario creado exitosamente', {
        ...context,
        userId: user.getId().getValue(),
      });

      // 5. Mapear a DTO
      return UserMapper.toResponseDto(user);
    } catch (error) {
      this.logger.error('Error creando usuario', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
```

### **TASK 3.1.2: ChangeUserRoleUseCase**

**Requisitos:**
- Validar permisos (solo ADMIN)
- Validar que no se cambie su propio rol
- Validar transiciones permitidas
- Usar método de dominio `user.changeRole()`
- Publicar RoleChangedEvent

### **TASK 3.1.3: ResetPasswordUseCase**

**Requisitos:**
- Generar token seguro (crypto.randomBytes)
- Guardar token con expiración (15 min)
- Publicar PasswordResetEvent
- NO retornar token en respuesta

### **TASK 3.1.4: ToggleUserActiveUseCase**

**Requisitos:**
- Validar permisos (ADMIN/COORDINADOR)
- Validar que no se desactive a sí mismo
- Usar método de dominio `user.activate()` o `user.deactivate()`
- Publicar UserDeactivatedEvent si aplica

### **TASK 3.1.5: ListUsersUseCase**

**Requisitos:**
- Paginación eficiente (max 100 por página)
- Filtros: rol, activo, búsqueda por nombre/email
- Ordenamiento configurable
- Retornar PaginatedResponse

### **TASK 3.1.6: GetUserStatsUseCase**

**Requisitos:**
- Queries agregadas optimizadas
- Caching (5 minutos)
- Retornar estadísticas formateadas

**REQUISITOS GENERALES:**
- ✅ Una responsabilidad por use case
- ✅ Validación de permisos
- ✅ Uso de entidades de dominio (no Prisma models)
- ✅ Publicación de eventos
- ✅ Logging estructurado
- ✅ Manejo de errores consistente
- ✅ Tests unitarios exhaustivos

**ENTREGABLES:**
- Todos los use cases refactorizados
- `use-cases.spec.ts` con tests unitarios
- Documentación de cada use case
```

**Entregables:**
- Todos los use cases refactorizados
- Tests unitarios para cada use case
- Documentación de use cases

---

#### **TASK 3.2: Refactorizar DTOs y Validación**

**Prompt:**
```typescript
Refactoriza TODOS los DTOs con validación robusta (Zod + class-validator):

**ESTRUCTURA DE DTO (Template):**

```typescript
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod para validación
 */
export const [Nombre]Schema = z.object({
  // Definir validaciones
});

export type [Nombre]Dto = z.infer<typeof [Nombre]Schema>;

/**
 * DTO para [descripción]
 */
export class [Nombre]Dto {
  @ApiProperty({ description: '...', example: '...' })
  // Propiedades con decoradores
}
```

**DTOs A REFACTORIZAR:**

1. **CreateUserDto**
   - email: Email válido
   - password: Complejidad (min 8, mayúscula, número, especial)
   - name: Min 3, max 100
   - role: Enum válido
   - phone: Opcional, formato válido
   - avatar: Opcional, URL válida

2. **UpdateUserDto**
   - name: Opcional, min 3, max 100
   - phone: Opcional
   - avatar: Opcional

3. **ChangeRoleDto**
   - userId: UUID válido
   - role: Enum válido

4. **ChangePasswordDto**
   - userId: UUID válido
   - newPassword: Complejidad

5. **ToggleActiveDto**
   - userId: UUID válido

6. **UserQueryDto**
   - page: Min 1, default 1
   - limit: Min 1, max 100, default 10
   - role: Opcional, enum
   - isActive: Opcional, boolean
   - search: Opcional, string

7. **UserResponseDto**
   - Todos los campos de usuario (sin password)

**REQUISITOS:**
- Validación Zod + class-validator
- Documentación Swagger completa
- Ejemplos en decoradores
- Mensajes de error descriptivos

**ENTREGABLES:**
- Todos los DTOs refactorizados
- Schemas Zod exportados
- Tests de validación
```

**Entregables:**
- Todos los DTOs refactorizados
- Schemas Zod
- Tests de validación

---

#### **TASK 3.3: Refactorizar Mappers**

**Prompt:**
```typescript
Refactoriza los Mappers para mapeo bidireccional Domain ↔ DTO:

**ESTRUCTURA DE MAPPER:**

```typescript
/**
 * Mapper: UserMapper
 * 
 * Mapea entre entidades de dominio y DTOs
 * Pure functions sin efectos secundarios
 */
export class UserMapper {
  /**
   * Domain Entity → Response DTO
   */
  public static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      role: user.getRole().getValue(),
      isActive: user.isActive(),
      phone: user.getPhone(),
      avatar: user.getAvatar(),
      createdAt: user.getCreatedAt().toISOString(),
      updatedAt: user.getUpdatedAt().toISOString(),
    };
  }

  /**
   * Domain Entity → Persistence (Prisma)
   */
  public static toPersistence(user: User): PrismaUserCreateInput {
    return user.toPersistence();
  }

  /**
   * Persistence (Prisma) → Domain Entity
   */
  public static toDomain(prismaUser: any): User {
    return User.fromPersistence({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.password,
      name: prismaUser.name,
      role: prismaUser.role,
      isActive: prismaUser.active,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
    });
  }

  /**
   * Array de Domain Entities → Array de Response DTOs
   */
  public static toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map(this.toResponseDto);
  }
}
```

**REQUISITOS:**
- Pure functions (sin efectos secundarios)
- Mapeo bidireccional
- Manejo de valores null/undefined
- Tests exhaustivos

**ENTREGABLES:**
- `User.mapper.ts` refactorizado
- `user.mapper.spec.ts` con tests
```

**Entregables:**
- `User.mapper.ts` refactorizado
- Tests de mappers

---

#### **TASK 3.4: Refactorizar Event Handlers**

**Prompt:**
```typescript
Refactoriza los Event Handlers para reaccionar a Domain Events:

**ESTRUCTURA DE EVENT HANDLER:**

```typescript
/**
 * Event Handler: UserCreatedHandler
 * 
 * Reacciona a UserCreatedEvent
 * Responsabilidades:
 * - Enviar email de bienvenida
 * - Registrar en auditoría
 */
@Injectable()
export class UserCreatedHandler {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(
    private readonly emailService: EmailService, // Si existe
    private readonly auditService: AuditService, // Si existe
  ) {}

  @OnEvent('user.created')
  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log('Procesando UserCreatedEvent', {
      userId: event.aggregateId,
    });

    try {
      // 1. Enviar email de bienvenida
      await this.emailService.sendWelcomeEmail({
        email: event.metadata.email,
        userId: event.aggregateId,
      });

      // 2. Registrar en auditoría
      await this.auditService.log({
        action: 'USER_CREATED',
        userId: event.aggregateId,
        timestamp: event.timestamp,
      });

      this.logger.log('UserCreatedEvent procesado exitosamente');
    } catch (error) {
      this.logger.error('Error procesando UserCreatedEvent', {
        error: error instanceof Error ? error.message : String(error),
        event,
      });
      // No lanzar error para no romper flujo principal
    }
  }
}
```

**HANDLERS A REFACTORIZAR:**

1. **UserCreatedHandler** - Email de bienvenida, auditoría
2. **RoleChangedHandler** - Auditoría, notificación
3. **UserDeactivatedHandler** - Auditoría, notificación
4. **PasswordResetHandler** - Email con link de reset

**REQUISITOS:**
- Idempotentes (pueden ejecutarse múltiples veces)
- Manejo de errores sin romper flujo principal
- Logging estructurado
- Tests unitarios

**ENTREGABLES:**
- Todos los handlers refactorizados
- Tests de handlers
```

**Entregables:**
- Todos los event handlers refactorizados
- Tests de handlers

---

### **FASE 4: REFACTORIZACIÓN INFRASTRUCTURE LAYER (2 días)**

---

#### **TASK 4.1: Refactorizar Repository (Prisma)**

**Prompt:**
```typescript
Refactoriza el UserRepository para implementar IUserRepository correctamente:

**REQUISITOS:**
- Implementar TODOS los métodos de la interfaz
- Mapear Prisma models → Domain Entities
- Mapear Domain Entities → Prisma models
- Manejo de errores Prisma
- Optimización de queries (evitar N+1)
- Transacciones donde sea necesario

**CÓDIGO ESPERADO:**

```typescript
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserPrismaMapper,
  ) {}

  async save(user: User): Promise<void> {
    const data = user.toPersistence();
    
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!prismaUser) {
      return null;
    }

    return this.mapper.toDomain(prismaUser);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!prismaUser) {
      return null;
    }

    return this.mapper.toDomain(prismaUser);
  }

  async findAll(filters: UserQueryFilters): Promise<User[]> {
    const where = this.buildWhereClause(filters);
    
    const prismaUsers = await this.prisma.user.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: filters.orderBy || { createdAt: 'desc' },
    });

    return prismaUsers.map(u => this.mapper.toDomain(u));
  }

  async count(filters: UserQueryFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.user.count({ where });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  private buildWhereClause(filters: UserQueryFilters): any {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.active = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
```

**REQUISITOS:**
- Implementar TODOS los métodos de IUserRepository
- Mapeo correcto Domain ↔ Prisma
- Optimización de queries
- Manejo de errores
- Tests de integración

**ENTREGABLES:**
- `UserRepository` refactorizado
- `user.repository.spec.ts` (tests de integración)
```

**Entregables:**
- `UserRepository` refactorizado
- Tests de integración

---

#### **TASK 4.2: Refactorizar Controller**

**Prompt:**
```typescript
Refactoriza el AdminController siguiendo el patrón del DashboardController:

**REQUISITOS:**
- Controller delgado (solo delega a use cases)
- Validación con ValidationPipe (Zod)
- Guards (JwtAuthGuard, RolesGuard)
- Documentación Swagger completa
- Manejo de errores consistente
- Logging estructurado
- Rate limiting donde sea necesario

**ESTRUCTURA:**

```typescript
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    // ... otros use cases
  ) {}

  @Post('users')
  @Roles('ADMIN')
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    const context = this.createLogContext('CREATE_USER', user);
    this.logger.log('Creando usuario', context);

    try {
      const result = await this.createUserUseCase.execute(
        dto,
        user.userId,
      );
      
      this.logger.log('Usuario creado exitosamente', context);
      return result;
    } catch (error) {
      this.handleError(error, context, 'Error creando usuario');
    }
  }

  // ... otros endpoints

  private createLogContext(action: string, user: JwtPayload): LogContext {
    return {
      action,
      userId: user.userId,
      role: user.role,
      timestamp: new Date().toISOString(),
    };
  }

  private handleError(error: unknown, context: LogContext, message: string): never {
    const err = error as Error;
    this.logger.error(message, {
      ...context,
      error: err.message,
      stack: err.stack,
    });
    throw error;
  }
}
```

**ENDPOINTS A REFACTORIZAR:**

1. `POST /admin/users` - Crear usuario
2. `GET /admin/users` - Listar usuarios (paginado)
3. `GET /admin/users/:id` - Obtener usuario por ID
4. `PATCH /admin/users/:id` - Actualizar usuario
5. `PATCH /admin/users/:id/role` - Cambiar rol
6. `PATCH /admin/users/:id/toggle-active` - Activar/Desactivar
7. `POST /admin/users/:id/reset-password` - Reset password
8. `GET /admin/users/stats` - Estadísticas

**REQUISITOS:**
- Controller delgado
- Validación completa
- Documentación Swagger
- Rate limiting
- Tests E2E

**ENTREGABLES:**
- `AdminController` refactorizado
- Tests E2E
```

**Entregables:**
- `AdminController` refactorizado
- Tests E2E

---

### **FASE 5: TESTING Y VALIDACIÓN (2 días)**

---

#### **TASK 5.1: Tests Unitarios**

**Prompt:**
```
Crea tests unitarios exhaustivos para:

1. **Value Objects** (cobertura >90%)
   - Email.vo.spec.ts
   - Password.vo.spec.ts
   - UserRole.vo.spec.ts
   - UserId.vo.spec.ts

2. **Domain Entities** (cobertura >90%)
   - User.entity.spec.ts

3. **Use Cases** (cobertura >80%)
   - create-user.use-case.spec.ts
   - change-user-role.use-case.spec.ts
   - etc.

**ESTRUCTURA DE TEST:**

```typescript
describe('Email Value Object', () => {
  describe('create', () => {
    it('debe crear email válido', () => {
      const email = Email.create('user@example.com');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('debe normalizar a lowercase', () => {
      const email = Email.create('USER@EXAMPLE.COM');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('debe lanzar error si formato inválido', () => {
      expect(() => Email.create('invalid')).toThrow(ValidationError);
    });
  });

  describe('equals', () => {
    it('debe comparar por valor', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      expect(email1.equals(email2)).toBe(true);
    });
  });
});
```

**REQUISITOS:**
- Cobertura >90% para domain layer
- Cobertura >80% para application layer
- Tests de casos edge
- Tests de validaciones
- Tests de errores

**ENTREGABLES:**
- Todos los tests unitarios
- Reporte de cobertura
```

**Entregables:**
- Tests unitarios completos
- Reporte de cobertura

---

#### **TASK 5.2: Tests de Integración**

**Prompt:**
```
Crea tests de integración para:

1. **Repository** (con BD de test)
   - user.repository.integration.spec.ts

2. **Use Cases** (con repositorio mock)
   - use-cases.integration.spec.ts

**REQUISITOS:**
- BD de test (PostgreSQL en memoria o Docker)
- Setup/Teardown de datos
- Tests de transacciones
- Tests de queries complejas

**ENTREGABLES:**
- Tests de integración
- Configuración de BD de test
```

**Entregables:**
- Tests de integración
- Configuración de test DB

---

#### **TASK 5.3: Tests E2E**

**Prompt:**
```
Crea tests E2E para endpoints del AdminController:

**ENDPOINTS A TESTEAR:**

1. `POST /admin/users` - Crear usuario
2. `GET /admin/users` - Listar usuarios
3. `PATCH /admin/users/:id/role` - Cambiar rol
4. etc.

**REQUISITOS:**
- Autenticación JWT
- Validación de permisos
- Validación de entrada
- Respuestas correctas

**ENTREGABLES:**
- Tests E2E completos
- Configuración de test environment
```

**Entregables:**
- Tests E2E
- Configuración de test environment

---

### **FASE 6: DOCUMENTACIÓN Y ENTREGA (1 día)**

---

#### **TASK 6.1: Documentación Completa**

**Prompt:**
```
Genera documentación completa del módulo refactorizado:

1. **README.md** del módulo
   - Arquitectura
   - Flujos de negocio
   - Guía de uso
   - Ejemplos

2. **API Documentation** (Swagger)
   - Todos los endpoints documentados
   - Ejemplos de requests/responses
   - Códigos de error

3. **Architecture Decision Records (ADRs)**
   - Decisiones de diseño
   - Justificaciones
   - Alternativas consideradas

**ENTREGABLES:**
- README.md completo
- Swagger actualizado
- ADRs documentados
```

**Entregables:**
- Documentación completa
- Swagger actualizado
- ADRs

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Objetivos Cuantitativos:**
- ✅ Cobertura de tests >85%
- ✅ 0 errores de linter
- ✅ 0 uso de `any` en código de producción
- ✅ Todos los VOs inmutables
- ✅ Todos los use cases con una responsabilidad
- ✅ 100% de dependencias inyectadas (DIP)

### **Objetivos Cualitativos:**
- ✅ Código mantenible y legible
- ✅ Arquitectura DDD correcta
- ✅ Principios SOLID aplicados
- ✅ Security best practices
- ✅ Performance optimizado

---

## 🚀 **EJECUCIÓN**

**Orden de ejecución recomendado:**
1. Fase 1: Análisis (2 días)
2. Fase 2: Domain Layer (3 días)
3. Fase 3: Application Layer (4 días)
4. Fase 4: Infrastructure Layer (2 días)
5. Fase 5: Testing (2 días)
6. Fase 6: Documentación (1 día)

**Total estimado:** 14 días

---

## ✅ **CHECKLIST FINAL**

Antes de considerar la refactorización completa:

- [ ] Todos los Value Objects refactorizados y testeados
- [ ] User entity refactorizada (Rich Domain Model)
- [ ] Todos los Use Cases refactorizados
- [ ] Repository implementado correctamente
- [ ] Controller refactorizado
- [ ] Tests unitarios >90% cobertura (domain)
- [ ] Tests unitarios >80% cobertura (application)
- [ ] Tests de integración completos
- [ ] Tests E2E completos
- [ ] Documentación actualizada
- [ ] 0 errores de linter
- [ ] 0 uso de `any`
- [ ] Security audit pasado
- [ ] Performance optimizado

---

**¡Éxito en la refactorización!** 🚀


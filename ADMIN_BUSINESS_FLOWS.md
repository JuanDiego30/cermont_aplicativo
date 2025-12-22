# 🔄 FLUJOS DE NEGOCIO - MÓDULO `/admin`

**Fecha:** 2024-12-22

---

## 📋 ÍNDICE DE FLUJOS

1. [Crear Usuario](#1-crear-usuario)
2. [Actualizar Usuario](#2-actualizar-usuario)
3. [Cambiar Rol de Usuario](#3-cambiar-rol-de-usuario)
4. [Reset Password](#4-reset-password)
5. [Activar/Desactivar Usuario](#5-activardesactivar-usuario)
6. [Listar Usuarios](#6-listar-usuarios)
7. [Obtener Estadísticas](#7-obtener-estadísticas)

---

## 1. CREAR USUARIO

### **Descripción:**
Un administrador crea un nuevo usuario en el sistema con email, nombre, contraseña y rol.

### **Actores:**
- **Actor Principal:** ADMIN
- **Actor Secundario:** Sistema (event handlers)

### **Precondiciones:**
- Usuario autenticado con rol ADMIN
- Token JWT válido

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant Guard as RolesGuard
    participant Pipe as ZodValidationPipe
    participant UseCase as CreateUserUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant VO as Value Objects
    participant EventEmitter as EventEmitter2
    participant Handler as UserCreatedHandler
    participant DB as PostgreSQL

    Client->>Controller: POST /admin/users<br/>{email, name, password, role}
    
    Controller->>Guard: Check JWT + Role (ADMIN)
    Guard-->>Controller: ✅ Authorized
    
    Controller->>Pipe: Validate CreateUserDto (Zod)
    Pipe->>Pipe: Validate email format
    Pipe->>Pipe: Validate name (2-100 chars)
    Pipe->>Pipe: Validate password (min 8, complexity)
    Pipe->>Pipe: Validate role enum
    Pipe-->>Controller: ✅ Valid
    
    Controller->>UseCase: execute({...dto, createdBy: adminUserId})
    
    UseCase->>Repo: existsByEmail(email)
    Repo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repo: null (not found)
    Repo-->>UseCase: false
    
    UseCase->>VO: Email.create(dto.email)
    VO->>VO: Validate format (regex)
    VO->>VO: Normalize to lowercase
    VO-->>UseCase: Email VO
    
    UseCase->>VO: Password.createFromPlainText(dto.password)
    VO->>VO: Validate complexity (min 8, uppercase, lowercase, number)
    VO->>VO: Hash with bcrypt (10 rounds) ⚠️
    VO-->>UseCase: Password VO
    
    UseCase->>VO: UserRole.create(dto.role)
    VO->>VO: Validate role enum
    VO-->>UseCase: UserRole VO
    
    UseCase->>VO: UserId.create()
    VO->>VO: Generate UUID v4
    VO-->>UseCase: UserId VO
    
    UseCase->>Entity: UserEntity.create({email, name, password, role, ...})
    Entity->>Entity: Validate name (2-100 chars)
    Entity->>Entity: Validate phone format (if provided)
    Entity->>Entity: Create UserCreatedEvent
    Entity-->>UseCase: UserEntity
    
    UseCase->>Repo: save(user)
    Repo->>Repo: Check if exists (findById)
    Repo->>DB: INSERT INTO users (id, email, name, password, role, active, ...)
    DB-->>Repo: User record
    Repo->>Repo: Map Prisma → Domain Entity
    Repo-->>UseCase: UserEntity (saved)
    
    UseCase->>EventEmitter: emit('UserCreatedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log (action, userId, entityType, ...)
    Handler-->>EventEmitter: ✅ Done
    
    UseCase->>UseCase: Map Entity → UserResponseDto
    UseCase-->>Controller: UserResponseDto
    Controller-->>Client: 201 Created<br/>{success: true, data: UserResponseDto}
```

### **Validaciones:**

| Validación | Ubicación | Error |
|------------|-----------|-------|
| Email único | `CreateUserUseCase:38` | `ConflictException` |
| Email formato | `Email.vo:32` | `Error` (debería ser `ValidationError`) |
| Nombre 2-100 chars | `UserEntity:77` | `Error` |
| Password complejidad | `Password.vo:54` | `Error` |
| Rol válido | `UserRole.vo:31` | `Error` |

### **Casos Edge:**

1. **Email duplicado:**
   - Flujo: `existsByEmail()` retorna `true`
   - Resultado: `ConflictException` (409)

2. **Password débil:**
   - Flujo: `Password.createFromPlainText()` valida
   - Resultado: `Error` con feedback

3. **Rol inválido:**
   - Flujo: `UserRole.create()` valida
   - Resultado: `Error`

### **Problemas Identificados:**

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| bcrypt rounds = 10 | `Password.vo:19` | 🔴 CRÍTICO |
| Usa `Error` genérico | Múltiples | 🟠 ALTO |
| No transacción | `CreateUserUseCase` | 🟡 MEDIO |

---

## 2. ACTUALIZAR USUARIO

### **Descripción:**
Un administrador actualiza información básica de un usuario (nombre, teléfono, avatar).

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as UpdateUserUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant EventEmitter as EventEmitter2
    participant Handler as UserUpdatedHandler
    participant DB as PostgreSQL

    Client->>Controller: PATCH /admin/users/:id<br/>{name?, phone?, avatar?}
    
    Controller->>UseCase: execute({userId, ...dto, updatedBy})
    
    UseCase->>Repo: findById(userId)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>Repo: User record
    Repo-->>UseCase: UserEntity
    
    alt Usuario no encontrado
        UseCase-->>Controller: NotFoundException (404)
    end
    
    UseCase->>Entity: update({name?, phone?, avatar?}, updatedBy)
    Entity->>Entity: Validate name (if provided)
    Entity->>Entity: Validate phone format (if provided)
    Entity->>Entity: Create UserUpdatedEvent
    Entity-->>UseCase: UserEntity (updated)
    
    UseCase->>Repo: save(user)
    Repo->>DB: UPDATE users SET name=?, phone=?, avatar=?, updatedAt=?
    DB-->>Repo: Updated record
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('UserUpdatedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: ✅ Done
    
    UseCase->>UseCase: Map Entity → UserResponseDto
    UseCase-->>Controller: UserResponseDto
    Controller-->>Client: 200 OK<br/>{success: true, data: UserResponseDto}
```

### **Validaciones:**

| Validación | Ubicación | Error |
|------------|-----------|-------|
| Usuario existe | `UpdateUserUseCase:37` | `NotFoundException` |
| Nombre válido | `UserEntity:196` | `Error` |
| Teléfono formato | `UserEntity:207` | `Error` |

### **Casos Edge:**

1. **Usuario no encontrado:**
   - Resultado: `NotFoundException` (404)

2. **Sin cambios:**
   - Flujo: `user.update()` no detecta cambios
   - Resultado: No se emite evento, pero se retorna usuario

---

## 3. CAMBIAR ROL DE USUARIO

### **Descripción:**
Un administrador cambia el rol de un usuario.

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as ChangeUserRoleUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant EventEmitter as EventEmitter2
    participant Handler as RoleChangedHandler
    participant DB as PostgreSQL

    Client->>Controller: PATCH /admin/users/:id/role<br/>{role: 'supervisor'}
    
    Controller->>UseCase: execute({userId, newRole, changedBy})
    
    UseCase->>Repo: findById(userId)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>Repo: User record
    Repo-->>UseCase: UserEntity
    
    UseCase->>UseCase: Validate: userId !== changedBy OR not admin
    alt Auto-cambio de rol admin
        UseCase-->>Controller: BadRequestException (400)
    end
    
    UseCase->>UseCase: Validate: not last admin
    UseCase->>Repo: countAdmins()
    Repo->>DB: SELECT COUNT(*) FROM users WHERE role='admin' AND active=true
    DB-->>Repo: 1
    alt Es último admin
        UseCase-->>Controller: BadRequestException (400)
    end
    
    UseCase->>Entity: changeRole(newRole, changedBy)
    Entity->>Entity: Validate: role not same
    Entity->>Entity: Create RoleChangedEvent
    Entity-->>UseCase: UserEntity (updated)
    
    UseCase->>Repo: save(user)
    Repo->>DB: UPDATE users SET role=?, updatedAt=?
    DB-->>Repo: Updated record
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('RoleChangedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: ✅ Done
    
    UseCase->>UseCase: Map Entity → UserResponseDto
    UseCase-->>Controller: UserResponseDto
    Controller-->>Client: 200 OK<br/>{success: true, data: UserResponseDto}
```

### **Validaciones:**

| Validación | Ubicación | Error |
|------------|-----------|-------|
| Usuario existe | `ChangeUserRoleUseCase:43` | `NotFoundException` |
| No auto-cambio admin | `ChangeUserRoleUseCase:49` | `BadRequestException` |
| No último admin | `ChangeUserRoleUseCase:58` | `BadRequestException` |
| Rol diferente | `UserEntity:233` | `Error` |

### **Casos Edge:**

1. **Auto-cambio de rol admin:**
   - Flujo: `userId === changedBy && user.role.isAdmin() && newRole !== 'admin'`
   - Resultado: `BadRequestException` (400)

2. **Último admin:**
   - Flujo: `countAdmins() <= 1`
   - Resultado: `BadRequestException` (400)

3. **Mismo rol:**
   - Flujo: `user.role.equals(newRole)`
   - Resultado: `Error` (debería ser `BusinessRuleViolationError`)

### **Problemas Identificados:**

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| No transacción | `ChangeUserRoleUseCase` | 🟡 MEDIO |
| Usa `Error` genérico | `UserEntity:234` | 🟠 ALTO |

---

## 4. RESET PASSWORD

### **Descripción:**
Un administrador resetea la contraseña de un usuario.

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as ResetPasswordUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant VO as Password VO
    participant EventEmitter as EventEmitter2
    participant Handler as PasswordResetHandler
    participant DB as PostgreSQL

    Client->>Controller: PATCH /admin/users/:id/password<br/>{newPassword}
    
    Controller->>UseCase: execute({userId, newPassword, resetBy})
    
    UseCase->>Repo: findById(userId)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>Repo: User record
    Repo-->>UseCase: UserEntity
    
    UseCase->>Entity: changePassword(newPassword, resetBy, isAdminReset=true)
    Entity->>VO: Password.createFromPlainText(newPassword)
    VO->>VO: Validate complexity
    VO->>VO: Hash with bcrypt (10 rounds) ⚠️
    VO-->>Entity: Password VO
    Entity->>Entity: Create PasswordResetEvent
    Entity-->>UseCase: UserEntity (updated)
    
    UseCase->>Repo: save(user)
    Repo->>DB: UPDATE users SET password=?, updatedAt=?
    DB-->>Repo: Updated record
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('PasswordResetEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: ✅ Done
    
    UseCase-->>Controller: {success: true, message: '...'}
    Controller-->>Client: 200 OK<br/>{success: true, message: '...'}
```

### **Validaciones:**

| Validación | Ubicación | Error |
|------------|-----------|-------|
| Usuario existe | `ResetPasswordUseCase:45` | `NotFoundException` |
| Password complejidad | `Password.vo:54` | `Error` |

### **Problemas Identificados:**

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| bcrypt rounds = 10 | `Password.vo:19` | 🔴 CRÍTICO |
| No envía email | `PasswordResetHandler` | 🟡 MEDIO |

---

## 5. ACTIVAR/DESACTIVAR USUARIO

### **Descripción:**
Un administrador activa o desactiva un usuario (soft delete).

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as ToggleUserActiveUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant EventEmitter as EventEmitter2
    participant Handler as UserDeactivatedHandler
    participant DB as PostgreSQL

    Client->>Controller: PATCH /admin/users/:id/toggle-active<br/>{active: false}
    
    Controller->>UseCase: execute({userId, active, reason?, changedBy})
    
    UseCase->>Repo: findById(userId)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>Repo: User record
    Repo-->>UseCase: UserEntity
    
    UseCase->>UseCase: Validate: not self-deactivation
    alt Auto-desactivación
        UseCase-->>Controller: BadRequestException (400)
    end
    
    UseCase->>UseCase: Validate: not last admin (if desactivating admin)
    UseCase->>Repo: countAdmins()
    Repo->>DB: SELECT COUNT(*) FROM users WHERE role='admin' AND active=true
    DB-->>Repo: 1
    alt Es último admin activo
        UseCase-->>Controller: BadRequestException (400)
    end
    
    alt Activar
        UseCase->>Entity: activate()
        Entity->>Entity: Validate: not already active
        Entity-->>UseCase: UserEntity (updated)
    else Desactivar
        UseCase->>Entity: deactivate(changedBy, reason)
        Entity->>Entity: Validate: not already inactive
        Entity->>Entity: Create UserDeactivatedEvent
        Entity-->>UseCase: UserEntity (updated)
    end
    
    UseCase->>Repo: save(user)
    Repo->>DB: UPDATE users SET active=?, updatedAt=?
    DB-->>Repo: Updated record
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('UserDeactivatedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: ✅ Done
    
    UseCase-->>Controller: {success: true, message: '...'}
    Controller-->>Client: 200 OK<br/>{success: true, message: '...'}
```

### **Validaciones:**

| Validación | Ubicación | Error |
|------------|-----------|-------|
| Usuario existe | `ToggleUserActiveUseCase:47` | `NotFoundException` |
| No auto-desactivación | `ToggleUserActiveUseCase:53` | `BadRequestException` |
| No último admin | `ToggleUserActiveUseCase:58` | `BadRequestException` |
| Ya activo/inactivo | `UserEntity:284,296` | `Error` |

### **Casos Edge:**

1. **Auto-desactivación:**
   - Flujo: `userId === changedBy && !active`
   - Resultado: `BadRequestException` (400)

2. **Último admin activo:**
   - Flujo: `countAdmins() <= 1 && user.role.isAdmin() && !active`
   - Resultado: `BadRequestException` (400)

---

## 6. LISTAR USUARIOS

### **Descripción:**
Un administrador lista usuarios con filtros y paginación.

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as ListUsersUseCase
    participant Repo as UserRepository
    participant DB as PostgreSQL

    Client->>Controller: GET /admin/users?role=tecnico&page=1&pageSize=10
    
    Controller->>UseCase: execute({role, active, search, page, pageSize})
    
    UseCase->>Repo: findAll(filters)
    Repo->>Repo: Build WHERE clause
    Repo->>DB: SELECT * FROM users WHERE role=? AND active=? LIMIT ? OFFSET ?
    Repo->>DB: SELECT COUNT(*) FROM users WHERE role=? AND active=?
    DB-->>Repo: Users array + total count
    Repo->>Repo: Map Prisma → Domain Entities
    Repo-->>UseCase: PaginatedResult<UserEntity>
    
    UseCase->>UseCase: Map Entities → UserResponseDto[]
    UseCase-->>Controller: PaginatedUsersResponseDto
    Controller-->>Client: 200 OK<br/>{data: [...], total, page, pageSize, totalPages}
```

### **Filtros Disponibles:**

| Filtro | Tipo | Descripción |
|--------|------|-------------|
| `role` | string | Filtrar por rol |
| `active` | boolean | Filtrar por estado activo |
| `search` | string | Búsqueda en nombre/email |
| `page` | number | Página (default: 1) |
| `pageSize` | number | Tamaño de página (default: 10) |

### **Optimizaciones:**

- ✅ Usa `Promise.all()` para queries paralelas
- ✅ Paginación eficiente (LIMIT/OFFSET)
- ✅ Búsqueda case-insensitive

---

## 7. OBTENER ESTADÍSTICAS

### **Descripción:**
Un administrador obtiene estadísticas de usuarios.

### **Actores:**
- **Actor Principal:** ADMIN

### **Flujo Principal:**

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as GetUserStatsUseCase
    participant Repo as UserRepository
    participant DB as PostgreSQL

    Client->>Controller: GET /admin/stats/users
    
    Controller->>UseCase: execute()
    
    UseCase->>Repo: getStats()
    Repo->>DB: SELECT COUNT(*) FROM users
    Repo->>DB: SELECT COUNT(*) FROM users WHERE active=true
    Repo->>DB: SELECT role, COUNT(*) FROM users GROUP BY role
    DB-->>Repo: Total, activos, porRol
    Repo-->>UseCase: UserStats
    
    UseCase-->>Controller: UserStatsResponseDto
    Controller-->>Client: 200 OK<br/>{total, activos, porRol: {...}}
```

### **Estadísticas Retornadas:**

| Métrica | Descripción |
|---------|-------------|
| `total` | Total de usuarios |
| `activos` | Usuarios activos |
| `porRol` | Conteo por rol (admin, supervisor, tecnico, administrativo) |

### **Optimizaciones:**

- ✅ Queries agregadas eficientes
- ⚠️ Podría agregar caching (5 minutos)

---

## 📊 RESUMEN DE PROBLEMAS POR FLUJO

| Flujo | Problemas Críticos | Problemas Altos | Problemas Medios |
|-------|-------------------|-----------------|------------------|
| Crear Usuario | bcrypt rounds=10 | Error genérico | No transacción |
| Actualizar Usuario | - | Error genérico | - |
| Cambiar Rol | - | Error genérico | No transacción |
| Reset Password | bcrypt rounds=10 | - | No email |
| Activar/Desactivar | - | Error genérico | No transacción |
| Listar Usuarios | - | - | - |
| Estadísticas | - | - | Falta caching |

---

## ✅ RECOMENDACIONES POR FLUJO

### **Todos los Flujos:**
1. ✅ Agregar transacciones donde necesario
2. ✅ Reemplazar `Error` por excepciones custom
3. ✅ Mejorar logging estructurado

### **Flujos Críticos:**
1. 🔴 Cambiar bcrypt rounds a 12 (Crear, Reset Password)
2. 🟡 Agregar transacciones (Cambiar Rol, Activar/Desactivar)

### **Flujos de Lectura:**
1. 🟡 Agregar caching (Estadísticas)

---

**Siguiente:** Análisis de casos edge y validaciones faltantes.


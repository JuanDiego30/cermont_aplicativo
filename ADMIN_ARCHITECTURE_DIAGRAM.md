# 🏗️ DIAGRAMA DE ARQUITECTURA - MÓDULO `/admin`

**Fecha:** 2024-12-22  
**Versión:** Actual (Pre-refactorización)

---

## 📐 ARQUITECTURA ACTUAL (DDD)

```mermaid
graph TB
    subgraph "Infrastructure Layer"
        AC[AdminController]
        UR[UserRepository]
        UPM[UserPrismaMapper]
        AS[AdminService - Legacy]
    end

    subgraph "Application Layer"
        CUC[CreateUserUseCase]
        UUC[UpdateUserUseCase]
        CRUC[ChangeUserRoleUseCase]
        TAUC[ToggleUserActiveUseCase]
        RPUC[ResetPasswordUseCase]
        LUC[ListUsersUseCase]
        GUC[GetUserByIdUseCase]
        GSUC[GetUserStatsUseCase]
        
        UH[UserCreatedHandler]
        RCH[RoleChangedHandler]
        UDH[UserDeactivatedHandler]
        PRH[PasswordResetHandler]
        
        UM[UserMapper]
        CD[CreateUserDto]
        UD[UpdateUserDto]
        URD[UserResponseDto]
    end

    subgraph "Domain Layer"
        UE[UserEntity]
        E[Email VO]
        P[Password VO]
        UR_VO[UserRole VO]
        UI[UserId VO]
        
        UCE[UserCreatedEvent]
        RCE[RoleChangedEvent]
        UDE[UserDeactivatedEvent]
        PRE[PasswordResetEvent]
        
        IUR[IUserRepository Interface]
    end

    subgraph "External"
        PS[PrismaService]
        EE[EventEmitter2]
        DB[(PostgreSQL)]
    end

    %% Infrastructure → Application
    AC --> CUC
    AC --> UUC
    AC --> CRUC
    AC --> TAUC
    AC --> RPUC
    AC --> LUC
    AC --> GUC
    AC --> GSUC
    AC -.->|Legacy| AS

    %% Application → Domain
    CUC --> IUR
    CUC --> UE
    UUC --> IUR
    UUC --> UE
    CRUC --> IUR
    CRUC --> UE
    TAUC --> IUR
    TAUC --> UE
    RPUC --> IUR
    RPUC --> UE
    LUC --> IUR
    GUC --> IUR
    GSUC --> IUR

    CUC --> EE
    UUC --> EE
    CRUC --> EE
    TAUC --> EE
    RPUC --> EE

    %% Domain → Value Objects
    UE --> E
    UE --> P
    UE --> UR_VO
    UE --> UI

    %% Domain Events
    UE --> UCE
    UE --> RCE
    UE --> UDE
    UE --> PRE

    %% Event Handlers
    EE --> UH
    EE --> RCH
    EE --> UDH
    EE --> PRH

    %% Infrastructure → Domain
    UR --> IUR
    UR --> UPM
    UPM --> UE
    UR --> PS
    AS --> PS

    %% External
    PS --> DB
    UH --> PS

    %% Mappers
    CUC --> UM
    UUC --> UM
    UM --> URD

    style AS fill:#ffcccc,stroke:#ff0000,stroke-width:2px
    style IUR fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    style UE fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    style E fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    style P fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    style UR_VO fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    style UI fill:#ccffcc,stroke:#00ff00,stroke-width:2px
```

---

## 🔄 FLUJO DE CREACIÓN DE USUARIO

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AdminController
    participant UseCase as CreateUserUseCase
    participant Repo as UserRepository
    participant Entity as UserEntity
    participant VO as Value Objects
    participant EventEmitter as EventEmitter2
    participant Handler as UserCreatedHandler
    participant DB as PostgreSQL

    Client->>Controller: POST /admin/users (CreateUserDto)
    Controller->>Controller: Validate (Zod)
    Controller->>Controller: Check Permissions (RolesGuard)
    Controller->>UseCase: execute(dto, adminUserId)
    
    UseCase->>Repo: existsByEmail(email)
    Repo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repo: null
    Repo-->>UseCase: false
    
    UseCase->>VO: Email.create(dto.email)
    VO-->>UseCase: Email VO
    
    UseCase->>VO: Password.createFromPlainText(dto.password)
    VO->>VO: Validate complexity
    VO->>VO: Hash with bcrypt (10 rounds) ⚠️
    VO-->>UseCase: Password VO
    
    UseCase->>VO: UserRole.create(dto.role)
    VO-->>UseCase: UserRole VO
    
    UseCase->>VO: UserId.create()
    VO-->>UseCase: UserId VO
    
    UseCase->>Entity: UserEntity.create(data)
    Entity->>Entity: Validate business rules
    Entity->>Entity: Create UserCreatedEvent
    Entity-->>UseCase: UserEntity
    
    UseCase->>Repo: save(user)
    Repo->>UPM: toCreateData(user)
    UPM-->>Repo: Prisma data
    Repo->>DB: INSERT INTO users ...
    DB-->>Repo: User record
    Repo->>UPM: toDomain(prismaUser)
    UPM-->>Repo: UserEntity
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('UserCreatedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: done
    
    UseCase->>UM: toResponse(user)
    UM-->>UseCase: UserResponseDto
    UseCase-->>Controller: UserResponseDto
    Controller-->>Client: 201 Created + UserResponseDto
```

---

## 🔄 FLUJO DE CAMBIO DE ROL

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

    Client->>Controller: PATCH /admin/users/:id/role
    Controller->>Controller: Validate (Zod)
    Controller->>Controller: Check Permissions (ADMIN only)
    Controller->>UseCase: execute({userId, newRole, changedBy})
    
    UseCase->>Repo: findById(userId)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>Repo: User record
    Repo-->>UseCase: UserEntity
    
    UseCase->>UseCase: Validate: not self-role change
    UseCase->>UseCase: Validate: not last admin
    
    UseCase->>Entity: changeRole(newRole, changedBy)
    Entity->>Entity: Validate: role not same
    Entity->>Entity: Create RoleChangedEvent
    Entity-->>UseCase: UserEntity (updated)
    
    UseCase->>Repo: save(user)
    Repo->>DB: UPDATE users SET role = ? ...
    DB-->>Repo: Updated record
    Repo-->>UseCase: UserEntity
    
    UseCase->>EventEmitter: emit('RoleChangedEvent', event)
    EventEmitter->>Handler: handle(event)
    Handler->>DB: INSERT INTO audit_log ...
    Handler-->>EventEmitter: done
    
    UseCase->>UM: toResponse(user)
    UM-->>UseCase: UserResponseDto
    UseCase-->>Controller: UserResponseDto
    Controller-->>Client: 200 OK + UserResponseDto
```

---

## 📊 DEPENDENCIAS ENTRE CAPAS

```mermaid
graph LR
    subgraph "Domain Layer (Core)"
        A[Entities]
        B[Value Objects]
        C[Domain Events]
        D[Repository Interfaces]
    end

    subgraph "Application Layer"
        E[Use Cases]
        F[DTOs]
        G[Mappers]
        H[Event Handlers]
    end

    subgraph "Infrastructure Layer"
        I[Controllers]
        J[Repositories]
        K[Prisma Mappers]
    end

    E --> A
    E --> B
    E --> C
    E --> D
    H --> C
    I --> E
    I --> F
    J --> D
    J --> A
    K --> A

    style A fill:#90EE90
    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#90EE90
    style E fill:#87CEEB
    style F fill:#87CEEB
    style G fill:#87CEEB
    style H fill:#87CEEB
    style I fill:#FFB6C1
    style J fill:#FFB6C1
    style K fill:#FFB6C1
```

**Regla de Dependencias:** ✅ Correcta
- Domain no depende de nadie
- Application depende solo de Domain
- Infrastructure depende de Domain y Application

---

## 🚨 VIOLACIONES DE ARQUITECTURA

### 1. **Leaky Abstraction: AdminService**
```
AdminService → PrismaService (directo)
```
**Problema:** Service legacy usa Prisma directamente, viola DIP

### 2. **Event Handlers → PrismaService**
```
UserCreatedHandler → PrismaService (directo)
```
**Problema:** Handlers dependen de Prisma, deberían usar abstracción

---

## 📈 MÉTRICAS DE ACOPLAMIENTO

| Capa | Dependencias Externas | Acoplamiento |
|------|----------------------|--------------|
| Domain | 0 | ✅ Bajo |
| Application | Domain only | ✅ Bajo |
| Infrastructure | Domain + Application | ✅ Bajo |
| **Legacy (AdminService)** | **Prisma directo** | ⚠️ **Alto** |

---

## ✅ FORTALEZAS ARQUITECTÓNICAS

1. ✅ Separación de capas clara
2. ✅ Dependencias apuntan hacia adentro (Clean Architecture)
3. ✅ Repository Pattern implementado correctamente
4. ✅ Domain Events funcionando
5. ✅ Use Cases bien estructurados

---

## ⚠️ ÁREAS DE MEJORA

1. ⚠️ Eliminar `AdminService` legacy
2. ⚠️ Abstraer Prisma en Event Handlers
3. ⚠️ Agregar transacciones donde necesario
4. ⚠️ Mejorar inmutabilidad (Object.freeze)

---

**Siguiente:** Análisis de flujos de negocio detallados.


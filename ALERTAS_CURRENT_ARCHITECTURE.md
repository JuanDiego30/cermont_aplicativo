# 🏗️ ARQUITECTURA ACTUAL - MÓDULO `/alertas`

**Fecha:** 2024-12-22  
**Versión:** Actual (Pre-refactorización)

---

## 📐 ARQUITECTURA ACTUAL (Simplificada)

```mermaid
graph TB
    subgraph "Infrastructure Layer (Parcial)"
        AC[AlertasController]
    end

    subgraph "Service Layer (God Object)"
        AS[AlertasService]
        CRON1[CRON: Actas Sin Firmar]
        CRON2[CRON: SES Pendientes]
        CRON3[CRON: Facturas Vencidas]
        CRON4[CRON: Propuestas Sin Respuesta]
        CRUD1[getAlertasUsuario]
        CRUD2[getTodasAlertasPendientes]
        CRUD3[marcarLeida]
        CRUD4[marcarResuelta]
        CRUD5[getResumenAlertas]
        BL[crearAlerta - Lógica Negocio]
    end

    subgraph "External"
        PS[PrismaService]
        DB[(PostgreSQL)]
        SCHEDULE[ScheduleModule]
    end

    AC --> AS
    AS --> CRON1
    AS --> CRON2
    AS --> CRON3
    AS --> CRON4
    AS --> CRUD1
    AS --> CRUD2
    AS --> CRUD3
    AS --> CRUD4
    AS --> CRUD5
    AS --> BL
    
    CRON1 --> PS
    CRON2 --> PS
    CRON3 --> PS
    CRON4 --> PS
    CRUD1 --> PS
    CRUD2 --> PS
    CRUD3 --> PS
    CRUD4 --> PS
    CRUD5 --> PS
    BL --> PS
    
    PS --> DB
    SCHEDULE --> CRON1
    SCHEDULE --> CRON2
    SCHEDULE --> CRON3
    SCHEDULE --> CRON4

    style AS fill:#ffcccc,stroke:#ff0000,stroke-width:3px
    style PS fill:#ffcccc,stroke:#ff0000,stroke-width:2px
    style AC fill:#ccffcc,stroke:#00ff00,stroke-width:2px
```

---

## 🔄 FLUJO ACTUAL: CREAR ALERTA (CRON)

```mermaid
sequenceDiagram
    participant SCHEDULE as ScheduleModule
    participant SERVICE as AlertasService
    participant PRISMA as PrismaService
    participant DB as PostgreSQL

    SCHEDULE->>SERVICE: @Cron('0 8 * * *')<br/>checkActasSinFirmar()
    
    SERVICE->>SERVICE: Calcular fecha límite (7 días)
    
    SERVICE->>PRISMA: findMany(actas pendientes)
    PRISMA->>DB: SELECT * FROM actas WHERE ...
    DB-->>PRISMA: Actas array
    PRISMA-->>SERVICE: Actas pendientes
    
    loop Para cada acta
        SERVICE->>SERVICE: crearAlerta({...}) ⚠️ Lógica de negocio
        
        SERVICE->>PRISMA: findFirst(alerta existente)
        PRISMA->>DB: SELECT * FROM alertas WHERE ...
        DB-->>PRISMA: Alerta o null
        
        alt Alerta no existe
            SERVICE->>PRISMA: create(alerta)
            PRISMA->>DB: INSERT INTO alertas ...
            DB-->>PRISMA: Alerta creada
            PRISMA-->>SERVICE: Alerta
        else Alerta existe
            SERVICE-->>SERVICE: return existente
        end
        
        SERVICE->>PRISMA: update(acta, alertaEnviada=true)
        PRISMA->>DB: UPDATE actas SET ...
        DB-->>PRISMA: Acta actualizada
        PRISMA-->>SERVICE: OK
    end
    
    SERVICE-->>SCHEDULE: ✅ Completado
```

**Problemas en este flujo:**
- ❌ Lógica de negocio en service (debería estar en domain)
- ❌ Dependencia directa de Prisma (debería usar repository)
- ❌ Sin validación de entrada
- ❌ Sin manejo de errores estructurado
- ❌ Sin domain events

---

## 🔄 FLUJO ACTUAL: OBTENER ALERTAS DE USUARIO

```mermaid
sequenceDiagram
    participant CLIENT as Cliente HTTP
    participant CONTROLLER as AlertasController
    participant SERVICE as AlertasService
    participant PRISMA as PrismaService
    participant DB as PostgreSQL

    CLIENT->>CONTROLLER: GET /alertas/mis-alertas
    CONTROLLER->>CONTROLLER: JwtAuthGuard (validar token)
    CONTROLLER->>CONTROLLER: CurrentUser (extraer userId)
    
    CONTROLLER->>SERVICE: getAlertasUsuario(userId)
    
    SERVICE->>PRISMA: findMany(alertas del usuario)
    PRISMA->>DB: SELECT * FROM alertas WHERE usuarioId=? AND resuelta=false
    DB-->>PRISMA: Alertas array
    PRISMA-->>SERVICE: Alertas
    
    SERVICE-->>CONTROLLER: Alertas (Prisma models)
    CONTROLLER-->>CLIENT: 200 OK + Alertas JSON
```

**Problemas en este flujo:**
- ❌ Retorna modelos Prisma directamente (debería retornar DTOs)
- ❌ Sin paginación
- ❌ Sin filtros
- ❌ Sin validación de entrada

---

## 📊 DEPENDENCIAS ACTUALES

```mermaid
graph LR
    subgraph "AlertasModule"
        AS[AlertasService]
        AC[AlertasController]
    end

    subgraph "External Dependencies"
        PS[PrismaService]
        SCHEDULE[ScheduleModule]
        JWT[JwtAuthGuard]
        ROLES[RolesGuard]
    end

    AC --> AS
    AS --> PS
    AS --> SCHEDULE
    AC --> JWT
    AC --> ROLES

    style AS fill:#ffcccc,stroke:#ff0000,stroke-width:2px
    style PS fill:#ffcccc,stroke:#ff0000,stroke-width:2px
```

**Regla de Dependencias:** ❌ **VIOLADA**
- Service depende directamente de Prisma (concreto)
- No hay abstracciones (interfaces)
- Difícil de testear (requiere mock de Prisma)

---

## 🚨 VIOLACIONES DE ARQUITECTURA

### 1. **God Object: AlertasService**
```
AlertasService tiene:
- 4 CRON jobs
- 5 métodos CRUD
- 2 métodos privados (lógica de negocio)
- Total: 11 métodos en una clase
```
**Problema:** Viola SRP (Single Responsibility Principle)

### 2. **Sin Separación de Capas**
```
No existe:
- Domain Layer (entities, VOs, events)
- Application Layer (use cases, DTOs, mappers)
- Infrastructure Layer completo (solo controller)
```
**Problema:** Todo está en el service

### 3. **Dependencias Concretas**
```
AlertasService → PrismaService (directo)
```
**Problema:** Viola DIP (Dependency Inversion Principle)

### 4. **Lógica de Negocio en Service**
```
crearAlerta() contiene:
- Validación de existencia
- Lógica de negocio (evitar duplicados)
- Persistencia directa
```
**Problema:** Debería estar en domain entity

---

## 📈 MÉTRICAS DE ACOPLAMIENTO

| Componente | Dependencias Externas | Acoplamiento |
|------------|----------------------|--------------|
| AlertasService | PrismaService, ScheduleModule | 🔴 **ALTO** |
| AlertasController | AlertasService, Guards | 🟡 **MEDIO** |
| **Domain Layer** | **NO EXISTE** | - |
| **Application Layer** | **NO EXISTE** | - |

---

## ✅ FORTALEZAS ARQUITECTÓNICAS

1. ✅ Controller delgado (buena práctica)
2. ✅ Guards implementados (seguridad básica)
3. ✅ CRONs funcionando correctamente
4. ✅ Logging básico presente

---

## ⚠️ ÁREAS DE MEJORA CRÍTICAS

1. 🔴 **Eliminar God Object** - Separar responsabilidades
2. 🔴 **Crear Domain Layer** - Entities, VOs, Events
3. 🔴 **Crear Application Layer** - Use Cases, DTOs
4. 🔴 **Abstraer Prisma** - Repository Pattern
5. 🟠 **Sistema de Queue** - Procesamiento asíncrono
6. 🟠 **Retry Mechanism** - Manejo de fallos

---

## 📝 CONCLUSIÓN

La arquitectura actual es **muy simplificada** y requiere una **refactorización completa** a DDD + Clean Architecture. El principal problema es el **God Object (AlertasService)** que mezcla múltiples responsabilidades.

**Siguiente:** Diseñar arquitectura objetivo (DDD).


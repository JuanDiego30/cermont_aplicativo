---
name: prisma-architect
description: Experto en Prisma ORM para diseño de esquemas, migraciones, optimización de consultas y patrones avanzados. Usar para modelado de datos, relaciones, migraciones y rendimiento de base de datos.
triggers:
  - Prisma
  - schema
  - migration
  - database
  - ORM
  - PostgreSQL
  - relation
  - query optimization
role: specialist
scope: implementation
output-format: code
---

# Prisma Architect

Especialista senior en Prisma ORM con experiencia profunda en diseño de esquemas, migraciones y optimización de rendimiento.

## Rol

Arquitecto de bases de datos con 8+ años de experiencia en diseño de datos relacionales. Especializado en Prisma ORM, migraciones seguras, y optimización de consultas para aplicaciones de alto rendimiento.

## Cuándo Usar Este Skill

- Diseño inicial de esquema Prisma
- Modelado de relaciones complejas
- Creación y gestión de migraciones
- Optimización de consultas N+1
- Implementación de soft deletes
- Configuración de índices
- Seeding de datos
- Conexión y pooling de base de datos

## Flujo de Trabajo

1. **Analizar requisitos** - Entender entidades, relaciones y restricciones
2. **Diseñar schema** - Modelar con tipos correctos e índices
3. **Crear migración** - Generar y revisar SQL generado
4. **Implementar** - Crear servicios Prisma con patrones correctos
5. **Optimizar** - Revisar consultas, agregar índices, usar select/include

## Guía de Referencia

### Schema Patterns

```prisma
// schema.prisma - Ejemplo completo
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete
  
  orders    Order[]
  profile   Profile?
  
  @@index([email])
  @@index([role])
  @@map("users")
}

model Order {
  id        String      @id @default(uuid())
  number    String      @unique
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

enum Role {
  USER
  ADMIN
  SUPERVISOR
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Prisma 7.x Configuration

```javascript
// prisma.config.js (Prisma 7+)
const path = require('path');

module.exports = {
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
};
```

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
      datasourceUrl: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete extension
  async softDelete<T>(model: string, where: object): Promise<T> {
    return (this as any)[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }
}
```

### Migration Commands

```bash
# Crear migración desde cambios en schema
npx prisma migrate dev --name add_user_role

# Aplicar migraciones en producción
npx prisma migrate deploy

# Reset base de datos (¡SOLO desarrollo!)
npx prisma migrate reset

# Generar cliente después de cambios
npx prisma generate

# Ver estado de migraciones
npx prisma migrate status

# Introspect base de datos existente
npx prisma db pull
```

### Query Optimization

```typescript
// ❌ N+1 Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id }
  });
}

// ✅ Eager loading con include
const users = await prisma.user.findMany({
  include: {
    orders: {
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  }
});

// ✅ Select solo campos necesarios
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    _count: {
      select: { orders: true }
    }
  }
});

// ✅ Paginación cursor-based (mejor rendimiento)
const orders = await prisma.order.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastOrderId },
  orderBy: { createdAt: 'desc' }
});
```

### Transactions

```typescript
// Transaction implícita
const [user, order] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.order.create({ data: orderData })
]);

// Transaction interactiva (rollback automático en error)
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  const order = await tx.order.create({
    data: { ...orderData, userId: user.id }
  });
  
  await tx.user.update({
    where: { id: userId },
    data: { orderCount: { increment: 1 } }
  });
  
  return order;
});
```

## Restricciones

### DEBE HACER
- Usar UUIDs para IDs públicos
- Agregar índices en campos de búsqueda frecuente
- Implementar soft delete para datos críticos
- Usar `@updatedAt` en todos los modelos
- Documentar enums con comentarios
- Usar transacciones para operaciones múltiples
- Manejar errores de Prisma específicamente

### NO DEBE HACER
- Exponer IDs internos de base de datos
- Crear migraciones destructivas sin revisión
- Usar `findFirst` cuando esperas un resultado único
- Olvidar cascade en relaciones
- Hardcodear URLs de base de datos
- Ignorar logs de queries lentas

## Manejo de Errores

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        throw new ConflictException('Email already exists');
      case 'P2025': // Record not found
        throw new NotFoundException('User not found');
      case 'P2003': // Foreign key constraint failed
        throw new BadRequestException('Invalid reference');
      default:
        throw new InternalServerErrorException('Database error');
    }
  }
  throw error;
}
```

## Skills Relacionados

- **nestjs-expert** - Integración con NestJS
- **clean-architecture** - Patrones de repositorio
- **jest-testing** - Tests con Prisma Mock

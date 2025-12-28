# ⚡ GUÍA DE CORRECCIONES - PASO A PASO

## 🚀 IMPLEMENTACIÓN INMEDIATA (45 minutos)

---

## ARCHIVO 1: schema.prisma ACTUALIZADO
**Ubicación:** `apps/api/prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  SUPERVISOR
  TECNICO
  CLIENTE
  USER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum OrderStatus {
  CREATED
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// ✅ MODELO USER COMPLETO Y CORRECTO
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String
  name                  String
  phone                 String?
  role                  Role      @default(USER)
  status                UserStatus @default(ACTIVE)
  
  // Two-Factor Authentication
  twoFactorEnabled      Boolean   @default(false)
  twoFactorSecret       String?
  twoFactorBackupCodes  String[]  @default([])
  
  // Password Reset
  resetToken            String?
  resetTokenExpiry      DateTime?
  
  // Audit
  lastLogin             DateTime?
  loginAttempts         Int       @default(0)
  lockedUntil           DateTime?
  
  // Metadata
  avatar                String?
  bio                   String?
  settings              Json?     @default("{}")
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?
  
  // Relations
  ordenes               Orden[]
  ejecuciones           Ejecucion[]
  certificaciones       Certificacion[]
  checklists            Checklist[]
  formularios           FormularioSubmission[]
  auditLogs             AuditLog[]
  
  @@index([email])
  @@index([status])
  @@index([role])
  @@index([deletedAt])
}

// ✅ MODELO ORDEN SIMPLIFICADO
model Orden {
  id                    String    @id @default(cuid())
  numero                String    @unique
  descripcion           String
  estado                OrderStatus @default(CREATED)
  
  // Relations
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  
  // Metadata
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  // Relations
  ejecuciones           Ejecucion[]
  certificaciones       Certificacion[]
  checklists            Checklist[]
  
  @@index([userId])
  @@index([estado])
}

// ✅ MODELO EJECUCIÓN
model Ejecucion {
  id                    String    @id @default(cuid())
  ordenId               String
  orden                 Orden     @relation(fields: [ordenId], references: [id])
  
  tecnicoId             String
  tecnico               User      @relation(fields: [tecnicoId], references: [id])
  
  estado                String
  progreso              Int       @default(0)
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  certificaciones       Certificacion[]
  checklists            Checklist[]
  
  @@index([ordenId])
  @@index([tecnicoId])
}

// ✅ MODELO CERTIFICACIÓN
model Certificacion {
  id                    String    @id @default(cuid())
  ordenId               String
  orden                 Orden     @relation(fields: [ordenId], references: [id])
  
  tecnicoId             String
  tecnico               User      @relation(fields: [tecnicoId], references: [id])
  
  ejecucionId           String
  ejecucion            Ejecucion @relation(fields: [ejecucionId], references: [id])
  
  tipo                  String
  estado                String
  fechaVencimiento      DateTime
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([ordenId])
  @@index([tecnicoId])
  @@index([fechaVencimiento])
}

// ✅ MODELO CHECKLIST
model Checklist {
  id                    String    @id @default(cuid())
  nombre                String
  descripcion           String?
  
  ordenId               String?
  orden                 Orden?    @relation(fields: [ordenId], references: [id])
  
  ejecucionId           String?
  ejecucion            Ejecucion? @relation(fields: [ejecucionId], references: [id])
  
  usuarioId             String
  usuario               User      @relation(fields: [usuarioId], references: [id])
  
  completado            Boolean   @default(false)
  fechaCompletado       DateTime?
  
  items                 ChecklistItem[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([ordenId])
  @@index([ejecucionId])
  @@index([usuarioId])
}

// ✅ MODELO CHECKLIST ITEM
model ChecklistItem {
  id                    String    @id @default(cuid())
  checklistId           String
  checklist             Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
  
  titulo                String
  completado            Boolean   @default(false)
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([checklistId])
}

// ✅ MODELO FORMULARIO SUBMISSION
model FormularioSubmission {
  id                    String    @id @default(cuid())
  usuarioId             String
  usuario               User      @relation(fields: [usuarioId], references: [id])
  
  datos                 Json
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([usuarioId])
}

// ✅ AUDIT LOG
model AuditLog {
  id                    String    @id @default(cuid())
  usuarioId             String
  usuario               User      @relation(fields: [usuarioId], references: [id])
  
  accion                String
  entidad               String
  cambios               Json
  
  createdAt             DateTime  @default(now())
  
  @@index([usuarioId])
  @@index([createdAt])
}
```

---

## ARCHIVO 2: seed.ts ACTUALIZADO
**Ubicación:** `apps/api/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  try {
    // Limpiar usuarios existentes (solo en desarrollo)
    await prisma.user.deleteMany();
    console.log('✅ Tabla User limpiada');

    // ✅ USUARIO ADMIN
    const hashedPasswordAdmin = await bcrypt.hash('Cermont2025!', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'root@cermont.com',
        password: hashedPasswordAdmin,
        name: 'Administrador Cermont',
        phone: '+57 315 123 4567',
        role: 'ADMIN',
        status: 'ACTIVE',
        twoFactorEnabled: false,
      },
    });
    console.log('✅ Usuario admin creado:', admin.email);

    // ✅ USUARIO SUPERVISOR
    const hashedPasswordSupervisor = await bcrypt.hash('Supervisor2025!', 10);
    const supervisor = await prisma.user.create({
      data: {
        email: 'supervisor@cermont.com',
        password: hashedPasswordSupervisor,
        name: 'Supervisor de Proyectos',
        phone: '+57 310 234 5678',
        role: 'SUPERVISOR',
        status: 'ACTIVE',
        twoFactorEnabled: false,
      },
    });
    console.log('✅ Usuario supervisor creado:', supervisor.email);

    // ✅ USUARIO TECNICO
    const hashedPasswordTecnico = await bcrypt.hash('Tecnico2025!', 10);
    const tecnico = await prisma.user.create({
      data: {
        email: 'tecnico@cermont.com',
        password: hashedPasswordTecnico,
        name: 'Juan Diego Técnico',
        phone: '+57 305 345 6789',
        role: 'TECNICO',
        status: 'ACTIVE',
        twoFactorEnabled: false,
      },
    });
    console.log('✅ Usuario técnico creado:', tecnico.email);

    // ✅ USUARIO CLIENTE
    const hashedPasswordCliente = await bcrypt.hash('Cliente2025!', 10);
    const cliente = await prisma.user.create({
      data: {
        email: 'cliente@cermont.com',
        password: hashedPasswordCliente,
        name: 'Cliente Test',
        phone: '+57 300 456 7890',
        role: 'CLIENTE',
        status: 'ACTIVE',
        twoFactorEnabled: false,
      },
    });
    console.log('✅ Usuario cliente creado:', cliente.email);

    // ✅ USUARIO TEST
    const hashedPasswordTest = await bcrypt.hash('Test2025!', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@cermont.com',
        password: hashedPasswordTest,
        name: 'Usuario Test',
        phone: '+57 301 567 8901',
        role: 'USER',
        status: 'ACTIVE',
        twoFactorEnabled: false,
      },
    });
    console.log('✅ Usuario test creado:', testUser.email);

    console.log('\n✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('\n📝 Usuarios Disponibles para Testing:');
    console.log('   Admin      - root@cermont.com / Cermont2025!');
    console.log('   Supervisor - supervisor@cermont.com / Supervisor2025!');
    console.log('   Tecnico    - tecnico@cermont.com / Tecnico2025!');
    console.log('   Cliente    - cliente@cermont.com / Cliente2025!');
    console.log('   Test       - test@cermont.com / Test2025!');

  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

---

## ARCHIVO 3: .env.example ACTUALIZADO
**Ubicación:** `apps/api/.env.example`

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cermont"

# JWT
JWT_SECRET="your_super_secret_key_cermont_2025_change_in_production"
JWT_EXPIRY="24h"
JWT_REFRESH_EXPIRY="7d"

# Environment
NODE_ENV="development"
API_PORT=4000
FRONTEND_URL="http://localhost:4200"

# Email (Development uses Ethereal)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT=587
SMTP_USER="generated_user@ethereal.email"
SMTP_PASS="generated_password"
SMTP_FROM="noreply@cermont.com"

# SMS
TEXTBELT_KEY="textbelt_key"

# Redis (Optional, for BullMQ)
REDIS_URL="redis://localhost:6379"

# Web Push
VAPID_PUBLIC_KEY="your_public_key"
VAPID_PRIVATE_KEY="your_private_key"
VAPID_SUBJECT="mailto:your-email@cermont.com"

# Logging
LOG_LEVEL="debug"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## COMANDOS A EJECUTAR

**1. Actualizar dependencias:**
```bash
cd apps/api
npm install

# Instalar paquetes faltantes
npm install web-push @types/web-push bcrypt @types/bcrypt
npm install bullmq ioredis
```

**2. Configurar .env:**
```bash
cp .env.example .env
# Editar .env con valores correctos
```

**3. Crear y aplicar migraciones:**
```bash
npx prisma migrate dev --name init_auth_setup
```

**4. Ejecutar seed:**
```bash
npx prisma db seed
```

**5. Verificar en Prisma Studio:**
```bash
npx prisma studio
```

**6. Testear login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@cermont.com",
    "password": "Cermont2025!"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 200,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "email": "root@cermont.com",
      "name": "Administrador Cermont",
      "role": "ADMIN"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

**7. Hacer commit a GitHub:**
```bash
git add .
git commit -m "fix: complete prisma auth setup with seed and migrations

- Add complete User model with all required fields
- Create migration with proper schema
- Implement seed.ts with 5 test users
- All users hashed passwords with bcrypt
- Ready for authentication testing"

git push origin main
```

---

## ✅ VERIFICACIÓN

Después de implementar, verificar:

```bash
# 1. Base de datos conectada
npm run start:dev

# 2. Ver logs - buscar:
# ✅ [PrismaService] PostgreSQL Database connected
# ✅ [NestFactory] Nest application successfully started

# 3. Testear endpoints
POST /api/auth/login          → 200 + token
POST /api/auth/register       → 200 + user
GET /api/auth/me (con token)  → 200 + user
POST /api/auth/logout         → 200

# 4. Ver usuarios creados
npx prisma studio
# Navegar a User model
```

---

**Tiempo Total:** ~45 minutos  
**Dificultad:** Media  
**Status:** Listo para Implementación  

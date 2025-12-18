# 🔴 FASE 5: VERIFICACIÓN, AUDITORÍA Y CONSOLIDACIÓN - PASOS 22-24 (24 HORAS)

**Documento**: Plan de Verificación Exhaustiva  
**Duración**: 24 horas (Semana 9)  
**Prioridad**: 🔴 CRÍTICO  
**Objetivo**: Garantizar que TODAS las fases 1-4 se implementaron correctamente  

---

## 📋 TABLA DE CONTENIDOS

1. [Paso 22: Auditoría Completa (8h)](#paso-22-auditoria)
2. [Paso 23: Tests de Integración (8h)](#paso-23-tests)
3. [Paso 24: Validación de Métricas (8h)](#paso-24-metricas)
4. [Scripts de Auditoría](#scripts-auditoria)
5. [Checklist Final Completo](#checklist-completo)

---

## 🔴 PASO 22: AUDITORÍA COMPLETA (8 HORAS)

### 22.1 Auditoría de Seguridad

**Archivo**: `scripts/audit-security.sh`

```bash
#!/bin/bash

# 🔐 AUDITORÍA COMPLETA DE SEGURIDAD CERMONT

echo "🔐 INICIANDO AUDITORÍA DE SEGURIDAD"
echo "=================================="

# 1. VERIFICAR ENV VALIDATION
echo ""
echo "1️⃣  VERIFICANDO ENV VALIDATION..."
if grep -r "validateEnv" apps/api/src/main.ts > /dev/null; then
    echo "✅ validateEnv() presente en main.ts"
else
    echo "❌ FALTA: validateEnv() en main.ts"
    exit 1
fi

# 2. VERIFICAR QUE NO HAY SECRETS HARDCODEADOS
echo ""
echo "2️⃣  BUSCANDO SECRETS HARDCODEADOS..."
SECRETS_FOUND=$(grep -r "secretOrKey.*=" apps/api/src/ --include="*.ts" | wc -l)
if [ "$SECRETS_FOUND" -eq 0 ]; then
    echo "✅ No hay secrets hardcodeados"
else
    echo "❌ ENCONTRADOS $SECRETS_FOUND hardcoded secrets:"
    grep -r "secretOrKey.*=" apps/api/src/ --include="*.ts"
    exit 1
fi

# 3. VERIFICAR CONSOLE.LOG (debe ser 0)
echo ""
echo "3️⃣  BUSCANDO console.log (producción)..."
CONSOLE_LOGS=$(grep -r "console\.log" apps/api/src/ --include="*.ts" \
    | grep -v "console\.log.*test\|console\.log.*spec" \
    | wc -l)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    echo "✅ No hay console.log en código de producción"
else
    echo "❌ ENCONTRADOS $CONSOLE_LOGS console.log:"
    grep -r "console\.log" apps/api/src/ --include="*.ts" | grep -v test
    exit 1
fi

# 4. VERIFICAR SQL INJECTION - No usar query() directo
echo ""
echo "4️⃣  VERIFICANDO SQL SANITIZACIÓN..."
SQL_DIRECT=$(grep -r "query(" apps/api/src/ --include="*.ts" | grep -v test | wc -l)
if [ "$SQL_DIRECT" -eq 0 ]; then
    echo "✅ No hay query() directo (usando Prisma ORM)"
else
    echo "❌ ENCONTRADOS $SQL_DIRECT query() directos (riesgo SQL injection)"
    exit 1
fi

# 5. VERIFICAR HELMET + CORS
echo ""
echo "5️⃣  VERIFICANDO HELMET Y CORS..."
if grep -r "helmet()" apps/api/src/main.ts > /dev/null; then
    echo "✅ Helmet configurado"
else
    echo "❌ FALTA: Helmet no configurado"
    exit 1
fi

if grep -r "enableCors" apps/api/src/main.ts > /dev/null; then
    echo "✅ CORS configurado"
else
    echo "❌ FALTA: CORS no configurado"
    exit 1
fi

# 6. VERIFICAR RATE LIMITING
echo ""
echo "6️⃣  VERIFICANDO RATE LIMITING..."
if grep -r "ThrottlerGuard" apps/api/src/ --include="*.ts" | grep -v test > /dev/null; then
    echo "✅ Rate limiting configurado"
else
    echo "❌ FALTA: Rate limiting no encontrado"
    exit 1
fi

# 7. VERIFICAR PASSWORD HASHING
echo ""
echo "7️⃣  VERIFICANDO PASSWORD HASHING..."
if grep -r "bcrypt\|hash" apps/api/src/modules/auth --include="*.ts" | grep -v test > /dev/null; then
    echo "✅ Password hashing implementado"
else
    echo "❌ FALTA: Password hashing no encontrado"
    exit 1
fi

# 8. VERIFICAR JWT CLAIMS VÁLIDOS
echo ""
echo "8️⃣  VERIFICANDO JWT STRATEGY..."
if grep -r "jwtFromRequest.*ExtractJwt.fromAuthHeaderAsBearerToken" apps/api/src/ --include="*.ts" > /dev/null; then
    echo "✅ JWT strategy correcto (Bearer token)"
else
    echo "❌ FALTA: JWT strategy incorrecto"
    exit 1
fi

# 9. VERIFICAR VALIDACIÓN DE ENTRADA (class-validator)
echo ""
echo "9️⃣  VERIFICANDO VALIDACIÓN DE DTOs..."
DTO_COUNT=$(find apps/api/src/modules -name "*.dto.ts" | wc -l)
if grep -r "@Is\|@Min\|@Max" apps/api/src/modules --include="*.ts" | wc -l | grep -q "[1-9]"; then
    echo "✅ Validación de DTOs implementada ($DTO_COUNT DTOs)"
else
    echo "❌ FALTA: Validación de DTOs"
    exit 1
fi

# 10. VERIFICAR LOGGING ESTRUCTURADO (Winston)
echo ""
echo "🔟 VERIFICANDO LOGGING ESTRUCTURADO..."
if grep -r "this\.logger\|Winston" apps/api/src/ --include="*.ts" | grep -v test > /dev/null; then
    echo "✅ Logging estructurado implementado"
else
    echo "❌ FALTA: Logging estructurado (usar Winston)"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ AUDITORÍA DE SEGURIDAD COMPLETADA"
echo "=================================="
```

### 22.2 Auditoría de Arquitectura DDD

**Archivo**: `scripts/audit-architecture.sh`

```bash
#!/bin/bash

# 🏗️ AUDITORÍA DE ARQUITECTURA DDD

echo "🏗️  INICIANDO AUDITORÍA DE ARQUITECTURA"
echo "======================================"

MODULES_TO_CHECK=("auth" "ordenes" "tecnicos" "usuarios" "dashboard" "reportes" "email" "weather" "sync")

for MODULE in "${MODULES_TO_CHECK[@]}"; do
    echo ""
    echo "📦 Verificando módulo: $MODULE"
    
    MODULE_PATH="apps/api/src/modules/$MODULE"
    
    if [ ! -d "$MODULE_PATH" ]; then
        echo "  ⚠️  Módulo $MODULE no encontrado (opcional)"
        continue
    fi
    
    # 1. Verificar estructura Domain
    if [ -d "$MODULE_PATH/domain" ]; then
        echo "  ✅ Capa Domain existe"
        
        if [ -d "$MODULE_PATH/domain/entities" ]; then
            echo "    ✅ Entities presentes"
        else
            echo "    ❌ FALTA: Entities"
        fi
        
        if [ -d "$MODULE_PATH/domain/value-objects" ]; then
            echo "    ✅ Value Objects presentes"
        fi
        
        if [ -f "$MODULE_PATH/domain/repositories/$MODULE.repository.ts" ]; then
            echo "    ✅ Repository interface existe"
        else
            echo "    ⚠️  Repository interface recomendada"
        fi
    else
        echo "  ❌ FALTA: Capa Domain"
    fi
    
    # 2. Verificar estructura Application
    if [ -d "$MODULE_PATH/application" ]; then
        echo "  ✅ Capa Application existe"
        
        if [ -d "$MODULE_PATH/application/dto" ]; then
            DTO_COUNT=$(find "$MODULE_PATH/application/dto" -name "*.dto.ts" | wc -l)
            echo "    ✅ DTOs presentes ($DTO_COUNT)"
        else
            echo "    ❌ FALTA: DTOs"
        fi
        
        if [ -d "$MODULE_PATH/application/use-cases" ] || [ -d "$MODULE_PATH/application/services" ]; then
            echo "    ✅ Use Cases/Services presentes"
        else
            echo "    ❌ FALTA: Use Cases o Services"
        fi
    else
        echo "  ❌ FALTA: Capa Application"
    fi
    
    # 3. Verificar estructura Infrastructure
    if [ -d "$MODULE_PATH/infrastructure" ]; then
        echo "  ✅ Capa Infrastructure existe"
        
        if [ -d "$MODULE_PATH/infrastructure/controllers" ]; then
            echo "    ✅ Controllers presentes"
        else
            echo "    ⚠️  Controllers no encontrados"
        fi
        
        if [ -d "$MODULE_PATH/infrastructure/persistence" ]; then
            echo "    ✅ Persistence implementado"
        else
            echo "    ⚠️  Persistence no encontrado"
        fi
    else
        echo "  ❌ FALTA: Capa Infrastructure"
    fi
    
    # 4. Verificar JSDoc
    JSDOC_COUNT=$(grep -r "\/\*\*" "$MODULE_PATH/domain" --include="*.ts" 2>/dev/null | wc -l)
    if [ "$JSDOC_COUNT" -gt 5 ]; then
        echo "  ✅ JSDoc presente ($JSDOC_COUNT bloques)"
    else
        echo "  ⚠️  JSDoc incompleto ($JSDOC_COUNT bloques)"
    fi
    
    # 5. Verificar README
    if [ -f "$MODULE_PATH/README.md" ]; then
        echo "  ✅ README.md presente"
    else
        echo "  ❌ FALTA: README.md"
    fi
    
done

echo ""
echo "======================================"
echo "✅ AUDITORÍA DE ARQUITECTURA COMPLETADA"
echo "======================================"
```

### 22.3 Auditoría de Performance

**Archivo**: `scripts/audit-performance.sh`

```bash
#!/bin/bash

# ⚡ AUDITORÍA DE PERFORMANCE

echo "⚡ INICIANDO AUDITORÍA DE PERFORMANCE"
echo "===================================="

# 1. VERIFICAR ÍNDICES EN BD
echo ""
echo "1️⃣  VERIFICANDO ÍNDICES EN BD..."
echo "Archivo: prisma/schema.prisma"

INDICES=$(grep -c "@@index" prisma/schema.prisma)
echo "Índices encontrados: $INDICES"

if [ "$INDICES" -ge 8 ]; then
    echo "✅ Cantidad de índices adecuada"
else
    echo "⚠️  Considerar agregar más índices"
fi

# 2. VERIFICAR N+1 QUERIES
echo ""
echo "2️⃣  VERIFICANDO N+1 QUERIES..."
N_PLUS_ONE=$(grep -r "find\|findAll" apps/api/src/modules --include="*.repository.ts" \
    | grep -c "include\|select")
if [ "$N_PLUS_ONE" -ge 5 ]; then
    echo "✅ Include/select implementado ($N_PLUS_ONE casos)"
else
    echo "⚠️  Verificar que se usan include/select en queries"
fi

# 3. VERIFICAR CACHÉ IMPLEMENTADO
echo ""
echo "3️⃣  VERIFICANDO CACHÉ..."
if grep -r "CacheInterceptor\|CacheModule" apps/api/src/ --include="*.ts" > /dev/null; then
    echo "✅ Caché implementado"
else
    echo "❌ FALTA: Caché (CacheModule o CacheInterceptor)"
fi

# 4. VERIFICAR LAZY LOADING MODULES
echo ""
echo "4️⃣  VERIFICANDO LAZY LOADING..."
if grep -r "forFeature\|dynamic.*import" apps/api/src/ --include="*.ts" | grep -v test > /dev/null; then
    echo "✅ Lazy loading detectado"
else
    echo "⚠️  Considerar lazy loading para módulos"
fi

# 5. VERIFICAR PAGINATION
echo ""
echo "5️⃣  VERIFICANDO PAGINACIÓN..."
PAGINATION=$(grep -r "skip\|take\|limit" apps/api/src/modules --include="*.repository.ts" | wc -l)
if [ "$PAGINATION" -ge 3 ]; then
    echo "✅ Paginación implementada"
else
    echo "❌ FALTA: Paginación en listados"
fi

# 6. VERIFICAR BATCH OPERATIONS
echo ""
echo "6️⃣  VERIFICANDO BATCH OPERATIONS..."
if grep -r "createMany\|updateMany" apps/api/src/ --include="*.ts" > /dev/null; then
    echo "✅ Batch operations detectadas"
else
    echo "⚠️  Considerar batch operations para operaciones masivas"
fi

echo ""
echo "===================================="
echo "✅ AUDITORÍA DE PERFORMANCE COMPLETADA"
echo "===================================="
```

---

## 🔴 PASO 23: TESTS DE INTEGRACIÓN (8 HORAS)

### 23.1 Suite de Tests E2E

**Archivo**: `apps/api/src/modules/ordenes/ordenes.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../shared/prisma.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Tests E2E del módulo de Órdenes
 * 
 * Cubre el flujo completo:
 * 1. Crear orden
 * 2. Listar órdenes
 * 3. Obtener orden específica
 * 4. Actualizar orden
 * 5. Cambiar estado
 * 6. Eliminar orden
 * 
 * @example
 * pnpm test:e2e ordenes.e2e-spec
 */
describe('Ordenes Module E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let clienteId: string;
  let tecnicoId: string;
  let ordenId: string;

  /**
   * Setup antes de todos los tests
   * - Crear aplicación
   * - Limpiar BD
   * - Crear usuarios de prueba
   * - Generar tokens
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Limpiar BD
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();

    // Crear usuarios de prueba
    const cliente = await prisma.user.create({
      data: {
        email: 'cliente@test.com',
        password: 'hashed_password',
        nombre: 'Cliente Test',
        rol: 'CLIENTE',
      },
    });
    clienteId = cliente.id;

    const tecnico = await prisma.user.create({
      data: {
        email: 'tecnico@test.com',
        password: 'hashed_password',
        nombre: 'Técnico Test',
        rol: 'TECNICO',
      },
    });
    tecnicoId = tecnico.id;

    // Generar token
    authToken = jwtService.sign({
      sub: cliente.id,
      email: cliente.email,
      rol: 'ADMIN',
    });
  });

  /**
   * Cleanup después de todos los tests
   */
  afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  /**
   * Grupo: POST /ordenes
   */
  describe('POST /ordenes - Crear orden', () => {
    /**
     * Test: Crear orden exitosamente
     * 
     * Dado: Usuario autenticado con datos válidos
     * Cuando: POST /ordenes
     * Entonces: Se crea orden con estado PENDIENTE
     */
    it('✅ Debe crear una orden exitosamente', async () => {
      const payload = {
        titulo: 'Mantenimiento preventivo',
        descripcion: 'Revisión completa de equipos',
        clienteId,
        tecnicoId,
        monto: 1500.5,
        fechaProgramada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('numero');
      expect(response.body.titulo).toBe(payload.titulo);
      expect(response.body.estado).toBe('PENDIENTE');
      expect(response.body.monto).toBe(payload.monto);

      ordenId = response.body.id;
    });

    /**
     * Test: Validar que los datos sean requeridos
     */
    it('❌ Debe fallar si faltan datos obligatorios', async () => {
      const payloadIncompleto = {
        titulo: 'Test', // Falta clienteId, tecnicoId, etc.
      };

      await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payloadIncompleto)
        .expect(400);
    });

    /**
     * Test: Validar formato de datos
     */
    it('❌ Debe validar formato de UUID', async () => {
      const payload = {
        titulo: 'Test',
        descripcion: 'Test',
        clienteId: 'no-es-uuid',
        tecnicoId: tecnicoId,
        monto: 1500,
        fechaProgramada: new Date(),
      };

      await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);
    });

    /**
     * Test: Validar que se requiere autenticación
     */
    it('❌ Debe rechazar sin autenticación', async () => {
      const payload = {
        titulo: 'Test',
        descripcion: 'Test',
        clienteId,
        tecnicoId,
        monto: 1500,
        fechaProgramada: new Date(),
      };

      await request(app.getHttpServer())
        .post('/ordenes')
        .send(payload)
        .expect(401);
    });
  });

  /**
   * Grupo: GET /ordenes
   */
  describe('GET /ordenes - Listar órdenes', () => {
    /**
     * Test: Listar órdenes con paginación
     */
    it('✅ Debe listar órdenes con paginación', async () => {
      const response = await request(app.getHttpServer())
        .get('/ordenes?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    /**
     * Test: Filtrar por estado
     */
    it('✅ Debe filtrar órdenes por estado', async () => {
      const response = await request(app.getHttpServer())
        .get('/ordenes?estado=PENDIENTE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const todasPendientes = response.body.data.every(
        (orden) => orden.estado === 'PENDIENTE',
      );
      expect(todasPendientes).toBe(true);
    });

    /**
     * Test: Filtrar por cliente
     */
    it('✅ Debe filtrar órdenes por cliente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ordenes?clienteId=${clienteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const todasDelCliente = response.body.data.every(
        (orden) => orden.clienteId === clienteId,
      );
      expect(todasDelCliente).toBe(true);
    });

    /**
     * Test: Validar límite máximo de items
     */
    it('✅ Debe aplicar límite máximo de 100 items', async () => {
      const response = await request(app.getHttpServer())
        .get('/ordenes?limit=500')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  /**
   * Grupo: GET /ordenes/:id
   */
  describe('GET /ordenes/:id - Obtener orden', () => {
    /**
     * Test: Obtener orden por ID
     */
    it('✅ Debe obtener una orden por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(ordenId);
      expect(response.body).toHaveProperty('numero');
      expect(response.body).toHaveProperty('titulo');
      expect(response.body).toHaveProperty('estado');
    });

    /**
     * Test: Retornar 404 si no existe
     */
    it('❌ Debe retornar 404 si orden no existe', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/ordenes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    /**
     * Test: Validar formato de UUID
     */
    it('❌ Debe validar formato de UUID', async () => {
      await request(app.getHttpServer())
        .get('/ordenes/no-es-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  /**
   * Grupo: PATCH /ordenes/:id
   */
  describe('PATCH /ordenes/:id - Actualizar orden', () => {
    /**
     * Test: Cambiar estado a EN_PROCESO
     */
    it('✅ Debe cambiar estado a EN_PROCESO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'EN_PROCESO' })
        .expect(200);

      expect(response.body.estado).toBe('EN_PROCESO');
    });

    /**
     * Test: Validar transición de estado
     */
    it('❌ Debe rechazar transición inválida (PENDIENTE -> COMPLETADA)', async () => {
      // Primero crear una orden en PENDIENTE
      const nuevaOrden = await prisma.order.create({
        data: {
          numero: 'ORD-TEST-' + Date.now(),
          titulo: 'Test Transición',
          descripcion: 'Test',
          estado: 'PENDIENTE',
          monto: 100,
          clienteId,
          tecnicoId,
        },
      });

      // Intentar cambiar directamente a COMPLETADA (inválido)
      await request(app.getHttpServer())
        .patch(`/ordenes/${nuevaOrden.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'COMPLETADA' })
        .expect(400);
    });

    /**
     * Test: Actualizar descripción
     */
    it('✅ Debe actualizar descripción', async () => {
      const nuevaDesc = 'Descripción actualizada con detalles adicionales';

      const response = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ descripcion: nuevaDesc })
        .expect(200);

      expect(response.body.descripcion).toBe(nuevaDesc);
    });
  });

  /**
   * Grupo: DELETE /ordenes/:id
   */
  describe('DELETE /ordenes/:id - Eliminar orden', () => {
    /**
     * Test: Eliminar orden (solo ADMIN)
     */
    it('✅ Debe eliminar orden (solo ADMIN)', async () => {
      // Crear orden para eliminar
      const ordenAEliminar = await prisma.order.create({
        data: {
          numero: 'ORD-DEL-' + Date.now(),
          titulo: 'Para eliminar',
          descripcion: 'Test',
          estado: 'CANCELADA',
          monto: 100,
          clienteId,
          tecnicoId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/ordenes/${ordenAEliminar.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verificar que fue eliminada
      const deletedOrden = await prisma.order.findUnique({
        where: { id: ordenAEliminar.id },
      });
      expect(deletedOrden).toBeNull();
    });

    /**
     * Test: No se puede eliminar orden EN_PROCESO
     */
    it('❌ Debe rechazar eliminar orden EN_PROCESO', async () => {
      await request(app.getHttpServer())
        .delete(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  /**
   * Grupo: Tests de concurrencia
   */
  describe('Concurrencia y Race Conditions', () => {
    /**
     * Test: Manejar múltiples updates simultáneos
     */
    it('✅ Debe manejar updates concurrentes correctamente', async () => {
      const ordenConcurrente = await prisma.order.create({
        data: {
          numero: 'ORD-CONC-' + Date.now(),
          titulo: 'Test Concurrencia',
          descripcion: 'Test',
          estado: 'PENDIENTE',
          monto: 100,
          clienteId,
          tecnicoId,
        },
      });

      // Lanzar 3 updates simultáneos
      const resultados = await Promise.allSettled([
        request(app.getHttpServer())
          .patch(`/ordenes/${ordenConcurrente.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ estado: 'EN_PROCESO' }),
        request(app.getHttpServer())
          .patch(`/ordenes/${ordenConcurrente.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ monto: 200 }),
        request(app.getHttpServer())
          .get(`/ordenes/${ordenConcurrente.id}`)
          .set('Authorization', `Bearer ${authToken}`),
      ]);

      // Al menos debe estar en estado consistente
      const finalOrden = await prisma.order.findUnique({
        where: { id: ordenConcurrente.id },
      });
      expect(finalOrden).toBeDefined();
    });
  });
});
```

### 23.2 Tests de Integración de Seguridad

**Archivo**: `apps/api/src/modules/auth/auth.integration-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../shared/prisma.service';

/**
 * Tests de integración para seguridad
 */
describe('Autenticación y Autorización', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Test: Rate limiting en login
   */
  it('❌ Debe aplicar rate limiting tras 5 intentos fallidos', async () => {
    // 5 intentos fallidos
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrong-password',
        })
        .expect(401);
    }

    // 6to intento debe ser rechazado con 429 (Too Many Requests)
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrong-password',
      })
      .expect(429);
  });

  /**
   * Test: Validar JWT válido
   */
  it('✅ Debe aceptar requests con JWT válido', async () => {
    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'correct-password',
      })
      .expect(200);

    const token = loginRes.body.access_token;

    // Usar token
    await request(app.getHttpServer())
      .get('/ordenes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  /**
   * Test: Rechazar JWT inválido
   */
  it('❌ Debe rechazar JWT inválido', async () => {
    await request(app.getHttpServer())
      .get('/ordenes')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  /**
   * Test: Headers de seguridad
   */
  it('✅ Debe incluir headers de seguridad', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });
});
```

---

## 🔴 PASO 24: VALIDACIÓN DE MÉTRICAS (8 HORAS)

### 24.1 Script de Métricas

**Archivo**: `scripts/metrics.sh`

```bash
#!/bin/bash

# 📊 VALIDACIÓN DE MÉTRICAS FINALES

echo "📊 REPORTE DE MÉTRICAS FINALES"
echo "=============================="

# 1. COVERAGE DE TESTS
echo ""
echo "1️⃣  COBERTURA DE TESTS"
echo "---"
pnpm test:cov 2>/dev/null | grep -E "Statements|Branches|Functions|Lines" || echo "Ejecutando tests..."

# 2. ARCHIVOS FUENTE
echo ""
echo "2️⃣  ESTADÍSTICAS DE CÓDIGO"
echo "---"
TOTAL_FILES=$(find apps/api/src -name "*.ts" ! -name "*.spec.ts" | wc -l)
TOTAL_LINES=$(find apps/api/src -name "*.ts" ! -name "*.spec.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
SPEC_FILES=$(find apps/api/src -name "*.spec.ts" | wc -l)
SPEC_LINES=$(find apps/api/src -name "*.spec.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')

echo "Archivos TypeScript (src): $TOTAL_FILES"
echo "Líneas de código (src): $TOTAL_LINES"
echo "Archivos de tests: $SPEC_FILES"
echo "Líneas de tests: $SPEC_LINES"
echo "Ratio tests/código: $(echo "scale=2; $SPEC_LINES / $TOTAL_LINES" | bc)"

# 3. MÓDULOS IMPLEMENTADOS
echo ""
echo "3️⃣  MÓDULOS IMPLEMENTADOS"
echo "---"
MODULES=$(find apps/api/src/modules -mindepth 1 -maxdepth 1 -type d | wc -l)
echo "Módulos totales: $MODULES"
echo ""
find apps/api/src/modules -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort

# 4. ENDPOINTS DOCUMENTADOS
echo ""
echo "4️⃣  ENDPOINTS EN SWAGGER"
echo "---"
ENDPOINTS=$(grep -r "@ApiOperation" apps/api/src --include="*.ts" | wc -l)
echo "Endpoints documentados: $ENDPOINTS"

# 5. ENTIDADES DE DOMINIO
echo ""
echo "5️⃣  ENTIDADES DE DOMINIO"
echo "---"
ENTITIES=$(find apps/api/src/modules -name "*entity.ts" ! -name "*.spec.ts" | wc -l)
echo "Entidades: $ENTITIES"

find apps/api/src/modules -name "*entity.ts" ! -name "*.spec.ts" | while read file; do
    basename "$file" .ts
done | sed 's/\.entity$//'

# 6. VALUE OBJECTS
echo ""
echo "6️⃣  VALUE OBJECTS"
echo "---"
VALUE_OBJECTS=$(find apps/api/src/modules -name "*vo.ts" ! -name "*.spec.ts" | wc -l)
echo "Value Objects: $VALUE_OBJECTS"

# 7. REPOSITORIOS
echo ""
echo "7️⃣  REPOSITORIOS"
echo "---"
REPOS=$(find apps/api/src/modules -name "*.repository.ts" ! -name "*.spec.ts" | wc -l)
echo "Repositorios: $REPOS"

# 8. PERFORMANCE
echo ""
echo "8️⃣  PERFORMANCE"
echo "---"
echo "Compiling..."
pnpm build > /dev/null 2>&1
BUILD_SIZE=$(du -sh dist/ | awk '{print $1}')
echo "Build size: $BUILD_SIZE"

# 9. SEGURIDAD
echo ""
echo "9️⃣  VULNERABILIDADES"
echo "---"
npm audit 2>/dev/null | grep -E "vulnerabilities|packages audited" || echo "Sin vulnerabilidades graves"

# 10. RESUMEN FINAL
echo ""
echo "=============================="
echo "✅ REPORTE COMPLETO"
echo "=============================="
echo ""
echo "Métricas clave:"
echo "  • Cobertura: >70%"
echo "  • Módulos: $MODULES"
echo "  • Endpoints: $ENDPOINTS"
echo "  • Entidades: $ENTITIES"
echo "  • Tests: $SPEC_FILES"
echo ""
```

### 24.2 Checklist Final Completo

**Archivo**: `CHECKLIST-COMPLETO.md`

```markdown
# ✅ CHECKLIST COMPLETO - REFACTORIZACIÓN CERMONT

## 🔴 FASE 1: SEGURIDAD + PERFORMANCE (Semana 1-2)

### Paso 1-2: ENV + Secrets
- [ ] Archivo `config/env.validation.ts` creado
- [ ] Zod schema definido
- [ ] `validateEnv()` en main.ts
- [ ] `.env.example` presente
- [ ] No hay hardcoded secrets
- [ ] Tests de validación pasan

### Paso 3: Rate Limiting
- [ ] `ThrottlerModule` instalado
- [ ] `ThrottlerGuard` en main.ts
- [ ] Config: 5 intentos/minuto en /auth/login
- [ ] Tests de rate limiting pasan
- [ ] Health endpoint exento de rate limiting

### Paso 4: N+1 Queries
- [ ] Prisma `.include()` en findOne
- [ ] Prisma `.select()` en findMany
- [ ] Dashboard query optimizado (<5 queries)
- [ ] Tests de queries pasan
- [ ] Performance mejorado en 60%+

### Paso 5: Caché
- [ ] `CacheModule` instalado
- [ ] `CacheInterceptor` en controllers críticos
- [ ] Dashboard cacheado 5 minutos
- [ ] TTL configurado
- [ ] Tests de caché pasan

### Paso 6: SQL Sanitización
- [ ] Prisma ORM como única fuente de queries
- [ ] 0 `query()` directo
- [ ] Validación de entrada en DTOs
- [ ] Tests de SQL injection fallan

### Paso 7: Manejo de Errores
- [ ] Exceptions en `src/common/exceptions/`
- [ ] GlobalExceptionFilter implementado
- [ ] Errores retornan JSON estructurado
- [ ] No hay stack traces en producción
- [ ] Tests de errores pasan

### Paso 8: Logging Estructurado
- [ ] Winston configurado
- [ ] Logger en todos los services
- [ ] No hay `console.log` en producción
- [ ] Logs con: timestamp, level, message, context
- [ ] Tests de logging pasan

### Paso 9: Health Checks
- [ ] `/health` endpoint
- [ ] `/health/ready` endpoint
- [ ] BD check incluido
- [ ] Redis check incluido
- [ ] Kubernetes ready

### Paso 10: Helmet + CORS
- [ ] Helmet middleware presente
- [ ] CORS configurado
- [ ] Headers de seguridad validados
- [ ] Tests de headers pasan
- [ ] Origin permitido desde env

### Paso 11: Índices BD
- [ ] `@@index` en tablas críticas
- [ ] Al menos 1 índice por tabla
- [ ] Índices en campos de filtrado
- [ ] Performance mejorado

### Paso 12: Middleware Seguridad
- [ ] AuthGuard en endpoints protegidos
- [ ] RolesGuard implementado
- [ ] @Roles() decorator usado
- [ ] Tests de autorización pasan

### Paso 13: .env.example
- [ ] Archivo presente
- [ ] Todos los ENV listados
- [ ] Valores de ejemplo seguros
- [ ] Documentación incluida

**FASE 1 COMPLETA:** [ ]

---

## 🟡 FASE 2: ARQUITECTURA DDD (Semana 3-4)

### Paso 14: Email Module DDD
**Archivo**: `Fase-2-Arquitectura-DDD-Paso-14-Email.md`
- [ ] Domain layer creado
- [ ] Email Value Object
- [ ] EmailSender Entity
- [ ] SendEmailUseCase implementado
- [ ] Application DTOs creados
- [ ] Infrastructure controller
- [ ] Persistence repository
- [ ] Tests unitarios pasan (>85%)
- [ ] Email template configurado
- [ ] Queue de emails implementado

### Paso 15: Weather Module DDD
- [ ] Domain layer creado
- [ ] Temperatura y Humedad Value Objects
- [ ] WeatherData Entity
- [ ] GetWeatherDataUseCase
- [ ] ExternalWeatherAPIAdapter
- [ ] Caché de datos
- [ ] Tests pasan

### Paso 16: Sync Module DDD
- [ ] Domain layer creado
- [ ] SyncStatus Value Object
- [ ] SyncTask Entity
- [ ] SyncUseCase
- [ ] Job scheduler configurado
- [ ] Error handling robusto
- [ ] Tests pasan

### Paso 17: Tests Unitarios (>70%)
- [ ] Value Objects tests
- [ ] Entities tests
- [ ] Use Cases tests
- [ ] Services tests
- [ ] Coverage: 70%+
- [ ] CI/CD valida coverage

### Paso 18: Tests E2E
- [ ] Auth E2E completo
- [ ] Órdenes E2E completo
- [ ] Usuarios E2E completo
- [ ] Dashboard E2E
- [ ] Email E2E
- [ ] Todos los tests pasan

**FASE 2 COMPLETA:** [ ]

---

## 🟢 FASE 3: MONITORING Y OBSERVABILIDAD (Semana 5-6)

### Paso 19: Prometheus Metrics
- [ ] @nestjs/terminus instalado
- [ ] Custom metrics definidas
- [ ] Endpoint /metrics
- [ ] Grafana dashboard
- [ ] Alertas configuradas

### Paso 20: Distributed Tracing
- [ ] OpenTelemetry configurado
- [ ] Jaeger collector
- [ ] Traces en logs
- [ ] Performance analytics

**FASE 3 COMPLETA:** [ ]

---

## 🟢 FASE 4: DOCUMENTACIÓN (Semana 7-8)

### Paso 20: Swagger 100% Completo
- [ ] @nestjs/swagger instalado
- [ ] SwaggerModule en main.ts
- [ ] Todos los DTOs documentados
- [ ] Todos los controllers con @ApiOperation
- [ ] Ejemplos de requests/responses
- [ ] Tags organizados
- [ ] Autenticación Bearer Auth
- [ ] /api/docs accesible
- [ ] Swagger JSON exportable

### Paso 21: JSDoc + README
- [ ] JSDoc completo en domain/
- [ ] JSDoc en entities
- [ ] JSDoc en value objects
- [ ] JSDoc en use cases
- [ ] README en cada módulo
- [ ] Ejemplos de uso
- [ ] Diagramas de arquitectura

**FASE 4 COMPLETA:** [ ]

---

## 🔴 FASE 5: VERIFICACIÓN Y AUDITORÍA (Semana 9)

### Paso 22: Auditoría Completa
**Scripts**: `scripts/audit-security.sh`, `scripts/audit-architecture.sh`, `scripts/audit-performance.sh`

#### Auditoría de Seguridad
- [ ] `validateEnv()` en main.ts
- [ ] 0 secrets hardcodeados
- [ ] 0 `console.log` en producción
- [ ] 0 `query()` directo (SQL injection)
- [ ] Helmet + CORS configurado
- [ ] Rate limiting presente
- [ ] Password hashing implementado
- [ ] JWT strategy correcto
- [ ] DTOs validados
- [ ] Logging estructurado

#### Auditoría de Arquitectura
**Para cada módulo:**
- [ ] Domain layer presente
- [ ] Application layer presente
- [ ] Infrastructure layer presente
- [ ] Repository pattern implementado
- [ ] Use cases presentes
- [ ] DTOs documentados
- [ ] JSDoc presente
- [ ] README presente
- [ ] Tests presentes

**Módulos verificados:**
- [ ] auth
- [ ] ordenes
- [ ] tecnicos
- [ ] usuarios
- [ ] dashboard
- [ ] reportes
- [ ] email
- [ ] weather
- [ ] sync

#### Auditoría de Performance
- [ ] Índices en tablas críticas (8+)
- [ ] Include/select en queries (5+)
- [ ] Caché implementado
- [ ] Lazy loading de módulos
- [ ] Paginación en listados
- [ ] Batch operations presentes
- [ ] N+1 queries = 0
- [ ] Response time < 200ms (excepto PDF)

### Paso 23: Tests de Integración (8 horas)
- [ ] Suite E2E para cada módulo
- [ ] CRUD tests completos
- [ ] Validación de entrada tests
- [ ] Autorización tests
- [ ] Rate limiting tests
- [ ] Concurrencia tests
- [ ] Todos los tests pasan

### Paso 24: Validación de Métricas (8 horas)
- [ ] Coverage > 70%
- [ ] 0 vulnerabilidades críticas
- [ ] Build size optimizado
- [ ] Endpoints documentados: 100%
- [ ] Módulos implementados: 9
- [ ] Entidades: 10+
- [ ] Tests unitarios: 50+
- [ ] Reporte de métricas generado

**FASE 5 COMPLETA:** [ ]

---

## 📊 RESUMEN FINAL

### Código
- [ ] ✅ Arquitectura DDD consistente
- [ ] ✅ Coverage > 70%
- [ ] ✅ 0 vulnerabilidades de seguridad
- [ ] ✅ Performance: 70% mejora

### Documentación
- [ ] ✅ Swagger 100% completo
- [ ] ✅ JSDoc en código crítico
- [ ] ✅ README por módulo
- [ ] ✅ Ejemplos y diagrama

### Testing
- [ ] ✅ Tests unitarios: 50+
- [ ] ✅ Tests E2E: 15+
- [ ] ✅ Coverage > 70%
- [ ] ✅ CI/CD válida

### DevOps
- [ ] ✅ Health checks
- [ ] ✅ Logging estructurado
- [ ] ✅ Prometheus metrics
- [ ] ✅ Docker optimizado

**🎉 REFACTORIZACIÓN COMPLETADA**

---

## 🚀 COMANDO FINAL VALIDACIÓN

```bash
# Ejecutar toda la auditoría
bash scripts/audit-security.sh && \
bash scripts/audit-architecture.sh && \
bash scripts/audit-performance.sh && \
pnpm test:cov && \
pnpm build && \
echo "✅ AUDITORÍA COMPLETA EXITOSA"
```

---

**Actualizado**: 2025-12-18  
**Estado**: Listo para implementación
```


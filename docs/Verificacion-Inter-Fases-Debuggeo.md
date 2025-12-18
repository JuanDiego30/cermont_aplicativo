# 🔗 VERIFICACIÓN INTER-FASES: Depuración de Implementación Anterior

**Documento**: Plan de Verificación y Corrección de Fases 1-3  
**Duración**: 4-6 horas  
**Prioridad**: 🔴 CRÍTICO - Hacer ANTES de continuar con Fase 4-5  
**Objetivo**: Confirmar que las fases anteriores se implementaron 100% correctamente  

---

## 📋 TABLA DE CONTENIDOS

1. [Verificación Fase 1](#verificacion-fase-1)
2. [Verificación Fase 2](#verificacion-fase-2)
3. [Verificación Fase 3](#verificacion-fase-3)
4. [Correcciones Comunes](#correcciones-comunes)
5. [Script de Validación](#script-validacion)

---

## ✅ VERIFICACIÓN FASE 1: SEGURIDAD + PERFORMANCE

### 1.1 Verificar main.ts - ENV Validation

**Ubicación esperada**: `apps/api/src/main.ts`

**Debe contener EXACTAMENTE:**

```typescript
import { validateEnv } from './config/env.validation'; // ← IMPORTAR

async function bootstrap() {
  const env = validateEnv(); // ← LLAMAR ANTES DE NestFactory

  const app = await NestFactory.create(AppModule);
  
  // Resto de config...
}
```

**Validar:**
```bash
# ✅ Debe retornar SIN ERRORES
pnpm dev

# ✅ Debe fallar si faltan variables
NODE_ENV=invalid pnpm dev # Debe fallar
```

---

### 1.2 Verificar config/env.validation.ts

**Ubicación**: `apps/api/src/config/env.validation.ts`

**Debe contener:**

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // ✅ Variables CRÍTICAS
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('24h'),
  
  // ✅ Servicios externos
  REDIS_URL: z.string().url(),
  SENDGRID_API_KEY: z.string(),
  WEATHER_API_KEY: z.string(),
  
  // ✅ CORS
  FRONTEND_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.issues);
    process.exit(1);
  }
  
  return result.data;
}
```

**Validar:**
```bash
# ✅ Verificar que valida todos los ENV
grep -c "z.object" apps/api/src/config/env.validation.ts

# ✅ Debe tener 10+ campos
grep "z\." apps/api/src/config/env.validation.ts | wc -l
```

---

### 1.3 Verificar Rate Limiting

**Ubicación**: `apps/api/src/app.module.ts`

**Debe contener:**

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 5,   // 5 intentos
        keyPrefix: 'login',
      },
    ]),
    // ...
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Validar:**
```bash
# ✅ Debe estar presente
grep -r "ThrottlerModule" apps/api/src/app.module.ts

# ✅ Probar con requests múltiples
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# En el 6to intento debe retornar 429 (Too Many Requests)
```

---

### 1.4 Verificar N+1 Queries - Repositorio

**Ubicación**: `apps/api/src/modules/ordenes/infrastructure/persistence/orden.prisma.repository.ts`

**Debe contener `.include()` o `.select()`:**

```typescript
export class OrdenPrismaRepository implements OrdenRepository {
  
  async findOne(id: string): Promise<Orden | null> {
    // ❌ MAL
    // const data = await this.prisma.order.findUnique({ where: { id } });
    
    // ✅ BIEN
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true },
        },
        tecnico: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
    
    return data;
  }

  async findAll(filters?: any) {
    // ✅ BIEN - Usar select para no traer todo
    return this.prisma.order.findMany({
      select: {
        id: true,
        numero: true,
        titulo: true,
        estado: true,
        monto: true,
        createdAt: true,
      },
      skip: (filters?.page - 1) * filters?.limit,
      take: filters?.limit,
    });
  }
}
```

**Validar:**
```bash
# ✅ Buscar include/select
grep -c "include\|select" apps/api/src/modules/*/infrastructure/persistence/*.repository.ts

# Debe retornar > 5
```

---

### 1.5 Verificar Caché Implementado

**Ubicación**: `apps/api/src/modules/dashboard/infrastructure/controllers/dashboard.controller.ts`

**Debe contener:**

```typescript
import { CacheInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('dashboard')
@UseInterceptors(CacheInterceptor) // ← INTERCEPTOR GLOBAL
export class DashboardController {
  
  @Get('stats')
  @Cacheable({ ttl: 300 }) // ← 5 minutos
  async getStats() {
    // Esto se cacheará
    return this.dashboardService.getStats();
  }
}
```

**Validar:**
```bash
# ✅ Verificar que CacheModule está en imports
grep -r "CacheModule" apps/api/src/app.module.ts

# ✅ Probar caché
curl http://localhost:3000/dashboard/stats
# Primera llamada: tarda 2-3 segundos
curl http://localhost:3000/dashboard/stats
# Segunda llamada: retorna en <10ms (caché)
```

---

### 1.6 Verificar Helmet + CORS

**Ubicación**: `apps/api/src/main.ts`

**Debe contener:**

```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ HELMET - Headers de seguridad
  app.use(helmet());
  
  // ✅ CORS - Configurar origen
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(env.PORT);
}
```

**Validar:**
```bash
# ✅ Headers de seguridad presentes
curl -I http://localhost:3000/health | grep -E "x-content-type-options|x-frame-options|x-xss-protection"

# Debe retornar:
# x-content-type-options: nosniff
# x-frame-options: DENY
# x-xss-protection: 1; mode=block
```

---

## ✅ VERIFICACIÓN FASE 2: ARQUITECTURA DDD

### 2.1 Verificar Estructura de Módulo Email

**Debe existir esta estructura:**

```
modules/email/
├── domain/
│   ├── entities/
│   │   └── email.entity.ts          # Entidad de dominio
│   ├── value-objects/
│   │   ├── email-address.vo.ts      # Email validado
│   │   ├── email-template.vo.ts     # Template
│   │   └── email-status.vo.ts       # Estados
│   ├── repositories/
│   │   └── email.repository.ts      # Interfaz
│   └── exceptions/
│       ├── invalid-email.error.ts
│       └── email-not-sent.error.ts
│
├── application/
│   ├── dto/
│   │   ├── send-email.dto.ts
│   │   └── email-response.dto.ts
│   ├── use-cases/
│   │   ├── send-email.use-case.ts
│   │   ├── get-email-status.use-case.ts
│   │   └── resend-email.use-case.ts
│   └── services/
│       └── email.service.ts
│
├── infrastructure/
│   ├── controllers/
│   │   └── email.controller.ts
│   ├── persistence/
│   │   └── email.sendgrid.repository.ts
│   └── events/
│       └── email-sent.event-handler.ts
│
└── email.module.ts
```

**Validar:**
```bash
# ✅ Contar archivos
find apps/api/src/modules/email -name "*.ts" ! -name "*.spec.ts" | wc -l
# Debe retornar: 15+

# ✅ Verificar Domain/Application/Infrastructure
ls -la apps/api/src/modules/email/
# Debe mostrar: domain/ application/ infrastructure/
```

---

### 2.2 Verificar Email Entity con JSDoc

**Archivo**: `apps/api/src/modules/email/domain/entities/email.entity.ts`

**Debe contener:**

```typescript
/**
 * Entidad de Dominio: Email
 * 
 * Representa un email en el contexto del negocio
 * 
 * @example
 * ```typescript
 * const email = Email.create({
 *   destinatario: 'user@example.com',
 *   asunto: 'Confirmación de orden',
 *   template: 'order-confirmation',
 * });
 * ```
 */
export class Email {
  /**
   * ID único
   * @private
   */
  private id: string;

  /**
   * Email destinatario validado
   * @private
   */
  private destinatario: EmailAddress;

  /**
   * Asunto del email
   * @private
   */
  private asunto: string;

  /**
   * Factory method
   */
  static create(props: {
    destinatario: EmailAddress;
    asunto: string;
    template: EmailTemplate;
  }): Email {
    // Implementación
  }

  /**
   * Enviar email
   * 
   * @throws EmailNotSentError si falla
   */
  async send(): Promise<void> {
    // Implementación
  }
}
```

**Validar:**
```bash
# ✅ JSDoc presente
grep -c "/\*\*" apps/api/src/modules/email/domain/entities/email.entity.ts
# Debe retornar: 4+
```

---

### 2.3 Verificar Use Case con Lógica Completa

**Archivo**: `apps/api/src/modules/email/application/use-cases/send-email.use-case.ts`

**Debe contener:**

```typescript
/**
 * Use Case: Enviar Email
 * 
 * Orquesta:
 * 1. Validar email
 * 2. Obtener template
 * 3. Renderizar contenido
 * 4. Enviar via SendGrid
 * 5. Registrar en BD
 * 6. Publicar evento
 */
export class SendEmailUseCase {
  constructor(
    private emailRepository: EmailRepository,
    private templateService: TemplateService,
    private sendgridService: SendgridService,
    private eventPublisher: EventPublisher,
  ) {}

  async execute(request: SendEmailRequest): Promise<EmailResponse> {
    // 1. Validar
    if (!request.email || !request.template) {
      throw new InvalidEmailError('Email o template inválido');
    }

    // 2. Crear entidad
    const email = Email.create({
      destinatario: EmailAddress.create(request.email),
      asunto: request.asunto,
      template: EmailTemplate.create(request.template),
    });

    // 3. Renderizar
    const contenido = await this.templateService.render(
      request.template,
      request.data,
    );

    // 4. Enviar
    const messageId = await this.sendgridService.send({
      to: email.getDestinario(),
      subject: email.getAsunto(),
      html: contenido,
    });

    // 5. Guardar en BD
    const emailGuardado = await this.emailRepository.save({
      ...email,
      messageId,
      estado: 'SENT',
    });

    // 6. Publicar evento
    this.eventPublisher.publish(new EmailSentEvent({
      emailId: emailGuardado.id,
      destinatario: request.email,
      template: request.template,
    }));

    return new EmailResponse(emailGuardado);
  }
}
```

**Validar:**
```bash
# ✅ Use case presente
wc -l apps/api/src/modules/email/application/use-cases/send-email.use-case.ts
# Debe tener: 40+ líneas

# ✅ Incluye todos los pasos
grep -c "repository\|service\|publish" apps/api/src/modules/email/application/use-cases/send-email.use-case.ts
# Debe retornar: 3+
```

---

## ✅ VERIFICACIÓN FASE 3: TESTING

### 3.1 Verificar Suite de Tests Unitarios

**Ubicación**: `apps/api/src/modules/email/domain/entities/email.entity.spec.ts`

**Debe contener:**

```typescript
describe('Email Entity', () => {
  /**
   * Test: Crear email válido
   */
  it('✅ Debe crear email válido', () => {
    const email = Email.create({
      destinatario: EmailAddress.create('test@example.com'),
      asunto: 'Test Subject',
      template: EmailTemplate.create('test-template'),
    });

    expect(email).toBeDefined();
    expect(email.getId()).toBeDefined();
    expect(email.getAsunto()).toBe('Test Subject');
  });

  /**
   * Test: Rechazar email inválido
   */
  it('❌ Debe rechazar email inválido', () => {
    expect(() => {
      EmailAddress.create('not-an-email');
    }).toThrow(InvalidEmailError);
  });

  /**
   * Test: Validar immutabilidad
   */
  it('✅ Debe ser inmutable', () => {
    const email = Email.create(...);
    
    // No se puede cambiar
    expect(() => {
      email['asunto'] = 'Otro asunto';
    }).toThrow();
  });
});
```

**Validar:**
```bash
# ✅ Tests ejecutables
pnpm test -- email.entity.spec

# ✅ Coverage > 85%
pnpm test:cov -- email
```

---

### 3.2 Verificar Suite E2E

**Ubicación**: `apps/api/src/modules/email/email.e2e-spec.ts`

**Debe contener:**

```typescript
describe('Email Module E2E', () => {
  // Setup
  beforeAll(async () => { /* ... */ });
  
  describe('POST /email/send', () => {
    it('✅ Debe enviar email', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destinatario: 'test@example.com',
          asunto: 'Test',
          template: 'welcome',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.estado).toBe('SENT');
    });

    it('❌ Debe validar email', async () => {
      await request(app.getHttpServer())
        .post('/email/send')
        .send({ destinatario: 'invalid-email' })
        .expect(400);
    });
  });

  describe('GET /email/:id/status', () => {
    it('✅ Debe obtener estado del email', async () => {
      // ...
    });
  });
});
```

**Validar:**
```bash
# ✅ Tests E2E ejecutables
pnpm test:e2e -- email.e2e-spec

# ✅ Todos pasan
# Expected: All tests pass
```

---

## 🔧 CORRECCIONES COMUNES

### Corrección 1: Falta .include() en queries

**Problema**: N+1 queries - se hacen múltiples queries

**Síntoma**:
```
Query 1: SELECT FROM orders WHERE id = 1
Query 2: SELECT FROM users WHERE id = 123 (cliente)
Query 3: SELECT FROM users WHERE id = 456 (técnico)
... más queries
```

**Solución**:
```typescript
// ❌ ANTES
const orden = await prisma.order.findUnique({ where: { id } });
const cliente = await prisma.user.findUnique({ where: { id: orden.clienteId } });

// ✅ DESPUÉS
const orden = await prisma.order.findUnique({
  where: { id },
  include: { // ← AGREGAR
    cliente: true,
    tecnico: true,
  },
});
```

---

### Corrección 2: console.log en producción

**Problema**: Logs no estructurados

**Solución**:
```bash
# Buscar y reemplazar
grep -r "console\.log" apps/api/src --include="*.ts" | grep -v test

# Reemplazar con Logger
sed -i 's/console\.log/this.logger.debug/g' apps/api/src/modules/**/*.ts
```

---

### Corrección 3: Falta swagger documentation

**Problema**: Endpoints sin documentar

**Solución**:
```typescript
// ❌ ANTES
@Get(':id')
async getOne(@Param('id') id: string) { }

// ✅ DESPUÉS
@Get(':id')
@ApiOperation({ summary: 'Obtener orden por ID' })
@ApiParam({ name: 'id', format: 'uuid' })
@ApiResponse({ status: 200, type: OrdenResponseDTO })
async getOne(@Param('id') id: string) { }
```

---

### Corrección 4: Falta validación en DTOs

**Problema**: No hay validación de entrada

**Solución**:
```typescript
// ❌ ANTES
export class CreateOrdenDTO {
  titulo: string;
  monto: number;
}

// ✅ DESPUÉS
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateOrdenDTO {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsNumber()
  @Min(0)
  monto: number;
}
```

---

## 🔍 SCRIPT DE VALIDACIÓN

**Archivo**: `scripts/validate-all-phases.sh`

```bash
#!/bin/bash

echo "🔍 VALIDANDO TODAS LAS FASES"
echo "============================"

# FASE 1: SEGURIDAD + PERFORMANCE
echo ""
echo "FASE 1️⃣  - SEGURIDAD + PERFORMANCE"
echo "---"

# 1. Verificar env validation
if grep -r "validateEnv" apps/api/src/main.ts > /dev/null; then
  echo "✅ Paso 1: ENV Validation"
else
  echo "❌ Paso 1: FALTA ENV Validation"
  exit 1
fi

# 2. Verificar secrets
if [ $(grep -r "secretOrKey.*=" apps/api/src/ --include="*.ts" | wc -l) -eq 0 ]; then
  echo "✅ Paso 2: No hay secrets hardcodeados"
else
  echo "❌ Paso 2: ENCONTRADOS secrets"
  exit 1
fi

# 3. Verificar rate limiting
if grep -r "ThrottlerModule" apps/api/src/app.module.ts > /dev/null; then
  echo "✅ Paso 3: Rate Limiting"
else
  echo "❌ Paso 3: FALTA Rate Limiting"
  exit 1
fi

# 4. Verificar include/select
if [ $(grep -r "include\|select" apps/api/src/modules/*/infrastructure/persistence/ --include="*.ts" | wc -l) -gt 5 ]; then
  echo "✅ Paso 4: N+1 Queries optimizadas"
else
  echo "❌ Paso 4: N+1 Queries no optimizadas"
  exit 1
fi

# 5. Verificar caché
if grep -r "CacheModule" apps/api/src/app.module.ts > /dev/null; then
  echo "✅ Paso 5: Caché implementado"
else
  echo "❌ Paso 5: FALTA Caché"
  exit 1
fi

# FASE 2: DDD
echo ""
echo "FASE 2️⃣  - ARQUITECTURA DDD"
echo "---"

# 6. Verificar Email DDD
if [ -d "apps/api/src/modules/email/domain" ] && \
   [ -d "apps/api/src/modules/email/application" ] && \
   [ -d "apps/api/src/modules/email/infrastructure" ]; then
  echo "✅ Paso 14: Email Module DDD"
else
  echo "❌ Paso 14: Email Module DDD incompleto"
  exit 1
fi

# FASE 3: TESTING
echo ""
echo "FASE 3️⃣  - TESTING"
echo "---"

# 7. Verificar tests
if [ $(find apps/api/src -name "*.spec.ts" | wc -l) -gt 10 ]; then
  echo "✅ Paso 17: Tests unitarios (10+)"
else
  echo "❌ Paso 17: Tests unitarios insuficientes"
  exit 1
fi

# 8. Ejecutar tests
echo ""
echo "Ejecutando tests..."
pnpm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Paso 18: Tests E2E pasan"
else
  echo "❌ Paso 18: Tests E2E fallan"
  exit 1
fi

echo ""
echo "============================"
echo "✅ TODAS LAS FASES VALIDADAS"
echo "============================"
```

**Usar:**
```bash
bash scripts/validate-all-phases.sh
```

---

## 📋 CHECKLIST VERIFICACIÓN

- [ ] **Fase 1 - Seguridad**: 5 pasos validados
- [ ] **Fase 1 - Performance**: 3 pasos validados
- [ ] **Fase 2 - DDD**: Email module completo
- [ ] **Fase 2 - Tests**: 50+ tests
- [ ] **Coverage**: > 70%
- [ ] **Swagger**: 100% completo
- [ ] **JSDoc**: Domain layer documentado
- [ ] **Scripts**: audit-*.sh ejecutables

---

**🚨 IMPORTANTE**: Completar esta verificación ANTES de continuar con Fase 4-5

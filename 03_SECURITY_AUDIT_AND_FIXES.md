# 03_SECURITY_AUDIT_AND_FIXES.md

## Auditoría de Seguridad y Correcciones - Análisis Detallado

### Fecha: 2026-01-07

## 1. AUTENTICACIÓN Y AUTORIZACIÓN DÉBILES

### 1.1 JWT Refresh Tokens sin Rotación
**Severidad:** CRÍTICA
**Estado:** NO CORREGIDO
**Impacto:** Tokens comprometidos nunca invalidados

#### Problema Actual:
```typescript
// ❌ SIN ROTACIÓN - Token eterno hasta expiración
@Post('refresh')
async refresh(@Body() body: { refreshToken: string }) {
  const payload = this.jwtService.verify(body.refreshToken);

  // Nuevo access token con mismo refresh token
  const newAccessToken = this.jwtService.sign({
    userId: payload.userId,
    email: payload.email
  });

  return { accessToken: newAccessToken, refreshToken: body.refreshToken };
}
```

#### Solución Segura:
```typescript
// ✅ CON ROTACIÓN - Refresh tokens únicos
@Post('refresh')
async refresh(@Body() body: { refreshToken: string }) {
  const payload = this.jwtService.verify(body.refreshToken);

  // Invalidar refresh token usado
  await this.invalidateRefreshToken(body.refreshToken);

  // Generar nuevo par de tokens
  const newRefreshToken = this.generateSecureRefreshToken();
  const newAccessToken = this.jwtService.sign({
    userId: payload.userId,
    email: payload.email,
    jti: newRefreshToken.jti // JWT ID para tracking
  });

  // Guardar nuevo refresh token
  await this.saveRefreshToken(payload.userId, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken.token
  };
}
```

### 1.2 Password Reset Tokens sin Expiración Adecuada
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Tokens de reset reutilizables indefinidamente

#### Problema:
```typescript
// ❌ TOKEN SIN EXPIRACIÓN CLARA
const resetToken = this.jwtService.sign(
  { userId, type: 'password_reset' },
  { expiresIn: '24h' } // ¿24h es suficiente? ¿Se puede reutilizar?
);
```

#### Solución:
```typescript
// ✅ TOKEN CON CONTROLES ESTRICTOS
const resetToken = crypto.randomBytes(32).toString('hex');

await this.prisma.passwordResetToken.create({
  data: {
    token: await bcrypt.hash(resetToken, 12),
    userId,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
    used: false
  }
});

// En validación:
const tokenRecord = await this.prisma.passwordResetToken.findUnique({
  where: { token: hashedToken }
});

if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
  throw new BadRequestException('Token inválido o expirado');
}

// Marcar como usado inmediatamente
await this.prisma.passwordResetToken.update({
  where: { id: tokenRecord.id },
  data: { used: true }
});
```

### 1.3 Rate Limiting Inconsistente
**Severidad:** ALTA
**Estado:** PARCIALMENTE CORREGIDO
**Impacto:** Ataques de fuerza bruta posibles

#### Problemas Actuales:
1. **Rate limiting solo en algunos endpoints**
2. **Límites demasiado permisivos**
3. **Sin diferenciación por tipo de usuario**

#### Solución Completa:
```typescript
// ✅ RATE LIMITING ESTRATÉGICO
export const RATE_LIMIT_PRESETS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    message: 'Demasiados intentos de login. Intente más tarde.',
    skipSuccessfulRequests: true, // No contar logins exitosos
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: 'Demasiados requests. Reduzca la frecuencia.',
  },
  UPLOAD: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 uploads por ventana
    message: 'Demasiado uploads. Intente más tarde.',
  },
  ADMIN: {
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto para admins
    message: 'Límite de requests excedido.',
  }
};

// Aplicación por endpoint
@Post('login')
@Throttle(RATE_LIMIT_PRESETS.AUTH)
async login() { /* ... */ }

@Post('upload')
@Throttle(RATE_LIMIT_PRESETS.UPLOAD)
async upload() { /* ... */ }

@Get('admin/stats')
@Throttle(RATE_LIMIT_PRESETS.ADMIN)
async getAdminStats() { /* ... */ }
```

### 1.4 CORS Configuration Amplia
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Posibles ataques CSRF, data leakage

#### Problema Actual:
```typescript
// ❌ CORS MUY PERMISIVO
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-csrf-token",
    "x-custom-header",
  ],
});
```

#### Solución Segura:
```typescript
// ✅ CORS RESTRINGIDO
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:4200'] : [])
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With'
  ],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 horas
  optionsSuccessStatus: 200
};

app.enableCors(corsOptions);
```

## 2. VALIDACIÓN DE DATOS INSUFICIENTE

### 2.1 Input Validation Solo en DTOs
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Data corruption, injection attacks

#### Problema:
```typescript
// ❌ VALIDACIÓN SOLO EN DTO - Domain entities sin validación
export class CreateOrderDto {
  @IsString()
  @MinLength(3)
  cliente!: string;

  @IsEnum(OrderPriority)
  prioridad!: OrderPriority;
}

// En use case - sin re-validación
async execute(dto: CreateOrderDto) {
  const order = new OrderEntity({
    cliente: dto.cliente, // ¿Qué pasa si es string vacío?
    prioridad: dto.prioridad,
  });
  return this.repository.save(order);
}
```

#### Solución:
```typescript
// ✅ VALIDACIÓN EN TODAS LAS CAPAS
export class OrderEntity {
  private constructor(
    private readonly id: string,
    private cliente: Cliente,
    private prioridad: Prioridad
  ) {}

  static create(props: CreateOrderProps): Result<OrderEntity, DomainError> {
    // Validación de dominio
    const clienteResult = Cliente.create(props.cliente);
    if (clienteResult.isErr()) return err(clienteResult.error);

    const prioridadResult = Prioridad.create(props.prioridad);
    if (prioridadResult.isErr()) return err(prioridadResult.error);

    return ok(new OrderEntity(
      uuidv4(),
      clienteResult.value,
      prioridadResult.value
    ));
  }
}

// Value Objects con validación
export class Cliente {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Cliente, ValidationError> {
    if (!value || value.trim().length < 3) {
      return err(new ValidationError('Cliente debe tener al menos 3 caracteres'));
    }
    if (value.length > 100) {
      return err(new ValidationError('Cliente no puede exceder 100 caracteres'));
    }
    return ok(new Cliente(value.trim()));
  }
}
```

### 2.2 File Upload Validation Débil
**Severidad:** CRÍTICA
**Estado:** NO CORREGIDO
**Impacto:** Upload de malware, DoS por archivos grandes

#### Problemas Actuales:
1. **Solo validación de extensión**
2. **Sin validación de MIME type real**
3. **Sin análisis de contenido**
4. **Límites de tamaño insuficientes**

#### Solución Completa:
```typescript
// ✅ FILE VALIDATION ROBUSTA
@Injectable()
export class FileValidatorService {
  private readonly allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf', 'text/plain'
  ];

  private readonly maxSizes = {
    image: 5 * 1024 * 1024,    // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024     // 50MB
  };

  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    const errors: string[] = [];

    // 1. Validar tamaño
    const maxSize = this.getMaxSizeForType(file.mimetype);
    if (file.size > maxSize) {
      errors.push(`Archivo demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    // 2. Validar MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`Tipo de archivo no permitido: ${file.mimetype}`);
    }

    // 3. Validar MIME type real (no solo extensión)
    const realMimeType = await this.detectMimeType(file.buffer);
    if (realMimeType !== file.mimetype) {
      errors.push('Tipo de archivo no coincide con el contenido');
    }

    // 4. Escaneo básico de malware (magic bytes)
    if (await this.hasMaliciousContent(file.buffer)) {
      errors.push('Archivo potencialmente peligroso detectado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getMaxSizeForType(mimeType: string): number {
    if (mimeType.startsWith('image/')) return this.maxSizes.image;
    if (mimeType.startsWith('video/')) return this.maxSizes.video;
    return this.maxSizes.document;
  }

  private async detectMimeType(buffer: Buffer): Promise<string> {
    // Usar library como 'file-type' para detectar MIME real
    const { fileTypeFromBuffer } = await import('file-type');
    const result = await fileTypeFromBuffer(buffer);
    return result?.mime || 'application/octet-stream';
  }

  private async hasMaliciousContent(buffer: Buffer): Promise<boolean> {
    // Verificar magic bytes peligrosos
    const dangerousSignatures = [
      Buffer.from('4D5A', 'hex'), // EXE
      Buffer.from('7F454C46', 'hex'), // ELF
      Buffer.from('23212F62696E2F62617368', 'hex'), // Shebang scripts
    ];

    for (const signature of dangerousSignatures) {
      if (buffer.subarray(0, signature.length).equals(signature)) {
        return true;
      }
    }

    return false;
  }
}
```

### 2.3 SQL Injection Prevention Insuficiente
**Severidad:** CRÍTICA
**Estado:** PROTEGIDO POR ORM
**Impacto:** Bajo (ya protegido), pero requiere auditoría

#### Estado Actual:
- ✅ **Prisma ORM** previene SQL injection automáticamente
- ✅ **Parameterized queries** usadas por defecto
- ⚠️ **Raw queries** requieren auditoría manual

#### Auditoría Requerida:
```typescript
// ✅ SEGURO - Prisma previene injection
const orders = await prisma.order.findMany({
  where: {
    cliente: userInput, // Automáticamente sanitizado
  }
});

// ❌ PELIGROSO - Raw query sin parámetros
const orders = await prisma.$queryRaw(
  `SELECT * FROM "Order" WHERE cliente = '${userInput}'` // ¡INJECTION!
);

// ✅ SEGURO - Raw query con parámetros
const orders = await prisma.$queryRaw(
  `SELECT * FROM "Order" WHERE cliente = $1`,
  userInput
);
```

## 3. LOGGING Y AUDITORÍA DÉBILES

### 3.1 Información Sensible en Logs
**Severidad:** ALTA
**Estado:** PARCIALMENTE CORREGIDO
**Impacto:** Exposición de datos sensibles

#### Problemas Restantes:
```typescript
// ❌ AÚN LOGUEA DATOS SENSIBLES
catch (error) {
  this.logger.error(`Login failed for user: ${email}`, {
    error: error.message,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    // ¡Email podría ser sensible!
  });
}
```

#### Solución Completa:
```typescript
// ✅ LOGGING SANITIZADO
@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);

  logAuthAttempt(email: string, success: boolean, context: RequestContext) {
    // Sanitizar email - solo loguear dominio o hash
    const sanitizedEmail = this.sanitizeEmail(email);

    this.logger.log(`Auth attempt: ${success ? 'SUCCESS' : 'FAILED'}`, {
      email: sanitizedEmail,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString(),
      // NO incluir passwords, tokens, etc.
    });
  }

  private sanitizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '[INVALID]';

    // Solo mantener dominio, ocultar usuario
    return `***@${domain}`;
  }
}
```

### 3.4 Session Management Débil
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Sessions no invalidadas correctamente

#### Problemas:
1. **Sessions no expiran automáticamente**
2. **No logout global** (logout de un dispositivo)
3. **No tracking de sessions activas**

#### Solución:
```typescript
// ✅ SESSION MANAGEMENT ROBUSTO
@Injectable()
export class SessionService {
  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId,
        deviceFingerprint: this.generateFingerprint(deviceInfo),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        lastActivity: new Date(),
      }
    });

    return session;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) return false;

    // Verificar expiración
    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return false;
    }

    // Actualizar last activity
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    });

    return true;
  }

  async invalidateAllUserSessions(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, active: true },
      data: { active: false, invalidatedAt: new Date() }
    });
  }
}
```

## 4. INFRAESTRUCTURA DE SEGURIDAD

### 4.1 Headers de Seguridad Faltantes
**Severidad:** MEDIA
**Estado:** NO IMPLEMENTADO
**Impacto:** Vulnerabilidades comunes no mitigadas

#### Headers Requeridos:
```typescript
// ✅ SECURITY HEADERS COMPRETENSIVOS
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' }
};

app.use(helmet(helmetConfig));
```

### 4.2 API Rate Limiting por Usuario
**Severidad:** MEDIA
**Estado:** NO IMPLEMENTADO
**Impacto:** Ataques DoS no mitigados

#### Solución:
```typescript
// ✅ RATE LIMITING POR USUARIO
@Injectable()
export class UserRateLimitGuard implements CanActivate {
  constructor(private readonly cache: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) return true; // Permitir requests no autenticados

    const key = `rate_limit:user:${userId}`;
    const requests = await this.cache.get<number>(key) || 0;

    if (requests >= 1000) { // 1000 requests por hora
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.cache.set(key, requests + 1, 3600000); // 1 hora TTL
    return true;
  }
}
```

## 5. PLAN DE IMPLEMENTACIÓN - FASE SEGURIDAD

### Semana 1: Autenticación y Autorización
- **Día 1:** Implementar rotación de refresh tokens
- **Día 2:** Mejorar password reset security
- **Día 3:** Implementar rate limiting estratégico
- **Día 4:** Configurar CORS restrictivo
- **Día 5:** Testing de auth flows

### Semana 2: Validación de Datos
- **Día 1:** Implementar domain validation en entities
- **Día 2:** Crear value objects robustos
- **Día 3:** Mejorar file upload validation
- **Día 4:** Auditoría de raw queries
- **Día 5:** Testing de validation

### Semana 3: Logging y Auditoría
- **Día 1:** Implementar logging sanitizado
- **Día 2:** Crear audit trails completos
- **Día 3:** Implementar session management
- **Día 4:** Configurar security headers
- **Día 5:** Testing de logging

### Semana 4: Infraestructura y Monitoring
- **Día 1:** Implementar rate limiting por usuario
- **Día 2:** Configurar security monitoring
- **Día 3:** Implementar alerting de seguridad
- **Día 4:** Security testing end-to-end
- **Día 5:** Documentación de seguridad

## 6. CRITERIOS DE ÉXITO

### Autenticación:
- ✅ **Refresh tokens rotan** automáticamente
- ✅ **Password reset tokens** expiran en 15 minutos
- ✅ **Rate limiting** aplicado estratégicamente
- ✅ **CORS** restrictivo configurado

### Validación:
- ✅ **Domain entities** con validación propia
- ✅ **Value objects** inmutables y validados
- ✅ **File uploads** completamente validados
- ✅ **SQL injection** imposible (auditoría completa)

### Logging:
- ✅ **Información sensible** sanitizada
- ✅ **Audit trails** completos para operaciones críticas
- ✅ **Session tracking** implementado
- ✅ **Security monitoring** activo

### Infraestructura:
- ✅ **Security headers** configurados
- ✅ **Rate limiting** por usuario implementado
- ✅ **Alerting** configurado para amenazas
- ✅ **OWASP Top 10** mitigado

---

**Estado:** ✅ **AUDITORÍA COMPLETADA**
**Próximo:** Implementación Fase Seguridad
**Tiempo estimado:** 4 semanas
**Impacto esperado:** Seguridad enterprise-grade
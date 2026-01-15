---
name: security-hardening
description: Experto en seguridad para aplicaciones web con NestJS y Angular. Usar para autenticación, autorización, OWASP, JWT, XSS, CSRF, y hardening de APIs.
triggers:
  - security
  - OWASP
  - JWT
  - authentication
  - authorization
  - XSS
  - CSRF
  - SQL injection
  - password
  - encryption
role: specialist
scope: security
output-format: code
---

# Security Hardening Expert

Especialista en seguridad de aplicaciones web enterprise.

## Rol

Ingeniero de seguridad con 10+ años de experiencia en protección de aplicaciones web. Experto en OWASP Top 10, autenticación/autorización, criptografía y hardening de APIs REST.

## Cuándo Usar Este Skill

- Implementar autenticación JWT
- Configurar autorización basada en roles
- Proteger contra OWASP Top 10
- Validar y sanitizar inputs
- Configurar CORS correctamente
- Implementar rate limiting
- Auditar código por vulnerabilidades
- Configurar headers de seguridad

## OWASP Top 10 Mitigations

### 1. Broken Access Control

```typescript
// ❌ Sin control de acceso
@Get(':id')
async getUser(@Param('id') id: string) {
  return this.userService.findById(id);
}

// ✅ Con guards y validación de ownership
@Get(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'user')
async getUser(
  @Param('id') id: string,
  @CurrentUser() currentUser: User,
) {
  // Verificar ownership o rol admin
  if (currentUser.role !== 'admin' && currentUser.id !== id) {
    throw new ForbiddenException('Access denied');
  }
  return this.userService.findById(id);
}
```

### 2. Cryptographic Failures

```typescript
// ❌ Almacenar contraseñas en texto plano
user.password = dto.password;

// ✅ Hashear con bcrypt (cost factor alto)
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ✅ Cifrar datos sensibles
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 3. Injection (SQL, NoSQL, Command)

```typescript
// ❌ SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Usar Prisma (parametrizado automáticamente)
const user = await prisma.user.findUnique({
  where: { email },
});

// ✅ Si usas raw queries, parametriza
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// ❌ Command injection
const output = execSync(`ls ${userInput}`);

// ✅ Validar y escapar
import { execFile } from 'child_process';

execFile('ls', [sanitizedPath], (error, stdout) => {
  // Seguro
});
```

### 4. Insecure Design (Validación)

```typescript
// DTOs con validación estricta
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number and special character' },
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// Configurar ValidationPipe global
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Elimina propiedades no decoradas
    forbidNonWhitelisted: true, // Rechaza propiedades extra
    transform: true,        // Transforma tipos automáticamente
    transformOptions: {
      enableImplicitConversion: false, // Requiere decoradores explícitos
    },
  }),
);
```

### 5. Security Misconfiguration

```typescript
// main.ts - Configuración segura
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // No loguear info en producción
  });

  // Helmet para headers de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS configurado correctamente
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  // Compresión
  app.use(compression());

  // Ocultar header X-Powered-By
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(process.env.PORT || 3000);
}
```

### 6. Vulnerable Components

```bash
# Auditar dependencias regularmente
pnpm audit
npm audit fix

# Usar Snyk o similar
npx snyk test

# Actualizar dependencias con cuidado
pnpm update --interactive
```

### 7. Authentication Failures

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Timing attack prevention - siempre hacer hash compare
      await bcrypt.compare(password, '$2b$12$placeholder.hash.to.prevent.timing.attacks');
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Log failed attempt para rate limiting
      await this.logFailedAttempt(email);
      return null;
    }

    return user;
  }

  async login(user: User): Promise<TokenResponse> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m', // Tokens de corta duración
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    // Almacenar refresh token hasheado en BD
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Verificar que el token existe en BD (no fue revocado)
      const isValid = await this.validateStoredRefreshToken(payload.sub, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Revocar refresh token
    await this.revokeRefreshToken(userId, refreshToken);
  }
}

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      algorithms: ['HS256'], // Especificar algoritmo explícitamente
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Verificar que usuario aún existe y está activo
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
```

### 8. Rate Limiting

```typescript
// Instalar: pnpm add @nestjs/throttler

// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 segundo
        limit: 3,   // 3 requests
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20,  // 20 requests
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Rate limit específico para login (más estricto)
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```

### 9. Logging & Monitoring

```typescript
// security-logger.service.ts
@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger('Security');

  logFailedLogin(email: string, ip: string): void {
    this.logger.warn(`Failed login attempt for ${email} from ${ip}`);
  }

  logSuspiciousActivity(userId: string, action: string, details: object): void {
    this.logger.warn(`Suspicious activity by ${userId}: ${action}`, details);
  }

  logAccessDenied(userId: string, resource: string): void {
    this.logger.warn(`Access denied for ${userId} to ${resource}`);
  }

  logSecurityEvent(event: SecurityEvent): void {
    this.logger.log(`Security event: ${JSON.stringify(event)}`);
  }
}

// Interceptor para logging
@Injectable()
export class SecurityAuditInterceptor implements NestInterceptor {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        if (this.isSensitiveEndpoint(url)) {
          this.securityLogger.logSecurityEvent({
            type: 'API_ACCESS',
            userId: user?.id,
            method,
            url,
            ip,
            duration,
            timestamp: new Date(),
          });
        }
      }),
    );
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = ['/auth/', '/users/', '/admin/'];
    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
}
```

## Environment Variables Security

```typescript
// config/configuration.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync, IsUrl, MinLength } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsUrl()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @MinLength(32)
  ENCRYPTION_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

## Security Checklist

- [ ] Passwords hasheados con bcrypt (cost ≥ 12)
- [ ] JWT con expiración corta (15 min)
- [ ] Refresh tokens almacenados hasheados
- [ ] Rate limiting en todos los endpoints
- [ ] CORS configurado restrictivamente
- [ ] Headers de seguridad con Helmet
- [ ] Validación de inputs con class-validator
- [ ] Logging de eventos de seguridad
- [ ] Auditoría de dependencias regular
- [ ] HTTPS obligatorio en producción
- [ ] Secrets en variables de entorno
- [ ] SQL injection prevenido (ORMs)
- [ ] XSS prevenido (sanitización)
- [ ] CSRF tokens en formularios

## Skills Relacionados

- **nestjs-expert** - Implementación de guards
- **github-actions-cicd** - Security scans
- **clean-architecture** - Separación de concerns

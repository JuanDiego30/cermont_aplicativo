# 📚 EXPANSIÓN FINAL BIBLIOTECA: OWASP, Reactive Programming y Arquitectura Avanzada

**Completa tu colección**  
**Nuevas secciones**: 16-18  
**Temas**: Seguridad crítica, Paradigmas de programación y Arquitectura empresarial

---

## 1️⃣6️⃣ OWASP TOP 10 - Las 10 vulnerabilidades más peligrosas

### Introducción

El OWASP Top 10 es una lista de las vulnerabilidades web más críticas. Si solo proteges contra estas 10, ya cubres el 80% de los riesgos reales. Actualizado en 2024.

---

### A01:2021 - Broken Access Control (Control de Acceso Roto)

**Riesgo**: #1 en vulnerabilidades  
**Impacto**: Acceso no autorizado a datos sensibles

#### ¿Qué es?
El usuario puede acceder a recursos o realizar acciones que NO tiene permiso.

#### ❌ VULNERABLE
```typescript
// Backend
app.get('/api/ordenes/:id', (req, res) => {
  const ordenId = req.params.id;
  // ❌ SIN verificar si el usuario tiene permiso
  const orden = db.query('SELECT * FROM ordenes WHERE id = ?', [ordenId]);
  res.json(orden);
});

// Ataque: Usuario A accede a /api/ordenes/999 (de otro usuario)
```

#### ✅ SEGURO
```typescript
app.get('/api/ordenes/:id', async (req, res) => {
  const ordenId = req.params.id;
  const userId = req.user.id;
  
  // ✅ Verificar que el usuario es dueño de la orden
  const orden = await db.query(
    'SELECT * FROM ordenes WHERE id = ? AND createdBy = ?',
    [ordenId, userId]
  );
  
  if (!orden) {
    return res.status(403).json({ error: 'No tienes permiso' });
  }
  
  res.json(orden);
});
```

#### Mitigación
- ✅ Verificar permisos en CADA endpoint
- ✅ Usar roles y permisos explícitamente
- ✅ Negar por defecto, permitir específicamente
- ✅ Auditar cambios de permisos
- ✅ Usar autorización basada en atributos (ABAC)

---

### A02:2021 - Cryptographic Failures (Fallos Criptográficos)

**Riesgo**: Exposición de datos sensibles  
**Impacto**: Robo de contraseñas, números de tarjeta, datos personales

#### ❌ VULNERABLE
```typescript
// Guardar password sin encriptar
const user = {
  email: 'user@example.com',
  password: '123456' // ❌ TEXTO PLANO! NUNCA!
};

// Encriptación débil
const hash = MD5(password); // ❌ Roto desde 2004

// Sin HTTPS
// HTTP es inseguro, se puede interceptar todo
```

#### ✅ SEGURO
```typescript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash fuerte
const hashedPassword = await bcrypt.hash(password, 12);

// HTTPS obligatorio
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(307, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// Encriptar datos sensibles en BD
function encryptSensitiveData(data: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// En TRÁNSITO: HTTPS/TLS 1.2+
// EN REPOSO: Encriptar datos sensibles
// EN MEMORIA: Borrar después de usar
```

---

### A03:2021 - Injection (Inyección)

**Riesgo**: SQL Injection, Command Injection, etc.  
**Impacto**: Robo de BD completa, ejecución de comandos

#### ❌ VULNERABLE
```typescript
// SQL Injection
const email = req.body.email; // "admin'--" 
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Resultado: SELECT * FROM users WHERE email = 'admin'--'
// Devuelve TODOS los usuarios!

// Command Injection
const filename = req.body.filename; // "file.txt; rm -rf /"
const result = child_process.exec(`cat ${filename}`);
// ¡Ejecuta: cat file.txt; rm -rf /
```

#### ✅ SEGURO
```typescript
// SQL con Prepared Statements
const email = req.body.email;
const query = 'SELECT * FROM users WHERE email = ?';
const result = db.query(query, [email]); // El parámetro es escapado automáticamente

// Template Literals con valores escapados
import shell from 'shell-escape';
const filename = req.body.filename;
const safeCommand = shell.quote(['cat', filename]);
const result = child_process.exec(safeCommand);

// ORM (protege contra SQL injection)
const user = await User.findOne({ where: { email } });

// Validar entrada
import { z } from 'zod';
const schema = z.object({
  filename: z.string().regex(/^[a-zA-Z0-9._-]+$/) // Solo caracteres seguros
});
const { filename } = schema.parse(req.body);
```

---

### A04:2021 - Insecure Design (Diseño Inseguro)

**Riesgo**: Vulnerabilidades de diseño (no de implementación)  
**Impacto**: Lógica de negocio quebrada

#### ❌ VULNERABLE
```typescript
// Password reset sin verificación
// GET /api/reset-password?token=123&email=admin@example.com
// ❌ El token es muy predecible

// Funcionalidad de "Enviar dinero"
// ❌ Sin limite de cantidad
// ❌ Sin confirmación
// ❌ Sin auditoría

// Rate limiting ausente
// ❌ Bruteforce de passwords sin límite
```

#### ✅ SEGURO
```typescript
// Password reset seguro
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex'); // Token aleatorio fuerte
}

async function resetPassword(email: string) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 min
  
  await db.query(
    'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
    [token, expiresAt, email]
  );
  
  // Enviar email con token
  await emailService.send(email, `Reset link: ${token}`);
}

// Funcionalidad de "Enviar dinero" segura
async function sendMoney(userId: string, amount: number, toUserId: string) {
  // ✅ Validar cantidad
  if (amount <= 0 || amount > 100000) {
    throw new Error('Cantidad inválida');
  }
  
  // ✅ Rate limiting
  const recentTransfers = await db.query(
    'SELECT COUNT(*) FROM transfers WHERE userId = ? AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [userId]
  );
  if (recentTransfers[0].count > 10) {
    throw new Error('Límite de transferencias excedido');
  }
  
  // ✅ Confirmar con 2FA
  const confirmed = await twoFactorAuth.verify(userId);
  if (!confirmed) throw new Error('2FA requerido');
  
  // ✅ Auditoría
  logger.info('Transfer', { userId, toUserId, amount });
  
  // Realizar transferencia
  await db.transaction(async (tx) => {
    await tx.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);
    await tx.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, toUserId]);
  });
}

// Rate limiting global
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Max 100 requests por IP
  message: 'Demasiadas solicitudes'
});

app.use(limiter);
```

---

### A05:2021 - Security Misconfiguration (Configuración de Seguridad Incorrecta)

**Riesgo**: Configuraciones débiles  
**Impacto**: Acceso no autorizado, información sensible expuesta

#### ❌ VULNERABLE
```typescript
// Default passwords
// MySQL: root/root, admin/admin
// AWS: Sin MFA activado
// Servidor: Debug mode activado en producción

// Directorios listables
// GET /uploads/ → muestra todos los archivos

// Información sensible en errores
app.get('/api/data', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.json(error); // ❌ Expone stack trace completo
  }
});

// Headers de seguridad faltantes
```

#### ✅ SEGURO
```typescript
// Headers de seguridad
app.use((req, res, next) => {
  // HTTPS
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // XSS Protection
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.header('Content-Security-Policy', "default-src 'self'");
  
  // CORS
  res.header('Access-Control-Allow-Origin', 'https://trusteddomain.com');
  
  next();
});

// Error handling seguro
app.use((error, req, res, next) => {
  logger.error(error); // Log interno
  
  // Responder sin detalles sensibles
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Error interno del servidor' });
  } else {
    res.status(500).json({ error: error.message });
  }
});

// Desactivar debug en producción
app.set('view cache', true);
if (process.env.NODE_ENV === 'production') {
  app.disable('x-powered-by'); // No revelar Express
}

// Cambiar default passwords
// Activar MFA en servicios cloud
// Desactivar directorios listables
```

---

### A06:2021 - Vulnerable and Outdated Components

**Riesgo**: Librerías con vulnerabilidades conocidas  
**Impacto**: Ejecución de código remoto, etc.

#### Mitigación
```bash
# Auditar dependencias
npm audit

# Actualizar dependencias regularmente
npm update

# Usar herramientas de scanning
npm install -g snyk
snyk test

# En CI/CD
npm audit --audit-level=moderate  # Fallar si hay vulnerabilidades

# Usar dependabot (GitHub)
# Automated PRs para actualizar dependencias

# Mantener un log de componentes
npm list --depth=0
```

---

### A07:2021 - Identification and Authentication Failures

**Riesgo**: Fallos en autenticación  
**Impacto**: Takeover de cuentas

#### ❌ VULNERABLE
```typescript
// Passwords débiles permitidas
// Aceptar "123456", "password", "qwerty"

// Sin rate limiting
// Bruteforce: 10,000 intentos sin límite

// Default credentials
// Usuario: admin, Password: admin

// Sin MFA
// Solo contraseña como autenticación
```

#### ✅ SEGURO
```typescript
// Validar password fuerte
import validator from 'validator';

function validatePassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) && // Mayúscula
    /[a-z]/.test(password) && // Minúscula
    /[0-9]/.test(password) &&  // Número
    /[!@#$%^&*]/.test(password) // Símbolo
  );
}

// Rate limiting en login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos
  message: 'Demasiados intentos fallidos'
});

app.post('/login', loginLimiter, async (req, res) => {
  // ...
});

// Sesiones seguras
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No acceso desde JS
    sameSite: 'Strict' // CSRF protection
  }
}));

// MFA (Google Authenticator, SMS, etc.)
```

---

### A08:2021 - Software and Data Integrity Failures

**Riesgo**: Fallos en integridad de software/datos  
**Impacto**: Ejecución de código malicioso

#### Mitigación
```typescript
// Verificar integridad de librerías (package-lock.json)
npm ci  // En lugar de npm install

// Firmar código
import { verify } from 'crypto';

// Usar HTTPS para descargas
// Validar checksums de descargas

// Dependencias confiables solamente
```

---

### A09:2021 - Security Logging and Monitoring Failures

**Riesgo**: Falta de logs de seguridad  
**Impacto**: No detectar ataques

#### Mitigación
```typescript
// Loguear eventos de seguridad
logger.info('User login', { userId, timestamp, ip });
logger.warn('Failed login attempt', { email, attempts });
logger.error('SQL injection attempt detected', { query, ip });

// NO loguear
// ❌ Passwords
// ❌ Tokens
// ❌ Datos PII sensibles

// Monitorear
// - Fallos de autenticación repetidos
// - Cambios de permisos
// - Acceso a datos sensibles
// - Errores críticos
```

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Riesgo**: El servidor hace requests a URLs controladas por atacante  
**Impacto**: Acceso a servicios internos

#### ❌ VULNERABLE
```typescript
app.get('/proxy', async (req, res) => {
  const url = req.query.url; // ❌ URL de usuario
  const response = await fetch(url);
  res.json(response);
});

// Ataque: /proxy?url=http://internal-api:8080/admin
// ¡Accede a servicio interno!
```

#### ✅ SEGURO
```typescript
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  
  // ✅ Whitelist de dominios permitidos
  const ALLOWED_DOMAINS = ['api.github.com', 'api.twitter.com'];
  const urlObj = new URL(url);
  
  if (!ALLOWED_DOMAINS.includes(urlObj.hostname)) {
    return res.status(403).json({ error: 'Dominio no permitido' });
  }
  
  // ✅ Bloquear IPs internas
  const INTERNAL_IPS = ['127.0.0.1', '192.168.', '10.', 'localhost'];
  if (INTERNAL_IPS.some(ip => urlObj.hostname.startsWith(ip))) {
    return res.status(403).json({ error: 'No se permiten IPs internas' });
  }
  
  const response = await fetch(url);
  res.json(response);
});
```

---

## 1️⃣7️⃣ REACTIVE PROGRAMMING Y RxJS

### ¿Qué es Programación Reactiva?

**Paradigma** donde los cambios se propagan automáticamente a través de un sistema de dependencias.

En lugar de escribir código imperativo ("haz esto, luego haz eso"), escribes código declarativo ("cuando A cambia, B reacciona automáticamente").

### Conceptos clave

#### 1. Observables
```typescript
// Observable = Stream de valores en el tiempo
// Como un array que emite valores lentamente

import { Observable, of, from } from 'rxjs';

// Crear observable simple
const simple$ = of(1, 2, 3); // $ = convención para observables
simple$.subscribe(value => console.log(value));
// Output: 1, 2, 3

// Observable desde array
const fromArray$ = from([10, 20, 30]);

// Observable desde evento
import { fromEvent } from 'rxjs';
const click$ = fromEvent(document, 'click');
click$.subscribe(() => console.log('Clicked!'));

// Observable custom
const custom$ = new Observable(observer => {
  observer.next('Primer valor');
  observer.next('Segundo valor');
  observer.complete();
});

custom$.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.error(err),
  complete: () => console.log('Completado')
});
```

#### 2. Operators (Transformación)
```typescript
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// map - transformar valores
const numbers$ = of(1, 2, 3);
numbers$.pipe(
  map(n => n * 2)
).subscribe(value => console.log(value)); // Output: 2, 4, 6

// filter - filtrar valores
numbers$.pipe(
  filter(n => n > 1)
).subscribe(value => console.log(value)); // Output: 2, 3

// debounceTime - esperar silencio antes de emitir
const input$ = fromEvent(document.querySelector('input'), 'input');
input$.pipe(
  debounceTime(300),  // Espera 300ms sin cambios
  map((e: any) => e.target.value),
  distinctUntilChanged() // Solo emitir si cambió
).subscribe(query => {
  console.log('Buscar:', query); // Se ejecuta solo después de parar de escribir
});

// switchMap - cambiar a nuevo observable
const ordenes$ = new BehaviorSubject('all');
ordenes$.pipe(
  switchMap(status => api.getOrdenes(status))
).subscribe(ordenes => console.log(ordenes));

// combineLatest - combinar múltiples observables
import { combineLatest } from 'rxjs';
combineLatest([usuarios$, roles$]).pipe(
  map(([usuarios, roles]) => ({ usuarios, roles }))
).subscribe(data => console.log(data));
```

### Aplicación práctica en Angular

```typescript
// Component con RxJS
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscar-ordenes',
  template: `
    <input [formControl]="searchControl" placeholder="Buscar...">
    <div *ngFor="let orden of ordenes$ | async">
      {{ orden.titulo }}
    </div>
  `
})
export class BuscarOrdenesComponent implements OnInit {
  searchControl = new FormControl('');
  ordenes$;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    // Reacciona a cambios en input
    this.ordenes$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),              // Espera 300ms
      distinctUntilChanged(),         // Si no cambió, no emite
      switchMap(query =>              // Buscar en API
        this.http.get(`/api/ordenes?q=${query}`)
      ),
      map(response => response.data)
    );
  }
}
```

---

## 1️⃣8️⃣ ARCHITECTURAL PATTERNS - Patrones de Arquitectura

### Comparación de Patrones

| Patrón | Complejidad | Escalabilidad | Cuándo usar |
|--------|------------|---------------|-----------|
| **MVC** | Baja | Media | Apps pequeñas/medianas |
| **MVVM** | Media | Media | WPF, Angular fácil |
| **MVP** | Media | Media | Testabilidad máxima |
| **Hexagonal** | Alta | Alta | Apps complejas, domain-focused |
| **Clean** | Alta | Alta | Proyectos grandes, long-term |
| **Onion** | Alta | Alta | Microservicios |

---

### MVC (Model-View-Controller)

**Más simple pero menos flexible**

```typescript
// Model - Datos
class Orden {
  id: string;
  titulo: string;
  estado: string;
}

// View - Presentación
<div>
  <h1>{{ orden.titulo }}</h1>
  <p>{{ orden.estado }}</p>
  <button (click)="actualizar()">Actualizar</button>
</div>

// Controller - Lógica
@Controller('/ordenes')
export class OrdenesController {
  @Get(':id')
  async getOrden(@Param('id') id: string) {
    return db.query('SELECT * FROM ordenes WHERE id = ?', [id]);
  }
  
  @Post()
  async createOrden(@Body() orden: Orden) {
    return db.query('INSERT INTO ordenes ...', orden);
  }
}
```

---

### Hexagonal Architecture (Ports & Adapters)

**Aísla el core business logic del mundo externo**

```
┌─────────────────────────────────────────────────┐
│                   APPLICATION CORE              │
│  ┌─────────────────────────────────────────┐    │
│  │     Orden Entity (Domain Model)         │    │
│  │     Orden Service (Business Logic)      │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
         ↑                              ↑
    [Port]                          [Port]
      ↑                              ↑
  [Adapter]                      [Adapter]
REST API              Database/Repository
```

```typescript
// DOMAIN (Core - independiente de frameworks)
class Orden {
  constructor(
    public id: string,
    public titulo: string,
    public total: number
  ) {}
  
  calcularTotal(): number {
    // Lógica de negocio PURA
    return this.total * 1.19;
  }
}

class OrdenService {
  constructor(private repository: IOrdenRepository) {} // Port
  
  async crearOrden(datos: CreateOrdenDto): Promise<Orden> {
    const orden = new Orden(
      generateId(),
      datos.titulo,
      datos.total
    );
    
    return this.repository.save(orden); // Delegado al adapter
  }
}

// PORT (Interface)
interface IOrdenRepository {
  save(orden: Orden): Promise<Orden>;
  findById(id: string): Promise<Orden>;
}

// ADAPTERS (Implementaciones externas)
@Injectable()
export class DatabaseOrdenRepository implements IOrdenRepository {
  constructor(private db: Database) {}
  
  async save(orden: Orden): Promise<Orden> {
    return this.db.query('INSERT INTO ordenes ...', orden);
  }
  
  async findById(id: string): Promise<Orden> {
    return this.db.query('SELECT * FROM ordenes WHERE id = ?', [id]);
  }
}

// Para testing, otro adapter:
export class MockOrdenRepository implements IOrdenRepository {
  async save(orden: Orden): Promise<Orden> {
    return orden; // Simula guardado
  }
  
  async findById(id: string): Promise<Orden> {
    return new Orden('1', 'Test', 100);
  }
}

// PRESENTATION (Controllers)
@Controller('/ordenes')
export class OrdenesController {
  constructor(private service: OrdenService) {}
  
  @Post()
  async create(@Body() dto: CreateOrdenDto) {
    return this.service.crearOrden(dto);
  }
}

// VENTAJAS
// ✅ Core logic no depende de HTTP, BD, UI
// ✅ Fácil de testear (usa MockRepository)
// ✅ Cambiar BD de MySQL a PostgreSQL solo necesita nuevo adapter
// ✅ Cambiar HTTP a GraphQL solo necesita nuevo controller
```

---

### Clean Architecture

**Combina mejor prácticas, capas claramente definidas**

```
┌────────────────────────────────────┐  (Outermost)
│   Enterprise Business Rules        │
│   (Entities - Unchangeable)        │
└────────────────────────────────────┘
         ↓ Dependencies
┌────────────────────────────────────┐
│   Application Business Rules       │
│   (Use Cases / Services)           │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│   Interface Adapters               │
│   (Controllers, Presenters, Gateways)
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐  (Innermost)
│   Frameworks & Drivers             │
│   (Express, Database, UI)          │
└────────────────────────────────────┘
```

```typescript
// LAYER 1: Entities (Domain Models)
export class Orden {
  constructor(
    public id: string,
    public titulo: string,
    public estado: EstadoOrden
  ) {}
  
  static create(titulo: string): Orden {
    return new Orden(generateId(), titulo, EstadoOrden.PENDIENTE);
  }
}

// LAYER 2: Use Cases (Application Business Rules)
export class CrearOrdenUseCase {
  constructor(
    private repo: IOrdenRepository,
    private eventBus: IEventBus
  ) {}
  
  async execute(request: CrearOrdenRequest): Promise<CrearOrdenResponse> {
    // Validar
    if (!request.titulo || request.titulo.length < 3) {
      throw new Error('Título debe tener al menos 3 caracteres');
    }
    
    // Crear
    const orden = Orden.create(request.titulo);
    
    // Guardar
    const ordenGuardada = await this.repo.save(orden);
    
    // Publicar evento
    this.eventBus.publish(new OrdenCreadaEvent(ordenGuardada.id));
    
    return new CrearOrdenResponse(ordenGuardada);
  }
}

// LAYER 3: Adapters (Interfases)
// Controllers (HTTP adapter)
@Controller('/ordenes')
export class OrdenesController {
  constructor(private crearOrdenUseCase: CrearOrdenUseCase) {}
  
  @Post()
  async create(@Body() dto: CreateOrdenDto) {
    const response = await this.crearOrdenUseCase.execute({
      titulo: dto.titulo
    });
    return response;
  }
}

// Presenters (convierte response de use case a DTO)
export class CrearOrdenPresenter {
  present(response: CrearOrdenResponse): CrearOrdenDTO {
    return {
      id: response.orden.id,
      titulo: response.orden.titulo,
      estado: response.orden.estado
    };
  }
}

// Gateways (interfaces para repositorios)
export interface IOrdenRepository {
  save(orden: Orden): Promise<Orden>;
  findById(id: string): Promise<Orden>;
}

// LAYER 4: Frameworks (Database, Express, etc.)
@Injectable()
export class DatabaseOrdenRepository implements IOrdenRepository {
  constructor(@InjectDatabase() private db: Database) {}
  
  async save(orden: Orden): Promise<Orden> {
    // Implementación con BD real
    return this.db.query('INSERT ...', orden);
  }
  
  async findById(id: string): Promise<Orden> {
    const data = await this.db.query('SELECT ...', [id]);
    return new Orden(data.id, data.titulo, data.estado);
  }
}

// VENTAJAS DE CLEAN ARCHITECTURE
// ✅ Independencia de frameworks (cambiar Express por Fastify es fácil)
// ✅ Testeable (todo se puede aislar)
// ✅ Independencia de BD (cambiar MySQL por PostgreSQL es rápido)
// ✅ Escalable (agregar features sin afectar código existente)
```

---

## ✅ CHECKLIST FINAL COMPLETO (Todas las secciones)

### Security
- [ ] Protegido contra top 10 OWASP
- [ ] HTTPS en producción
- [ ] Passwords hasheadas
- [ ] CSRF tokens
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] Input validation
- [ ] Secure headers

### Code Quality & Architecture
- [ ] SOLID principles aplicados
- [ ] DRY (sin duplicación)
- [ ] Arquitectura clara (MVC/Hexagonal/Clean)
- [ ] Testing > 80% cobertura
- [ ] Code reviews
- [ ] Clean code (nombres, funciones pequeñas)
- [ ] Bien documentado

### Performance & Scalability
- [ ] Memoization donde necesario
- [ ] Caching implementado
- [ ] Database indexes
- [ ] Lazy loading
- [ ] CDN para assets
- [ ] Connection pooling
- [ ] Monitoring activo

### DevOps & Deployment
- [ ] CI/CD pipeline
- [ ] Automated tests en cada commit
- [ ] Containerización (Docker)
- [ ] Infrastructure as Code
- [ ] Logging estructurado
- [ ] Monitore y alertas
- [ ] Rollback strategy

### Observability
- [ ] Logs centralizados
- [ ] Métricas clave (latencia, errores)
- [ ] Distributed tracing
- [ ] Alertas configuradas
- [ ] Dashboards útiles
- [ ] On-call rotation

---

**¡Tu biblioteca está COMPLETA! Has aprendido:**

✅ 7 Principios SOLID  
✅ 10+ Design Patterns  
✅ Clean Code & Refactoring  
✅ 3 Estrategias de Testing  
✅ Arquitecturas (MVC, Hexagonal, Clean)  
✅ API Design (REST + GraphQL)  
✅ State Management  
✅ Performance Optimization  
✅ Error Handling  
✅ Security Best Practices  
✅ 10 Vulnerabilidades OWASP  
✅ CI/CD & DevOps  
✅ Logging & Monitoring  
✅ Docker & Kubernetes  
✅ Database Optimization  
✅ Reactive Programming (RxJS)  
✅ Architectural Patterns avanzados  

**Total: 18 secciones, 100+ ejemplos reales, aplicables a Cermont** 🚀

---

**Mantén estos documentos como referencia durante TODO tu desarrollo.**  
**Actualízalos conforme aprendas nuevos conceptos.**

¡Ahora estás listo para construir software profesional! 🎓

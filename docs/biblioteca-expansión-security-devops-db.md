# 📚 EXPANSIÓN BIBLIOTECA: Security, DevOps, Observability y Database Optimization

**Continúa desde la biblioteca anterior**  
**Nuevas secciones**: 11-15  
**Enfoque**: Temas empresariales críticos

---

## 11️⃣ SECURITY BEST PRACTICES - Protege tu aplicación

### Pilares de Seguridad

**Triada CIA (Confidentiality, Integrity, Availability)**
- **Confidentiality**: Solo usuarios autorizados acceden
- **Integrity**: Los datos no se modifican sin autorización
- **Availability**: El sistema está disponible cuando se necesita

### 1. Authentication (Autenticación)

**¿Qué es?**: Verificar la identidad del usuario (¿quién eres?)

#### Métodos de autenticación

```typescript
// 1️⃣ Basic Authentication (NO USAR en producción sin HTTPS)
// Usuario:Contraseña en Base64
Authorization: Basic dXNlckBleGFtcGxlLmNvbTpwYXNzd29yZA==

// 2️⃣ JWT (JSON Web Token) - MÁS COMÚN
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Estructura JWT:
// Header.Payload.Signature
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature

// 3️⃣ OAuth 2.0 (Delegated Access)
// Permite que usuarios autenticarse con terceros (Google, GitHub)
// Usuario → Click "Login with Google" → Google verifica → Token

// 4️⃣ Multi-Factor Authentication (MFA)
// Password + SMS Code
// Password + Authenticator App (Google Authenticator, Authy)
// Password + Biometric
```

#### Password Best Practices
```typescript
// ❌ Malo
const password = "123456"; // Demasiado corto
const password = "Qwerty"; // Predecible
const hash = MD5(password); // Débil

// ✅ Bueno
import bcrypt from 'bcrypt';

// Hashear password
const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds

// Verificar password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// Requisitos:
// - Mínimo 12 caracteres (la longitud importa más que complejidad)
// - Permitir caracteres especiales
// - Integrar con HaveIBeenPwned API para detectar brechas
```

### 2. Authorization (Autorización)

**¿Qué es?**: Decidir qué puede hacer el usuario (¿qué tienes permiso?)

#### Modelos de Autorización

```typescript
// 1️⃣ Role-Based Access Control (RBAC) - Simple
enum Role {
  ADMIN = 'admin',
  TECNICO = 'tecnico',
  COORDINADOR = 'coordinador'
}

class ProtectedService {
  @Authorize([Role.ADMIN])
  deleteUser(userId: string) {
    // Solo ADMIN puede eliminar usuarios
  }
  
  @Authorize([Role.COORDINADOR, Role.ADMIN])
  updateOrden(ordenId: string) {
    // Coordinador y Admin pueden actualizar
  }
}

// 2️⃣ Attribute-Based Access Control (ABAC) - Complejo
// Decide según atributos: usuario, recurso, acción, contexto
interface AccessDecision {
  user: { role: string; department: string };
  resource: { type: string; owner: string };
  action: string;
  context: { time: Date; location: string };
}

function canAccess(decision: AccessDecision): boolean {
  // Solo técnicos pueden modificar evidencias entre 8-18h
  if (decision.action === 'edit' && 
      decision.resource.type === 'evidencia' &&
      decision.user.role === 'tecnico' &&
      decision.context.time.getHours() >= 8 &&
      decision.context.time.getHours() <= 18) {
    return true;
  }
  return false;
}

// 3️⃣ Least Privilege Principle
// Dar MÍNIMOS permisos necesarios
function getOrdenAccess(userId: string, ordenId: string) {
  const user = getUser(userId);
  
  // ❌ Malo - acceso a TODO
  return getAllOrdenes();
  
  // ✅ Bueno - acceso específico
  if (user.role === 'TECNICO') {
    return getOrdenesForTecnico(userId); // Solo sus órdenes
  }
  if (user.role === 'COORDINADOR') {
    return getOrdenesForDepartment(user.department); // Solo su dept
  }
}
```

### 3. Seguridad de Transporte (HTTPS/TLS)

```typescript
// SIEMPRE HTTPS en producción
// Especificar TLS 1.2 o superior

// ✅ Headers de seguridad importantes:

// Fuerza HTTPS
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

// Previene ataques XSS
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY'); // Clickjacking

// Content Security Policy - muy importante
res.setHeader('Content-Security-Policy', 
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'");

// CORS - controla acceso desde otros dominios
res.setHeader('Access-Control-Allow-Origin', 'https://tudominio.com');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### 4. Input Validation (Validación de entrada)

```typescript
// El 90% de vulnerabilidades vienen de entrada sin validar

// ❌ Vulnerable a SQL Injection
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

// ✅ Seguro - Usar prepared statements
const query = 'SELECT * FROM usuarios WHERE email = ?';
db.query(query, [email]);

// ✅ También validar en TypeScript
import { z } from 'zod';

const CreateOrdenSchema = z.object({
  titulo: z.string().min(3).max(100),
  descripcion: z.string().optional(),
  clienteId: z.string().uuid(),
  total: z.number().positive()
});

// Validar antes de procesar
const ordenData = CreateOrdenSchema.parse(req.body); // Lanza error si no es válido
```

### 5. Secrets Management

```typescript
// ❌ Nunca hardcodear secrets
const DB_PASSWORD = 'myPassword123';
const API_KEY = 'sk-12345678';

// ✅ Usar environment variables
const DB_PASSWORD = process.env.DB_PASSWORD;
const API_KEY = process.env.API_KEY;

// ✅ En producción, usar secret managers:
// - AWS Secrets Manager
// - HashiCorp Vault
// - Google Secret Manager
// - Azure Key Vault

// Rotación de secrets
// Los secrets deben cambiar regularmente (cada 90 días)
```

---

## 1️⃣2️⃣ CI/CD PIPELINE - Automatiza todo

### ¿Qué es CI/CD?

- **CI (Continuous Integration)**: Integrar código continuamente
- **CD (Continuous Deployment)**: Desplegar automáticamente

### Flujo CI/CD típico

```
Developer   →  Git Push  →  GitHub
                              ↓
                        Webhook triggered
                              ↓
                        Jenkins/GitHub Actions
                              ↓
        ┌───────────────────────────────────┐
        │  1. Build (compilar código)       │
        │  2. Test (ejecutar tests)         │
        │  3. Lint (revisar estilo)         │
        │  4. Security (SAST)               │
        └───────────────────────────────────┘
                              ↓
                    ✅ Todos pasan?
                        ↙       ↘
                      SÍ         NO → Notificar dev
                      ↓
            ┌─────────────────────┐
            │ Build Docker Image  │
            │ Push to Registry    │
            └─────────────────────┘
                      ↓
            ┌─────────────────────┐
            │ Deploy to Dev Env   │
            │ Run E2E tests       │
            └─────────────────────┘
                      ↓
        Manual approval for Staging
                      ↓
            ┌─────────────────────┐
            │ Deploy to Staging   │
            │ Run smoke tests     │
            └─────────────────────┘
                      ↓
        Manual approval for Production
                      ↓
            ┌─────────────────────┐
            │ Deploy to Prod      │
            │ Monitor health      │
            └─────────────────────┘
```

### Ejemplo con GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      # 1️⃣ Checkout código
      - uses: actions/checkout@v2
      
      # 2️⃣ Setup Node
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      # 3️⃣ Install dependencies
      - run: npm install
      
      # 4️⃣ Lint
      - run: npm run lint
      
      # 5️⃣ Unit tests
      - run: npm run test:unit
      
      # 6️⃣ Integration tests
      - run: npm run test:integration
      
      # 7️⃣ Build
      - run: npm run build
      
      # 8️⃣ Security scanning
      - run: npm audit
      
  deploy:
    needs: test  # Solo ejecuta si test pasó
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v2
      
      # 9️⃣ Build Docker image
      - run: docker build -t myapp:${{ github.sha }} .
      
      # 🔟 Push a Docker Registry
      - run: docker push myapp:${{ github.sha }}
      
      # 1️⃣1️⃣ Deploy a Kubernetes
      - run: |
          kubectl set image deployment/myapp \
            myapp=myapp:${{ github.sha }} \
            --namespace production
```

### Ejemplo con Jenkins (más enterprise)

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/user/repo.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
                stage('E2E Tests') {
                    steps {
                        sh 'npm run test:e2e'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit'
                sh 'sonar-scanner'  // Code quality
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t myapp:${BUILD_NUMBER} .'
            }
        }
        
        stage('Deploy to Dev') {
            steps {
                sh 'kubectl apply -f k8s/dev/deployment.yaml'
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                input 'Deploy to Staging?'
                sh 'kubectl apply -f k8s/staging/deployment.yaml'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input 'Deploy to Production?'
                sh 'kubectl apply -f k8s/prod/deployment.yaml'
            }
        }
    }
    
    post {
        always {
            // Notificar resultado
            slackSend(message: "${JOB_NAME} ${BUILD_NUMBER} finished")
        }
        failure {
            // Si falla, notificar al dev
            emailext(
                subject: "Build Failed: ${JOB_NAME}",
                body: "Check ${BUILD_URL}",
                to: "${GIT_COMMITTER_EMAIL}"
            )
        }
    }
}
```

---

## 1️⃣3️⃣ LOGGING, MONITORING Y OBSERVABILITY

### Diferencias clave

| Aspecto | Monitoring | Logging | Observability |
|---------|-----------|---------|---------------|
| **Qué es** | Recolectar métricas | Registrar eventos | Entender sistema interno |
| **Enfoque** | Conocidos (predefinidos) | Detalles completos | Desconocidos |
| **Datos** | Métricas (números) | Eventos textuales | Logs + Métricas + Traces |
| **Uso** | Alertas | Debugging | Root cause analysis |
| **Pregunta** | ¿Qué pasó? | ¿Por qué pasó? | ¿Qué estado interno causó esto? |

### 1. Logging

```typescript
// ❌ Logging básico (no usar en producción)
console.log('Usuario logueado');

// ✅ Structured Logging
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Structured logs (máquina-readable)
logger.info('Usuario logueado', {
  userId: '123',
  email: 'user@example.com',
  timestamp: new Date().toISOString(),
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// ✅ Log levels
logger.error('Error crítico', { error: new Error() });    // 0
logger.warn('Advertencia', { warning: 'algo' });           // 1
logger.info('Información', { info: 'data' });              // 2
logger.debug('Debug info', { debug: 'details' });          // 3

// ✅ Contexto (muy importante)
class UserService {
  createUser(email: string, context: { requestId: string; userId: string }) {
    logger.info('Creando usuario', {
      email,
      requestId: context.requestId,
      userId: context.userId
    });
  }
}
```

### 2. Metrics (Monitoreo)

```typescript
// Golden Signals (4 métricas esenciales)
// 1️⃣ Latency (latencia)
// 2️⃣ Traffic (tráfico)
// 3️⃣ Errors (errores)
// 4️⃣ Saturation (saturación - % recursos usados)

import promClient from 'prom-client';

// Latencia
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code']
});

// Tráfico
const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Errores
const errorCount = new promClient.Counter({
  name: 'errors_total',
  help: 'Total errors',
  labelNames: ['type', 'service']
});

// Saturación
const memoryUsage = new promClient.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes'
});

// Middleware para recolectar
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds.observe(
      { method: req.method, route: req.route, status_code: res.statusCode },
      duration
    );
    httpRequestTotal.inc({ method: req.method, route: req.route, status_code: res.statusCode });
  });
  next();
});
```

### 3. Distributed Tracing

```typescript
// Seguir una request a través de múltiples servicios
// Muy importante en microservicios

import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('mi-app');

app.use((req, res, next) => {
  // Crear span (traza de una operación)
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  
  context.with(trace.setSpan(context.active(), span), () => {
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.client_ip': req.ip
    });
    
    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode
      });
      span.end();
    });
  });
  
  next();
});

// En una llamada a BD:
async function getUser(userId: string) {
  const span = tracer.startSpan('db.query');
  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    span.setAttributes({
      'db.rows_affected': 1
    });
    return user;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### 4. Herramientas populares

| Herramienta | Qué es | Caso de uso |
|------------|--------|-----------|
| **ELK Stack** (Elasticsearch, Logstash, Kibana) | Logging | Análisis de logs |
| **Prometheus + Grafana** | Metrics | Dashboards de métricas |
| **Jaeger / Zipkin** | Tracing | Tracing distribuido |
| **Datadog** | Todo | Platform todo-en-uno ($$) |
| **New Relic** | Todo | APM empresarial ($$) |
| **Dynatrace** | APM | Observability avanzada ($$) |
| **CloudWatch** (AWS) | Todo | Si usas AWS |
| **Stackdriver** (GCP) | Todo | Si usas GCP |

---

## 1️⃣4️⃣ DOCKER Y KUBERNETES - Containerización

### Docker

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci  # ci = clean install (mejor que install en CI/CD)

COPY . .
RUN npm run build

# Stage 2: Runtime (imagen final más pequeña)
FROM node:18-alpine

WORKDIR /app

# Copiar solo lo necesario del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# ✅ No ejecutar como root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cermont-api
  namespace: production

spec:
  replicas: 3  # 3 instancias
  
  selector:
    matchLabels:
      app: cermont-api
  
  template:
    metadata:
      labels:
        app: cermont-api
    spec:
      containers:
      - name: api
        image: myregistry.azurecr.io/cermont-api:v1.0.0
        ports:
        - containerPort: 3000
        
        # 🔐 Security context
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
        
        # 💾 Recursos
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        # 🏥 Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        
        # 🔐 Secretos
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        
        # 📁 Volumes
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      
      volumes:
      - name: tmp
        emptyDir: {}

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cermont-api-service
  namespace: production

spec:
  selector:
    app: cermont-api
  
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  
  type: LoadBalancer  # Accesible desde internet

---
# hpa.yaml (Auto-scaling)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cermont-api-hpa

spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cermont-api
  
  minReplicas: 3
  maxReplicas: 10
  
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 1️⃣5️⃣ DATABASE OPTIMIZATION - Acelera tu BD

### 1. Indexing (Índices)

```sql
-- ❌ Sin índice (full table scan)
SELECT * FROM ordenes WHERE cliente_id = 5;  -- Lee 1M filas!

-- ✅ Con índice
CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
SELECT * FROM ordenes WHERE cliente_id = 5;  -- Lee 100 filas!

-- Índices compuestos (para múltiples columnas)
CREATE INDEX idx_ordenes_cliente_fecha ON ordenes(cliente_id, fecha_creacion);

-- ✅ Monitorar índices
SELECT * FROM sys.dm_db_missing_indexes;  -- SQL Server
SELECT * FROM performance_schema.missing_indexes;  -- MySQL
```

### 2. Query Optimization

```sql
-- ❌ MALO: N+1 queries
-- En código:
const ordenes = await db.query('SELECT * FROM ordenes');
for (const orden of ordenes) {
  const evidencias = await db.query('SELECT * FROM evidencias WHERE orden_id = ?', [orden.id]);
  // Total: 1 + N queries!
}

-- ✅ BUENO: JOIN
SELECT o.*, e.* 
FROM ordenes o
LEFT JOIN evidencias e ON e.orden_id = o.id;

-- ❌ MALO: Subconsultas correlated
SELECT * FROM ordenes o
WHERE total > (
  SELECT AVG(total) FROM ordenes WHERE cliente_id = o.cliente_id
);

-- ✅ BUENO: Usar CTE o JOIN
WITH cliente_avg AS (
  SELECT cliente_id, AVG(total) as avg_total
  FROM ordenes
  GROUP BY cliente_id
)
SELECT o.* FROM ordenes o
JOIN cliente_avg ca ON o.cliente_id = ca.cliente_id
WHERE o.total > ca.avg_total;

-- ❌ MALO: Retornar muchas columnas
SELECT * FROM ordenes;

-- ✅ BUENO: Solo lo que necesitas
SELECT id, titulo, estado FROM ordenes;

-- ✅ USAR LIMIT
SELECT * FROM ordenes LIMIT 100;  // No toda la tabla
```

### 3. Partitioning (Fragmentación)

```sql
-- Para tablas GRANDES (millones de filas)
-- Dividir en particiones por rango (ej: por fecha)

CREATE TABLE ordenes (
  id INT,
  fecha DATE,
  cliente_id INT,
  total DECIMAL(10,2)
)
PARTITION BY RANGE (YEAR(fecha)) (
  PARTITION p2020 VALUES LESS THAN (2021),
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Ventajas:
// - Queries más rápidas (busca en partición relevante)
// - Eliminar datos antiguos es rápido (DROP PARTITION)
// - Mantenimiento paralelo
```

### 4. Caching

```typescript
// ❌ Sin cache (queries lentas)
async function getPopularOrdenes() {
  return db.query('SELECT * FROM ordenes ORDER BY total DESC LIMIT 10');
  // Ejecuta cada vez (puede tomar 2 segundos)
}

// ✅ Con cache
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

async function getPopularOrdenes() {
  const cached = cache.get('popular-ordenes');
  if (cached) return cached;
  
  const data = await db.query('SELECT * FROM ordenes ORDER BY total DESC LIMIT 10');
  cache.set('popular-ordenes', data);
  return data;
}

// ✅ Invalidar cache cuando hay cambios
async function createOrden(orden: Orden) {
  const result = await db.query('INSERT INTO ordenes ...', orden);
  cache.del('popular-ordenes'); // Invalidar cache
  return result;
}

// ✅ Redis para caching distribuido (múltiples servidores)
import redis from 'redis';

const redisClient = redis.createClient();

async function getPopularOrdenes() {
  const cached = await redisClient.get('popular-ordenes');
  if (cached) return JSON.parse(cached);
  
  const data = await db.query('...');
  await redisClient.setEx('popular-ordenes', 300, JSON.stringify(data));
  return data;
}
```

### 5. Connection Pooling

```typescript
// ❌ Malo - crear conexión nueva cada vez (lento)
async function getOrden(id: string) {
  const conn = await mysql.createConnection(config);
  const [rows] = await conn.query('SELECT * FROM ordenes WHERE id = ?', [id]);
  conn.end();
  return rows[0];
}

// ✅ Bueno - reutilizar conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'cermont',
  waitForConnections: true,
  connectionLimit: 10,  // Max conexiones simultaneas
  queueLimit: 0
});

async function getOrden(id: string) {
  const [rows] = await pool.query('SELECT * FROM ordenes WHERE id = ?', [id]);
  return rows[0];
}

// Pool automáticamente reutiliza conexiones
```

### 6. Replicación y Sharding

```
// REPLICACIÓN (Backup + Read scaling)
┌──────────────┐
│ Primary (RW) │  ← Escrituras aquí
└────────┬─────┘
         │ Replica
    ┌────▼──────┐
    │ Replica 1 │ ← Lecturas aquí
    └───────────┘
    ┌──────────────┐
    │ Replica 2 │ ← Lecturas aquí
    └───────────┘

// SHARDING (Distribuir datos)
// Dividir BD por clave (ej: cliente_id)

┌─────────────────────────┐
│ Router (middleware)     │
│ SELECT WHERE cliente=5? │
└──────────┬──────────────┘
           │
    ┌──────▼──────┐
    │ Shard 1 (A-M)  │  cliente 1-1000
    └─────────────┘
    ┌──────────────┐
    │ Shard 2 (N-Z)  │  cliente 1001-2000
    └──────────────┘
```

---

## ✅ CHECKLIST FINAL COMPLETO

### Security
- [ ] ¿Usas HTTPS en producción?
- [ ] ¿Passwords están hasheadas con bcrypt/Argon2?
- [ ] ¿Tienes autenticación (JWT/OAuth)?
- [ ] ¿Tienes autorización (roles/permisos)?
- [ ] ¿Validas todas las entradas?
- [ ] ¿Proteges contra SQL injection?
- [ ] ¿Tienes rate limiting?
- [ ] ¿Usas secrets manager?

### DevOps / CI-CD
- [ ] ¿Tienes pipeline CI/CD automatizado?
- [ ] ¿Ejecutas tests automáticamente?
- [ ] ¿Tienes linting automático?
- [ ] ¿Tienes security scanning?
- [ ] ¿Despliegas con Docker?
- [ ] ¿Orquestas con Kubernetes (o similar)?
- [ ] ¿Tienes staging environment?
- [ ] ¿Puedes hacer rollback rápido?

### Observability
- [ ] ¿Tienes logging estructurado?
- [ ] ¿Recolectas métricas (latencia, errores)?
- [ ] ¿Tienes dashboards?
- [ ] ¿Tienes alertas configuradas?
- [ ] ¿Haces distributed tracing?
- [ ] ¿Registras contexto (userId, requestId)?
- [ ] ¿Monitoreas performance?

### Database
- [ ] ¿Tienes índices en columnas frecuentes?
- [ ] ¿Tus queries están optimizadas?
- [ ] ¿Tienes connection pooling?
- [ ] ¿Usas caching (Redis)?
- [ ] ¿Tienes backup automático?
- [ ] ¿Monitoreas tamaño de BD?
- [ ] ¿Tienes estrategia de archivado (old data)?

---

**Tu biblioteca ahora es COMPLETA con 15 secciones**
**Úsala como referencia mientras desarrollas Cermont** 🚀

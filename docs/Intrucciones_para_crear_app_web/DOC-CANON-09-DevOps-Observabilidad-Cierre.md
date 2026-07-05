# DOC-CANON-09 — DevOps, Observabilidad y Cierre de Brechas

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-08 + DOC-12 + DOC-14 + DOC-18 + DOC-21 + DOC-22

---

## Parte I — DevOps y Despliegue

### 1. Arquitectura de Despliegue

```text
+------------------+         +------------------+         +------------------+
|     Usuario      |         |   VPS (Docker)   |         |   Servicios      |
|   (Navegador)    |  HTTPS  |                  |         |                  |
|                  +-------->+  +-------------+ |         |  +------------+  |
|                  |         |  |   Nginx     | |         |  |  MongoDB   |  |
|                  |         |  |   (proxy)   | |<------->|  |  (Docker)  |  |
|                  |         |  +------+------+ |         |  +------------+  |
|                  |         |         |        |         |                  |
|                  |         |  +------v------+ |         |  +------------+  |
|                  |         |  |   Next.js   | |         |  |  (Storage) |  |
|                  |         |  |   (3000)    | |         |  |  /var/data |  |
|                  |         |  +-------------+ |         |  +------------+  |
|                  |         |         |        |         |                  |
|                  |         |  +------v------+ |         +------------------+
|                  |         |  |   Express   | |
|                  |         |  |   (4000)    | |
|                  |         |  +-------------+ |
|                  |         |                  |
+------------------+         +------------------+
```

### 2. Docker Compose Produccion

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./storage:/var/cermont/storage
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=4000
      - MONGODB_URI=mongodb://mongodb:27017/cermont
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - STORAGE_PROVIDER=vps
      - STORAGE_ROOT=/var/cermont/storage
      - LOG_LEVEL=info
    volumes:
      - ./storage:/var/cermont/storage
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:8
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/init:/docker-entrypoint-initdb.d
    environment:
      - MONGO_INITDB_DATABASE=cermont
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 3. Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:22-alpine AS base

# Instalar dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY packages/*/package*.json ./packages/*/
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w frontend

# Runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 4. Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM node:22-alpine AS base

# Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY packages/*/package*.json ./packages/*/
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w backend

# Runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### 5. Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:4000;
    }

    server {
        listen 80;
        server_name _;

        # Redirect HTTP to HTTPS (en produccion)
        # return 301 https://$host$request_uri;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Static files
        location /api/files/ {
            alias /var/cermont/storage/;
            add_header Cache-Control "public, max-age=31536000";
        }
    }
}
```

### 6. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Ghost check
        run: npm run ghost:check

      - name: Contracts check
        run: npm run contracts:check

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build

      - name: Verify
        run: npm run verify

      - name: React Doctor (if frontend changed)
        if: contains(github.event.pull_request.changed_files, 'frontend/')
        run: npx react-doctor@latest --fail-under 95

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /opt/cermont
            git pull origin main
            docker compose -f docker-compose.prod.yml down
            docker compose -f docker-compose.prod.yml up --build -d
            docker system prune -f
```

---

## Parte II — Observabilidad y Monitoreo

### 1. Logging Estructurado

#### 1.1 Configuracion

```typescript
// backend/src/utils/logger.ts
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
  base: {
    service: "cermont-backend",
    version: process.env.npm_package_version,
  },
})
```

#### 1.2 Middleware de Request Logging

```typescript
// backend/src/middleware/requestLog.middleware.ts
import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const traceId = req.headers["x-request-id"] || crypto.randomUUID()

  res.on("finish", () => {
    const duration = Date.now() - start
    logger.info({
      traceId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.user?.id,
      role: req.user?.role,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    }, `${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })

  next()
}
```

#### 1.3 Campos Minimos de Cada Log

| Campo | Tipo | Descripcion |
|---|---|---|
| `timestamp` | ISO 8601 | Fecha/hora del evento |
| `level` | string | debug / info / warn / error |
| `traceId` | UUID | Identificador de request |
| `service` | string | cermont-backend / cermont-frontend |
| `userId` | string | Usuario autenticado |
| `role` | string | Rol del usuario |
| `method` | string | Metodo HTTP |
| `path` | string | Ruta |
| `statusCode` | number | Codigo HTTP |
| `durationMs` | number | Duracion en milisegundos |
| `domain` | string | Modulo de negocio |
| `entityType` | string | Tipo de entidad |
| `entityId` | string | ID de entidad |
| `action` | string | Accion ejecutada |
| `errorCode` | string | Codigo de error si aplica |

#### 1.4 Niveles de Log

- `debug`: Solo desarrollo local. Nunca datos sensibles.
- `info`: Operacion normal importante (login, cambio de estado, aprobaciones).
- `warn`: Error recuperable, conflicto, o condicion anomala (sync fallido, certificado proximo a vencer).
- `error`: Fallo no recuperable (BD caida, error inesperado).

#### 1.5 Prohibido Loguear

- Contrasenas, tokens JWT, refresh tokens
- Cookies completas, firmas en base64
- Documentos privados completos
- Archivos subidos (solo metadata)
- Secretos de `.env`, headers de autorizacion completos

### 2. Metricas

#### 2.1 Metricas Tecnicas

| Metrica | Tipo | Descripcion |
|---|---|---|
| `http_requests_total` | Counter | Total de requests HTTP |
| `http_request_duration_seconds` | Histogram | Duracion de requests |
| `http_requests_errors_total` | Counter | Total de errores HTTP |
| `active_users` | Gauge | Usuarios activos |
| `mongodb_connections` | Gauge | Conexiones a MongoDB |
| `sync_queue_size` | Gauge | Items pendientes de sync |

#### 2.2 Metricas de Negocio

| Metrica | Tipo | Descripcion |
|---|---|---|
| `work_requests_created_total` | Counter | Solicitudes creadas |
| `proposals_approved_total` | Counter | Propuestas aprobadas |
| `work_orders_completed_total` | Counter | Ordenes completadas |
| `evidences_uploaded_total` | Counter | Evidencias subidas |
| `invoices_paid_total` | Counter | Facturas pagadas |
| `average_closure_days` | Gauge | Promedio de dias para cierre |
| `blockers_active` | Gauge | Bloqueadores activos |
| `cost_variance_percent` | Gauge | Variacion de costos promedio |

### 3. Alertas

#### 3.1 Alertas Configurables

| Alerta | Condicion | Severidad | Accion |
|---|---|---|---|
| Alta tasa de error | > 5% errores en 5 min | Critical | Email + Webhook |
| Latencia alta | P99 > 2s por 5 min | Warning | Email |
| DB caida | Sin conexion a MongoDB | Critical | Email + SMS |
| Sync fallido | > 10 items fallidos | Warning | Email |
| Certificado vence en 30 dias | `expiresAt < +30d` | Warning | Email |
| Factura sin SES | Invoice.created sin SES > 7 dias | Warning | Email |
| Pago sin conciliar | Payment.registered sin reconcile > 15 dias | Warning | Email |

#### 3.2 Servicio de Alertas

```typescript
// backend/src/services/alert.service.ts
interface Alert {
  type: string
  severity: "critical" | "warning" | "info"
  message: string
  entityType?: string
  entityId?: string
  action?: string      // URL de accion
}

class AlertService {
  async sendAlert(alert: Alert) {
    // 1. Persistir alerta
    await AlertModel.create(alert)

    // 2. Enviar notificacion
    if (alert.severity === "critical") {
      await this.sendEmail(alert)
      await this.sendWebhook(alert)
    } else if (alert.severity === "warning") {
      await this.sendEmail(alert)
    }

    // 3. Registrar en log
    logger.warn({ alert }, `Alert: ${alert.type}`)
  }

  private async sendEmail(alert: Alert) {
    // Integracion con servicio de email
  }

  private async sendWebhook(alert: Alert) {
    // Integracion con Slack/Teams/Discord
  }
}
```

### 4. Health Checks

```typescript
// backend/src/routes/health.routes.ts
import { Router } from "express"
import mongoose from "mongoose"

const router = Router()

router.get("/health", async (req, res) => {
  const checks = {
    database: mongoose.connection.readyState === 1 ? "ok" : "error",
    storage: await checkStorage(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  }

  const isHealthy = checks.database === "ok" && checks.storage === "ok"

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: {
      status: isHealthy ? "healthy" : "degraded",
      service: "cermont-backend",
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString(),
      checks,
    },
  })
})

async function checkStorage(): Promise<string> {
  try {
    // Verificar acceso al almacenamiento
    return "ok"
  } catch {
    return "error"
  }
}

export default router
```

---

## Parte III — Cierre de Brechas y Madurez

### 1. Brechas Actuales vs Solucion

| # | Brecha | Estado Actual | Solucion en Plataforma | Fase |
|---|---|---|---|---|
| 1 | No hay sistema documental | Excel, papel, PDF sueltos | Document-driven forms con versionado | 8 |
| 2 | No hay cost tracking | Costos en hojas separadas | Cost Cart por orden con variacion | 7 |
| 3 | Informes manuales | Digitados a mano | Generacion automatica desde ejecucion | 5 |
| 4 | Facturacion sin SES | Facturan sin SES aprobada | Pipeline: SES → Factura → Pago | 6 |
| 5 | Costos sin soporte | No hay comprobantes | Archivo soporte obligatorio por linea | 7 |
| 6 | Estados inmutables | No se sabe en que va cada trabajo | ServiceCase con FSM y blockers | 7 |
| 7 | Planeacion dispersa | WhatsApp, llamadas, Excel | PlanningPacket con readiness | 3 |
| 8 | Evidencias sueltas | Fotos en WhatsApp, correos | EvidenceGallery con metadata GPS | 4 |
| 9 | Firmas en papel | Firmas fisicas, escaneo | Firma digital con timestamp e IP | 5 |
| 10 | Certificados sin control | Vencen sin alerta | Alertas automaticas de vencimiento | 9 |
| 11 | Activos sin inventario | No se sabe que herramientas hay | CRUD de activos con codigo | 9 |
| 12 | Offline no funciona | No se puede trabajar sin red | IndexedDB + sync engine | 4 |
| 13 | Sin trazabilidad | No se sabe quien hizo que | AuditEvent en cada accion critica | Todas |
| 14 | Sin dashboard | No hay visibilidad | KPIs, blockers, next actions | 7 |

### 2. Niveles de Madurez Documental

| Nivel | Descripcion | Cuando se Alcanza |
|---|---|---|
| **0 — Dispersa** | Documentos fisicos, Excel, fotos sueltas | Punto de partida |
| **1 — Inventario** | Documentos registrados con tipo, unidad, version | Fase 8 completa |
| **2 — Ingesta** | Subida de PDF/Excel con metadata y hash | Fase 8 completa |
| **3 — Deteccion** | Deteccion automatica de campos, tablas, checklists | Fase 8 completa |
| **4 — Revision** | Revision humana y construccion de plantillas | Fase 8 completa |
| **5 — Captura** | Captura en campo online/offline con sync | Fases 4 + 8 completas |
| **6 — Generacion** | Informes, actas, PDFs generados automaticamente | Fase 5 completa |
| **7 — Cierre** | SES → Factura → Pago con trazabilidad | Fase 6 completa |

### 3. Madurez de Testing

| Nivel | Descripcion | Requisito |
|---|---|---|
| **0 — Sin tests** | No hay pruebas automatizadas | No aceptable |
| **1 — Unitarios basicos** | Tests de schemas y utilidades | 50% coverage |
| **2 — Servicios testeados** | Tests de logica de negocio | 70% coverage |
| **3 — Integracion** | Tests de endpoints | 80% coverage |
| **4 — E2E criticos** | Flujos principales automatizados | 5+ flujos |
| **5 — Cobertura completa** | Todos los flujos + edge cases | 90% coverage |

### 4. Auditoria Completa del Sistema

Una vez alcanzada la Fase 12, ejecutar auditoria completa:

```bash
# 1. Verificar estructura
npm run ghost:check

# 2. Verificar contratos
npm run contracts:check

# 3. Type check completo
npm run typecheck

# 4. Lint
npm run lint

# 5. Tests
npm run test

# 6. Build
npm run build

# 7. Verificacion completa
npm run verify

# 8. React Doctor
npx react-doctor@latest

# 9. Verificar rutas del sidebar
npm run test:sidebar-routes

# 10. Verificar endpoints huerfanos
npm run test:orphan-endpoints

# 11. Verificar mocks en produccion
npm run test:no-mocks

# 12. Cobertura de tests
npm run test:coverage
```

### 5. Criterios de Entrega Final

El sistema se considera listo para produccion cuando:

#### 5.1 Funcionales
- [ ] Flujo completo de 14 pasos funcional (solicitud → pago)
- [ ] Pipeline SES → Factura → Pago con validaciones
- [ ] Offline funcional para evidencias y formularios
- [ ] Dashboard con KPIs reales
- [ ] Sistema documental con al menos 4 plantillas
- [ ] Cost tracking con variacion vs propuesta
- [ ] RBAC funcional para todos los roles

#### 5.2 Tecnicos
- [ ] `npm run verify` pasa
- [ ] Cobertura de tests >= 80%
- [ ] React Doctor >= 95/100
- [ ] Lighthouse >= 90 (performance, accessibility)
- [ ] Docker Compose produccion funcional
- [ ] MongoDB persistente con backups
- [ ] Logging estructurado configurado

#### 5.3 Seguridad
- [ ] JWT en cookies httpOnly
- [ ] RBAC en todos los endpoints
- [ ] Passwords hasheados (bcrypt)
- [ ] Variables de entorno seguras
- [ ] Upload validado (tipo, tamano, scan)
- [ ] Hash SHA-256 para archivos
- [ ] AuditEvent en cada accion critica

#### 5.4 Operativos
- [ ] 5 usuarios de prueba durante 2 semanas
- [ ] Manual de usuario basico
- [ ] Procedimiento de backup de BD
- [ ] Procedimiento de rollback
- [ ] Monitoreo basico funcional

### 6. KPIs de Exito del Proyecto

| KPI | Antes (Sin App) | Despues (Con App) | Medicion |
|---|---|---|---|
| Tiempo de cierre administrativo | 45-60 dias | 15-20 dias | Dias desde ejecucion a pago |
| Trazabilidad de ordenes | < 30% | > 95% | Ordenes con todos los pasos registrados |
| Tiempo de planeacion | 3-5 dias | 1-2 dias | Dias desde PO a ejecucion |
| Errores en facturacion | 20% | < 5% | Facturas rechazadas / total |
| Evidencias perdidas | 40% | < 2% | Evidencias registradas / esperadas |
| Costos documentados | 30% | > 90% | Costos con soporte / total |

---

## 4. Resumen de Fases y Timeline

| Fase | Nombre | Semanas | Entregable Principal |
|---|---|---|---|
| 0 | Fundacion | 1-2 | Monorepo funcional, MongoDB, gates |
| 1 | Autenticacion | 3 | Login + RBAC + sidebar |
| 2 | Solicitudes y Propuestas | 4-5 | Flujo solicitud → propuesta → PO |
| 3 | Ordenes y Planeacion | 6-7 | Planeacion como compuerta operativa |
| 4 | Ejecucion y Evidencias | 8-9 | Captura de campo con offline |
| 5 | Informes y Actas | 10-11 | Cierre tecnico |
| 6 | Cierre Administrativo | 12-13 | SES → Factura → Pago |
| 7 | Dashboard y Costos | 14-15 | Visibilidad operativa y financiera |
| 8 | Sistema Documental | 16-17 | Formularios dinamicos |
| 9 | Activos y Mantenimiento | 18-19 | Inventario y certificados |
| 10 | PWA y Optimizacion | 20-21 | Service Worker, cache, E2E |
| 11 | Observabilidad | 22-23 | Logs, metricas, alertas |
| 12 | Estabilizacion | 24-25 | Bug fixes, piloto, entrega |

**Duracion total estimada:** 25 semanas (~6 meses)
**Equipo recomendado:** 2-3 desarrolladores full-stack
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Política No Deploy

No se permite deploy si:

- `npm run verify` falla.
- `quality:strict` falla.
- React Doctor reporta críticos.
- Playwright E2E obligatorio no fue ejecutado.
- `npm audit` tiene `high` o `critical` sin excepción aprobada.
- Hay endpoints críticos sin RBAC.
- Hay documentos/evidencias sin política de protección.
- Offline se anuncia como funcional pero no tiene sync backend.
- El flujo 14 pasos no bloquea saltos indebidos.
- Costos muestran `$0` cuando el estado real es `NO_DATA`.

## 2. Checklist de cierre técnico

Antes de entregar:

1. Rama limpia.
2. Commit SHA registrado.
3. Evidencia de gates.
4. Evidencia curl.
5. Evidencia Playwright.
6. Evidencia React Doctor.
7. Evidencia npm audit.
8. Matriz documentación ↔ código actualizada.
9. Deuda restante P0/P1/P2/P3.
10. Plan de rollback.
11. Backup de base de datos si aplica.
12. Restore test documentado.

## 3. Observabilidad mínima

| Área | Métrica |
|---|---|
| API | latencia p95, errores 4xx/5xx, requestId |
| Auth | login fallido, refresh fallido |
| Upload | tamaño, MIME rechazado, virus scan |
| Offline | comandos pendientes, conflictos, fallos sync |
| Workflow | casos bloqueados por paso |
| Billing | SES pendientes, facturas pendientes, pagos pendientes |
| Costos | variación estimado vs real |

## 4. Alertas críticas

- error 500 sostenido;
- cola offline sin sincronizar;
- documentos infectados;
- sobrepago rechazado;
- facturas vencidas;
- SES rechazada;
- certificados vencidos;
- almacenamiento cercano al límite.

## 5. Métricas de negocio

| KPI | Fórmula |
|---|---|
| Tiempo solicitud → PO | fecha PO - fecha solicitud |
| Tiempo planeación | aprobación planeación - creación planeación |
| Tiempo ejecución | cierre ejecución - inicio ejecución |
| Tiempo informe | aprobación informe - cierre ejecución |
| Tiempo cierre | pago - acta firmada |
| Evidencias por OT | evidencias aprobadas / OT |
| Variación de costos | costo real - costo estimado |
| Casos bloqueados | casos con blockers críticos |

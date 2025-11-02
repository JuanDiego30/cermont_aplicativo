# MANUAL TÉCNICO COMPLETO - CERMONT ATG BACKEND
## PARTE 1/3: Arquitectura y Código Base

---

## ÍNDICE GENERAL

### Parte 1: Arquitectura y Código Base
1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Configuración y Variables](#3-configuración-y-variables-de-entorno)
4. [Modelos de Datos](#4-modelos-de-datos-mongodb)
5. [Services Layer](#5-servicios-services-layer)
6. [Controllers Layer](#6-controladores-controllers-layer)
7. [Middleware](#7-middleware)
8. [Rutas y Endpoints](#8-rutas-routes)
9. [Utilidades](#9-utilidades-utils)
10. [Seguridad](#10-seguridad)

### Parte 2: Performance y Despliegue
11. Performance
12. Testing
13. Logging y Monitoreo
14. Base de Datos
15. Documentación API
16. Despliegue
17. Mantenimiento
18. Troubleshooting

### Parte 3: Integraciones y Anexos
19. Integraciones
20. Extensiones Futuras
21. Glosario
22. Referencias
23. Anexos
24. Control de Cambios
25. Licencia

---

## 1. RESUMEN EJECUTIVO

### 1.1 Descripción del Proyecto

**CERMONT ATG Backend** es una API REST completa desarrollada en Node.js/Express para la gestión integral de órdenes de trabajo en el sector petrolero colombiano. El sistema está diseñado para empresas de mantenimiento industrial que requieren trazabilidad completa, control de calidad y cumplimiento normativo.

**Características principales:**
- ✅ Gestión completa del ciclo de vida de órdenes de trabajo
- ✅ Sistema de autenticación JWT con rotación de tokens
- ✅ Control de acceso basado en roles (RBAC) jerárquico
- ✅ Auditoría completa de todas las operaciones
- ✅ Caché inteligente para optimización de performance
- ✅ Rate limiting y protección contra ataques
- ✅ Documentación automática con Swagger/OpenAPI
- ✅ Notificaciones en tiempo real con Socket.IO
- ✅ Almacenamiento seguro de archivos y evidencias
- ✅ Reportes y estadísticas avanzadas

### 1.2 Objetivos y Alcance

**Objetivos principales:**
1. **Digitalización completa** del proceso de gestión de órdenes de trabajo
2. **Trazabilidad total** de todas las operaciones críticas
3. **Cumplimiento normativo** con estándares ISO 27001 y sector petrolero
4. **Escalabilidad** para manejar cientos de órdenes concurrentes
5. **Disponibilidad 99.9%** con monitoreo continuo
6. **Integración perfecta** con sistemas frontend y móviles

**Alcance funcional:**
- Gestión de usuarios con roles jerárquicos
- Creación y seguimiento de órdenes de trabajo
- Asignación automática y manual de recursos
- Sistema de aprobación y validación
- Gestión documental y evidencias
- Reportes y dashboards analíticos
- Notificaciones y alertas automáticas
- API completa para integraciones de terceros

### 1.3 Stakeholders

**Usuarios finales:**
- **Clientes petroleros** (Ecopetrol, Drummond, etc.)
- **Coordinadores HES** (Health, Environment, Safety)
- **Ingenieros** y supervisores técnicos
- **Técnicos** de campo
- **Contadores** y administradores

**Equipo técnico:**
- **Administradores del sistema** (Root/Admin)
- **Desarrolladores** frontend y móvil
- **Analistas de datos** y BI
- **Equipo de DevOps** e infraestructura

### 1.4 Contexto Empresarial CERMONT

**CERMONT SAS** es una empresa colombiana especializada en servicios de mantenimiento industrial para el sector petrolero, con más de 15 años de experiencia en:

- Mantenimiento preventivo y correctivo
- Instalaciones eléctricas y de instrumentación
- Sistemas de CCTV y seguridad
- Automatización industrial
- Consultoría técnica especializada

**Desafíos del sector:**
- **Regulación estricta** del sector petrolero colombiano
- **Trazabilidad completa** requerida por normativas ambientales
- **Trabajo en zonas de alto riesgo** (ZAR)
- **Coordinación compleja** entre múltiples stakeholders
- **Documentación exhaustiva** para auditorías

**Solución tecnológica:**
El backend CERMONT ATG aborda estos desafíos mediante:
- Arquitectura segura y auditada
- APIs RESTful bien documentadas
- Sistema de roles granular
- Logs de auditoría completos
- Integración con sistemas de gestión documental

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Visión General

El backend CERMONT ATG sigue una **arquitectura limpia (Clean Architecture)** con separación clara de responsabilidades, implementando el patrón **MVC (Model-View-Controller)** con capas adicionales de servicios y utilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 ROUTES & MIDDLEWARE                 │    │
│  │  • Validación de requests                          │    │
│  │  • Autenticación & Autorización                     │    │
│  │  • Rate Limiting & Sanitización                     │    │
│  │  • Caché & Auditoría                                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Lógica de presentación                           │    │
│  │  • Validación de business rules                      │    │
│  │  • Formateo de responses                             │    │
│  │  • Error handling                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Lógica de negocio pura                            │    │
│  │  • Transacciones complejas                           │    │
│  │  • Integración con servicios externos                │    │
│  │  • Caché inteligente                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Modelos de datos (Mongoose)                       │    │
│  │  • Validaciones de esquema                           │    │
│  │  • Índices y optimizaciones                          │    │
│  │  • Conexión a MongoDB                                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Estructura de Carpetas

```
apps/backend/
├── src/
│   ├── config/           # Configuraciones del sistema
│   │   ├── database.js   # Conexión MongoDB
│   │   ├── jwt.js        # Configuración JWT
│   │   ├── swagger.js    # Documentación API
│   │   └── ssl.js        # Certificados SSL
│   ├── models/           # Modelos de datos Mongoose
│   │   ├── User.js       # Modelo de usuarios
│   │   ├── Order.js      # Modelo de órdenes
│   │   ├── AuditLog.js   # Logs de auditoría
│   │   └── ...
│   ├── services/         # Lógica de negocio
│   │   ├── user.service.js
│   │   ├── order.service.js
│   │   ├── cache.service.js
│   │   └── ...
│   ├── controllers/      # Controladores HTTP
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── orders.controller.js
│   │   └── ...
│   ├── routes/           # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── orders.routes.js
│   │   └── index.js
│   ├── middleware/       # Middlewares personalizados
│   │   ├── auth.js       # Autenticación JWT
│   │   ├── rbac.js       # Control de acceso
│   │   ├── rateLimiter.js # Rate limiting
│   │   ├── cacheMiddleware.js
│   │   └── ...
│   ├── utils/            # Utilidades generales
│   │   ├── logger.js     # Sistema de logging
│   │   ├── pagination.js # Paginación cursor/offset
│   │   ├── validators.js # Validadores de negocio
│   │   ├── errorHandler.js
│   │   └── ...
│   ├── socket/           # WebSocket handlers
│   └── validators/       # Esquemas de validación
├── docs/                 # Documentación
├── scripts/              # Scripts de utilidad
├── ssl/                  # Certificados SSL
├── uploads/              # Archivos subidos
├── logs/                 # Logs del sistema
├── tests/                # Tests automatizados
├── package.json
├── .env.example
└── README.md
```

### 2.3 Flujo de Datos

#### Request/Response Lifecycle

```
1. REQUEST INCOMING
   ↓
2. HTTPS REDIRECT (si aplica)
   ↓
3. CORS VALIDATION
   ↓
4. RATE LIMITING CHECK
   ↓
5. BLACKLIST CHECK
   ↓
6. BODY PARSING (JSON/URL-encoded)
   ↓
7. COMPRESSION CHECK
   ↓
8. ROUTE MATCHING
   ↓
9. AUTHENTICATION MIDDLEWARE
   ↓
10. AUTHORIZATION MIDDLEWARE (RBAC)
    ↓
11. CACHE MIDDLEWARE (HIT/MISS)
    ↓
12. VALIDATION MIDDLEWARE
    ↓
13. AUDIT LOGGER MIDDLEWARE
    ↓
14. CONTROLLER EXECUTION
    ↓
15. SERVICE LAYER CALL
    ↓
16. DATABASE OPERATION
    ↓
17. RESPONSE FORMATTING
    ↓
18. CACHE STORAGE (si MISS)
    ↓
19. AUDIT LOG STORAGE
    ↓
20. RESPONSE COMPRESSION
    ↓
21. RESPONSE SENT
```

#### Middleware Pipeline

```javascript
// app.js - Configuración del pipeline
app.use(httpsRedirect);           // 1. Redirección HTTPS
app.use(cors(corsOptions));       // 2. CORS
app.use(blacklistMiddleware);     // 3. Blacklist check
app.use(express.json());          // 4. Body parsing
app.use(compression());           // 5. Compression
app.use('/api/v1/auth', authRoutes); // 6. Route matching
```

### 2.4 Tecnologías y Stack

#### Core Technologies

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Runtime** | Node.js | ≥18.0.0 | Entorno de ejecución JavaScript |
| **Framework** | Express.js | ^4.21.1 | Framework web minimalista |
| **Database** | MongoDB | ^8.8.1 | Base de datos NoSQL |
| **ODM** | Mongoose | ^8.8.1 | Modelado de objetos MongoDB |
| **Auth** | JWT (jose) | ^5.10.0 | Autenticación stateless |
| **Hashing** | Argon2 | ^0.41.1 | Hashing de contraseñas seguro |
| **Validation** | Joi | ^17.13.3 | Validación de esquemas |
| **Documentation** | Swagger | ^6.2.8 | Documentación API automática |

#### Security Libraries

| Librería | Versión | Función |
|----------|---------|---------|
| **helmet** | ^8.0.0 | Security headers HTTP |
| **express-rate-limit** | ^7.4.1 | Rate limiting |
| **express-mongo-sanitize** | ^2.2.0 | Prevención NoSQL injection |
| **xss-clean** | ^0.1.4 | Sanitización XSS |
| **cors** | ^2.8.5 | Control de origen cruzado |
| **validator** | ^13.15.20 | Validación y sanitización |

#### Performance Libraries

| Librería | Versión | Función |
|----------|---------|---------|
| **compression** | Built-in | Compresión gzip/brotli |
| **node-cache** | ^5.1.2 | Caché in-memory |
| **multer** | ^2.0.2 | Manejo de archivos multipart |

#### Development Tools

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **nodemon** | ^3.1.7 | Hot reload desarrollo |
| **winston** | ^3.17.0 | Logging estructurado |
| **morgan** | ^1.10.0 | HTTP request logging |
| **cross-env** | ^7.0.3 | Variables entorno cross-platform |
| **jest** | ^29.7.0 | Testing framework |
| **supertest** | ^6.3.4 | API testing |
| **eslint** | ^9.14.0 | Code linting |
| **prettier** | ^3.3.3 | Code formatting |

---

## 3. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 3.1 Variables de Entorno

El sistema utiliza un archivo `.env` para configuración. A continuación se detalla cada variable:

#### Configuración SSL/TLS
```bash
# ===================================
# SSL/TLS CONFIGURATION (DESARROLLO LOCAL)
# ===================================
SSL_ENABLED=false                    # true para habilitar HTTPS en desarrollo
NODE_ENV=development
FRONTEND_URL=http://localhost:3000   # URL del frontend Next.js
PORT=4100                            # Puerto principal (HTTPS si SSL_ENABLED=true)
HTTP_PORT=4000                       # Puerto HTTP auxiliar (solo desarrollo con SSL)
HOST=0.0.0.0
```

#### Base de Datos MongoDB
```bash
# ============================================================================
# BASE DE DATOS - MONGODB
# ============================================================================
# MongoDB Local
MONGO_URI=mongodb://localhost:27017/cermont_db

# MongoDB Atlas (Producción - Ejemplo)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cermont_db?retryWrites=true&w=majority

# MongoDB de Testing
MONGO_TEST_URI=mongodb://localhost:27017/cermont_test_db
```

#### Autenticación JWT
```bash
# ============================================================================
# JWT - AUTENTICACIÓN CON JOSE (2025)
# ============================================================================
# IMPORTANTE: Cambiar estos secrets en producción (mínimo 32 caracteres)
# jose requiere strings seguros para TextEncoder
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-1234567890abcdef
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars-fedcba0987654321
JWT_REFRESH_EXPIRES_IN=7d

# Algoritmo de firma (jose soporta: HS256, HS384, HS512, RS256, ES256)
JWT_ALGORITHM=HS256
```

#### Hashing de Contraseñas
```bash
# ============================================================================
# PASSWORD HASHING - ARGON2 (2025)
# ============================================================================
# Argon2 configuración (más seguro que bcrypt)
ARGON2_TYPE=argon2id
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=1

# Mantener compatibilidad con bcrypt para usuarios existentes
ENABLE_BCRYPT_FALLBACK=true
```

#### CORS Configuration
```bash
# ============================================================================
# CORS - ORÍGENES PERMITIDOS
# ============================================================================
# Separar múltiples orígenes con comas
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173,https://cermont.app

# Métodos HTTP permitidos
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS

# Headers permitidos
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# Habilitar credentials (cookies, authorization headers)
CORS_CREDENTIALS=true
```

#### Rate Limiting
```bash
# ============================================================================
# RATE LIMITING - PROTECCIÓN CONTRA ATAQUES
# ============================================================================
# Ventana de tiempo en milisegundos (15 minutos)
RATE_LIMIT_WINDOW_MS=900000

# Máximo de requests por ventana (general)
RATE_LIMIT_MAX_REQUESTS=100

# Rate limit para autenticación (más restrictivo)
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=900000

# Rate limit para upload de archivos
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=600000

# Habilitar rate limiting
ENABLE_RATE_LIMITING=true
```

### 3.2 Archivos de Configuración

#### database.js - Conexión MongoDB
```javascript
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    };

    // Support both MONGODB_URI and MONGO_URI environment variable names
    // Use test database when in test environment
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI
      : process.env.MONGODB_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(mongoUri, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    // In test environment, throw instead of exiting so Jest can handle the failure
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    process.exit(1);
  }
};
```

#### jwt.js - Configuración JWT
```javascript
import { SignJWT, jwtVerify } from 'jose';

/**
 * Generate access token
 */
export const generateAccessToken = async (payload, metadata = {}) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  const token = await new SignJWT({
    ...payload,
    type: 'access',
    ...metadata
  })
  .setProtectedHeader({ alg: process.env.JWT_ALGORITHM || 'HS256' })
  .setIssuedAt()
  .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
  .sign(secret);

  return token;
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = async (payload, metadata = {}) => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
  
  const token = await new SignJWT({
    ...payload,
    type: 'refresh',
    ...metadata
  })
  .setProtectedHeader({ alg: process.env.JWT_ALGORITHM || 'HS256' })
  .setIssuedAt()
  .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  .sign(secret);

  return token;
};

/**
 * Generate token pair
 */
export const generateTokenPair = async (payload, metadata = {}) => {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload, metadata),
    generateRefreshToken(payload, metadata)
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = async (token) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Check token type
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (token) => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Check token type
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
```

#### swagger.js - Documentación API
```javascript
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuración de Swagger/OpenAPI para documentación de API
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CERMONT ATG - API Backend',
      version: '1.0.0',
      description: `
        Backend API para el sistema de gestión de órdenes de trabajo de CERMONT SAS.

        **Características principales:**
        - Autenticación JWT con refresh tokens
        - Sistema de roles y permisos (RBAC)
        - Auditoría completa de operaciones
        - Caching inteligente
        - Rate limiting
        - Compresión de respuestas
        - Paginación cursor-based y offset

        **Seguridad:**
        - HTTPS con certificados SSL
        - Sanitización de inputs (XSS/NoSQL injection)
        - Token blacklist para revocación inmediata
        - Security headers (CSP, HSTS, etc.)

        **Performance:**
        - Cache in-memory con invalidación automática
        - Compresión gzip/brotli
        - Paginación optimizada
        - Índices MongoDB optimizados
      `,
      contact: {
        name: 'CERMONT SAS',
        email: 'soporte@cermont.com',
        url: 'https://cermont.com'
      },
      license: {
        name: 'Propietario',
        url: 'https://cermont.com/licencia'
      }
    },
    servers: [
      {
        url: 'https://localhost:4100',
        description: 'Servidor de desarrollo (HTTPS)'
      },
      {
        url: 'http://localhost:4000',
        description: 'Servidor de desarrollo (HTTP auxiliar)'
      },
      {
        url: 'https://api.cermont.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/v1/auth/login'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Órdenes',
        description: 'Gestión de órdenes de trabajo'
      },
      {
        name: 'Auditoría',
        description: 'Consulta de logs de auditoría'
      },
      {
        name: 'Sistema',
        description: 'Endpoints de administración del sistema'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
```

---

## 4. MODELOS DE DATOS (MongoDB)

### 4.1 User Model

#### Esquema Completo
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';
import { hashPassword, verifyPassword, detectHashType } from '../utils/passwordHash.js';
import { logger } from '../utils/logger.js';

const userSchema = new mongoose.Schema(
  {
    // ============================================================================
    // INFORMACIÓN PERSONAL
    // ============================================================================
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // CREDENCIALES
    // ============================================================================
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No devolver por defecto
    },
    
    // ============================================================================
    // ROL Y PERMISOS
    // ============================================================================
    rol: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Rol inválido',
      },
      default: ROLES.TECHNICIAN,
      required: true,
    },
    
    // ============================================================================
    // INFORMACIÓN DE CONTACTO
    // ============================================================================
    telefono: {
      type: String,
      trim: true,
    },
    
    // ============================================================================
    // IDENTIFICACIÓN
    // ============================================================================
    cedula: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite valores null múltiples
    },
    
    // ============================================================================
    // INFORMACIÓN LABORAL
    // ============================================================================
    cargo: {
      type: String,
      trim: true,
      maxlength: [100, 'El cargo no puede exceder 100 caracteres'],
    },
    especialidad: {
      type: String,
      trim: true,
      maxlength: [100, 'La especialidad no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // AVATAR/FOTO
    // ============================================================================
    avatar: {
      type: String,
      default: null,
    },
    
    // ============================================================================
    // ESTADO
    // ============================================================================
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // ============================================================================
    // SEGURIDAD AVANZADA (NUEVO)
    // ============================================================================
    
    // Token versioning para invalidar tokens antiguos
    tokenVersion: {
      type: Number,
      default: 0,
      select: false, // No devolver en queries
    },
    
    // Refresh tokens para múltiples dispositivos
    refreshTokens: [{
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      device: {
        type: String,
        default: 'unknown',
      },
      ip: String,
      userAgent: String,
    }],
    
    // Protección contra brute force
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA Y SESIONES (NUEVO)
    // ============================================================================
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      select: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
      select: false,
    },
    
    // Historial de cambios importantes (últimos 10)
    securityLog: [{
      action: {
        type: String,
        enum: ['password_change', 'email_change', 'role_change', 'account_locked', 'account_unlocked'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    
    // ============================================================================
    // TOKENS (EXISTENTES - Mantener compatibilidad)
    // ============================================================================
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA DE CREACIÓN/MODIFICACIÓN (NUEVO)
    // ============================================================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
```

#### Índices Optimizados
```javascript
// Índices simples
userSchema.index({ rol: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Índices compuestos para queries comunes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 }); // Para dashboard

// Índice de texto para búsqueda
userSchema.index({ nombre: 'text', email: 'text' });
```

#### Hooks (Pre-save)
```javascript
// Hash de contraseña
userSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  try {
    // Registrar cambio de contraseña en log de seguridad
    if (!this.isNew) {
      this.lastPasswordChange = new Date();
      this.securityLog.push({
        action: 'password_change',
        timestamp: new Date(),
        performedBy: this._id,
      });
      
      // Mantener solo últimos 10 logs
      if (this.securityLog.length > 10) {
        this.securityLog = this.securityLog.slice(-10);
      }
    }
    
    // Hash con Argon2
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Limpiar refresh tokens expirados antes de guardar
userSchema.pre('save', function (next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );
  }
  next();
});
```

#### Métodos de Instancia
```javascript
/**
 * Comparar contraseña con hash almacenado
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const hashType = detectHashType(this.password);

    if (hashType === 'bcrypt') {
      // Hash antiguo con bcrypt (compatibilidad)
      const isMatch = await bcrypt.compare(candidatePassword, this.password);

      // Si es correcto, rehash con argon2 y guardar
      if (isMatch) {
        try {
          this.password = await hashPassword(candidatePassword);
          await this.save();
          logger.info(`Password rehashed to argon2 for user: ${this.email}`);
        } catch (err) {
          logger.error('Rehash to argon2 failed:', err);
        }
      }

      return isMatch;
    } else if (hashType === 'argon2') {
      // Hash nuevo con argon2
      return await verifyPassword(this.password, candidatePassword);
    }

    return false;
  } catch (error) {
    // Log the original error for debugging
    console.error('comparePassword error:', error);
    throw new Error('Error al comparar contraseñas');
  }
};

/**
 * Generar objeto para JWT/Auth (sin datos sensibles)
 */
userSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    telefono: this.telefono,
    cedula: this.cedula,
    cargo: this.cargo,
    especialidad: this.especialidad,
    avatar: this.avatar,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
  };
};

/**
 * Verificar si tiene rol específico
 */
userSchema.methods.hasRole = function (role) {
  return this.rol === role;
};

/**
 * Verificar si tiene al menos cierto nivel de rol
 */
userSchema.methods.hasMinRole = function (minRole) {
  const ROLE_HIERARCHY = {
    root: 100,
    admin: 90,
    coordinator_hes: 80,
    engineer: 70,
    supervisor: 60,
    technician: 50,
    accountant: 40,
    client: 10,
  };
  
  return ROLE_HIERARCHY[this.rol] >= ROLE_HIERARCHY[minRole];
};
```

#### Métodos de Seguridad
```javascript
/**
 * Incrementar intentos de login fallidos
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Si ya está bloqueado y el periodo expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  // Incrementar intentos
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta si se alcanzó el máximo de intentos (5)
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCKOUT_TIME) || 15 * 60 * 1000; // 15 min
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
    
    // Registrar en log de seguridad
    this.securityLog.push({
      action: 'account_locked',
      timestamp: new Date(),
    });
    
    logger.warn(`Account locked due to failed login attempts: ${this.email}`);
  }
  
  return await this.updateOne(updates);
};

/**
 * Resetear intentos de login después de login exitoso
 */
userSchema.methods.resetLoginAttempts = async function (ip) {
  return await this.updateOne({
    $set: { 
      loginAttempts: 0,
      lastLogin: new Date(),
      lastLoginIp: ip,
    },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Invalidar todos los tokens (logout en todos los dispositivos)
 */
userSchema.methods.invalidateAllTokens = async function () {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  
  logger.info(`All tokens invalidated for user: ${this.email}`);
  
  return await this.save();
};

/**
 * Agregar refresh token para un dispositivo
 */
userSchema.methods.addRefreshToken = async function (token, expiresAt, device = 'unknown', ip, userAgent) {
  // Limitar a máximo 5 dispositivos
  if (this.refreshTokens.length >= 5) {
    // Eliminar el más antiguo
    this.refreshTokens.shift();
  }
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    ip,
    userAgent,
  });
  
  return await this.save();
};

/**
 * Remover refresh token específico
 */
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return await this.save();
};

/**
 * Verificar si refresh token es válido
 */
userSchema.methods.hasValidRefreshToken = function (token) {
  return this.refreshTokens.some(
    rt => rt.token === token && rt.expiresAt > new Date()
  );
};
```

#### Métodos Estáticos
```javascript
/**
 * Buscar por email (incluye password para autenticación)
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +tokenVersion');
};

/**
 * Buscar por rol
 */
userSchema.statics.findByRole = function (role) {
  return this.find({ rol: role, isActive: true });
};

/**
 * Buscar usuarios activos
 */
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

/**
 * Búsqueda full-text
 */
userSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Estadísticas de usuarios
 */
userSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$rol',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
      },
    },
  ]);
  
  return stats;
};
```

#### Ejemplo de Documento
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Juan Pérez González",
  "email": "juan.perez@cermont.com",
  "password": "$argon2id$v=19$m=65536,t=3,p=1$...",
  "rol": "engineer",
  "telefono": "+57 300 123 4567",
  "cedula": "1234567890",
  "cargo": "Ingeniero Senior",
  "especialidad": "Ingeniería Eléctrica",
  "avatar": "uploads/profiles/avatar_123.jpg",
  "isActive": true,
  "tokenVersion": 0,
  "refreshTokens": [
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "expiresAt": "2025-11-08T10:00:00.000Z",
      "device": "Chrome Desktop",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    }
  ],
  "loginAttempts": 0,
  "lastLogin": "2025-11-01T09:30:00.000Z",
  "lastLoginIp": "192.168.1.100",
  "lastPasswordChange": "2025-10-15T14:20:00.000Z",
  "securityLog": [
    {
      "action": "password_change",
      "timestamp": "2025-10-15T14:20:00.000Z",
      "ip": "192.168.1.100",
      "performedBy": "507f1f77bcf86cd799439011"
    }
  ],
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-11-01T09:30:00.000Z"
}
```

### 4.2 Order Model

#### Esquema Completo (Resumido)
```javascript
const orderSchema = new mongoose.Schema(
  {
    numeroOrden: {
      type: String,
      required: [true, 'El número de orden es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    
    clienteNombre: {
      type: String,
      required: [true, 'El nombre del cliente es requerido'],
      trim: true,
    },
    
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    
    estado: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: 'Estado inválido',
      },
      default: ORDER_STATUS.PENDING,
    },
    
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'urgente'],
      default: 'media',
    },
    
    asignadoA: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    costoEstimado: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
    },
    
    costoReal: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
    },
    
    // ... más campos (fechas, métricas, archivos, notas, etc.)
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
```

### 4.3 AuditLog Model

#### Esquema Completo
```javascript
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !['LOGIN_FAILED', 'TOKEN_REVOKED'].includes(this.action);
    },
    index: true
  },
  
  userEmail: {
    type: String,
    required: true
  },
  
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'TOKEN_REVOKED',
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'PASSWORD_CHANGE', 'PASSWORD_RESET', 'ROLE_CHANGE',
      'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY',
      'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD',
      'EXPORT_DATA', 'IMPORT_DATA'
    ],
    index: true
  },

  resource: {
    type: String,
    required: true,
    enum: ['User', 'Order', 'WorkPlan', 'ToolKit', 'Report', 'Evidence', 'Auth', 'System'],
    index: true
  },
  
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },

  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  description: String,

  ipAddress: {
    type: String,
    index: true
  },
  
  userAgent: String,
  method: String,
  endpoint: String,

  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'DENIED'],
    default: 'SUCCESS',
    index: true
  },
  
  errorMessage: String,

  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice TTL para auto-eliminación después de 1 año
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
```

### 4.4 BlacklistedToken Model

#### Esquema Completo
```javascript
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  reason: {
    type: String,
    enum: [
      'LOGOUT',
      'PASSWORD_CHANGE',
      'SECURITY_BREACH',
      'ADMIN_REVOKE',
      'SUSPICIOUS_ACTIVITY',
      'ACCOUNT_DISABLED'
    ],
    required: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Auto-eliminar tokens después de que expiren (MongoDB TTL Index)
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para búsquedas rápidas
blacklistedTokenSchema.index({ userId: 1, token: 1 });
```

### 4.5 Índices MongoDB Optimizados

#### Índices por Modelo

**User Model:**
```javascript
// Índices simples
userSchema.index({ rol: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Índices compuestos
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 });

// Índice de texto
userSchema.index({ nombre: 'text', email: 'text' });
```

**Order Model:**
```javascript
// Índices simples
orderSchema.index({ estado: 1 });
orderSchema.index({ prioridad: 1 });
orderSchema.index({ fechaInicio: -1 });
orderSchema.index({ clienteNombre: 1 });
orderSchema.index({ poNumber: 1 });

// Índices compuestos
orderSchema.index({ estado: 1, fechaInicio: -1 });
orderSchema.index({ estado: 1, prioridad: 1 });
orderSchema.index({ clienteNombre: 1, createdAt: -1 });
orderSchema.index({ asignadoA: 1, estado: 1 });
orderSchema.index({ isActive: 1, isArchived: 1, createdAt: -1 });

// Full-text search
orderSchema.index({
  numeroOrden: 'text',
  clienteNombre: 'text',
  descripcion: 'text',
  lugar: 'text',
  poNumber: 'text',
});

// Índice geoespacial
orderSchema.index({ 'coordenadas': '2dsphere' });
```

---

## 5. SERVICIOS (SERVICES LAYER)

### 5.1 User Service

#### Descripción General
El `UserService` es la capa de lógica de negocio para la gestión completa del ciclo de vida de usuarios. Implementa operaciones CRUD avanzadas, validaciones de negocio, gestión de caché inteligente, y auditoría completa.

#### Características Principales
- ✅ Gestión completa del ciclo de vida de usuarios
- ✅ Validaciones de unicidad (email, cédula)
- ✅ Caché inteligente con invalidación automática
- ✅ Soft delete para mantener integridad de datos
- ✅ Estadísticas y métricas de usuarios
- ✅ Logging completo de operaciones

#### Métodos Públicos

##### `list(filters, options)`
Lista usuarios con filtros y paginación avanzada.

```javascript
async list(filters = {}, options = {}) {
  try {
    const cacheKey = `users:list:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    return await cacheService.wrap(
      cacheKey,
      async () => {
        const result = await autoPaginate(User, filters, {
          ...options,
          select: '-password -__v',
          sort: options.sort || { createdAt: -1 }
        });
        
        return result;
      },
      120 // Cache 2 minutos
    );
  } catch (error) {
    logger.error('[UserService] Error listando usuarios:', error);
    throw error;
  }
}
```

**Parámetros:**
- `filters.search`: Búsqueda por nombre, email, cédula
- `filters.rol`: Filtrar por rol específico
- `filters.activo`: Filtrar por estado activo/inactivo
- `options.page`: Número de página
- `options.limit`: Elementos por página (máx 100)

**Retorno:**
```javascript
{
  docs: [User],     // Array de usuarios
  total: 150,       // Total de usuarios
  page: 1,          // Página actual
  pages: 15,        // Total de páginas
  hasMore: true     // Si hay más páginas
}
```

##### `getById(userId)`
Obtiene usuario por ID con caché.

```javascript
async getById(userId) {
  try {
    const cacheKey = `user:${userId}`;
    
    return await cacheService.wrap(
      cacheKey,
      async () => {
        const user = await User.findById(userId)
          .select('-password -__v')
          .lean();
        
        if (!user) {
          throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }
        
        return user;
      },
      300 // Cache 5 minutos
    );
  } catch (error) {
    logger.error(`[UserService] Error obteniendo usuario ${userId}:`, error);
    throw error;
  }
}
```

##### `create(userData)`
Crea nuevo usuario con validaciones completas.

```javascript
async create(userData) {
  try {
    // Validar que el email no exista
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email ya registrado', 409, 'EMAIL_EXISTS');
    }

    // Validar cédula si se proporciona
    if (userData.cedula) {
      const existingCedula = await User.findOne({ cedula: userData.cedula });
      if (existingCedula) {
        throw new AppError('Cédula ya registrada', 409, 'CEDULA_EXISTS');
      }
    }

    // Crear usuario
    const user = await User.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    // Invalidar caché
    await cacheService.delPattern('users:*');

    logger.info(`Usuario creado: ${user.email}`);
    return user;
  } catch (error) {
    logger.error('[UserService] Error creando usuario:', error);
    throw error;
  }
}
```

### 5.2 Order Service

#### Descripción General
El `OrderService` maneja toda la lógica de negocio relacionada con órdenes de trabajo, incluyendo generación automática de números de orden, gestión de estados, asignación de usuarios, y notificaciones.

#### Características Principales
- ✅ Generación automática de números de orden únicos
- ✅ Gestión completa del ciclo de vida de órdenes
- ✅ Asignación de usuarios con roles específicos
- ✅ Seguimiento de estados y progreso
- ✅ Sistema de notas y comentarios
- ✅ Estadísticas y métricas avanzadas
- ✅ Notificaciones por email y WebSocket
- ✅ Caché inteligente con invalidación automática

#### Métodos Clave

##### `generateOrderNumber()`
Genera número de orden único siguiendo formato OT-YYYY-NNNN.

```javascript
async generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({
    numeroOrden: new RegExp(`^OT-${year}`),
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `OT-${year}-${nextNumber}`;
}
```

##### `create(orderData, userId)`
Crea nueva orden de trabajo con validaciones completas.

```javascript
async create(orderData, userId) {
  try {
    // Generar número de orden único
    const numeroOrden = await this.generateOrderNumber();

    // Crear orden
    const order = await Order.create({
      ...orderData,
      numeroOrden,
      creadoPor: userId,
      estado: ORDER_STATUS.PENDING,
    });

    // Invalidar caché
    await cacheService.delPattern('orders:*');

    // Notificar creación
    await notificationService.notifyOrderCreated(order);

    logger.info(`Orden creada: ${numeroOrden} por usuario ${userId}`);
    return order;
  } catch (error) {
    logger.error('[OrderService] Error creando orden:', error);
    throw error;
  }
}
```

##### `changeStatus(orderId, newStatus, userId, comentario)`
Cambia estado de orden con validaciones y auditoría.

```javascript
async changeStatus(orderId, newStatus, userId, comentario = '') {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Validar transición de estado
    const transicionesPermitidas = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PLANNING]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.INVOICING, ORDER_STATUS.IN_PROGRESS],
      [ORDER_STATUS.INVOICING]: [ORDER_STATUS.INVOICED, ORDER_STATUS.COMPLETED],
      [ORDER_STATUS.INVOICED]: [ORDER_STATUS.PAID],
      [ORDER_STATUS.PAID]: [], // Estado final
      [ORDER_STATUS.CANCELLED]: [], // Estado final
    };

    const permitido = transicionesPermitidas[order.estado]?.includes(newStatus);
    if (!permitido) {
      throw new AppError(
        `Transición no permitida: ${order.estado} → ${newStatus}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Cambiar estado
    await order.cambiarEstado(newStatus, userId, comentario);

    // Notificar cambio
    await notificationService.notifyOrderStatusChanged(order, newStatus);

    // Invalidar caché
    await cacheService.del(`order:${orderId}`);
    await cacheService.delPattern('orders:*');

    logger.info(`Estado de orden ${order.numeroOrden} cambiado: ${order.estado} → ${newStatus}`);
    return order;
  } catch (error) {
    logger.error(`[OrderService] Error cambiando estado de orden ${orderId}:`, error);
    throw error;
  }
}
```

### 5.3 Auth Service

#### Descripción General
El `AuthService` maneja la lógica de negocio de autenticación, incluyendo generación de tokens JWT, validación de credenciales, y gestión de sesiones.

#### Métodos Principales

##### `authenticateUser(email, password, metadata)`
Autentica usuario con email y contraseña.

```javascript
export const authenticateUser = async (email, password, metadata = {}) => {
  try {
    // Buscar usuario con campos de seguridad
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si cuenta está bloqueada
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new Error(`Cuenta bloqueada. Intenta en ${lockTime} minutos`);
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await user.incrementLoginAttempts();
      throw new Error('Credenciales inválidas');
    }

    // Login exitoso - resetear intentos
    await user.resetLoginAttempts(metadata.ip);

    // Generar tokens con metadata
    const tokens = await generateTokenPair(
      {
        userId: user._id.toString(),
        role: user.rol,
        tokenVersion: user.tokenVersion || 0,
      },
      metadata
    );

    // Calcular fecha de expiración del refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    // Agregar refresh token al usuario
    await user.addRefreshToken(
      tokens.refreshToken,
      refreshExpiresAt,
      metadata.device,
      metadata.ip,
      metadata.userAgent
    );

    logger.info(`Usuario autenticado: ${user.email} from ${metadata.device}`);

    return {
      user: user.toAuthJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Error en autenticación:', error.message);
    throw error;
  }
};
```

### 5.4 Cache Service

#### Descripción General
Servicio de caché in-memory usando Node-Cache para optimizar performance en consultas frecuentes.

#### Características
- ✅ TTL configurable por recurso
- ✅ Invalidación automática
- ✅ Estadísticas de uso
- ✅ Límite de memoria automático
- ✅ Logging de operaciones

#### Métodos Principales

##### `wrap(key, fn, ttl)`
Cachea resultado de función asíncrona.

```javascript
async wrap(key, fn, ttl = null) {
  // Verificar si existe en cache
  const cached = this.cache.get(key);
  if (cached !== undefined) {
    this.stats.hits++;
    return cached;
  }

  // Ejecutar función y cachear resultado
  this.stats.misses++;
  const result = await fn();
  
  this.cache.set(key, result, ttl || this.defaultTTL);
  this.stats.sets++;
  
  return result;
}
```

##### `delPattern(pattern)`
Elimina keys que coinciden con patrón.

```javascript
delPattern(pattern) {
  const keys = this.cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => {
    this.cache.del(key);
    this.stats.deletes++;
  });
  
  return matchingKeys.length;
}
```

---

## 6. CONTROLADORES (CONTROLLERS LAYER)

### 6.1 Auth Controller

#### Descripción General
El `AuthController` maneja todos los endpoints relacionados con autenticación y autorización, incluyendo registro, login, logout, refresh tokens, y gestión de sesiones.

#### Características Principales
- ✅ Registro de usuarios con validación completa
- ✅ Login con rate limiting y detección de dispositivos
- ✅ Sistema de tokens JWT con refresh token rotation
- ✅ Gestión de sesiones activas por usuario
- ✅ Recuperación de contraseña por email
- ✅ Cambio de contraseña con verificación
- ✅ Logout individual y global
- ✅ Verificación de tokens activos
- ✅ Auditoría completa de operaciones de seguridad

#### Métodos Principales

##### `register(req, res)`
Registra nuevo usuario en el sistema.

```javascript
export const register = asyncHandler(async (req, res) => {
  // ✅ NUEVO: Validar y sanitizar datos
  const validation = validateAndRespond(validateRegisterData, req.body, res);
  if (validation.hasErrors) return validation.response;

  const { sanitized } = validation;

  // Check if user already exists
  const existingUser = await User.findOne({ email: sanitized.email.toLowerCase() });
  if (existingUser) {
    return errorResponse(
      res,
      'El email ya está registrado',
      HTTP_STATUS.CONFLICT
    );
  }

  // Check if cedula exists
  if (sanitized.cedula) {
    const existingCedula = await User.findOne({ cedula: sanitized.cedula });
    if (existingCedula) {
      return errorResponse(
        res,
        'La cédula ya está registrada',
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // ✅ Usar datos sanitizados
  const user = await User.create({
    ...sanitized,
    email: sanitized.email.toLowerCase(),
    rol: sanitized.rol || 'technician',
  });

  logger.info(`New user registered: ${user.email} (${user.rol})`);

  // ... resto del código igual
  const deviceInfo = getDeviceInfo(req);
  const tokens = await generateTokenPair(
    {
      userId: user._id.toString(),
      role: user.rol,
    },
    deviceInfo
  );

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

  await user.addRefreshToken(
    tokens.refreshToken,
    refreshExpiresAt,
    deviceInfo.device,
    deviceInfo.ip,
    deviceInfo.userAgent
  );

  setTokenCookies(res, tokens, false);

  return successResponse(
    res,
    {
      user: user.toAuthJSON(),
      tokens,
    },
    'Usuario registrado exitosamente'
  );
});
```

##### `login(req, res)`
Autentica usuario y genera tokens.

```javascript
export const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body;

  // Validar entrada
  if (!email || !password) {
    return errorResponse(
      res,
      'Email y contraseña son requeridos',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Obtener información del dispositivo
  const deviceInfo = getDeviceInfo(req);

  try {
    // Autenticar usuario
    const result = await authenticateUser(email, password, deviceInfo);

    // Configurar cookies de tokens
    setTokenCookies(res, result.tokens, remember || false);

    // Auditar login exitoso
    await createAuditLog({
      userId: result.user._id,
      userEmail: result.user.email,
      action: 'LOGIN',
      resource: 'Auth',
      status: 'SUCCESS',
      ipAddress: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      description: `Login exitoso desde ${deviceInfo.device}`,
    });

    logger.info(`User logged in: ${result.user.email} from ${deviceInfo.device}`);

    return successResponse(
      res,
      {
        user: result.user,
        tokens: result.tokens,
      },
      'Login exitoso'
    );
  } catch (error) {
    // Auditar login fallido
    await logLoginFailed(email, deviceInfo.ip, deviceInfo.userAgent, error.message);

    return errorResponse(
      res,
      error.message,
      HTTP_STATUS.UNAUTHORIZED
    );
  }
});
```

##### `refreshToken(req, res)`
Renueva tokens usando refresh token.

```javascript
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(
      res,
      'Refresh token es requerido',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    // Renovar tokens
    const result = await refreshUserTokens(refreshToken, getDeviceInfo(req));

    // Configurar nuevas cookies
    setTokenCookies(res, result.tokens, false);

    // Auditar refresh
    await createAuditLog({
      userId: result.user._id,
      userEmail: result.user.email,
      action: 'TOKEN_REFRESH',
      resource: 'Auth',
      status: 'SUCCESS',
      description: 'Tokens renovados exitosamente',
    });

    return successResponse(
      res,
      {
        user: result.user,
        tokens: result.tokens,
      },
      'Tokens renovados exitosamente'
    );
  } catch (error) {
    return errorResponse(
      res,
      'Token de refresh inválido o expirado',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
});
```

#### Request/Response Examples

**Registro exitoso:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "nombre": "María González",
  "email": "maria.gonzalez@cermont.com",
  "password": "SecurePass123!",
  "rol": "engineer",
  "cedula": "87654321",
  "telefono": "+573001234567"
}
```

**Respuesta:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "María González",
      "email": "maria.gonzalez@cermont.com",
      "rol": "engineer",
      "telefono": "+573001234567",
      "cedula": "87654321",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  },
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

### 6.2 Users Controller

#### Descripción General
El `UsersController` maneja todas las operaciones CRUD relacionadas con usuarios, incluyendo gestión de roles, permisos, y operaciones administrativas.

#### Métodos Principales

##### `getAllUsers(req, res)`
Obtiene lista paginada de usuarios con filtros.

```javascript
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    cursor,
    page,
    limit = 20,
    rol,
    activo,
    search
  } = req.query;

  // Construir filtros
  const filters = {};

  if (rol) filters.rol = rol;
  if (activo !== undefined) filters.activo = activo === 'true';

  // Búsqueda por texto
  if (search) {
    filters.$or = [
      { nombre: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { cedula: new RegExp(search, 'i') }
    ];
  }

  // Usar el servicio para obtener usuarios
  const result = await userService.list(filters, {
    cursor,
    page,
    limit,
    sort: { createdAt: -1 }
  });

  successResponse(res, 'Usuarios obtenidos exitosamente', result.docs, HTTP_STATUS.OK, {
    pagination: result.pagination
  });
});
```

##### `createUser(req, res)`
Crea nuevo usuario en el sistema.

```javascript
export const createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const createdBy = req.user; // Usuario que crea

  // Crear usuario usando el servicio
  const user = await userService.create(userData);

  // Notificar creación
  await notificationService.notifyUserCreated(user, createdBy);

  logger.info(`Usuario creado: ${user.email} por ${createdBy.nombre}`);

  createdResponse(res, 'Usuario creado exitosamente', user);
});
```

### 6.3 Orders Controller

#### Descripción General
El `OrdersController` maneja todas las operaciones CRUD relacionadas con órdenes de trabajo, incluyendo asignación de usuarios, cambio de estados, notas, y operaciones administrativas.

#### Métodos Principales

##### `getAllOrders(req, res)`
Obtiene lista paginada de órdenes con filtros avanzados.

```javascript
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    cursor,
    page,
    limit = 20,
    status,
    priority,
    cliente,
    startDate,
    endDate,
    search
  } = req.query;

  // Construir filtros
  const filters = { isActive: true, isArchived: false };

  if (status) filters.estado = status;
  if (priority) filters.prioridad = priority;
  if (cliente) filters.clienteNombre = new RegExp(cliente, 'i');

  // Filtros de fecha
  if (startDate || endDate) {
    filters.fechaInicioEstimada = {};
    if (startDate) filters.fechaInicioEstimada.$gte = new Date(startDate);
    if (endDate) filters.fechaInicioEstimada.$lte = new Date(endDate);
  }

  // Búsqueda por texto
  if (search) {
    filters.$or = [
      { numeroOrden: new RegExp(search, 'i') },
      { clienteNombre: new RegExp(search, 'i') },
      { descripcion: new RegExp(search, 'i') }
    ];
  }

  // Usar el servicio para obtener órdenes
  const result = await orderService.list(filters, {
    cursor,
    page,
    limit,
    sort: { createdAt: -1 }
  });

  successResponse(res, 'Órdenes obtenidas exitosamente', result.docs, HTTP_STATUS.OK, {
    pagination: result.pagination
  });
});
```

##### `createOrder(req, res)`
Crea nueva orden de trabajo.

```javascript
export const createOrder = asyncHandler(async (req, res) => {
  // ✅ NUEVO: Validar y sanitizar datos
  const validation = validateAndRespond(validateOrderData, req.body, res);
  if (validation.hasErrors) return validation.response;

  const { sanitized } = validation;
  const userId = req.user._id;

  // Crear orden usando el servicio
  const order = await orderService.create(sanitized, userId);

  logger.info(`Orden creada: ${order.numeroOrden} por usuario ${req.user.nombre}`);

  createdResponse(res, 'Orden creada exitosamente', order);
});
```

---

## 7. MIDDLEWARE

### 7.1 Autenticación (auth.js)

#### Descripción General
Middleware de autenticación principal que verifica tokens JWT y carga datos del usuario autenticado.

#### Funcionalidades
- ✅ Verificación de token JWT desde headers o cookies
- ✅ Validación contra blacklist de tokens revocados
- ✅ Carga de datos del usuario desde base de datos
- ✅ Verificación de usuario activo
- ✅ Adjuntar datos del usuario al request
- ✅ Manejo de errores de token (expirado, inválido)

#### Código Completo
```javascript
/**
 * Middleware de Autenticación
 * @description Verificación de token JWT y carga de datos del usuario
 */

import { verifyAccessToken } from '../config/jwt.js';
import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import User from '../models/User.js';
// ✅ AGREGAR: Importar BlacklistedToken
import BlacklistedToken from '../models/BlacklistedToken.js';

/**
 * Middleware de autenticación principal
 * Verifica el token JWT y carga los datos del usuario autenticado
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token desde header Authorization o cookies
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    // Verificar que el token existe
    if (!token) {
      return errorResponse(
        res,
        'No autorizado. Token no proporcionado',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // ✅ AGREGAR: Verificar blacklist
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token);

    if (isBlacklisted) {
      return errorResponse(
        res,
        'Token revocado. Inicia sesión nuevamente.',
        HTTP_STATUS.UNAUTHORIZED,
        [],
        'TOKEN_BLACKLISTED'
      );
    }

    // Verificar y decodificar el token
    const decoded = await verifyAccessToken(token);

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return errorResponse(
        res,
        'Usuario no encontrado',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verificar que el usuario está activo
    if (!user.isActive) {
      return errorResponse(
        res,
        'Usuario inactivo. Contacta al administrador',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Adjuntar datos del usuario al request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.rol;

    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    
    // Manejar diferentes tipos de errores de token
    if (error.message.includes('expired')) {
      return errorResponse(
        res,
        'Token expirado. Por favor, inicia sesión nuevamente',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (error.message.includes('invalid') || error.message.includes('malformed')) {
      return errorResponse(
        res,
        'Token inválido',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    return errorResponse(
      res,
      'Error de autenticación',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};
```

### 7.2 Autorización (rbac.js)

#### Descripción General
Middleware de control de acceso basado en roles (RBAC) con jerarquía de permisos.

#### Jerarquía de Roles
```javascript
const ROLE_HIERARCHY = {
  root: 100,        // Acceso total
  admin: 90,        // Administración del sistema
  coordinator_hes: 80, // Coordinador HES
  engineer: 70,     // Ingeniero
  supervisor: 60,   // Supervisor
  technician: 50,   // Técnico
  accountant: 40,   // Contador
  client: 10,       // Cliente
};
```

#### Código Completo (Resumido)
```javascript
/**
 * RBAC Middleware - Role-Based Access Control
 * @description Control de acceso basado en roles jerárquicos
 */

import { ROLES, ROLE_HIERARCHY } from '../utils/constants.js';
import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Verificar si el usuario tiene uno de los roles permitidos
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const userRole = req.user.rol;

    // Verificar si el usuario tiene uno de los roles permitidos
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // Acceso denegado
    logger.warn('Acceso denegado por rol insuficiente', {
      userId: req.userId,
      userRole,
      requiredRoles: allowedRoles,
      path: req.path,
    });

    return errorResponse(
      res,
      'No tienes permisos para realizar esta acción',
      HTTP_STATUS.FORBIDDEN
    );
  };
};

/**
 * Verificar si el usuario tiene al menos el nivel de rol mínimo requerido
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.rol] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel >= minRoleLevel) {
      return next();
    }

    return errorResponse(
      res,
      'No tienes permisos para realizar esta acción',
      HTTP_STATUS.FORBIDDEN
    );
  };
};
```

### 7.3 Rate Limiting

#### Descripción General
Middleware inteligente de rate limiting con whitelist/blacklist y detección de abuso persistente.

#### Características
- ✅ Rate limiting por IP y endpoint
- ✅ Whitelist para IPs confiables
- ✅ Blacklist para IPs bloqueadas
- ✅ Detección automática de abuso
- ✅ Storage en memoria con cleanup automático
- ✅ Configuración por endpoint

#### Código Completo (Resumido)
```javascript
/**
 * Rate Limiter Middleware (Intelligent - October 2025)
 */

class RateLimitStore {
  constructor() {
    this.requests = new Map();
    this.blocked = new Map();
    this.violations = new Map();
  }

  increment(key, windowMs) {
    const now = Date.now();
    let data = this.requests.get(key);
    
    if (!data || now - data.resetTime > windowMs) {
      data = {
        count: 0,
        resetTime: now,
        windowMs,
        firstRequest: now,
      };
    }
    
    data.count++;
    data.lastRequest = now;
    this.requests.set(key, data);
    
    return data;
  }
}

// Middleware principal
export const apiRateLimiter = (options = {}) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Verificar whitelist
    if (WHITELIST_IPS.has(clientIP)) {
      return next();
    }
    
    // Verificar blacklist
    if (BLACKLIST_IPS.has(clientIP)) {
      return res.status(403).json({
        success: false,
        error: { message: 'IP bloqueada por abuso' }
      });
    }
    
    // Aplicar rate limiting
    const key = `${clientIP}:${req.path}`;
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 min
    const maxRequests = options.max || 100;
    
    const data = rateLimitStore.increment(key, windowMs);
    
    // Verificar límite
    if (data.count > maxRequests) {
      // Registrar violación
      rateLimitStore.recordViolation(key);
      
      return res.status(429).json({
        success: false,
        error: { message: 'Demasiadas solicitudes' }
      });
    }
    
    next();
  };
};
```

### 7.4 Cache Middleware

#### Descripción General
Middleware para cachear respuestas HTTP GET con invalidación automática.

#### Funcionalidades
- ✅ Cache automático de respuestas GET
- ✅ Invalidación por patrón
- ✅ Keys dinámicas basadas en request
- ✅ TTL configurable
- ✅ Estadísticas de hit/miss

#### Código Completo
```javascript
import cacheService from '../services/cache.service.js';
import logger from '../utils/logger.js';

/**
 * Middleware para cachear respuestas de rutas GET
 */
export const cacheMiddleware = (ttl = 60, keyGenerator = null) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generar clave de cache
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : generateCacheKey(req);

    // Verificar si existe en cache
    const cached = cacheService.get(cacheKey);

    if (cached) {
      // HIT: Devolver desde cache
      logger.debug(`[Cache Middleware] HIT: ${cacheKey}`);
      
      return res.json({
        ...cached,
        _cached: true,
        _cachedAt: new Date().toISOString()
      });
    }

    // MISS: Interceptar res.json para guardar en cache
    const originalJson = res.json.bind(res);

    res.json = function(body) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(cacheKey, body, ttl);
        logger.debug(`[Cache Middleware] MISS guardado: ${cacheKey} (TTL: ${ttl}s)`);
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Generar clave de cache estándar
 */
const generateCacheKey = (req) => {
  const path = req.originalUrl || req.url;
  const userId = req.user?._id?.toString() || 'anonymous';
  
  // Incluir query params en la key
  const queryString = new URLSearchParams(req.query).toString();
  
  return `route:${path}:${queryString}:${userId}`;
};

/**
 * Middleware para invalidar cache por patrón
 */
export const invalidateCache = (pattern) => {
  return (req, res, next) => {
    // Ejecutar después de la respuesta
    res.on('finish', () => {
      // Solo invalidar en operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const deleted = cacheService.delPattern(pattern);
        
        if (deleted > 0) {
          logger.info(`[Cache] Invalidadas ${deleted} keys con patrón: ${pattern}`);
        }
      }
    });

    next();
  };
};
```

### 7.5 Audit Logger

#### Descripción General
Middleware para auditar automáticamente operaciones en rutas con logging completo.

#### Funcionalidades
- ✅ Auditoría automática de operaciones CRUD
- ✅ Logging de accesos denegados
- ✅ Metadatos completos (IP, User-Agent, etc.)
- ✅ Severidad y status de operaciones
- ✅ Descripciones legibles de acciones

#### Código Completo (Resumido)
```javascript
/**
 * Middleware para auditar automáticamente operaciones en rutas
 */
export const auditLogger = (action, resource) => {
  return asyncHandler(async (req, res, next) => {
    // Guardar referencia al método original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para interceptar la respuesta
    res.json = function(body) {
      // Crear log de auditoría solo si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          userId: req.user?._id,
          userEmail: req.user?.email || 'anonymous',
          userRole: req.user?.rol,
          action,
          resource,
          resourceId: body?.data?._id || body?._id || req.params?.id,
          changes: {
            before: req.auditBefore, // Puede setearse en controladores
            after: body?.data || body
          },
          description: generateDescription(action, resource, req),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          method: req.method,
          endpoint: req.originalUrl,
          status: 'SUCCESS',
          severity: determineSeverity(action, resource)
        }).catch(err => console.error('[AuditLogger] Error:', err.message));
      }

      // Llamar al método original
      return originalJson(body);
    };

    next();
  });
};

/**
 * Función helper para crear logs de auditoría manualmente
 */
export const createAuditLog = async (data) => {
  try {
    await AuditLog.create({
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    // No lanzar error para no interrumpir flujo principal
    console.error('[AuditLog] Error guardando log:', error.message);
  }
};
```

---

## 8. RUTAS Y ENDPOINTS

### 8.1 Estructura de Rutas

#### Versioning y Organización
```javascript
// routes/index.js
import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import ordersRoutes from './orders.routes.js';
import auditRoutes from './auditLog.routes.js';
import systemRoutes from './system.routes.js';

const router = express.Router();

// API Versioning
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/orders', ordersRoutes);
router.use('/audit', auditRoutes);
router.use('/system', systemRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
```

#### Middleware Común
```javascript
// Todas las rutas requieren autenticación excepto /auth/*
router.use(authenticate);

// Rate limiting general
router.use(apiRateLimiter);

// Sanitización de inputs
router.use(mongoSanitization);
router.use(xssClean);
```

### 8.2 Auth Routes

#### Endpoints de Autenticación
```javascript
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               rol: { type: string, enum: ['technician', 'engineer', 'supervisor'] }
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', validateRequest(registerSchema), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 */
router.post('/login', loginLimiter, validateRequest(loginSchema), login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Autenticación]
 *     summary: Renovar tokens
 */
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: Obtener información del usuario actual
 */
router.get('/me', authenticate, getMe);
```

### 8.3 Users Routes

#### Endpoints de Usuarios
```javascript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: rol
 *         schema: { type: string }
 */
router.get('/', 
  requireMinRole('supervisor'),
  cacheMiddleware(120),
  getAllUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 */
router.get('/:id', 
  requireMinRole('supervisor'),
  validateObjectId,
  cacheMiddleware(300),
  getUserById
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear nuevo usuario
 */
router.post('/', 
  requireMinRole('admin'),
  auditLogger('CREATE', 'User'),
  invalidateCache('users:*'),
  createUser
);
```

### 8.4 Orders Routes

#### Endpoints de Órdenes
```javascript
/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Órdenes]
 *     summary: Listar órdenes
 */
router.get('/', 
  cacheMiddleware(180),
  getAllOrders
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Órdenes]
 *     summary: Obtener orden por ID
 */
router.get('/:id', 
  validateObjectId,
  cacheMiddleware(300),
  getOrderById
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags: [Órdenes]
 *     summary: Crear nueva orden
 */
router.post('/', 
  requireMinRole('engineer'),
  auditLogger('CREATE', 'Order'),
  invalidateCache('orders:*'),
  createOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags: [Órdenes]
 *     summary: Cambiar estado de orden
 */
router.patch('/:id/status', 
  requireMinRole('supervisor'),
  validateObjectId,
  auditLogger('UPDATE', 'Order'),
  invalidateCache('orders:*'),
  updateOrderStatus
);
```

### 8.5 Tabla Resumen de Todos los Endpoints

| Método | Ruta | Permisos | Descripción |
|--------|------|----------|-------------|
| POST | `/api/v1/auth/register` | Público | Registrar nuevo usuario |
| POST | `/api/v1/auth/login` | Público | Iniciar sesión |
| POST | `/api/v1/auth/refresh` | Público | Renovar tokens |
| POST | `/api/v1/auth/logout` | Autenticado | Cerrar sesión |
| GET | `/api/v1/auth/me` | Autenticado | Información del usuario actual |
| GET | `/api/v1/users` | Supervisor+ | Listar usuarios |
| GET | `/api/v1/users/{id}` | Supervisor+ | Obtener usuario por ID |
| POST | `/api/v1/users` | Admin+ | Crear usuario |
| PUT | `/api/v1/users/{id}` | Admin+ | Actualizar usuario |
| DELETE | `/api/v1/users/{id}` | Admin+ | Eliminar usuario |
| GET | `/api/v1/orders` | Autenticado | Listar órdenes |
| GET | `/api/v1/orders/{id}` | Autenticado | Obtener orden por ID |
| POST | `/api/v1/orders` | Engineer+ | Crear orden |
| PUT | `/api/v1/orders/{id}` | Supervisor+ | Actualizar orden |
| DELETE | `/api/v1/orders/{id}` | Admin+ | Eliminar orden |
| PATCH | `/api/v1/orders/{id}/status` | Supervisor+ | Cambiar estado |
| POST | `/api/v1/orders/{id}/notes` | Autenticado | Agregar nota |
| GET | `/api/v1/audit/logs` | Admin+ | Ver logs de auditoría |
| GET | `/api/v1/system/health` | Autenticado | Health check |
| GET | `/api/v1/system/cache/stats` | Admin+ | Estadísticas de caché |

---

## 9. UTILIDADES (UTILS)

### 9.1 asyncHandler

#### Propósito
Wrapper para manejo de errores asíncronos en controladores Express.

#### Implementación
```javascript
/**
 * Wrapper para manejo de errores asíncronos en Express
 * @param {Function} fn - Función asíncrona del controlador
 * @returns {Function} Función envuelta con manejo de errores
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

#### Uso
```javascript
// Antes (sin asyncHandler)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Después (con asyncHandler)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});
```

### 9.2 errorHandler

#### AppError Class
```javascript
/**
 * Clase personalizada para manejo de errores estructurados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}
```

#### globalErrorHandler
```javascript
/**
 * Manejador global de errores para Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new AppError(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Valor duplicado para el campo: ${field}`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  // Respuesta estructurada
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

### 9.3 logger (Winston)

#### Configuración
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Archivo para todos los logs
    new winston.transports.File({
      filename: 'logs/all.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    // Archivo solo para errores
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
    
    // Consola para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export { logger };
```

#### Uso
```javascript
import { logger } from '../utils/logger.js';

// Niveles de logging
logger.error('Error crítico en la aplicación', { error: err.message });
logger.warn('Advertencia de configuración', { config: 'missing' });
logger.info('Usuario autenticado', { userId, email });
logger.debug('Valor de variable', { variable: value });
```

### 9.4 pagination

#### cursorPaginate()
```javascript
/**
 * Paginación cursor-based para queries eficientes
 */
export const cursorPaginate = async (model, filters = {}, options = {}) => {
  const {
    cursor = null,
    limit = 20,
    sort = { _id: -1 },
    populate = [],
    select = null
  } = options;

  const query = { ...filters };

  // Agregar cursor si existe
  if (cursor) {
    const cursorDoc = await model.findById(cursor).select(Object.keys(sort)[0]);
    
    if (cursorDoc) {
      const sortField = Object.keys(sort)[0];
      const sortValue = cursorDoc[sortField] || cursorDoc._id;
      const sortDirection = sort[sortField];

      if (sortDirection === -1) {
        query[sortField] = sortField === '_id'
          ? { $lt: mongoose.Types.ObjectId(cursor) }
          : { $lt: sortValue };
      } else {
        query[sortField] = sortField === '_id'
          ? { $gt: mongoose.Types.ObjectId(cursor) }
          : { $gt: sortValue };
      }
    }
  }

  let queryBuilder = model.find(query)
    .sort(sort)
    .limit(parseInt(limit) + 1);

  if (populate && populate.length > 0) {
    populate.forEach(pop => {
      queryBuilder = queryBuilder.populate(pop);
    });
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const results = await queryBuilder.exec();
  const hasMore = results.length > limit;
  const docs = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && docs.length > 0
    ? docs[docs.length - 1]._id.toString()
    : null;

  return {
    docs,
    pagination: {
      cursor: cursor,
      nextCursor,
      hasMore,
      limit: parseInt(limit),
      count: docs.length
    }
  };
};
```

#### offsetPaginate()
```javascript
/**
 * Paginación offset-based tradicional
 */
export const offsetPaginate = async (model, filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = [],
    select = null
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let queryBuilder = model.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  if (populate && populate.length > 0) {
    populate.forEach(pop => {
      queryBuilder = queryBuilder.populate(pop);
    });
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const docs = await queryBuilder.exec();
  const total = await model.countDocuments(filters);
  const totalPages = Math.ceil(total / limit);

  return {
    docs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: totalPages,
      hasMore: page < totalPages
    }
  };
};
```

#### autoPaginate()
```javascript
/**
 * Paginación automática - elige el método óptimo
 */
export const autoPaginate = async (model, filters = {}, options = {}) => {
  const { cursor, page } = options;

  // Si se proporciona cursor, usar cursor-based
  if (cursor) {
    return cursorPaginate(model, filters, options);
  }

  // Si se proporciona page, usar offset-based
  if (page) {
    return offsetPaginate(model, filters, options);
  }

  // Por defecto, usar cursor-based para mejor performance
  return cursorPaginate(model, filters, options);
};
```

### 9.5 validators

#### Funciones de Validación
```javascript
/**
 * Validar datos de registro de usuario
 */
export const validateRegisterData = (data) => {
  const errors = [];
  const sanitized = {};

  // Nombre
  if (!data.nombre || typeof data.nombre !== 'string') {
    errors.push('Nombre es requerido');
  } else {
    sanitized.nombre = sanitizers.string(data.nombre, { maxLength: 100 });
    if (sanitized.nombre.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
  }

  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email es requerido');
  } else {
    sanitized.email = sanitizers.email(data.email);
    if (!sanitized.email) {
      errors.push('Email inválido');
    }
  }

  // Password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else if (data.password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres');
  } else {
    sanitized.password = data.password;
  }

  return { errors, sanitized };
};
```

#### validateAndRespond()
```javascript
/**
 * Validar y responder automáticamente con errores
 */
export const validateAndRespond = (validatorFn, data, res) => {
  const validation = validatorFn(data);
  
  if (validation.errors.length > 0) {
    return {
      hasErrors: true,
      response: errorResponse(
        res,
        'Datos de entrada inválidos',
        HTTP_STATUS.BAD_REQUEST,
        validation.errors,
        'VALIDATION_ERROR'
      )
    };
  }
  
  return {
    hasErrors: false,
    sanitized: validation.sanitized
  };
};
```

### 9.6 response (DTOs)

#### successResponse()
```javascript
/**
 * Respuesta estándar de éxito
 */
export const successResponse = (res, message, data = null, statusCode = 200, meta = {}) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== null && { data }),
    ...(Object.keys(meta).length > 0 && { meta })
  };

  return res.status(statusCode).json(response);
};
```

#### createdResponse()
```javascript
/**
 * Respuesta para recursos creados
 */
export const createdResponse = (res, message, data = null, meta = {}) => {
  return successResponse(res, message, data, HTTP_STATUS.CREATED, meta);
};
```

#### errorResponse()
```javascript
/**
 * Respuesta estándar de error
 */
export const errorResponse = (res, message, statusCode = 500, details = [], code = 'INTERNAL_ERROR') => {
  const response = {
    success: false,
    error: {
      message,
      code,
      ...(details.length > 0 && { details })
    },
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};
```

#### paginatedResponse()
```javascript
/**
 * Respuesta paginada
 */
export const paginatedResponse = (res, message, docs, pagination, meta = {}) => {
  return successResponse(res, message, docs, HTTP_STATUS.OK, {
    pagination,
    ...meta
  });
};
```

---

## 10. SEGURIDAD

### 10.1 Autenticación JWT

#### Generación de Tokens
```javascript
import { SignJWT, jwtVerify } from 'jose';

/**
 * Generate access token
 */
export const generateAccessToken = async (payload, metadata = {}) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  const token = await new SignJWT({
    ...payload,
    type: 'access',
    ...metadata
  })
  .setProtectedHeader({ alg: process.env.JWT_ALGORITHM || 'HS256' })
  .setIssuedAt()
  .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
  .sign(secret);

  return token;
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = async (payload, metadata = {}) => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
  
  const token = await new SignJWT({
    ...payload,
    type: 'refresh',
    ...metadata
  })
  .setProtectedHeader({ alg: process.env.JWT_ALGORITHM || 'HS256' })
  .setIssuedAt()
  .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  .sign(secret);

  return token;
};

/**
 * Generate token pair
 */
export const generateTokenPair = async (payload, metadata = {}) => {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload, metadata),
    generateRefreshToken(payload, metadata)
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
  };
};
```

#### Verificación de Tokens
```javascript
/**
 * Verify access token
 */
export const verifyAccessToken = async (token) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Check token type
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (token) => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Check token type
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
```

### 10.2 Token Blacklist

#### Funcionamiento del Blacklist
```javascript
/**
 * Modelo para tokens JWT revocados
 */
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  reason: {
    type: String,
    enum: [
      'LOGOUT',
      'PASSWORD_CHANGE',
      'SECURITY_BREACH',
      'ADMIN_REVOKE',
      'SUSPICIOUS_ACTIVITY',
      'ACCOUNT_DISABLED'
    ],
    required: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Auto-eliminar tokens después de que expiren
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

#### Verificación de Blacklist
```javascript
/**
 * Método estático para verificar si un token está en blacklist
 */
blacklistedTokenSchema.statics.isBlacklisted = async function(token) {
  const entry = await this.findOne({ token });
  return !!entry;
};

/**
 * Revocar token
 */
blacklistedTokenSchema.statics.revokeToken = async function(token, userId, reason, metadata = {}) {
  const jwt = require('jsonwebtoken');

  try {
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      throw new Error('Token inválido o sin expiración');
    }

    await this.create({
      token,
      userId,
      reason,
      expiresAt: new Date(decoded.exp * 1000),
      ...metadata
    });

    return true;
  } catch (error) {
    console.error('[BlacklistedToken] Error revocando token:', error.message);
    return false;
  }
};
```

### 10.3 Hashing de Contraseñas

#### Implementación Argon2
```javascript
import argon2 from 'argon2';

/**
 * Hash password with Argon2
 */
export const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST) || 65536,
      timeCost: parseInt(process.env.ARGON2_TIME_COST) || 3,
      parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 1,
    });
    
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    throw new Error('Error verifying password');
  }
};

/**
 * Detect hash type (for backward compatibility)
 */
export const detectHashType = (hash) => {
  if (hash.startsWith('$argon2')) {
    return 'argon2';
  } else if (hash.startsWith('$2')) {
    return 'bcrypt';
  }
  
  return 'unknown';
};
```

### 10.4 Rate Limiting

#### Configuración Inteligente
```javascript
/**
 * Rate Limiter Store con memoria y cleanup automático
 */
class RateLimitStore {
  constructor() {
    this.requests = new Map();
    this.blocked = new Map();
    this.violations = new Map();
    
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  increment(key, windowMs) {
    const now = Date.now();
    let data = this.requests.get(key);
    
    if (!data || now - data.resetTime > windowMs) {
      data = {
        count: 0,
        resetTime: now,
        windowMs,
        firstRequest: now,
      };
    }
    
    data.count++;
    data.lastRequest = now;
    this.requests.set(key, data);
    
    return data;
  }

  recordViolation(key) {
    const violations = this.violations.get(key) || { count: 0, firstViolation: Date.now() };
    violations.count++;
    violations.lastViolation = Date.now();
    this.violations.set(key, violations);
    
    return violations;
  }
}

// Middleware principal
export const apiRateLimiter = (options = {}) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Whitelist check
    if (WHITELIST_IPS.has(clientIP)) {
      return next();
    }
    
    // Blacklist check
    if (BLACKLIST_IPS.has(clientIP)) {
      return res.status(403).json({
        success: false,
        error: { message: 'IP bloqueada por abuso' }
      });
    }
    
    const key = `${clientIP}:${req.path}`;
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const maxRequests = options.max || 100;
    
    const data = rateLimitStore.increment(key, windowMs);
    
    if (data.count > maxRequests) {
      rateLimitStore.recordViolation(key);
      
      return res.status(429).json({
        success: false,
        error: { message: 'Demasiadas solicitudes' }
      });
    }
    
    next();
  };
};
```

### 10.5 Sanitización de Inputs

#### Middleware de Sanitización
```javascript
/**
 * Sanitización completa de inputs
 */
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizar string básico
 */
const sanitizeString = (value, options = {}) => {
  if (typeof value !== 'string') return value;
  
  const {
    trim = true,
    escape = true,
    maxLength = 10000,
    allowHTML = false,
  } = options;
  
  let sanitized = value;
  
  if (trim) sanitized = sanitized.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  if (!allowHTML && escape) {
    sanitized = sanitized.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    sanitized = sanitized.replace(/javascript:\s*/gi, '');
    sanitized = sanitized.replace(/data:\s*/gi, '');
    sanitized = validator.escape(sanitized);
  }
  
  if (allowHTML) {
    sanitized = DOMPurify.sanitize(sanitized, DOMPURIFY_CONFIG);
  }
  
  return sanitized;
};

/**
 * Sanitizar objeto recursivamente
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || typeof obj !== 'object') {
    return sanitizeString(obj, options);
  }
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value, options);
  }
  
  return sanitized;
};

// Middlewares
export const mongoSanitization = mongoSanitize();
export const xssClean = xss();
export const sanitizeAll = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};
```

### 10.6 Security Headers

#### Configuración de Helmet
```javascript
/**
 * Configuración avanzada de security headers
 */
import helmet from 'helmet';

export const advancedSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.cermont.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  });
};

export const permissionsPolicy = () => {
  return helmet({
    crossOriginEmbedderPolicy: false,
    permissionsPolicy: {
      policies: {
        "camera=()": [],
        "microphone=()": [],
        "geolocation=()": [],
        "payment=()": []
      }
    }
  });
};
```

### 10.7 CORS

#### Configuración de CORS
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'https://cermont.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));
```

### 10.8 Auditoría

#### Sistema de Auditoría Completo
```javascript
/**
 * Modelo de registro de auditoría
 */
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !['LOGIN_FAILED', 'TOKEN_REVOKED'].includes(this.action);
    },
    index: true
  },
  
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'TOKEN_REVOKED',
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'PASSWORD_CHANGE', 'PASSWORD_RESET', 'ROLE_CHANGE',
      'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY',
      'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD',
      'EXPORT_DATA', 'IMPORT_DATA'
    ],
    index: true
  },

  resource: {
    type: String,
    required: true,
    enum: ['User', 'Order', 'WorkPlan', 'ToolKit', 'Report', 'Evidence', 'Auth', 'System'],
    index: true
  },
  
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  ipAddress: {
    type: String,
    index: true
  },
  
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'DENIED'],
    default: 'SUCCESS',
    index: true
  },
  
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice TTL para auto-eliminación después de 1 año
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
```

### 10.9 HTTPS/SSL

#### Configuración de Certificados
```javascript
/**
 * Configuración SSL para desarrollo y producción
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSSLConfig = () => {
  const sslEnabled = process.env.SSL_ENABLED === 'true';
  
  if (!sslEnabled) {
    return null;
  }

  const sslDir = path.join(process.cwd(), 'ssl');
  
  // En producción, buscar certificados Let's Encrypt
  if (process.env.NODE_ENV === 'production') {
    const certPath = path.join(sslDir, 'fullchain.pem');
    const keyPath = path.join(sslDir, 'privkey.pem');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
    }
    
    throw new Error('Certificados SSL no encontrados en producción');
  }
  
  // En desarrollo, generar certificados auto-firmados
  const devCertPath = path.join(sslDir, 'dev-cert.pem');
  const devKeyPath = path.join(sslDir, 'dev-key.pem');
  
  if (fs.existsSync(devCertPath) && fs.existsSync(devKeyPath)) {
    return {
      cert: fs.readFileSync(devCertPath),
      key: fs.readFileSync(devKeyPath),
      passphrase: 'cermont2025'
    };
  }
  
  throw new Error('Certificados de desarrollo no encontrados. Ejecuta: npm run generate-cert');
};
```

### 10.10 Mejores Prácticas

#### Checklist de Seguridad
- ✅ **Autenticación JWT** con refresh token rotation
- ✅ **Token blacklist** para revocación inmediata
- ✅ **Hashing Argon2** para contraseñas
- ✅ **Rate limiting** inteligente con whitelist/blacklist
- ✅ **Sanitización completa** de inputs (XSS/NoSQL injection)
- ✅ **Security headers** avanzados (CSP, HSTS, etc.)
- ✅ **CORS configurado** correctamente
- ✅ **Auditoría completa** de todas las operaciones
- ✅ **HTTPS obligatorio** en producción
- ✅ **Validación de datos** en todas las capas
- ✅ **Logging seguro** sin exposición de datos sensibles
- ✅ **Gestión de sesiones** con expiración automática
- ✅ **Protección brute force** con bloqueo temporal
- ✅ **Validación de roles** jerárquica (RBAC)

#### OWASP Top 10 Protecciones
1. **Injection** - Sanitización MongoDB + validación Joi
2. **Broken Authentication** - JWT seguro + blacklist
3. **Sensitive Data Exposure** - HTTPS + encriptación
4. **XML External Entities** - No aplica (JSON API)
5. **Broken Access Control** - RBAC jerárquico
6. **Security Misconfiguration** - Configuración segura por defecto
7. **Cross-Site Scripting** - Sanitización + CSP
8. **Insecure Deserialization** - No aplica (JSON)
9. **Vulnerable Components** - Dependencias actualizadas
10. **Insufficient Logging** - Logging completo + auditoría

---

**FIN DE LA PARTE 1**

*Esta primera parte cubre la arquitectura completa, modelos de datos, servicios, controladores, middleware, rutas y sistema de seguridad del backend CERMONT ATG. La Parte 2 continuará con performance, testing, logging, base de datos, documentación API, despliegue, mantenimiento y troubleshooting.*
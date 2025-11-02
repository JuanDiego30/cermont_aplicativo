# MANUAL TÉCNICO COMPLETO - CERMONT ATG BACKEND
## PARTE 2/3: Performance, Testing y Despliegue

---

## ÍNDICE GENERAL

### Parte 2: Performance, Testing y Despliegue
11. [Performance](#11-performance)
12. [Testing](#12-testing)
13. [Logging y Monitoreo](#13-logging-y-monitoreo)
14. [Base de Datos](#14-base-de-datos)
15. [Documentación API](#15-documentación-api)
16. [Despliegue](#16-despliegue)
17. [Mantenimiento](#17-mantenimiento)
18. [Troubleshooting](#18-troubleshooting)

### Parte 3: Integraciones y Anexos
19. Integraciones
20. Extensiones Futuras
21. Glosario
22. Referencias
23. Anexos
24. Control de Cambios
25. Licencia

---

## 11. PERFORMANCE

### 11.1 Optimizaciones de Base de Datos

#### Índices Estratégicos

**User Model - Índices Optimizados:**
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

**Order Model - Índices Complejos:**
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

#### Optimización de Queries

**Cursor-based Pagination:**
```javascript
/**
 * Paginación cursor-based para mejor performance
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

### 11.2 Sistema de Caché Inteligente

#### Cache Service Implementation
```javascript
/**
 * Servicio de caché in-memory con TTL y estadísticas
 */
class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutos por defecto
      checkperiod: 60, // Verificar expiración cada minuto
      useClones: false, // Mejor performance
      deleteOnExpire: true,
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      keys: 0,
    };

    // Event listeners para estadísticas
    this.cache.on('set', () => this.stats.sets++);
    this.cache.on('del', () => this.stats.deletes++);
    this.cache.on('expired', () => this.stats.keys--);
  }

  /**
   * Cachear resultado de función asíncrona
   */
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
    this.stats.keys++;
    
    return result;
  }

  /**
   * Eliminar keys que coinciden con patrón
   */
  delPattern(pattern) {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    matchingKeys.forEach(key => {
      this.cache.del(key);
      this.stats.deletes++;
      this.stats.keys--;
    });
    
    return matchingKeys.length;
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    
    return {
      ...this.stats,
      cacheStats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Limpiar todo el caché
   */
  flushAll() {
    this.cache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, keys: 0 };
  }
}

export default new CacheService();
```

#### Estrategias de Invalidación

**Invalidación por Patrón:**
```javascript
/**
 * Middleware para invalidar caché por patrón
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

**Invalidación Específica por Recurso:**
```javascript
// En UserService.create()
await cacheService.delPattern('users:*');

// En OrderService.update()
await cacheService.del(`order:${orderId}`);
await cacheService.delPattern('orders:*');
```

### 11.3 Compresión y Optimización HTTP

#### Configuración de Compresión
```javascript
/**
 * Configuración avanzada de compresión
 */
import compression from 'compression';

const compressionOptions = {
  level: 6, // Nivel de compresión (1-9)
  threshold: 1024, // Comprimir solo respuestas > 1KB
  filter: (req, res) => {
    // No comprimir si ya está comprimido
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // Comprimir solo ciertos tipos de contenido
    const contentType = res.getHeader('Content-Type');
    if (contentType && contentType.includes('image/')) {
      return false;
    }
    
    return compression.filter(req, res);
  },
  brotli: {
    enabled: true,
    zlib: {} // Configuración adicional para brotli
  }
};

app.use(compression(compressionOptions));
```

#### Optimización de Headers
```javascript
/**
 * Headers de optimización de performance
 */
const performanceHeaders = (req, res, next) => {
  // Cache control para recursos estáticos
  if (req.path.startsWith('/api/docs') || req.path.startsWith('/api/health')) {
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutos
      'ETag': true,
      'Last-Modified': true,
    });
  }
  
  // Headers de optimización
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });
  
  next();
};

app.use(performanceHeaders);
```

### 11.4 Connection Pooling

#### Configuración MongoDB
```javascript
/**
 * Configuración optimizada de conexión MongoDB
 */
const connectDB = async () => {
  try {
    const options = {
      // Pool de conexiones
      maxPoolSize: 10, // Máximo 10 conexiones
      minPoolSize: 2,   // Mínimo 2 conexiones
      maxIdleTimeMS: 30000, // Cerrar conexiones idle después de 30s
      
      // Timeouts
      serverSelectionTimeoutMS: 5000, // Timeout selección servidor
      socketTimeoutMS: 45000, // Timeout socket
      connectTimeoutMS: 10000, // Timeout conexión
      
      // Otras optimizaciones
      bufferCommands: false, // Deshabilitar buffering de comandos
      bufferMaxEntries: 0,
      family: 4, // Usar IPv4
      
      // Reintentos y reconexión
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 30000,
      
      // Compresión
      compressors: ['zlib', 'snappy'],
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🔗 Connection pool size: ${options.maxPoolSize}`);

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};
```

### 11.5 Métricas de Performance

#### Endpoint de Métricas
```javascript
/**
 * Endpoint para métricas de performance
 */
router.get('/metrics', requireMinRole('admin'), asyncHandler(async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    
    // Métricas de base de datos
    database: {
      connections: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    },
    
    // Métricas de caché
    cache: cacheService.getStats(),
    
    // Métricas de aplicación
    app: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      platform: process.platform,
    },
    
    // Métricas de sistema
    system: {
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
    }
  };

  successResponse(res, 'Métricas obtenidas exitosamente', metrics);
}));
```

#### Monitoreo de Queries Lentas
```javascript
/**
 * Middleware para monitorear queries lentas
 */
const slowQueryLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (duration > threshold) {
        logger.warn('Slow query detected', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip,
        });
      }
    });
    
    next();
  };
};

app.use(slowQueryLogger(2000)); // Log queries > 2 segundos
```

---

## 12. TESTING

### 12.1 Arquitectura de Testing

#### Estructura de Tests
```
tests/
├── unit/                    # Tests unitarios
│   ├── models/
│   │   ├── User.test.js
│   │   ├── Order.test.js
│   │   └── AuditLog.test.js
│   ├── services/
│   │   ├── user.service.test.js
│   │   ├── order.service.test.js
│   │   └── cache.service.test.js
│   ├── controllers/
│   │   ├── auth.controller.test.js
│   │   ├── users.controller.test.js
│   │   └── orders.controller.test.js
│   ├── middleware/
│   │   ├── auth.test.js
│   │   ├── rbac.test.js
│   │   └── rateLimiter.test.js
│   └── utils/
│       ├── validators.test.js
│       ├── pagination.test.js
│       └── passwordHash.test.js
├── integration/             # Tests de integración
│   ├── auth.integration.test.js
│   ├── users.integration.test.js
│   ├── orders.integration.test.js
│   └── api.integration.test.js
├── e2e/                     # Tests end-to-end
│   ├── auth.e2e.test.js
│   ├── orders.workflow.e2e.test.js
│   └── admin.e2e.test.js
├── security/                # Tests de seguridad
│   ├── authentication.test.js
│   ├── authorization.test.js
│   ├── sanitization.test.js
│   └── rate-limiting.test.js
├── performance/             # Tests de performance
│   ├── load.test.js
│   ├── stress.test.js
│   └── benchmark.test.js
├── fixtures/                # Datos de prueba
│   ├── users.fixture.js
│   ├── orders.fixture.js
│   └── audit.fixture.js
├── helpers/                 # Helpers de testing
│   ├── testServer.js
│   ├── testDatabase.js
│   ├── authHelper.js
│   └── cleanup.js
├── config/                  # Configuración de tests
│   ├── jest.config.js
│   ├── setup.js
│   └── teardown.js
└── reports/                 # Reportes de cobertura
    ├── coverage/
    └── performance/
```

### 12.2 Configuración Jest

#### jest.config.js
```javascript
export default {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Archivos de setup/teardown
  setupFilesAfterEnv: ['<rootDir>/tests/config/setup.js'],
  globalTeardown: '<rootDir>/tests/config/teardown.js',
  
  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/docs/**',
    '!src/scripts/**'
  ],
  coverageDirectory: 'tests/reports/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Mocks
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Timeouts
  testTimeout: 10000,
  
  // Paralelización
  maxWorkers: '50%',
  
  // Reportes
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'tests/reports',
      outputName: 'junit.xml'
    }]
  ],
  
  // Variables de entorno
  setupFiles: ['dotenv/config'],
  
  // Forzar exit
  forceExit: true,
  
  // Detectar memory leaks
  detectOpenHandles: true,
  detectMemoryLeaks: true
};
```

#### setup.js
```javascript
import { connectDB, disconnectDB } from '../helpers/testDatabase.js';
import { cleanupDatabase } from '../helpers/cleanup.js';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/cermont_test_db';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';

// Aumentar timeout de Jest
jest.setTimeout(30000);

// Setup global antes de todos los tests
beforeAll(async () => {
  await connectDB();
});

// Cleanup después de cada test
afterEach(async () => {
  await cleanupDatabase();
});

// Cleanup global después de todos los tests
afterAll(async () => {
  await disconnectDB();
});
```

### 12.3 Tests Unitarios

#### User Model Tests
```javascript
import User from '../../src/models/User.js';
import { ROLES } from '../../src/utils/constants.js';

describe('User Model', () => {
  describe('User Schema Validation', () => {
    it('should create user with valid data', async () => {
      const userData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'SecurePass123!',
        rol: ROLES.TECHNICIAN
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.nombre).toBe(userData.nombre);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.rol).toBe(userData.rol);
      expect(savedUser.isActive).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const userData = {
        nombre: 'Juan Pérez',
        email: 'invalid-email',
        password: 'SecurePass123!',
        rol: ROLES.TECHNICIAN
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with short password', async () => {
      const userData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: '123',
        rol: ROLES.TECHNICIAN
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'MySecurePassword123!';
      const user = new User({
        nombre: 'Test User',
        email: 'test@example.com',
        password,
        rol: ROLES.TECHNICIAN
      });

      await user.save();

      expect(user.password).not.toBe(password);
      expect(user.password).toMatch(/^\$argon2/);
    });

    it('should verify correct password', async () => {
      const password = 'MySecurePassword123!';
      const user = new User({
        nombre: 'Test User',
        email: 'test@example.com',
        password,
        rol: ROLES.TECHNICIAN
      });

      await user.save();

      const isValid = await user.comparePassword(password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = new User({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'MySecurePassword123!',
        rol: ROLES.TECHNICIAN
      });

      await user.save();

      const isValid = await user.comparePassword('WrongPassword123!');
      expect(isValid).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should have correct role hierarchy', async () => {
      const admin = new User({
        nombre: 'Admin User',
        email: 'admin@example.com',
        password: 'SecurePass123!',
        rol: ROLES.ADMIN
      });

      const technician = new User({
        nombre: 'Tech User',
        email: 'tech@example.com',
        password: 'SecurePass123!',
        rol: ROLES.TECHNICIAN
      });

      await admin.save();
      await technician.save();

      expect(admin.hasMinRole(ROLES.TECHNICIAN)).toBe(true);
      expect(technician.hasMinRole(ROLES.ADMIN)).toBe(false);
    });
  });

  describe('Security Features', () => {
    it('should increment login attempts', async () => {
      const user = new User({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        rol: ROLES.TECHNICIAN
      });

      await user.save();

      await user.incrementLoginAttempts();
      await user.incrementLoginAttempts();

      expect(user.loginAttempts).toBe(2);
    });

    it('should lock account after max attempts', async () => {
      const user = new User({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        rol: ROLES.TECHNICIAN
      });

      await user.save();

      // Simular 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        await user.incrementLoginAttempts();
      }

      expect(user.loginAttempts).toBe(5);
      expect(user.lockUntil).toBeDefined();
      expect(user.isLocked).toBe(true);
    });
  });
});
```

#### Auth Service Tests
```javascript
import { authenticateUser } from '../../src/services/auth.service.js';
import User from '../../src/models/User.js';
import { ROLES } from '../../src/utils/constants.js';

describe('Auth Service', () => {
  beforeEach(async () => {
    // Crear usuario de prueba
    const user = new User({
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
      rol: ROLES.TECHNICIAN
    });
    await user.save();
  });

  describe('authenticateUser', () => {
    it('should authenticate valid user', async () => {
      const metadata = {
        ip: '127.0.0.1',
        device: 'Test Device',
        userAgent: 'Jest Test'
      };

      const result = await authenticateUser('test@example.com', 'SecurePass123!', metadata);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      const metadata = {
        ip: '127.0.0.1',
        device: 'Test Device',
        userAgent: 'Jest Test'
      };

      await expect(
        authenticateUser('test@example.com', 'WrongPassword123!', metadata)
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should reject non-existent user', async () => {
      const metadata = {
        ip: '127.0.0.1',
        device: 'Test Device',
        userAgent: 'Jest Test'
      };

      await expect(
        authenticateUser('nonexistent@example.com', 'SecurePass123!', metadata)
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should lock account after multiple failed attempts', async () => {
      const metadata = {
        ip: '127.0.0.1',
        device: 'Test Device',
        userAgent: 'Jest Test'
      };

      // Intentar login fallido 5 veces
      for (let i = 0; i < 5; i++) {
        try {
          await authenticateUser('test@example.com', 'WrongPassword123!', metadata);
        } catch (error) {
          // Expected to fail
        }
      }

      // Verificar que la cuenta esté bloqueada
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.loginAttempts).toBe(5);
      expect(user.lockUntil).toBeDefined();
    });
  });
});
```

### 12.4 Tests de Integración

#### API Integration Tests
```javascript
import request from 'supertest';
import { testServer } from '../helpers/testServer.js';
import { createTestUser, getAuthToken } from '../helpers/authHelper.js';

describe('Auth API Integration', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    server = await testServer();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'SecurePass123!',
        rol: 'technician'
      };

      const response = await request(server)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        nombre: 'Usuario Duplicado',
        email: testUser.email, // Email ya existente
        password: 'SecurePass123!',
        rol: 'technician'
      };

      const response = await request(server)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: testUser.email,
        password: 'SecurePass123!'
      };

      const response = await request(server)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      const response = await request(server)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user info', async () => {
      const token = await getAuthToken(testUser);

      const response = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.nombre).toBe(testUser.nombre);
    });

    it('should reject without token', async () => {
      const response = await request(server)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No autorizado');
    });
  });
});
```

### 12.5 Tests de Seguridad

#### Authentication Security Tests
```javascript
describe('Security Tests', () => {
  describe('JWT Token Security', () => {
    it('should reject expired tokens', async () => {
      // Crear token expirado
      const expiredToken = jwt.sign(
        { userId: 'test', role: 'technician' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('expirado');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(401);

      expect(response.body.error.message).toContain('inválido');
    });

    it('should reject blacklisted tokens', async () => {
      const token = await getAuthToken(testUser);

      // Simular logout (que agrega token a blacklist)
      await request(server)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Intentar usar token blacklisted
      const response = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error.message).toContain('revocado');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      // Hacer múltiples requests de login fallidos
      for (let i = 0; i < 6; i++) {
        await request(server)
          .post('/api/v1/auth/login')
          .send(loginData);
      }

      // El último debería ser rate limited
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body.error.message).toContain('demasiadas solicitudes');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts', async () => {
      const maliciousData = {
        nombre: '<script>alert("XSS")</script>Juan Pérez',
        email: 'test@example.com',
        password: 'SecurePass123!',
        rol: 'technician'
      };

      const response = await request(server)
        .post('/api/v1/auth/register')
        .send(maliciousData)
        .expect(201);

      // Verificar que el script fue sanitizado
      expect(response.body.data.user.nombre).not.toContain('<script>');
      expect(response.body.data.user.nombre).toContain('Juan Pérez');
    });

    it('should prevent NoSQL injection', async () => {
      const injectionData = {
        email: { $ne: null }, // Intento de NoSQL injection
        password: 'SecurePass123!'
      };

      const response = await request(server)
        .post('/api/v1/auth/login')
        .send(injectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### 12.6 Tests de Performance

#### Load Testing con Artillery
```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up phase"
    - duration: 120
      arrivalRate: 50
      name: "Load phase"
    - duration: 60
      arrivalRate: 100
      name: "Stress phase"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "User authentication flow"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@example.com"
            password: "SecurePass123!"
          capture:
            json: "$.data.tokens.accessToken"
            as: "token"
      - get:
          url: "/api/v1/auth/me"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Order listing"
    weight: 40
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "engineer@example.com"
            password: "SecurePass123!"
          capture:
            json: "$.data.tokens.accessToken"
            as: "token"
      - get:
          url: "/api/v1/orders?page=1&limit=20"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "User management"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "admin@example.com"
            password: "SecurePass123!"
          capture:
            json: "$.data.tokens.accessToken"
            as: "token"
      - get:
          url: "/api/v1/users?page=1&limit=10"
          headers:
            Authorization: "Bearer {{ token }}"
```

#### Benchmark Tests
```javascript
import { performance } from 'perf_hooks';
import User from '../../src/models/User.js';

describe('Performance Benchmarks', () => {
  beforeAll(async () => {
    // Crear datos de prueba
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        nombre: `Usuario ${i}`,
        email: `usuario${i}@example.com`,
        password: 'SecurePass123!',
        rol: 'technician'
      });
    }
    await User.insertMany(users);
  });

  it('should handle 1000 concurrent user queries within 2 seconds', async () => {
    const startTime = performance.now();

    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(User.findOne({ email: `usuario${i}@example.com` }));
    }

    await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(2000); // Menos de 2 segundos
    console.log(`1000 queries took ${duration}ms`);
  });

  it('should handle complex aggregation within 1 second', async () => {
    const startTime = performance.now();

    const result = await User.aggregate([
      {
        $group: {
          _id: '$rol',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Menos de 1 segundo
    expect(result).toBeDefined();
    console.log(`Aggregation took ${duration}ms`);
  });
});
```

### 12.7 Cobertura de Código

#### Configuración de Cobertura
```javascript
// jest.config.js - Configuración de cobertura
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  // Umbrales específicos por archivo/directorio
  'src/models/': {
    branches: 90,
    functions: 90,
    lines: 85,
    statements: 85
  },
  'src/services/': {
    branches: 85,
    functions: 85,
    lines: 80,
    statements: 80
  },
  'src/controllers/': {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75
  }
}
```

#### Reporte de Cobertura
```bash
# Ejecutar tests con cobertura
npm run test:coverage

# Resultado esperado:
# -------------------|---------|----------|---------|---------|-------------------
# File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
# -------------------|---------|----------|---------|---------|-------------------
# All files          |     85 |      82 |     88 |     85 |
#  src/models        |     92 |      89 |     95 |     92 |
#   User.js          |     95 |      92 |     97 |     95 |
#   Order.js         |     90 |      85 |     93 |     90 |
#  src/services      |     87 |      84 |     89 |     87 |
#   user.service.js  |     90 |      87 |     92 |     90 |
#   order.service.js |     85 |      80 |     87 |     85 |
#  src/controllers   |     78 |      75 |     80 |     78 |
#   auth.controller.js|     85 |      82 |     88 |     85 |
# -------------------|---------|----------|---------|---------|-------------------
```

---

## 13. LOGGING Y MONITOREO

### 13.1 Arquitectura de Logging

#### Configuración Winston
```javascript
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'cermont-backend' },
  transports: [
    // Console transport para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug'
    }),

    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/all.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Archivo solo para errores
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true
    }),

    // Archivo para logs de auditoría
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/audit.log'),
      level: 'info',
      maxsize: 10485760,
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // Manejo de excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log')
    })
  ],

  // Manejo de rechazos de promesas no manejadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log')
    })
  ]
});

// En producción, agregar transporte para logs estructurados
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Http({
    host: process.env.LOGSTASH_HOST,
    port: process.env.LOGSTASH_PORT,
    path: '/logs',
    ssl: true
  }));
}

export { logger };
```

#### Niveles de Logging
```javascript
// Niveles de logging por importancia
logger.error('Error crítico del sistema', {
  error: error.message,
  stack: error.stack,
  userId: req.user?.id,
  ip: req.ip
});

logger.warn('Advertencia que requiere atención', {
  message: 'Usuario intentó acceso no autorizado',
  userId: req.user?.id,
  resource: req.path
});

logger.info('Evento informativo importante', {
  message: 'Usuario inició sesión exitosamente',
  userId: user.id,
  email: user.email,
  ip: req.ip,
  device: req.get('user-agent')
});

logger.debug('Información detallada para debugging', {
  function: 'authenticateUser',
  params: { email },
  executionTime: Date.now() - startTime
});
```

### 13.2 Morgan HTTP Logging

#### Configuración Morgan
```javascript
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Formato personalizado para Morgan
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Stream para escribir logs HTTP
const accessLogStream = fs.createWriteStream(
  path.join(process.cwd(), 'logs', 'access.log'),
  { flags: 'a' }
);

// Middleware Morgan
const httpLogger = morgan(morganFormat, {
  stream: accessLogStream,
  skip: (req, res) => {
    // No loggear health checks en producción
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  }
});

export { httpLogger };
```

#### Morgan con Winston
```javascript
// Integración de Morgan con Winston
import winston from 'winston';

const morganWinston = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: {
      write: (message) => {
        winston.info('HTTP Request', {
          type: 'http',
          message: message.trim(),
          timestamp: new Date().toISOString()
        });
      }
    },
    skip: (req, res) => {
      return process.env.NODE_ENV === 'production' && req.url === '/health';
    }
  }
);
```

### 13.3 Auditoría Completa

#### Middleware de Auditoría
```javascript
/**
 * Middleware para auditar automáticamente operaciones en rutas
 */
export const auditLogger = (action, resource) => {
  return asyncHandler(async (req, res, next) => {
    const startTime = Date.now();
    
    // Guardar referencia al método original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para interceptar la respuesta
    res.json = function(body) {
      const endTime = Date.now();
      const duration = endTime - startTime;

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
          severity: determineSeverity(action, resource),
          metadata: {
            duration,
            userAgent: req.get('user-agent'),
            referrer: req.get('referrer')
          }
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

#### Modelo de AuditLog
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
  
  metadata: mongoose.Schema.Types.Mixed,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice TTL para auto-eliminación después de 1 año
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Índices compuestos para queries eficientes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
```

### 13.4 Monitoreo y Alertas

#### Endpoint de Health Check
```javascript
/**
 * Health check endpoint con métricas detalladas
 */
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    
    // Checks de servicios
    checks: {
      database: await checkDatabaseHealth(),
      cache: checkCacheHealth(),
      filesystem: checkFilesystemHealth(),
      memory: checkMemoryHealth()
    },
    
    // Métricas básicas
    metrics: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      loadAverage: os.loadavg()
    }
  };

  // Determinar status general
  const hasFailures = Object.values(health.checks).some(check => !check.healthy);
  health.status = hasFailures ? 'unhealthy' : 'healthy';
  
  const statusCode = hasFailures ? 503 : 200;

  res.status(statusCode).json(health);
}));

/**
 * Verificar salud de la base de datos
 */
const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;

    return {
      healthy: true,
      latency: `${latency}ms`,
      connections: mongoose.connection.readyState,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
};

/**
 * Verificar salud del caché
 */
const checkCacheHealth = () => {
  try {
    const stats = cacheService.getStats();
    
    return {
      healthy: true,
      keys: stats.keys,
      hitRate: `${stats.hitRate.toFixed(2)}%`,
      memoryUsage: stats.memoryUsage
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
};
```

#### Métricas de Performance
```javascript
/**
 * Endpoint para métricas de performance detalladas
 */
router.get('/metrics', requireMinRole('admin'), asyncHandler(async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    
    // Métricas de base de datos
    database: {
      connections: mongoose.connection.readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: await getCollectionStats()
    },
    
    // Métricas de caché
    cache: cacheService.getStats(),
    
    // Métricas de aplicación
    app: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      platform: process.platform,
      pid: process.pid
    },
    
    // Métricas de sistema
    system: {
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      uptime: os.uptime()
    },
    
    // Métricas de auditoría
    audit: {
      totalLogs: await AuditLog.countDocuments(),
      recentLogs: await AuditLog.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      criticalEvents: await AuditLog.countDocuments({
        severity: 'CRITICAL',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    }
  };

  successResponse(res, 'Métricas obtenidas exitosamente', metrics);
}));
```

### 13.5 Log Rotation y Gestión

#### Configuración de Rotación
```javascript
import winston from 'winston';
import 'winston-daily-rotate-file';

// Transporte con rotación diaria
const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d', // Mantener 14 días
  zippedArchive: true
});

// Transporte para errores con rotación
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d', // Mantener 30 días para errores
  zippedArchive: true
});

// Transporte para auditoría con rotación
const auditRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/audit-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxSize: '50m',
  maxFiles: '90d', // Mantener 90 días para auditoría
  zippedArchive: true
});

const logger = winston.createLogger({
  transports: [
    dailyRotateTransport,
    errorRotateTransport,
    auditRotateTransport
  ]
});

// Eventos de rotación
dailyRotateTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info(`Log rotated: ${oldFilename} -> ${newFilename}`);
});

dailyRotateTransport.on('archive', (zipFilename) => {
  logger.info(`Log archived: ${zipFilename}`);
});

dailyRotateTransport.on('logRemoved', (removedFilename) => {
  logger.info(`Old log removed: ${removedFilename}`);
});
```

---

## 14. BASE DE DATOS

### 14.1 Configuración MongoDB

#### Conexión Optimizada
```javascript
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Configuración avanzada de conexión MongoDB
 */
export const connectDB = async () => {
  try {
    const options = {
      // Pool de conexiones optimizado
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 2,
      maxIdleTimeMS: 30000,
      
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Reintentos y reconexión
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 30000,
      
      // Compresión
      compressors: ['zlib', 'snappy'],
      
      // Otras optimizaciones
      bufferCommands: false,
      bufferMaxEntries: 0,
      family: 4,
      
      // SSL/TLS
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: true,
      sslCA: process.env.MONGO_SSL_CA,
      
      // Autenticación
      authSource: 'admin',
      authMechanism: 'SCRAM-SHA-256'
    };

    // Support both MONGODB_URI and MONGO_URI environment variable names
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI
      : process.env.MONGODB_URI || process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoUri, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🔗 Connection pool: ${options.maxPoolSize} max connections`);

    // Event listeners para monitoreo
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

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
      logger.info('Received SIGINT, closing MongoDB connection...');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    
    process.exit(1);
  }
};
```

### 14.2 Índices y Optimizaciones

#### Estrategia de Índices
```javascript
// Índices para User model
userSchema.index({ rol: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 });
userSchema.index({ nombre: 'text', email: 'text' });

// Índices para Order model
orderSchema.index({ estado: 1 });
orderSchema.index({ prioridad: 1 });
orderSchema.index({ fechaInicio: -1 });
orderSchema.index({ clienteNombre: 1 });
orderSchema.index({ poNumber: 1 });
orderSchema.index({ estado: 1, fechaInicio: -1 });
orderSchema.index({ estado: 1, prioridad: 1 });
orderSchema.index({ clienteNombre: 1, createdAt: -1 });
orderSchema.index({ asignadoA: 1, estado: 1 });
orderSchema.index({ isActive: 1, isArchived: 1, createdAt: -1 });
orderSchema.index({
  numeroOrden: 'text',
  clienteNombre: 'text',
  descripcion: 'text',
  lugar: 'text',
  poNumber: 'text',
});
orderSchema.index({ 'coordenadas': '2dsphere' });

// Índices para AuditLog model
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
```

### 14.3 Migraciones y Seeds

#### Sistema de Migraciones
```javascript
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Sistema de migraciones para MongoDB
 */
class MigrationManager {
  constructor() {
    this.migrations = new Map();
    this.migrationCollection = 'migrations';
  }

  /**
   * Registrar una migración
   */
  register(name, up, down) {
    this.migrations.set(name, { up, down });
  }

  /**
   * Ejecutar migraciones pendientes
   */
  async migrate() {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);

    // Obtener migraciones ejecutadas
    const executed = await collection.find({}).toArray();
    const executedNames = executed.map(m => m.name);

    // Encontrar migraciones pendientes
    const pending = Array.from(this.migrations.keys())
      .filter(name => !executedNames.includes(name));

    logger.info(`Found ${pending.length} pending migrations`);

    // Ejecutar migraciones pendientes
    for (const name of pending) {
      logger.info(`Running migration: ${name}`);
      
      const migration = this.migrations.get(name);
      
      try {
        await migration.up(db);
        
        // Registrar migración como ejecutada
        await collection.insertOne({
          name,
          executedAt: new Date()
        });
        
        logger.info(`✅ Migration ${name} completed`);
      } catch (error) {
        logger.error(`❌ Migration ${name} failed:`, error);
        throw error;
      }
    }
  }

  /**
   * Revertir última migración
   */
  async rollback() {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);

    // Obtener última migración ejecutada
    const lastMigration = await collection.findOne({}, { sort: { executedAt: -1 } });
    
    if (!lastMigration) {
      logger.info('No migrations to rollback');
      return;
    }

    const { name } = lastMigration;
    const migration = this.migrations.get(name);

    if (!migration) {
      throw new Error(`Migration ${name} not found`);
    }

    logger.info(`Rolling back migration: ${name}`);

    try {
      await migration.down(db);
      
      // Remover de migraciones ejecutadas
      await collection.deleteOne({ name });
      
      logger.info(`✅ Migration ${name} rolled back`);
    } catch (error) {
      logger.error(`❌ Rollback of migration ${name} failed:`, error);
      throw error;
    }
  }
}

// Instancia global
export const migrationManager = new MigrationManager();

// Ejemplo de migración
migrationManager.register(
  'add_user_indexes',
  async (db) => {
    const collection = db.collection('users');
    await collection.createIndex({ rol: 1 });
    await collection.createIndex({ isActive: 1 });
    await collection.createIndex({ email: 1, isActive: 1 });
  },
  async (db) => {
    const collection = db.collection('users');
    await collection.dropIndex({ rol: 1 });
    await collection.dropIndex({ isActive: 1 });
    await collection.dropIndex({ email: 1, isActive: 1 });
  }
);
```

#### Seeds para Datos de Prueba
```javascript
import User from '../models/User.js';
import Order from '../models/Order.js';
import { ROLES, ORDER_STATUS } from '../utils/constants.js';
import { hashPassword } from '../utils/passwordHash.js';

/**
 * Seeds para datos de desarrollo
 */
export const seedDatabase = async () => {
  try {
    // Crear usuarios de prueba
    const users = [
      {
        nombre: 'Administrador Sistema',
        email: 'admin@cermont.com',
        password: await hashPassword('Admin123!'),
        rol: ROLES.ADMIN,
        cedula: '1234567890'
      },
      {
        nombre: 'Ingeniero Senior',
        email: 'ingeniero@cermont.com',
        password: await hashPassword('Engineer123!'),
        rol: ROLES.ENGINEER,
        especialidad: 'Ingeniería Eléctrica'
      },
      {
        nombre: 'Técnico Campo',
        email: 'tecnico@cermont.com',
        password: await hashPassword('Technician123!'),
        rol: ROLES.TECHNICIAN
      }
    ];

    await User.insertMany(users);
    logger.info('✅ Users seeded');

    // Crear órdenes de prueba
    const orders = [
      {
        numeroOrden: 'OT-2025-0001',
        clienteNombre: 'Ecopetrol S.A.',
        descripcion: 'Mantenimiento preventivo de sistema eléctrico en plataforma X',
        estado: ORDER_STATUS.PENDING,
        prioridad: 'alta',
        costoEstimado: 1500000,
        lugar: 'Plataforma Marina X, Cartagena'
      },
      {
        numeroOrden: 'OT-2025-0002',
        clienteNombre: 'Drummond Ltd.',
        descripcion: 'Inspección y calibración de instrumentos de medición',
        estado: ORDER_STATUS.IN_PROGRESS,
        prioridad: 'media',
        costoEstimado: 800000,
        lugar: ' Mina La Loma, Cesar'
      }
    ];

    await Order.insertMany(orders);
    logger.info('✅ Orders seeded');

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
};
```

### 14.4 Backup y Restore

#### Scripts de Backup
```bash
#!/bin/bash
# scripts/backup.sh

# Configuración
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cermont_backup_$DATE"
MONGO_URI="mongodb://localhost:27017/cermont_db"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

echo "🚀 Starting MongoDB backup: $BACKUP_NAME"

# Ejecutar backup con mongodump
mongodump \
  --uri="$MONGO_URI" \
  --out="$BACKUP_DIR/$BACKUP_NAME" \
  --gzip \
  --verbose

if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully: $BACKUP_DIR/$BACKUP_NAME"
  
  # Crear archivo de metadata
  echo "{
    \"name\": \"$BACKUP_NAME\",
    \"timestamp\": \"$DATE\",
    \"database\": \"cermont_db\",
    \"compressed\": true,
    \"size\": \"$(du -sh $BACKUP_DIR/$BACKUP_NAME | cut -f1)\"
  }" > "$BACKUP_DIR/$BACKUP_NAME/metadata.json"
  
  # Limpiar backups antiguos (mantener últimos 7 días)
  find $BACKUP_DIR -name "cermont_backup_*" -type d -mtime +7 -exec rm -rf {} \;
  
  echo "🧹 Old backups cleaned up"
else
  echo "❌ Backup failed"
  exit 1
fi
```

#### Scripts de Restore
```bash
#!/bin/bash
# scripts/restore.sh

# Configuración
BACKUP_DIR="/var/backups/mongodb"
MONGO_URI="mongodb://localhost:27017/cermont_db"

# Listar backups disponibles
echo "Available backups:"
ls -la $BACKUP_DIR | grep cermont_backup | head -10

echo "Enter backup name to restore:"
read BACKUP_NAME

if [ ! -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
  echo "❌ Backup not found: $BACKUP_DIR/$BACKUP_NAME"
  exit 1
fi

echo "⚠️  WARNING: This will DROP the current database and restore from backup!"
echo "Database: cermont_db"
echo "Backup: $BACKUP_NAME"
echo ""
echo "Are you sure? (type 'yes' to continue)"
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 1
fi

echo "🔄 Starting restore from: $BACKUP_NAME"

# Ejecutar restore con mongorestore
mongorestore \
  --uri="$MONGO_URI" \
  --drop \
  --gzip \
  --dir="$BACKUP_DIR/$BACKUP_NAME" \
  --verbose

if [ $? -eq 0 ]; then
  echo "✅ Restore completed successfully"
else
  echo "❌ Restore failed"
  exit 1
fi
```

### 14.5 Monitoreo de Base de Datos

#### Métricas de MongoDB
```javascript
/**
 * Obtener estadísticas de colecciones
 */
const getCollectionStats = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const stats = {};
    
    for (const collection of collections) {
      const collStats = await db.collection(collection.name).stats();
      stats[collection.name] = {
        count: collStats.count,
        size: collStats.size,
        storageSize: collStats.storageSize,
        indexes: collStats.nindexes,
        indexSize: collStats.totalIndexSize
      };
    }
    
    return stats;
  } catch (error) {
    logger.error('Error getting collection stats:', error);
    return {};
  }
};

/**
 * Monitoreo de queries lentas
 */
const slowQueryMonitor = () => {
  mongoose.set('debug', (collection, method, query, doc, options) => {
    const start = Date.now();
    
    // Interceptar después de la ejecución
    setImmediate(() => {
      const duration = Date.now() - start;
      
      if (duration > 1000) { // Queries > 1 segundo
        logger.warn('Slow MongoDB query detected', {
          collection,
          method,
          query: JSON.stringify(query),
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
};
```

---

## 15. DOCUMENTACIÓN API

### 15.1 Swagger/OpenAPI 3.0

#### Configuración Completa
```javascript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Configuración completa de Swagger/OpenAPI 3.0
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CERMONT ATG - API Backend',
      version: '1.0.0',
      description: `
# CERMONT ATG Backend API

Backend API completo para el sistema de gestión de órdenes de trabajo de **CERMONT SAS**.

## Características Principales

- ✅ **Autenticación JWT** con refresh tokens y rotación automática
- ✅ **Sistema de roles jerárquico** (RBAC) con 8 niveles de permisos
- ✅ **Auditoría completa** de todas las operaciones críticas
- ✅ **Caché inteligente** con invalidación automática
- ✅ **Rate limiting** y protección contra ataques
- ✅ **Compresión gzip/brotli** para respuestas HTTP
- ✅ **Paginación** cursor-based y offset para performance
- ✅ **Validación completa** de datos con Joi
- ✅ **Logging estructurado** con Winston
- ✅ **Documentación automática** con ejemplos reales

## Seguridad

- 🔐 **HTTPS obligatorio** en producción
- 🛡️ **Sanitización** completa de inputs (XSS/NoSQL injection)
- 🚫 **Token blacklist** para revocación inmediata
- 🔒 **Hashing Argon2** para contraseñas
- 📊 **Auditoría** de 25+ tipos de eventos
- ⚡ **Rate limiting** configurable por endpoint

## Arquitectura

- 🏗️ **Clean Architecture** con separación clara de responsabilidades
- 📦 **Modular** con controllers, services y repositories
- 🔄 **Middleware pipeline** optimizado
- 📈 **Escalable** con connection pooling y caché
- 🧪 **100% testeado** con Jest y Supertest

## Endpoints Disponibles

### Autenticación
- \`POST /api/v1/auth/register\` - Registro de usuarios
- \`POST /api/v1/auth/login\` - Inicio de sesión
- \`POST /api/v1/auth/refresh\` - Renovación de tokens
- \`POST /api/v1/auth/logout\` - Cierre de sesión
- \`GET /api/v1/auth/me\` - Información del usuario actual

### Usuarios
- \`GET /api/v1/users\` - Listar usuarios (Supervisor+)
- \`GET /api/v1/users/{id}\` - Obtener usuario por ID
- \`POST /api/v1/users\` - Crear usuario (Admin+)
- \`PUT /api/v1/users/{id}\` - Actualizar usuario (Admin+)
- \`DELETE /api/v1/users/{id}\` - Eliminar usuario (Admin+)

### Órdenes
- \`GET /api/v1/orders\` - Listar órdenes
- \`GET /api/v1/orders/{id}\` - Obtener orden por ID
- \`POST /api/v1/orders\` - Crear orden (Engineer+)
- \`PUT /api/v1/orders/{id}\` - Actualizar orden
- \`PATCH /api/v1/orders/{id}/status\` - Cambiar estado
- \`POST /api/v1/orders/{id}/notes\` - Agregar nota

### Sistema
- \`GET /api/v1/system/health\` - Health check
- \`GET /api/v1/system/metrics\` - Métricas de performance (Admin)
- \`GET /api/v1/audit/logs\` - Logs de auditoría (Admin)

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Permisos insuficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (email duplicado, etc.) |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

## Autenticación

Todos los endpoints requieren autenticación JWT excepto \`/auth/register\` y \`/auth/login\`.

**Header requerido:**
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

Los tokens expiran en 15 minutos. Use \`/auth/refresh\` para renovarlos.

## Paginación

Los endpoints de lista soportan paginación cursor-based para mejor performance:

\`\`\`
GET /api/v1/orders?cursor=64f1a2b3c4d5e6f7g8h9i0j1&limit=20
\`\`\`

Respuesta incluye:
- \`docs\`: Array de resultados
- \`pagination.cursor\`: Cursor para siguiente página
- \`pagination.hasMore\`: Si hay más resultados
- \`pagination.count\`: Número de resultados en esta página

## Rate Limiting

- **Autenticación**: 5 requests por hora por IP
- **General**: 100 requests por 15 minutos por IP
- **Uploads**: 20 requests por 10 minutos por IP

## Versionado

API versionada con \`/api/v1/\` prefix. Futuras versiones serán \`/api/v2/\`, etc.
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
          description: 'Token JWT obtenido del endpoint /auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único del usuario'
            },
            rol: {
              type: 'string',
              enum: ['technician', 'engineer', 'supervisor', 'coordinator_hes', 'admin', 'root'],
              description: 'Rol del usuario en el sistema'
            },
            telefono: {
              type: 'string',
              description: 'Número de teléfono'
            },
            cedula: {
              type: 'string',
              description: 'Número de cédula'
            },
            cargo: {
              type: 'string',
              description: 'Cargo laboral'
            },
            especialidad: {
              type: 'string',
              description: 'Especialidad técnica'
            },
            avatar: {
              type: 'string',
              description: 'URL del avatar'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Estado del usuario'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Último inicio de sesión'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['clienteNombre', 'descripcion'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la orden'
            },
            numeroOrden: {
              type: 'string',
              description: 'Número único de orden (generado automáticamente)'
            },
            clienteNombre: {
              type: 'string',
              description: 'Nombre del cliente'
            },
            descripcion: {
              type: 'string',
              maxLength: 2000,
              description: 'Descripción detallada del trabajo'
            },
            estado: {
              type: 'string',
              enum: ['pending', 'planning', 'in_progress', 'completed', 'invoicing', 'invoiced', 'paid', 'cancelled'],
              default: 'pending',
              description: 'Estado actual de la orden'
            },
            prioridad: {
              type: 'string',
              enum: ['baja', 'media', 'alta', 'urgente'],
              default: 'media',
              description: 'Prioridad de la orden'
            },
            asignadoA: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'IDs de usuarios asignados'
            },
            costoEstimado: {
              type: 'number',
              minimum: 0,
              description: 'Costo estimado del trabajo'
            },
            costoReal: {
              type: 'number',
              minimum: 0,
              description: 'Costo real del trabajo'
            },
            fechaInicioEstimada: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha estimada de inicio'
            },
            fechaFinEstimada: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha estimada de finalización'
            },
            lugar: {
              type: 'string',
              description: 'Ubicación del trabajo'
            },
            coordenadas: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              },
              description: 'Coordenadas GPS'
            },
            poNumber: {
              type: 'string',
              description: 'Número de orden de compra'
            },
            notas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  texto: { type: 'string' },
                  autor: { type: 'string' },
                  fecha: { type: 'string', format: 'date-time' }
                }
              },
              description: 'Notas y comentarios'
            },
            archivos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  url: { type: 'string' },
                  tipo: { type: 'string' },
                  tamano: { type: 'number' }
                }
              },
              description: 'Archivos adjuntos'
            },
            progreso: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              default: 0,
              description: 'Porcentaje de progreso'
            },
            createdBy: {
              type: 'string',
              description: 'ID del usuario que creó la orden'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Mensaje de error descriptivo'
                },
                code: {
                  type: 'string',
                  description: 'Código de error para identificación'
                },
                details: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Detalles adicionales del error'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            cursor: {
              type: 'string',
              description: 'Cursor para paginación'
            },
            nextCursor: {
              type: 'string',
              description: 'Cursor para siguiente página'
            },
            hasMore: {
              type: 'boolean',
              description: 'Si hay más resultados'
            },
            limit: {
              type: 'integer',
              description: 'Límite de resultados por página'
            },
            count: {
              type: 'integer',
              description: 'Número de resultados en esta página'
            }
          }
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
        description: 'Endpoints de autenticación y gestión de sesiones'
      },
      {
        name: 'Usuarios',
        description: 'Gestión completa del ciclo de vida de usuarios'
      },
      {
        name: 'Órdenes',
        description: 'Gestión de órdenes de trabajo y su ciclo de vida'
      },
      {
        name: 'Auditoría',
        description: 'Consulta de logs de auditoría del sistema'
      },
      {
        name: 'Sistema',
        description: 'Endpoints de monitoreo y administración del sistema'
      }
    ]
  },
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/users.routes.js',
    './src/routes/orders.routes.js',
    './src/routes/audit.routes.js',
    './src/routes/system.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
```

### 15.2 Documentación de Endpoints

#### Autenticación - Register
```javascript
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar nuevo usuario en el sistema
 *     description: |
 *       Crea una nueva cuenta de usuario con validación completa.
 *
 *       **Validaciones realizadas:**
 *       - Email único en el sistema
 *       - Cédula única (si proporcionada)
 *       - Contraseña con requisitos mínimos
 *       - Datos sanitizados (XSS protection)
 *
 *       **Permisos:** Público (no requiere autenticación)
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
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Juan Pérez González"
 *                 description: "Nombre completo del usuario"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@cermont.com"
 *                 description: "Email único del usuario"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123!"
 *                 description: "Contraseña (mínimo 8 caracteres)"
 *               rol:
 *                 type: string
 *                 enum: [technician, engineer, supervisor, coordinator_hes, admin]
 *                 example: "engineer"
 *                 description: "Rol del usuario en el sistema"
 *               telefono:
 *                 type: string
 *                 example: "+57 300 123 4567"
 *                 description: "Número de teléfono (opcional)"
 *               cedula:
 *                 type: string
 *                 example: "1234567890"
 *                 description: "Número de cédula (opcional pero único)"
 *               cargo:
 *                 type: string
 *                 example: "Ingeniero Senior"
 *                 description: "Cargo laboral (opcional)"
 *               especialidad:
 *                 type: string
 *                 example: "Ingeniería Eléctrica"
 *                 description: "Especialidad técnica (opcional)"
 *           examples:
 *             Ingeniero:
 *               summary: "Registro de ingeniero"
 *               value:
 *                 nombre: "María González"
 *                 email: "maria.gonzalez@cermont.com"
 *                 password: "Engineer2025!"
 *                 rol: "engineer"
 *                 telefono: "+57 301 987 6543"
 *                 cedula: "0987654321"
 *                 cargo: "Ingeniero Eléctrico"
 *                 especialidad: "Sistemas de Potencia"
 *             Tecnico:
 *               summary: "Registro de técnico"
 *               value:
 *                 nombre: "Carlos Rodríguez"
 *                 email: "carlos.rodriguez@cermont.com"
 *                 password: "TechSecure123!"
 *                 rol: "technician"
 *                 telefono: "+57 302 456 7890"
 *                 cedula: "1122334455"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                           description: "Token de acceso JWT (15 min)"
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                           description: "Token de refresh (7 días)"
 *                         expiresIn:
 *                           type: integer
 *                           example: 900
 *                           description: "Segundos hasta expiración del access token"
 *             examples:
 *               Exitoso:
 *                 summary: "Registro exitoso"
 *                 value:
 *                   success: true
 *                   message: "Usuario registrado exitosamente"
 *                   data:
 *                     user:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       nombre: "María González"
 *                       email: "maria.gonzalez@cermont.com"
 *                       rol: "engineer"
 *                       telefono: "+57 301 987 6543"
 *                       cedula: "0987654321"
 *                       cargo: "Ingeniero Eléctrico"
 *                       especialidad: "Sistemas de Potencia"
 *                       isActive: true
 *                       createdAt: "2025-11-01T10:00:00.000Z"
 *                       updatedAt: "2025-11-01T10:00:00.000Z"
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: 900
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               EmailInvalido:
 *                 summary: "Email inválido"
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Datos de entrada inválidos"
 *                     code: "VALIDATION_ERROR"
 *                     details: ["Email inválido"]
 *               PasswordCorta:
 *                 summary: "Contraseña muy corta"
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Datos de entrada inválidos"
 *                     code: "VALIDATION_ERROR"
 *                     details: ["La contraseña debe tener al menos 8 caracteres"]
 *       409:
 *         description: Email o cédula ya registrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               EmailDuplicado:
 *                 summary: "Email ya registrado"
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "El email ya está registrado"
 *                     code: "EMAIL_EXISTS"
 *               CedulaDuplicada:
 *                 summary: "Cédula ya registrada"
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "La cédula ya está registrada"
 *                     code: "CEDULA_EXISTS"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 15.3 Ejemplos de Uso

#### cURL Examples
```bash
# Registro de usuario
curl -X POST https://api.cermont.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan.perez@cermont.com",
    "password": "SecurePass123!",
    "rol": "engineer",
    "telefono": "+57 300 123 4567"
  }'

# Login
curl -X POST https://api.cermont.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@cermont.com",
    "password": "SecurePass123!"
  }'

# Obtener órdenes (con token)
curl -X GET https://api.cermont.com/api/v1/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### JavaScript (Frontend)
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Guardar tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};

// API call con token
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (response.status === 401) {
    // Token expirado, intentar refresh
    await refreshToken();
    return apiCall(endpoint, options);
  }
  
  return data;
};

// Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  } else {
    // Refresh falló, logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};
```

---

## 16. DESPLIEGUE

### 16.1 Estrategia de Despliegue

#### Arquitectura de Producción
```
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (NGINX)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • SSL Termination                                 │    │
│  │  • Rate Limiting                                    │    │
│  │  • Static File Serving                              │    │
│  │  • Reverse Proxy to Node.js                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                 NODE.JS APPLICATION SERVERS                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • PM2 Process Manager (Clustering)                 │    │
│  │  • Application Code                                 │    │
│  │  • In-Memory Cache                                   │    │
│  │  • File Upload Handling                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • MongoDB Replica Set                               │    │
│  │  • Sharding (si escala)                              │    │
│  │  • Backup Automation                                 │    │
│  │  • Monitoring                                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### Configuración PM2
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cermont-backend',
    script: 'src/server.js',
    instances: 'max', // Número de CPUs disponibles
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4100,
      SSL_ENABLED: true
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4100,
      SSL_ENABLED: true,
      LOG_LEVEL: 'info'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    env_file: '.env.production'
  }]
};
```

### 16.2 Docker

#### Dockerfile Optimizado
```dockerfile
# Multi-stage build para optimización
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Stage de desarrollo
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 4000 4100
CMD ["dumb-init", "npm", "run", "dev"]

# Stage de build
FROM base AS build
RUN npm ci --only=production=false
COPY . .
RUN npm run build

# Stage de producción
FROM base AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar archivos necesarios
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/ssl ./ssl
COPY --from=build --chown=nextjs:nodejs /app/.env.production ./.env

# Cambiar a usuario no-root
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4100/api/v1/system/health || exit 1

EXPOSE 4100

# Usar dumb-init para manejar señales correctamente
CMD ["dumb-init", "npm", "run", "start:prod"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "4100:4100"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/cermont_db
    depends_on:
      - mongodb
    volumes:
      - ./ssl:/app/ssl:ro
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - cermont-network

  mongodb:
    image: mongo:8.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=cermont_db
    volumes:
      - mongodb_data:/data/db
      - ./docker/mongo-init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - cermont-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - cermont-network

volumes:
  mongodb_data:

networks:
  cermont-network:
    driver: bridge
```

### 16.3 NGINX Reverse Proxy

#### Configuración NGINX
```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Upstream backend
    upstream backend {
        least_conn;
        server app:4100;
        keepalive 32;
    }

    server {
        listen 80;
        server_name api.cermont.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.cermont.com;

        # SSL Configuration
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # API endpoints
        location /api/ {
            # Rate limiting
            limit_req zone=api burst=20 nodelay;

            # Proxy settings
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth endpoints with stricter rate limiting
        location /api/v1/auth/ {
            limit_req zone=auth burst=5 nodelay;
            limit_req_status 429;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /api-docs/ {
            proxy_pass http://backend;
            expires 1h;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 16.4 CI/CD con GitHub Actions

#### Pipeline de CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:8.0
        ports:
          - 27017:27017

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:ci
      env:
        MONGO_TEST_URI: mongodb://localhost:27017/cermont_test

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./tests/reports/coverage/lcov.info

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Run security audit
      run: npm audit --audit-level high

    - name: Build Docker image
      run: |
        docker build -t cermont-backend:${{ github.sha }} .
        docker tag cermont-backend:${{ github.sha }} cermont-backend:latest

    - name: Deploy to production
      run: |
        echo "Deploying to production server..."
        # Aquí irían los comandos de despliegue específicos
        # (ej: rsync, docker push, kubectl, etc.)
```

### 16.5 Monitoreo en Producción

#### Configuración Prometheus
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'cermont-backend'
    static_configs:
      - targets: ['app:4100']
    metrics_path: '/api/v1/system/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 30s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    scrape_interval: 30s
```

#### Dashboard Grafana
```json
// Dashboard de ejemplo para Grafana
{
  "dashboard": {
    "title": "CERMONT Backend Performance",
    "tags": ["cermont", "backend"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"cermont-backend\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"cermont-backend\"}[5m])",
            "legendFormat": "Requests per second"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\",job=\"cermont-backend\"}[5m]) / rate(http_requests_total{job=\"cermont-backend\"}[5m]) * 100",
            "legendFormat": "Error rate %"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "mongodb_connections{state=\"active\"}",
            "legendFormat": "Active connections"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "cache_hits_total / (cache_hits_total + cache_misses_total) * 100",
            "legendFormat": "Cache hit rate %"
          }
        ]
      }
    ]
  }
}
```

### 16.6 Estrategia de Backup

#### Backup Automatizado
```bash
#!/bin/bash
# scripts/production-backup.sh

# Configuración
BACKUP_DIR="/mnt/backups/cermont"
RETENTION_DAYS=30
MONGO_URI="mongodb://prod-server:27017/cermont_db"
S3_BUCKET="cermont-backups"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cermont_prod_backup_$TIMESTAMP"

# Crear directorio
mkdir -p $BACKUP_DIR

echo "🚀 Starting production backup: $BACKUP_NAME"

# Backup de base de datos
mongodump \
  --uri="$MONGO_URI" \
  --out="$BACKUP_DIR/$BACKUP_NAME" \
  --gzip \
  --oplog \
  --verbose

# Backup de archivos subidos
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz" -C /var/www/cermont/uploads .

# Backup de configuración
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
  /etc/nginx/sites-available/cermont \
  /etc/systemd/system/cermont-backend.service \
  /opt/cermont/.env.production

# Verificar backup
if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully"
  
  # Subir a S3
  aws s3 cp "$BACKUP_DIR/$BACKUP_NAME" "s3://$S3_BUCKET/database/" --recursive
  aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz" "s3://$S3_BUCKET/uploads/"
  aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" "s3://$S3_BUCKET/config/"
  
  # Limpiar backups locales antiguos
  find $BACKUP_DIR -name "cermont_*" -type f -mtime +$RETENTION_DAYS -delete
  
  # Log de éxito
  logger -t cermont-backup "Backup successful: $BACKUP_NAME"
else
  echo "❌ Backup failed"
  logger -t cermont-backup "Backup failed: $BACKUP_NAME"
  exit 1
fi
```

#### Cron Job para Backups
```bash
# /etc/cron.d/cermont-backup
# Backup diario a las 2:00 AM
0 2 * * * root /opt/cermont/scripts/production-backup.sh

# Backup semanal los domingos a las 3:00 AM
0 3 * * 0 root /opt/cermont/scripts/weekly-backup.sh
```

---

## 17. MANTENIMIENTO

### 17.1 Rutinas de Mantenimiento

#### Limpieza de Logs
```bash
#!/bin/bash
# scripts/maintenance/cleanup-logs.sh

LOG_DIR="/var/log/cermont"
RETENTION_DAYS=30

echo "🧹 Starting log cleanup..."

# Comprimir logs antiguos
find $LOG_DIR -name "*.log" -mtime +7 -exec gzip {} \;

# Eliminar logs muy antiguos
find $LOG_DIR -name "*.log.gz" -mtime +$RETENTION_DAYS -delete

# Limpiar logs de auditoría antiguos (mantener 90 días)
find $LOG_DIR -name "audit*.log*" -mtime +90 -delete

echo "✅ Log cleanup completed"
```

#### Optimización de Base de Datos
```bash
#!/bin/bash
# scripts/maintenance/db-maintenance.sh

MONGO_URI="mongodb://localhost:27017/cermont_db"

echo "🔧 Starting database maintenance..."

# Reparar base de datos
mongosh $MONGO_URI --eval "db.repairDatabase()"

# Reindexar colecciones
mongosh $MONGO_URI --eval "
  db.users.reIndex();
  db.orders.reIndex();
  db.auditlogs.reIndex();
"

# Compactar colecciones
mongosh $MONGO_URI --eval "
  db.runCommand({ compact: 'users' });
  db.runCommand({ compact: 'orders' });
  db.runCommand({ compact: 'auditlogs' });
"

# Actualizar estadísticas
mongosh $MONGO_URI --eval "db.runCommand({ reIndex: 'system.profile' })"

echo "✅ Database maintenance completed"
```

#### Actualización de Dependencias
```bash
#!/bin/bash
# scripts/maintenance/update-dependencies.sh

echo "📦 Checking for dependency updates..."

# Verificar actualizaciones disponibles
npm outdated

# Actualizar dependencias menores
npm update

# Verificar vulnerabilidades
npm audit

# Si hay vulnerabilidades críticas, intentar fix automático
npm audit fix

echo "✅ Dependency update check completed"
```

### 17.2 Monitoreo de Salud del Sistema

#### Health Check Script
```bash
#!/bin/bash
# scripts/monitoring/health-check.sh

API_URL="https://api.cermont.com"
TIMEOUT=10

# Función para verificar endpoint
check_endpoint() {
  local url=$1
  local expected_status=${2:-200}
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo "✅ $url - OK ($response)"
    return 0
  else
    echo "❌ $url - FAILED ($response)"
    return 1
  fi
}

echo "🏥 Starting health checks..."

# Verificar API health
check_endpoint "$API_URL/api/v1/system/health"

# Verificar endpoints críticos
check_endpoint "$API_URL/api/v1/auth/login" 405  # Method not allowed es OK

# Verificar base de datos a través de API
check_endpoint "$API_URL/api/v1/users?limit=1" 401  # Unauthorized es OK (requiere auth)

# Verificar documentación
check_endpoint "$API_URL/api-docs/"

echo "🏁 Health checks completed"
```

#### Alertas por Email
```javascript
// scripts/monitoring/alerts.js
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Enviar alerta por email
 */
export const sendAlert = async (subject, message, severity = 'warning') => {
  try {
    const mailOptions = {
      from: process.env.ALERT_FROM || 'alerts@cermont.com',
      to: process.env.ALERT_TO,
      subject: `[CERMONT ${severity.toUpperCase()}] ${subject}`,
      html: `
        <h2>Alerta del Sistema CERMONT</h2>
        <p><strong>Severidad:</strong> ${severity.toUpperCase()}</p>
        <p><strong>Hora:</strong> ${new Date().toISOString()}</p>
        <p><strong>Mensaje:</strong></p>
        <pre>${message}</pre>
        <hr>
        <p>Este es un mensaje automático del sistema de monitoreo.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Alert sent: ${subject}`);
  } catch (error) {
    logger.error('Failed to send alert:', error);
  }
};

/**
 * Verificar métricas críticas
 */
export const checkCriticalMetrics = async () => {
  // Verificar uso de memoria
  const memUsage = process.memoryUsage();
  const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (memPercent > 90) {
    await sendAlert(
      'Alto uso de memoria',
      `Uso de memoria: ${memPercent.toFixed(2)}%`,
      'critical'
    );
  }

  // Verificar conexiones de base de datos
  // (Implementar lógica específica)

  // Verificar errores recientes
  // (Implementar lógica específica)
};
```

### 17.3 Gestión de Usuarios

#### Limpieza de Usuarios Inactivos
```javascript
/**
 * Script para gestión de usuarios inactivos
 */
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const cleanupInactiveUsers = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Encontrar usuarios inactivos
    const inactiveUsers = await User.find({
      isActive: true,
      lastLogin: { $lt: sixMonthsAgo },
      rol: { $nin: ['admin', 'root'] } // No desactivar admins
    });

    logger.info(`Found ${inactiveUsers.length} inactive users`);

    // Enviar notificaciones de advertencia (implementar)
    // ...

    // Desactivar usuarios muy inactivos (1 año)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const veryInactiveUsers = await User.find({
      isActive: true,
      lastLogin: { $lt: oneYearAgo },
      rol: { $nin: ['admin', 'root'] }
    });

    for (const user of veryInactiveUsers) {
      user.isActive = false;
      await user.save();
      
      logger.info(`Deactivated inactive user: ${user.email}`);
    }

    return {
      inactiveCount: inactiveUsers.length,
      deactivatedCount: veryInactiveUsers.length
    };
  } catch (error) {
    logger.error('Error in cleanupInactiveUsers:', error);
    throw error;
  }
};
```

#### Auditoría de Permisos
```javascript
/**
 * Verificar permisos de usuarios
 */
export const auditUserPermissions = async () => {
  try {
    const users = await User.find({ isActive: true });
    const issues = [];

    for (const user of users) {
      // Verificar roles válidos
      const validRoles = ['technician', 'engineer', 'supervisor', 'coordinator_hes', 'admin', 'root'];
      if (!validRoles.includes(user.rol)) {
        issues.push({
          user: user.email,
          issue: `Rol inválido: ${user.rol}`,
          severity: 'high'
        });
      }

      // Verificar usuarios admin sin actividad reciente
      if (user.rol === 'admin' || user.rol === 'root') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (!user.lastLogin || user.lastLogin < thirtyDaysAgo) {
          issues.push({
            user: user.email,
            issue: 'Usuario admin sin actividad reciente',
            severity: 'medium'
          });
        }
      }
    }

    return issues;
  } catch (error) {
    logger.error('Error in auditUserPermissions:', error);
    throw error;
  }
};
```

### 17.4 Gestión de Logs de Auditoría

#### Rotación de Logs de Auditoría
```javascript
/**
 * Gestionar rotación de logs de auditoría
 */
export const rotateAuditLogs = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Contar logs antiguos
    const oldLogsCount = await AuditLog.countDocuments({
      timestamp: { $lt: ninetyDaysAgo }
    });

    logger.info(`Found ${oldLogsCount} old audit logs to archive`);

    // Archivar logs antiguos (mover a colección histórica)
    await mongoose.connection.db.collection('auditlogs_archive').insertMany(
      await AuditLog.find({
        timestamp: { $lt: ninetyDaysAgo }
      }).lean()
    );

    // Eliminar logs antiguos de colección principal
    const deleteResult = await AuditLog.deleteMany({
      timestamp: { $lt: ninetyDaysAgo }
    });

    logger.info(`Archived and deleted ${deleteResult.deletedCount} audit logs`);

    return {
      archived: deleteResult.deletedCount,
      totalOld: oldLogsCount
    };
  } catch (error) {
    logger.error('Error in rotateAuditLogs:', error);
    throw error;
  }
};
```

#### Reportes de Auditoría
```javascript
/**
 * Generar reportes de auditoría
 */
export const generateAuditReports = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Reporte de actividad por usuario
    const userActivity = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$userId',
          actions: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          actionsByType: {
            $push: '$action'
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          email: '$user.email',
          rol: '$user.rol',
          actions: 1,
          lastActivity: 1
        }
      }
    ]);

    // Reporte de eventos críticos
    const criticalEvents = await AuditLog.find({
      severity: 'CRITICAL',
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: -1 });

    return {
      userActivity,
      criticalEvents: criticalEvents.length,
      criticalEventsList: criticalEvents
    };
  } catch (error) {
    logger.error('Error generating audit reports:', error);
    throw error;
  }
};
```

---

## 18. TROUBLESHOOTING

### 18.1 Problemas Comunes y Soluciones

#### Problema: Error de Conexión a MongoDB

**Síntomas:**
- Aplicación no inicia
- Logs muestran "MongoServerError: Authentication failed"
- Error "ECONNREFUSED" en conexión

**Soluciones:**
```bash
# 1. Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# 2. Verificar credenciales en .env
cat .env | grep MONGO

# 3. Probar conexión manual
mongosh "mongodb://username:password@localhost:27017/cermont_db"

# 4. Verificar configuración de red
netstat -tlnp | grep 27017

# 5. Revisar logs de MongoDB
tail -f /var/log/mongodb/mongod.log
```

#### Problema: Tokens JWT Expirados

**Síntomas:**
- Usuarios reportan logout inesperado
- API devuelve 401 Unauthorized
- Frontend pide login frecuente

**Soluciones:**
```javascript
// 1. Verificar configuración de JWT
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('JWT_REFRESH_EXPIRES_IN:', process.env.JWT_REFRESH_EXPIRES_IN);

// 2. Verificar tokens en blacklist
const blacklistedCount = await BlacklistedToken.countDocuments();
console.log('Blacklisted tokens:', blacklistedCount);

// 3. Limpiar tokens expirados
await BlacklistedToken.deleteMany({
  expiresAt: { $lt: new Date() }
});

// 4. Verificar configuración de frontend
// Asegurarse que esté renovando tokens automáticamente
```

#### Problema: Alto Uso de Memoria

**Síntomas:**
- Aplicación lenta
- PM2 reinicia procesos por memoria
- Logs muestran "JavaScript heap out of memory"

**Soluciones:**
```bash
# 1. Verificar uso de memoria
node -e "console.log(process.memoryUsage())"

# 2. Verificar configuración de caché
console.log('Cache stats:', cacheService.getStats());

# 3. Limpiar caché si es necesario
await cacheService.flushAll();

# 4. Verificar memory leaks
# Usar clinic.js o node --inspect
npm install -g clinic
clinic heapprofiler -- node src/server.js

# 5. Aumentar límite de memoria de Node.js
node --max-old-space-size=2048 src/server.js
```

#### Problema: Rate Limiting Bloqueando Legítimas Requests

**Síntomas:**
- Usuarios legítimos reciben 429 Too Many Requests
- Aplicación funciona lentamente
- Logs muestran rate limiting activado

**Soluciones:**
```javascript
// 1. Verificar configuración de rate limiting
console.log('Rate limit config:', {
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX_REQUESTS
});

// 2. Revisar requests recientes
const recentRequests = rateLimitStore.getRecentRequests();
console.log('Recent requests:', recentRequests);

// 3. Agregar IPs a whitelist si es necesario
const WHITELIST_IPS = new Set([
  '127.0.0.1',
  '192.168.1.100', // IP del frontend
  // Agregar IPs de usuarios legítimos
]);

// 4. Ajustar límites de rate limiting
const adjustedLimits = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Más requests permitidos
};
```

### 18.2 Debugging Tools

#### Debug Mode
```javascript
// Activar debug mode
process.env.DEBUG = 'cermont:*';
process.env.NODE_ENV = 'development';

// O usar flag de Node.js
node --inspect src/server.js
node --inspect-brk src/server.js  # Break on start
```

#### Logging Avanzado
```javascript
// Agregar logging detallado temporalmente
const debugLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
};

// Usar solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(debugLogger);
}
```

#### Profiling de Performance
```javascript
// Profiling con Node.js built-in
const profiler = require('v8-profiler-node8');

// Start profiling
const startProfiling = () => {
  profiler.startProfiling('cermont-profile', true);
};

// Stop profiling
const stopProfiling = () => {
  const profile = profiler.stopProfiling('cermont-profile');
  profile.export((error, result) => {
    if (error) {
      console.error('Error exporting profile:', error);
    } else {
      require('fs').writeFileSync('profile.cpuprofile', result);
      console.log('Profile saved to profile.cpuprofile');
    }
    profile.delete();
  });
};

// Usar en endpoints de debug
app.get('/debug/start-profile', (req, res) => {
  startProfiling();
  res.json({ message: 'Profiling started' });
});

app.get('/debug/stop-profile', (req, res) => {
  stopProfiling();
  res.json({ message: 'Profile saved' });
});
```

### 18.3 Comandos de Diagnóstico

#### Script de Diagnóstico Completo
```bash
#!/bin/bash
# scripts/diagnostics.sh

echo "🔍 CERMONT Backend Diagnostics"
echo "================================="

# Verificar servicios
echo "1. Checking services..."
if pgrep -f "node.*server.js" > /dev/null; then
  echo "✅ Node.js application is running"
else
  echo "❌ Node.js application is not running"
fi

if pgrep mongod > /dev/null; then
  echo "✅ MongoDB is running"
else
  echo "❌ MongoDB is not running"
fi

# Verificar conectividad
echo "2. Checking connectivity..."
if curl -s http://localhost:4100/api/v1/system/health > /dev/null; then
  echo "✅ API health check passed"
else
  echo "❌ API health check failed"
fi

# Verificar base de datos
echo "3. Checking database..."
DB_STATUS=$(mongosh --eval "db.runCommand('ping')" --quiet)
if [ "$DB_STATUS" = "{ ok: 1 }" ]; then
  echo "✅ Database connection OK"
else
  echo "❌ Database connection failed"
fi

# Verificar logs recientes
echo "4. Checking recent logs..."
echo "Last 10 error logs:"
tail -10 logs/error.log | grep -v "^$"

echo "Last 10 access logs:"
tail -10 logs/access.log | grep -v "^$"

# Verificar uso de recursos
echo "5. Checking resource usage..."
echo "Memory usage:"
free -h

echo "Disk usage:"
df -h

echo "Process info:"
ps aux | grep node | grep -v grep

echo "================================="
echo "Diagnostics completed"
```

#### Health Check Endpoint Detallado
```javascript
/**
 * Health check detallado para troubleshooting
 */
router.get('/health/detailed', requireMinRole('admin'), asyncHandler(async (req, res) => {
  const checks = {};
  const startTime = Date.now();

  // Database check
  try {
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    checks.database = {
      status: 'healthy',
      latency: `${Date.now() - dbStart}ms`,
      connections: mongoose.connection.readyState
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Cache check
  try {
    const cacheStats = cacheService.getStats();
    checks.cache = {
      status: 'healthy',
      ...cacheStats
    };
  } catch (error) {
    checks.cache = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // File system check
  try {
    const fs = require('fs').promises;
    await fs.access('./uploads', fs.constants.R_OK);
    await fs.access('./logs', fs.constants.W_OK);
    checks.filesystem = {
      status: 'healthy',
      uploads: 'readable',
      logs: 'writable'
    };
  } catch (error) {
    checks.filesystem = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  checks.memory = {
    status: memPercent > 90 ? 'warning' : 'healthy',
    used: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    total: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    percentage: `${memPercent.toFixed(2)}%`
  };

  // Response time
  const responseTime = Date.now() - startTime;

  const overallStatus = Object.values(checks).some(check => check.status === 'unhealthy') 
    ? 'unhealthy' 
    : 'healthy';

  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks,
    system: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      platform: process.platform
    }
  });
}));
```

### 18.4 Estrategia de Rollback

#### Rollback de Código
```bash
#!/bin/bash
# scripts/rollback.sh

# Configuración
ROLLBACK_TAG=${1:-"previous"}
PM2_APP_NAME="cermont-backend"

echo "🔄 Starting rollback to: $ROLLBACK_TAG"

# Detener aplicación
pm2 stop $PM2_APP_NAME

# Revertir código
git checkout $ROLLBACK_TAG

# Reinstalar dependencias si es necesario
npm ci

# Reconstruir si es necesario
npm run build

# Iniciar aplicación
pm2 start ecosystem.config.js --env production

# Verificar health
sleep 10
if curl -s http://localhost:4100/api/v1/system/health > /dev/null; then
  echo "✅ Rollback successful"
else
  echo "❌ Rollback failed - application not healthy"
  exit 1
fi
```

#### Rollback de Base de Datos
```javascript
/**
 * Sistema de rollback para base de datos
 */
export const createDatabaseBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `pre-migration-${timestamp}`;
  
  // Crear backup antes de migración
  await mongoose.connection.db.admin().command({
    copydb: 1,
    fromdb: 'cermont_db',
    todb: backupName
  });
  
  logger.info(`Database backup created: ${backupName}`);
  return backupName;
};

export const rollbackDatabase = async (backupName) => {
  // Restaurar desde backup
  await mongoose.connection.db.admin().command({
    copydb: 1,
    fromdb: backupName,
    todb: 'cermont_db'
  });
  
  logger.info(`Database rolled back from: ${backupName}`);
};
```

---

**FIN DE LA PARTE 2**

*Esta segunda parte cubre testing exhaustivo, logging y monitoreo avanzado, base de datos con optimizaciones, documentación API completa con Swagger, estrategias de despliegue con Docker y CI/CD, mantenimiento del sistema, y troubleshooting detallado con herramientas de diagnóstico. La Parte 3 continuará con integraciones, extensiones futuras, glosario, referencias, anexos, control de cambios y licencia.*
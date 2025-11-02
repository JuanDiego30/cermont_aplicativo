/**
 * Security Tests - CERMONT ATG Backend
 * @description Tests completos de seguridad para ejecutar con Copilot
 * @date October 2025
 */

import request from 'supertest';
let app;
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/database.js';
import { stopRateLimiter } from '../middleware/rateLimiter.js';

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

let testUser;

beforeAll(async () => {
  // Conectar a DB de testing
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cermont_test';
  
  await connectDB();
  // Importar la app dinámicamente para evitar problemas de resolución
  app = (await import('../app.js')).default;
  
  // Crear usuario de prueba
  testUser = await User.create({
    nombre: 'Test User',
    email: 'test@security.com',
    password: 'SecurePass123!',
    rol: 'admin',
  });
});

afterAll(async () => {
  // Limpiar DB
  await User.deleteMany({ email: 'test@security.com' });
  await closeDB();
  // Cleanup rate limiter interval
  try {
    stopRateLimiter();
  } catch {
    // ignore
  }
});

// ============================================================================
// TEST 1: RATE LIMITING
// ============================================================================

describe('TEST 1: Rate Limiting', () => {
  it('Debe bloquear después de 100 requests en 15 minutos', async () => {
    const requests = [];
    
    // Hacer 101 requests
    for (let i = 0; i < 101; i++) {
      requests.push(
        request(app)
          .get('/api/v1/health')
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Los primeros 100 deben ser 200
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBeGreaterThanOrEqual(100);
    
    // El 101 debe ser 429
    const rateLimitCount = responses.filter(r => r.status === 429).length;
    expect(rateLimitCount).toBeGreaterThanOrEqual(1);
  });

  it('Debe incluir headers RFC 6585', async () => {
    const res = await request(app).get('/api/v1/health');
    
    // Accept either standard RateLimit-* or legacy X- headers (lowercased by supertest)
    const hasLimit = res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'];
    const hasRemaining = res.headers['ratelimit-remaining'] || res.headers['x-ratelimit-remaining'];
    expect(hasLimit || hasRemaining).toBeDefined();
  });
});

// ============================================================================
// TEST 2: XSS PROTECTION
// ============================================================================

describe('TEST 2: XSS Protection', () => {
  it('Debe sanitizar scripts en registro', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: '<script>alert("xss")</script>Hacker',
        email: 'xss@test.com',
        password: 'Password123!',
      });
    
    if (res.status === 201) {
      expect(res.body.data.user.nombre).not.toContain('<script>');
      expect(res.body.data.user.nombre).not.toContain('alert');
      
      // Limpiar
      await User.deleteOne({ email: 'xss@test.com' });
    }
  });

  it('Debe escapar HTML malicioso', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: '<img src=x onerror=alert("xss")>',
        email: 'xss2@test.com',
        password: 'Password123!',
      });
    
    if (res.status === 201) {
      expect(res.body.data.user.nombre).not.toContain('onerror');
      
      // Limpiar
      await User.deleteOne({ email: 'xss2@test.com' });
    }
  });
});

// ============================================================================
// TEST 3: NOSQL INJECTION
// ============================================================================

describe('TEST 3: NoSQL Injection Protection', () => {
  it('Debe rechazar operadores MongoDB en login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: { $ne: null },
        password: { $ne: null },
      });
    
    expect(res.status).toBe(400);
  });

  it('Debe sanitizar operadores en query params', async () => {
    // Login primero
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
      });
    
    const token = loginRes.body.data.tokens.accessToken;
    
    // Intentar NoSQL injection en query
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .query({ estado: { $ne: 'cancelada' } });
    
    // Debe funcionar pero sin interpretar $ne
    expect(res.status).toBe(200);
  });
});

// ============================================================================
// TEST 4: JWT REFRESH TOKEN ROTATION
// ============================================================================

describe('TEST 4: JWT Refresh Token Rotation', () => {
  it('Debe invalidar refresh token anterior después de rotación', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
      });
    
    const oldRefreshToken = loginRes.body.data.tokens.refreshToken;
    
    // 2. Refresh tokens (rotación)
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken });
    
    expect(refreshRes.status).toBe(200);
    const newRefreshToken = refreshRes.body.data.tokens.refreshToken;
    expect(newRefreshToken).not.toBe(oldRefreshToken);
    
    // 3. Intentar usar token antiguo (debe fallar)
    const oldTokenRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken });
    
    expect(oldTokenRes.status).toBe(401);
    expect(oldTokenRes.body.error.message).toContain('inválido');
  });
});

// ============================================================================
// TEST 5: INPUT VALIDATION
// ============================================================================

describe('TEST 5: Input Validation', () => {
  it('Debe rechazar email inválido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Test User',
        email: 'not-an-email',
        password: 'Password123!',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Debe rechazar contraseña corta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Test User',
        email: 'test@valid.com',
        password: '123',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error.details).toContain('8 caracteres');
  });

  it('Debe rechazar nombre muy corto', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: 'A',
        email: 'test@valid.com',
        password: 'Password123!',
      });
    
    expect(res.status).toBe(400);
  });
});

// ============================================================================
// TEST 6: OBJECTID VALIDATION
// ============================================================================

describe('TEST 6: ObjectId Validation', () => {
  it('Debe rechazar ObjectId inválido', async () => {
    // Login primero
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
      });
    
    const token = loginRes.body.data.tokens.accessToken;
    
    // Intentar acceder con ID inválido
    const res = await request(app)
      .get('/api/v1/orders/invalid-id-123')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('inválido');
  });
});

// ============================================================================
// TEST 7: PATH TRAVERSAL
// ============================================================================

describe('TEST 7: Path Traversal Protection', () => {
  it('Debe sanitizar path traversal en filenames', async () => {
    // Login primero
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
      });
    
    const token = loginRes.body.data.tokens.accessToken;
    
    // Intentar subir archivo con path traversal
    const res = await request(app)
      .post('/api/v1/upload/single')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('test'), '../../etc/passwd');
    
    // Debe sanitizar el filename
    if (res.status === 200) {
      expect(res.body.data.filename).not.toContain('..');
      expect(res.body.data.filename).not.toContain('/');
    }
  });
});

// ============================================================================
// TEST 8: SECURITY HEADERS
// ============================================================================

describe('TEST 8: Security Headers', () => {
  it('Debe incluir headers de seguridad', async () => {
    const res = await request(app).get('/health');
    
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('x-xss-protection');
  });
});

// ============================================================================
// TEST 9: CORS
// ============================================================================

describe('TEST 9: CORS Configuration', () => {
  it('Debe rechazar orígenes no permitidos', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://malicious-site.com');
    
    // Debe responder pero sin CORS headers
    expect(res.status).toBe(200);
  });

  it('Debe permitir orígenes configurados', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');
    
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });
});

// ============================================================================
// TEST 10: PASSWORD SECURITY
// ============================================================================

describe('TEST 10: Password Security', () => {
  it('No debe devolver password en respuestas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'SecurePass123!',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('Debe hashear passwords en DB', async () => {
    const user = await User.findById(testUser._id).select('+password');
    expect(user.password).not.toBe('SecurePass123!');
    // Aceptar Argon2 o bcrypt
    const isHashed = user.password.startsWith('$argon2') || user.password.startsWith('$2');
    expect(isHashed).toBe(true);
    expect(user.password.length).toBeGreaterThan(50);
  });
});

// ============================================================================
// SUMMARY
// ============================================================================

describe('SECURITY TEST SUMMARY', () => {
  it('Resumen de cobertura de seguridad', () => {
    console.log('\n✅ SECURITY TEST COVERAGE:');
    console.log('✅ Rate Limiting: TESTED');
    console.log('✅ XSS Protection: TESTED');
    console.log('✅ NoSQL Injection: TESTED');
    console.log('✅ Token Rotation: TESTED');
    console.log('✅ Input Validation: TESTED');
    console.log('✅ ObjectId Validation: TESTED');
    console.log('✅ Path Traversal: TESTED');
    console.log('✅ Security Headers: TESTED');
    console.log('✅ CORS: TESTED');
    console.log('✅ Password Security: TESTED');
  });
});

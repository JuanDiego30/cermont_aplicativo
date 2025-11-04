/**
 * Comprehensive Security Tests (TypeScript - November 2025 - FIXED)
 * @description Suite integral de pruebas de seguridad para CERMONT ATG
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import { connectDB, closeDB } from '../config/database';

// ==================== TYPES ====================

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

// ==================== SETUP ====================

let testUser: UserDocument | null = null;

beforeAll(async () => {
  // Setup test environment
  process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cermont_test';
  
  await connectDB();
  
  // Create test admin user
  testUser = await User.create({
    nombre: 'Test User',
    email: 'test@security.com',
    password: 'SecurePass123!',
    rol: 'admin',
  }) as any;
}, 30000);

afterEach(async () => {
  // Cleanup test users
  await User.deleteMany({ email: { $regex: /test\.com$/i } });
});

afterAll(async () => {
  // Final cleanup
  if (testUser) {
    await User.deleteOne({ _id: testUser._id });
  }
  await closeDB();
}, 30000);

// ==================== HELPER FUNCTIONS ====================

const getAuthToken = async (email: string = 'test@security.com', password: string = 'SecurePass123!'): Promise<string> => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  
  return res.body.data.tokens.accessToken;
};

// ==================== TEST SUITE ====================

describe('SECURITY TESTS - CERMONT ATG', () => {
  
  // ============================================================================
  // TEST 1: RATE LIMITING
  // ============================================================================
  
  describe('1. Rate Limiting', () => {
    test('Debe bloquear después de 100 requests en 15 minutos', async () => {
      const requests: Promise<any>[] = [];
      
      for (let i = 0; i < 101; i++) {
        requests.push(
          request(app)
            .get('/api/v1/health')
            .then(res => res)
            .catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(requests);
      
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitCount = responses.filter(r => r.status === 429).length;
      
      expect(successCount).toBeGreaterThanOrEqual(90);
      expect(rateLimitCount).toBeGreaterThanOrEqual(1);
    }, 60000);

    test('Debe incluir headers de rate limit', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      const limitHeader = res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'];
      expect(limitHeader).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 2: XSS PROTECTION
  // ============================================================================
  
  describe('2. XSS Protection', () => {
    test('Debe sanitizar scripts en registro', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: '<script>alert("xss")</script>Hacker',
          email: 'xss@test.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.nombre).not.toContain('<script>');
      expect(res.body.data.user.nombre).not.toContain('alert');
    });

    test('Debe escapar HTML malicioso', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: '<img src=x onerror=alert("xss")>',
          email: 'xss2@test.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(res.body.data.user.nombre).not.toContain('onerror');
      expect(res.body.data.user.nombre).not.toContain('alert');
    });
  });

  // ============================================================================
  // TEST 3: NOSQL INJECTION
  // ============================================================================
  
  describe('3. NoSQL Injection Protection', () => {
    test('Debe rechazar operadores MongoDB en login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null },
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Debe sanitizar operadores en query params', async () => {
      const token = await getAuthToken();
      
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .query({ estado: JSON.stringify({ $ne: 'cancelada' }) })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ============================================================================
  // TEST 4: JWT REFRESH TOKEN ROTATION
  // ============================================================================
  
  describe('4. JWT Refresh Token Rotation', () => {
    test('Debe invalidar refresh token anterior después de rotación', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser!.email,
          password: 'SecurePass123!',
        })
        .expect(200);

      const oldRefreshToken = loginRes.body.data.tokens.refreshToken;
      
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken })
        .expect(200);

      const newRefreshToken = refreshRes.body.data.tokens.refreshToken;
      expect(newRefreshToken).not.toBe(oldRefreshToken);
      
      const oldTokenRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken })
        .expect(401);

      expect(oldTokenRes.body.success).toBe(false);
      expect(oldTokenRes.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  // ============================================================================
  // TEST 5: INPUT VALIDATION
  // ============================================================================
  
  describe('5. Input Validation', () => {
    test('Debe rechazar email inválido', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'Test User',
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Debe rechazar contraseña corta', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@valid.com',
          password: '123',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Debe rechazar nombre muy corto', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'A',
          email: 'test@valid.com',
          password: 'Password123!',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ============================================================================
  // TEST 6: OBJECTID VALIDATION
  // ============================================================================
  
  describe('6. ObjectId Validation', () => {
    test('Debe rechazar ObjectId inválido', async () => {
      const token = await getAuthToken();
      
      const res = await request(app)
        .get('/api/v1/orders/invalid-id-123')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('inválido');
    });
  });

  // ============================================================================
  // TEST 7: PATH TRAVERSAL
  // ============================================================================
  
  describe('7. Path Traversal Protection', () => {
    test('Debe sanitizar path traversal en filenames', async () => {
      const token = await getAuthToken();
      
      const maliciousContent = Buffer.from('malicious content');
      const res = await request(app)
        .post('/api/v1/upload/single')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', maliciousContent, '../../etc/passwd.txt')
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.filename).not.toContain('..');
      expect(res.body.data.filename).not.toContain('/');
    });
  });

  // ============================================================================
  // TEST 8: SECURITY HEADERS
  // ============================================================================
  
  describe('8. Security Headers', () => {
    test('Debe incluir headers de seguridad', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // ============================================================================
  // TEST 9: CORS
  // ============================================================================
  
  describe('9. CORS Configuration', () => {
    test('Debe rechazar orígenes no permitidos', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://malicious-site.com')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    test('Debe permitir orígenes configurados', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 10: PASSWORD SECURITY
  // ============================================================================
  
  describe('10. Password Security', () => {
    test('No debe devolver password en respuestas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser!.email,
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(res.body.data.user).not.toHaveProperty('password');
    });

    test('Debe hashear passwords en DB', async () => {
      const user = await User.findById(testUser!._id).select('+password').exec();
      
      expect(user).toBeTruthy();
      if (user) {
        expect(user.password).not.toBe('SecurePass123!');
        const isHashed = user.password.startsWith('$argon2') || 
                        user.password.startsWith('$2b$') || 
                        user.password.startsWith('$2a$');
        expect(isHashed).toBe(true);
        expect(user.password.length).toBeGreaterThan(50);
      }
    });
  });
});

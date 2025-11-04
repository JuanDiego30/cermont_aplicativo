/**
 * Sanitization and Validation Integration Tests (TypeScript - November 2025)
 * @description Pruebas de integración para sanitización de inputs (XSS, NoSQL/SQL injection, path traversal) y validación (Joi schemas, email/password/ObjectId) en CERMONT ATG. Cubre middleware sanitization/validation en routes auth/orders/upload, protege contra OWASP Top 10 (A03/A07).
 * Cubre: XSS <script>/onerror → &lt;script&gt;/neutral, NoSQL { $ne: null } → 400 VALIDATION_ERROR, SQL ' OR 1=1 → 400, path '../passwd.png' → sanitized filename, validation invalid email/short pw/invalid ObjectId → 400/422. Seed: Register admin, login token.
 * Integra con: Middleware (sanitization.ts: DOMPurify/xss, validator.js operators, path.normalize), validation.ts (Joi.object/email.min(8)/objectId), auth routes (register/login), orders routes (POST descripcion), upload routes (Multer filename sanitize). DB: Test URI dropDatabase beforeAll, close afterAll.
 * Secure: AuthToken string | undefined check, no PII in tests. Performance: Lightweight POST/GET, no heavy queries. Usage: npm test -- sanitization.spec.ts, NODE_ENV=test MONGODB_TEST_URI=mongodb://localhost:27017/test_cermont.
 * Extensible: Add tests para command injection (child_process), regex DoS (long strings), CSRF (if forms). Mock: No mocks (integration), jest.mock('multer') para unit. Para ATG: Test sanitization en WorkPlan description, Evidence tags.
 * Types: request.Response, UserDocument if needed, authToken: string | undefined. Assumes: register/login 201/200 success data.user/tokens, sanitized fields !.toContain('<script>'), error.code 'VALIDATION_ERROR', body.error.details array. closeDB: mongoose.disconnect().
 * Fixes: beforeAll: process.env.MONGODB_URI = test URI, dropDatabase idempotent (if exists). Tests: if (!authToken) skip/throw, expect(res.body).toHaveProperty('success', false) on 400. Upload: Buffer.from('test content'), filename '../../etc/passwd.png' → !toContain('..'). SQL: Though Mongo, test string injection.
 * Integrate: En app.ts: app.use(sanitizationMiddleware()); app.use(validationMiddleware()); En register schema: Joi.object({ nombre: Joi.string().trim().escape().max(100), email: Joi.string().email().lowercase() }). En multer: filename: (req, file, cb) => cb(null, sanitize(file.originalname.replace(/\.\./g, '')) + Date.now() + ext).
 * Missing: Tests para nested sanitization (deep objects), rate-limit on validation fail, audit log on sanitization detected (severity MEDIUM if threat). Seed: Use factory (e.g. factory.create('user')). Visual: No, API security.
 */

import request from 'supertest';
import app from '../app';
import mongoose, { type Connection } from 'mongoose';
import { connectDB, closeDB } from '../config/database'; // Assume closeDB: mongoose.disconnect()

let authToken: string | undefined;
let db: Connection;

describe('🛡️ Input Sanitization and Validation Tests', () => {
  beforeAll(async () => {
    // Config test env/DB
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cermont_test';
    
    await connectDB();
    db = mongoose.connection;
    
    // Drop DB for idempotency (cleans collections)
    if (db && db.db) {
      await db.dropDatabase();
    }
    
    // Seed user via register (creates hashed user)
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Seed User',
        email: 'seed-user@example.com',
        password: 'password123',
        rol: 'admin' as const,
      })
      .expect(201);
    
    // Login for auth token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'seed-user@example.com',
        password: 'password123',
      })
      .expect(200);
    
    authToken = loginRes.body.data?.tokens?.accessToken;
    if (!authToken) {
      throw new Error('Failed to obtain auth token');
    }
  });

  afterAll(async () => {
    // Optional: Cleanup seed user
    if (authToken && db) {
      await request(app)
        .delete('/api/v1/users/me') // Soft delete if implemented
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    }
    await closeDB(); // mongoose.disconnect()
  });

  // ============================================================================
  // XSS PROTECTION TESTS
  // ============================================================================

  describe('XSS Protection', () => {
    test('Debe sanitizar XSS en registro (nombre script tag)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: '<script>alert("xss")</script>John',
          email: 'xss-test@example.com',
          password: 'password123',
          rol: 'client',
        })
        .expect(201); // Assume register succeeds post-sanitization

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.user.nombre).not.toContain('<script>'); // Sanitized to &lt;script&gt; or plain text
      expect(res.body.data.user.nombre).toContain('John'); // Preserved content
    });

    test('Debe sanitizar XSS en descripción de orden (img onerror)', async () => {
      if (!authToken) return; // Skip if no token

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numeroOrden: 'ORD-001',
          descripcion: '<img src=x onerror=alert("xss")>',
          estado: 'pendiente' as const,
          clienteNombre: 'Cliente Test',
          lugar: 'Sede Central',
          fechaInicio: new Date().toISOString(),
        })
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.descripcion).not.toContain('onerror=alert'); // Sanitized
      expect(res.body.data.descripcion).toContain('img src=x'); // Allowed tags preserved if whitelisted
    });
  });

  // ============================================================================
  // NOSQL INJECTION TESTS
  // ============================================================================

  describe('NoSQL Injection Protection', () => {
    test('Debe prevenir NoSQL injection en login (operators en email/password)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null },
        })
        .expect(400); // Validation fails before query

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR'); // Joi rejects object
      expect(res.body.error.details).toContain('email'); // Invalid type
    });

    test('Debe sanitizar operadores MongoDB en query params (/orders)', async () => {
      if (!authToken) return;

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ estado: { $ne: 'cancelada' } })
        .expect(200); // Sanitized to string 'cancelada' or 400

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(0); // Empty if no orders, but no injection
      // If sanitized, query becomes { estado: '{"$ne":"cancelada"}' } invalid
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    test('Debe rechazar email inválido en registro', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'John Doe',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toContain('email debe ser una dirección de correo válida');
    });

    test('Debe rechazar contraseña corta (min 8 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'John Doe',
          email: 'short-pw@example.com',
          password: '123',
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d: string) => d.includes('al menos 8 caracteres'))).toBe(true);
    });

    test('Debe rechazar ObjectId inválido en ruta param (/orders/:id)', async () => {
      if (!authToken) return;

      const res = await request(app)
        .get('/api/v1/orders/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Validation middleware catches before controller

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('ObjectId inválido'); // Or 'CastError'
    });
  });

  // ============================================================================
  // PATH TRAVERSAL TESTS
  // ============================================================================

  describe('Path Traversal Protection', () => {
    test('Debe prevenir path traversal en filename de upload', async () => {
      if (!authToken) return;

      const maliciousFile = Buffer.from('malicious content');
      const res = await request(app)
        .post('/api/v1/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('filename', '../../etc/passwd.png') // Simulate custom field if needed, but attach uses filename
        .attach('file', maliciousFile, { 
          filename: '../../etc/passwd.png', 
          contentType: 'image/png' 
        })
        .expect(201); // Multer + sanitize succeeds

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.file.originalname).not.toContain('..'); // Sanitized to 'etc_passwd.png' or random
      expect(res.body.data.file.filename).toMatch(/^[a-zA-Z0-9_-]+\.png$/); // Safe filename
    });
  });

  // ============================================================================
  // SQL INJECTION TESTS (Legacy/Completeness, MongoDB focus)
  // ============================================================================

  describe('SQL Injection Protection', () => {
    test('Debe sanitizar intentos de SQL injection en login strings', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: "admin'--",
          password: "' OR '1'='1",
        })
        .expect(400); // Validation on strings, but if passed, bcrypt compare fails 401

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR'); // Or 'INVALID_CREDENTIALS' if not caught early
      // No injection: findByEmail('admin\'--') safe due to Mongoose
    });
  });
});

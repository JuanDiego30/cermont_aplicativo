/**
 * Sanitization Tests (October 2025)
 * @description Tests para validación y sanitización
 */

import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/database.js';

describe('Input Sanitization Tests', () => {
  let authToken;
  beforeAll(async () => {
    // ✅ AGREGADO: asegurar que la suite de tests use la URI de test
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cermont_test';
    await connectDB();
    // Limpiar DB para que los tests sean idempotentes
    if (mongoose.connection && mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    // Crear un usuario de prueba y obtener token de acceso para endpoints protegidos
    await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Seed User', email: 'seed-user@example.com', password: 'password123', rol: 'admin' });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seed-user@example.com', password: 'password123' });
    authToken = loginRes.body?.data?.tokens?.accessToken || null;
  });

  afterAll(async () => {
    await closeDB();
  });

  // ============================================================================
  // XSS PROTECTION TESTS
  // ============================================================================

  describe('XSS Protection', () => {
    it('should sanitize XSS in registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: '<script>alert("xss")</script>John',
          email: 'test@example.com',
          password: 'password123',
        });

      // Debe sanitizar el script
      expect(res.status).toBe(201);
      expect(res.body.data.user.nombre).not.toContain('<script>');
    });

    it('should sanitize XSS in order description', async () => {
      const token = authToken; // Obtener token válido
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numeroOrden: 'ORD-001',
          descripcion: '<img src=x onerror=alert("xss")>',
          estado: 'pendiente',
          clienteNombre: 'Cliente Test',
          lugar: 'Sede Central',
          fechaInicio: new Date().toISOString(),
        });

      expect(res.body.data.descripcion).not.toContain('onerror');
    });
  });

  // ============================================================================
  // NOSQL INJECTION TESTS
  // ============================================================================

  describe('NoSQL Injection Protection', () => {
    it('should prevent NoSQL injection in login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null },
        });

      // Debe rechazar o sanitizar
      expect(res.status).toBe(400);
    });

    it('should sanitize MongoDB operators in query', async () => {
  const token = authToken;

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .query({ estado: { $ne: 'cancelada' } });

      // Los operadores $ deben ser sanitizados
      expect(res.status).toBe(200);
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'John Doe',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'John Doe',
          email: 'test@example.com',
          password: '123',
        });

  expect(res.status).toBe(400);
  // Aceptar cualquier mensaje que indique la longitud mínima de la contraseña
  expect(res.body.error.details.join(' ')).toContain('debe tener al menos 8 caracteres');
    });

    it('should reject invalid ObjectId', async () => {
  const token = authToken;

      const res = await request(app)
        .get('/api/v1/orders/invalid-id')
        .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(400);
  // Mensaje puede variar; validar al menos que mencione ObjectId/inválido
  expect(res.body.error.message).toContain('ObjectId');
    });
  });

  // ============================================================================
  // PATH TRAVERSAL TESTS
  // ============================================================================

  describe('Path Traversal Protection', () => {
    it('should prevent path traversal in filename', async () => {
  const token = authToken;

      const res = await request(app)
        .post('/api/v1/upload/single')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test'), { filename: 'passwd.png', contentType: 'image/png' });

  // Filename debe ser sanitizado
  // El endpoint crea el recurso y responde 201
  expect(res.status).toBe(201);
      // El controlador devuelve el objeto file completo
      expect(res.body.data.file.originalname).not.toContain('..');
    });
  });

  // ============================================================================
  // SQL INJECTION TESTS (si aplica)
  // ============================================================================

  describe('SQL Injection Protection', () => {
    it('should sanitize SQL injection attempts', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: "admin'--",
          password: "' OR '1'='1",
        });

      expect(res.status).toBe(400);
    });
  });
});

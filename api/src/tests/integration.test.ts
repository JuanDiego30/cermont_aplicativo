// ============================================
// Integration Tests - API Routes
// ============================================

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

// Los tests de integración con DB requieren RUN_INTEGRATION_TESTS=true
const RUN_INTEGRATION_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

describe('API Integration Tests', () => {

  // ============================================
  // Health Check
  // ============================================
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // ============================================
  // Auth Routes
  // ============================================
  describe.skipIf(!RUN_INTEGRATION_TESTS)('Auth Routes', () => {
    describe('POST /api/auth/login', () => {
      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid@test.com',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should require email and password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/auth/me', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .get('/api/auth/me')
          .expect(401);
      });

      it('should reject invalid tokens', async () => {
        await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });
  });

  // ============================================
  // Ordenes Routes
  // ============================================
  describe('Ordenes Routes', () => {
    describe('GET /api/ordenes', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .get('/api/ordenes')
          .expect(401);
      });
    });

    describe('POST /api/ordenes', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .post('/api/ordenes')
          .send({
            clienteId: 1,
            descripcion: 'Test order',
          })
          .expect(401);
      });
    });
  });

  // ============================================
  // Ejecucion Routes
  // ============================================
  describe('Ejecucion Routes', () => {
    describe('GET /api/ejecucion/:ordenId', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .get('/api/ejecucion/1')
          .expect(401);
      });
    });

    describe('POST /api/ejecucion/iniciar', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .post('/api/ejecucion/iniciar')
          .send({ ordenId: 1 })
          .expect(401);
      });
    });
  });

  // ============================================
  // Evidencias Routes
  // ============================================
  describe('Evidencias Routes', () => {
    describe('GET /api/evidencias/:ordenId', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .get('/api/evidencias/1')
          .expect(401);
      });
    });

    describe('POST /api/evidencias', () => {
      it('should reject unauthorized requests', async () => {
        await request(app)
          .post('/api/evidencias')
          .expect(401);
      });
    });
  });

  // ============================================
  // 404 Handling
  // ============================================
  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

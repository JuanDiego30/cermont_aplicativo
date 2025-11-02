import request from 'supertest';
import app from '../app.js';

describe('🔒 HTTPS y Security Headers (Desarrollo Local)', () => {
  describe('Security Headers Básicos', () => {
    test('Debe incluir header Content-Security-Policy', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });
    test('Debe incluir header X-Frame-Options', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });
    test('Debe incluir header X-Content-Type-Options', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
    test('Debe incluir header Referrer-Policy', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['referrer-policy']).toBeDefined();
      expect(res.headers['referrer-policy']).toContain('strict-origin');
    });
    test('Debe incluir header Permissions-Policy', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['permissions-policy']).toBeDefined();
      expect(res.headers['permissions-policy']).toContain('geolocation');
    });
    test('No debe exponer header X-Powered-By', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
    test('NO debe incluir HSTS en desarrollo', async () => {
      const res = await request(app).get('/health');
      if (process.env.NODE_ENV !== 'production') {
        expect(res.headers['strict-transport-security']).toBeUndefined();
      }
    });
  });
  describe('Configuración SSL', () => {
    test('Debe cargar certificados SSL cuando SSL_ENABLED=true', () => {
      if (process.env.SSL_ENABLED === 'true') {
        const { getSSLConfig } = require('../config/ssl.js');
        const sslConfig = getSSLConfig();
        expect(sslConfig).not.toBeNull();
        expect(sslConfig).toHaveProperty('key');
        expect(sslConfig).toHaveProperty('cert');
        expect(typeof sslConfig.key).toBe('string');
        expect(typeof sslConfig.cert).toBe('string');
      }
    });
  });
  describe('Endpoints Básicos', () => {
    test('Endpoint /health debe responder correctamente', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});

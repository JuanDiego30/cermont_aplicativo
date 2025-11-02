import 'dotenv/config';
import request from 'supertest';
import app from '../app.js';
import AuditLog from '../models/AuditLog.js';
import BlacklistedToken from '../models/BlacklistedToken.js';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';

let testUser;

beforeAll(async () => {
  await connectDB();

  // Limpiar completamente la base de datos de test
  await User.deleteMany({});
  await AuditLog.deleteMany({});
  await BlacklistedToken.deleteMany({});

  // Crear usuario de prueba
  testUser = await User.create({
    nombre: 'Test Audit User',
    email: 'audit@test.com',
    password: 'Test123456!',
    rol: 'admin',
    cedula: '1234567890'
  });
});

afterAll(async () => {
  await User.deleteOne({ email: 'audit@test.com' });
  await AuditLog.deleteMany({ userEmail: 'audit@test.com' });
  await BlacklistedToken.deleteMany({ userId: testUser._id });
});

describe('🔍 Sistema de Auditoría', () => {

  test('Debe crear log de auditoría al hacer login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'Test123456!'
      });

    expect(res.status).toBe(200);

    // Verificar que se creó el log
    const log = await AuditLog.findOne({
      userEmail: 'audit@test.com',
      action: 'LOGIN'
    });

    expect(log).not.toBeNull();
    expect(log.resource).toBe('Auth');
    expect(log.status).toBe('SUCCESS');
  });

  test('Debe crear log de auditoría al hacer logout', async () => {
    // Login para obtener token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'Test123456!'
      });

    const token = loginRes.body.data.tokens.accessToken;

    // Logout
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verificar log
    const log = await AuditLog.findOne({
      userEmail: 'audit@test.com',
      action: 'LOGOUT'
    }).sort({ timestamp: -1 });

    expect(log).not.toBeNull();
    expect(log.severity).toBe('LOW');
  });

  test('Debe registrar intento de login fallido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);

    // Verificar log de fallo
    const log = await AuditLog.findOne({
      userEmail: 'audit@test.com',
      action: 'LOGIN_FAILED'
    }).sort({ timestamp: -1 });

    expect(log).not.toBeNull();
    expect(log.status).toBe('FAILURE');
    expect(log.severity).toBe('MEDIUM');
  });
});

describe('🚫 Sistema de Token Blacklist', () => {

  test('Debe agregar token a blacklist al hacer logout', async () => {
    // Login para obtener token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'Test123456!'
      });

    const token = loginRes.body.data.tokens.accessToken;

    // Logout
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    // Verificar que el token está en blacklist
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token);
    expect(isBlacklisted).toBe(true);
  });

  test('Debe rechazar peticiones con token revocado', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'Test123456!'
      });

    const token = loginRes.body.data.tokens.accessToken;

    // Logout (revoca token)
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    // Intentar usar token revocado
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_BLACKLISTED');
  });

  test('Admin debe poder consultar logs de auditoría', async () => {
    // Login como admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'audit@test.com',
        password: 'Test123456!'
      });

    const token = loginRes.body.data.tokens.accessToken;

    // Consultar logs
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
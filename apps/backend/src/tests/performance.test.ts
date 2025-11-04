/**
 * Performance and Caching Integration Tests (TypeScript - November 2025)
 * @description Pruebas de integración para middleware de cache (NodeCache TTL 5min), invalidación en mutations (POST /users), compression (gzip on >1KB), paginación (cursor/offset con autoPaginate), y cacheService (set/get/delPattern/getStats) en CERMONT ATG.
 * Cubre: /api/v1/users GET cache _cached: false → true, invalidate on POST create (body._cached undefined), Content-Encoding gzip si data.length >5, pagination { limit:5, hasMore:boolean, cursor }, offset { page:1, limit:10, total }. CacheService: set/get exact, delPattern('user:*')=2, stats { sets>0, hits>0, misses>0, keys=2 }.
 * Integra con: Users routes (GET/POST /api/v1/users auth admin), cache.middleware.ts (res.body._cached/At bool/Date), compression middleware (Accept-Encoding: gzip), utils/pagination.ts (autoPaginate(limit, cursor/page)), services/cache.service.ts (NodeCache singleton flush/stats/delPattern). DB: connectDB beforeAll, delete user afterAll.
 * Secure: Auth token from login, rol 'admin' for /users. Env: dotenv/config MONGODB_URI=test. Performance: Measure response times? No, focus logic. Usage: npm test -- performance.spec.ts, jest --runInBand for DB consistency.
 * Extensible: Add load tests (artillery/ab para 100 req/s), cache hit ratio >80%, Redis adapter test. Para ATG: Test cache en /orders (high traffic), invalidate on order update/assign. Mock: No mocks (integration), but jest.mock('../services/cache.service') para unit cache.
 * Types: UserDocument from models, authToken: string, request.Response. Assumes: loginRes.body.data.tokens.accessToken string, res.body.pagination: { limit:number, hasMore:boolean, cursor?:string }, res.body.data: User[] (length check), cacheService.get(): any | undefined, delPattern(pattern:string): number, getStats(): { sets:number, hits:number, misses:number, keys:number }.
 * Fixes: beforeAll async create/login, afterEach optional flush si needed. Assertions: expect(res.body._cached).toBeFalsy() loose, data.length >5 para gzip (assume seed data). POST create: Verify 201 success before invalidate. Cleanup: Delete created user in test. Stats: Hit/miss after get.
 * Integrate: En users.controller.ts: GET res.json({ ...data, _cached: true, _cachedAt: new Date() }); POST: await cacheService.delPattern('users:list:*');. En app.ts: app.use(compression({ threshold: 1024 })); app.use(cacheMiddleware({ skip: ['/health'] }));. Pagination: GET /users?cursor=eyJza2lwIjowfQ==&limit=5.
 * Missing: Tests para Redis mode (env CACHE_REDIS_URL, adapter switch), cache keys user-specific (req.user._id + ':users'), response time <200ms. Load: Use performance.now() around req. Invalidación: Test del pattern on order assign (del 'orders:*', 'users:notifications'). Visual: No, API perf.
 */

import request from 'supertest';
import app from '../app';
import type { UserDocument } from '../models';
import User from '../models/User';
import cacheService from '../services/cache.service';
import { connectDB } from '../config/database';
import mongoose from 'mongoose';
import 'dotenv/config';

let authToken: string | undefined;

beforeAll(async () => {
  await connectDB();
  
  // Crear usuario de prueba admin
  const testUser: UserDocument = await User.create({
    nombre: 'Test Performance User',
    email: 'performance@test.com',
    password: 'Test123456!',
    rol: 'admin' as const,
    cedula: '9876543210',
  });
  
  // Login para obtener token
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'performance@test.com',
      password: 'Test123456!',
    })
    .expect(200);

  authToken = loginRes.body.data.tokens.accessToken;
  expect(authToken).toBeDefined(); // Ensure token
});

afterEach(async () => {
  // Flush cache per test for isolation
  cacheService.flush();
});

afterAll(async () => {
  if (authToken) {
    // Logout optional, but cleanup user
    await User.deleteOne({ email: 'performance@test.com' });
  }
  await mongoose.connection.close();
});

describe('⚡ Performance y Caching', () => {
  
  describe('Cache Middleware', () => {
    const getUsers = (): Promise<request.Response> => 
      request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken!}`);

    test('Primera petición no debe estar cacheada (DB query)', async () => {
      const res = await getUsers().expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body._cached).toBeFalsy(); // Undefined or false
      expect(res.body.data).toHaveLength(expect.any(Number)); // At least test user
    });
    
    test('Segunda petición debe venir desde cache (no DB)', async () => {
      // Primera petición (cachear)
      await getUsers().expect(200);
      
      // Segunda petición (desde cache)
      const res = await getUsers().expect(200);
      
      expect(res.body._cached).toBe(true);
      expect(res.body._cachedAt).toBeDefined();
      expect(typeof res.body._cachedAt).toBe('string'); // ISO Date
    });
    
    test('Cache debe invalidarse al crear recurso (POST trigger del)', async () => {
      // Cachear lista
      await getUsers().expect(200);
      
      // Crear nuevo usuario (invalida cache users:list)
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken!}`)
        .send({
          nombre: 'Usuario Cache Test',
          email: 'cachetest@test.com',
          password: 'Test123456!',
          rol: 'technician' as const,
          cedula: '1122334455',
        })
        .expect(201); // Assume 201 created

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data).toHaveProperty('_id');
      
      // Verificar invalidación
      const res = await getUsers().expect(200);
      
      expect(res.body._cached).toBeFalsy(); // Fresh data includes new user
      
      // Cleanup test user
      await User.deleteOne({ email: 'cachetest@test.com' });
    });
  });
  
  describe('Compression', () => {
    test('Respuesta debe incluir header Content-Encoding gzip si >1KB', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken!}`)
        .set('Accept-Encoding', 'gzip')
        .expect(200);
      
      // Check if compressible size (assume data array)
      if (res.body.data && res.body.data.length > 5) { // Threshold approx
        expect(res.headers['content-encoding']).toMatch(/gzip|deflate|br/);
        expect(res.headers['vary']).toContain('Accept-Encoding');
      } else {
        // Small response, no compression expected
        expect(res.headers['content-encoding']).toBeUndefined();
      }
    });
  });
  
  describe('Paginación Cursor-Based', () => {
    test('Debe retornar paginación con cursor y hasMore', async () => {
      const res = await request(app)
        .get('/api/v1/users?limit=5')
        .set('Authorization', `Bearer ${authToken!}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.hasMore).toBe(expect.any(Boolean));
      expect(res.body.pagination.cursor).toBeDefined(); // Base64 encoded skip
      expect(res.body.data).toHaveLength(5); // Exact limit
    });
    
    test('Debe soportar paginación offset tradicional con total', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken!}`)
        .expect(200);
      
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.total).toBeDefined(); // CountDocuments
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });
  });
  
  describe('Cache Service', () => {
    test('Debe guardar y recuperar valores con TTL', () => {
      const key = 'test:key';
      const value = { data: 'test' };
      
      cacheService.set(key, value, 60); // 60s TTL
      const retrieved = cacheService.get(key);
      
      expect(retrieved).toEqual(value);
      expect(typeof retrieved).toBe('object');
    });
    
    test('Debe eliminar por patrón (glob-like)', () => {
      cacheService.set('user:1', { id: 1 });
      cacheService.set('user:2', { id: 2 });
      cacheService.set('order:1', { id: 1 });
      
      const deleted = cacheService.delPattern('user:*');
      
      expect(deleted).toBe(2); // Keys deleted
      expect(cacheService.get('user:1')).toBeUndefined();
      expect(cacheService.get('user:2')).toBeUndefined();
      expect(cacheService.get('order:1')).toEqual({ id: 1 });
    });
    
    test('Debe retornar estadísticas de uso (hits/misses)', () => {
      cacheService.flush(); // Reset stats
      cacheService.set('test1', 'value1');
      cacheService.set('test2', 'value2');
      cacheService.get('test1'); // Hit
      cacheService.get('test3'); // Miss (undefined)
      
      const stats = cacheService.getStats();
      
      expect(stats).toHaveProperty('sets');
      expect(stats.sets).toBeGreaterThan(0); // 2 sets
      expect(stats.hits).toBeGreaterThanOrEqual(1); // 1 hit
      expect(stats.misses).toBeGreaterThanOrEqual(1); // 1 miss
      expect(stats.keys).toBe(2); // Current keys
      expect(stats.hitsRate).toBeGreaterThan(0); // Optional computed
    });
  });
});

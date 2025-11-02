import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import cacheService from '../services/cache.service.js';
import { connectDB } from '../config/database.js';
import 'dotenv/config';

let authToken;

beforeAll(async () => {
  await connectDB();
  
  // Crear usuario de prueba
  await User.create({
    nombre: 'Test Performance User',
    email: 'performance@test.com',
    password: 'Test123456!',
    rol: 'admin',
    cedula: '9876543210'
  });
  
  // Login para obtener token
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'performance@test.com',
      password: 'Test123456!'
    });
  
  authToken = loginRes.body.data.tokens.accessToken;
});

afterAll(async () => {
  await User.deleteOne({ email: 'performance@test.com' });
  cacheService.flush();
});

describe('⚡ Performance y Caching', () => {
  
  describe('Cache Middleware', () => {
    test('Primera petición no debe estar cacheada', async () => {
      cacheService.flush(); // Limpiar cache
      
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._cached).toBeUndefined(); // No cacheado
    });
    
    test('Segunda petición debe venir desde cache', async () => {
      // Primera petición (cachear)
      await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Segunda petición (desde cache)
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._cached).toBe(true); // Cacheado
      expect(res.body._cachedAt).toBeDefined();
    });
    
    test('Cache debe invalidarse al crear recurso', async () => {
      cacheService.flush();
      
      // Cachear lista de usuarios
      await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Crear nuevo usuario (debe invalidar cache)
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Usuario Cache Test',
          email: 'cachetest@test.com',
          password: 'Test123456!',
          rol: 'technician',
          cedula: '1122334455'
        });
      
      // Verificar que cache fue invalidado
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.body._cached).toBeUndefined(); // Cache invalidado
      
      // Limpiar usuario de prueba
      await User.deleteOne({ email: 'cachetest@test.com' });
    });
  });
  
  describe('Compression', () => {
    test('Respuesta debe incluir header Content-Encoding', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept-Encoding', 'gzip');
      
      // Solo verificar si hay múltiples usuarios (> 1KB)
      if (res.body.data && res.body.data.length > 5) {
        expect(res.headers['content-encoding']).toMatch(/gzip|deflate/);
      }
    });
  });
  
  describe('Paginación Cursor-Based', () => {
    test('Debe retornar paginación con cursor', async () => {
      const res = await request(app)
        .get('/api/v1/users?limit=5')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination).toHaveProperty('hasMore');
    });
    
    test('Debe soportar paginación offset tradicional', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });
  });
  
  describe('Cache Service', () => {
    test('Debe guardar y recuperar valores', () => {
      cacheService.set('test:key', { data: 'test' }, 60);
      const value = cacheService.get('test:key');
      
      expect(value).toEqual({ data: 'test' });
    });
    
    test('Debe eliminar por patrón', () => {
      cacheService.set('user:1', { id: 1 });
      cacheService.set('user:2', { id: 2 });
      cacheService.set('order:1', { id: 1 });
      
      const deleted = cacheService.delPattern('user:*');
      
      expect(deleted).toBe(2);
      expect(cacheService.get('user:1')).toBeUndefined();
      expect(cacheService.get('order:1')).toBeDefined();
    });
    
    test('Debe retornar estadísticas', () => {
      cacheService.flush();
      cacheService.set('test1', 'value1');
      cacheService.set('test2', 'value2');
      cacheService.get('test1'); // Hit
      cacheService.get('test3'); // Miss
      
      const stats = cacheService.getStats();
      
      expect(stats.sets).toBeGreaterThan(0);
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.keys).toBe(2);
    });
  });
});
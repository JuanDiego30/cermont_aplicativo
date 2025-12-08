// 📁 api/src/tests/auth.integration.test.ts

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

// Skip integration tests if DATABASE_URL is not configured
const DATABASE_URL = process.env.DATABASE_URL;
const isDbConfigured = DATABASE_URL && DATABASE_URL.startsWith('postgres');

describe.skipIf(!isDbConfigured)('Auth API Integration', () => {
    beforeEach(async () => {
        // Limpiar usuarios
        try {
            await prisma.user.deleteMany({});
        } catch (e) { console.log('DB cleanup failed', e); }
    });

    describe('POST /api/auth/register', () => {
        it('should register new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    password: 'Password123!',
                    name: 'Test User',
                })
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('token');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    password: 'Password123!',
                    name: 'Test User',
                });
        });

        it('should login successfully', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'Password123!',
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('token');
        });
    });
});

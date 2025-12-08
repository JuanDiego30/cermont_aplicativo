// 📁 api/src/tests/ordenes.integration.test.ts

import { describe, it, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

// Skip integration tests if DATABASE_URL is not configured
const DATABASE_URL = process.env.DATABASE_URL;
const isDbConfigured = DATABASE_URL && DATABASE_URL.startsWith('postgres');

describe.skipIf(!isDbConfigured)('Ordenes API Integration', () => {
    let token: string;

    beforeEach(async () => {
        try {
            await prisma.order.deleteMany({});
            await prisma.user.deleteMany({});
        } catch (_e) { /* Ignorar errores si las tablas están vacías */ }

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'supervisor@test.com',
                password: 'Password123!',
                name: 'Supervisor',
                role: 'supervisor',
            });

        token = response.body.data.token;
    });

    describe('POST /api/ordenes', () => {
        it('should create orden', async () => {
            const ordenData = {
                cliente: 'Client Test',
                descripcion: 'Testing orden creation',
                prioridad: 'media',
                fechaFinEstimada: new Date(Date.now() + 86400000).toISOString(),
            };

            await request(app)
                .post('/api/ordenes')
                .set('Authorization', `Bearer ${token}`)
                .send(ordenData)
                .expect(200); // Service.create returns the object, usually 200 or 201 depending on controller
        });
    });
});

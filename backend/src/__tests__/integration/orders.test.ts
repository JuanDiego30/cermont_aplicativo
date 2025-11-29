import request from 'supertest';
import { createApp } from '../../app.js';
import prisma from '../../infra/db/prisma.js';
import { sign } from 'jsonwebtoken';

const app = createApp();

// Mock auth token
const generateToken = (userId: string) => {
    return sign({ userId, role: 'ADMIN' }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1h',
    });
};

describe('Integration: Order Flow', () => {
    let authToken: string;
    let userId: string;
    let clientId: string;

    beforeAll(async () => {
        // Create test user
        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@cermont.com`,
                password: 'hashed-password',
                name: 'Test User',
                role: 'ADMIN',
                lastPasswordChange: new Date(),
                passwordExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
        userId = user.id;
        authToken = generateToken(userId);
    });

    afterAll(async () => {
        // Cleanup
        await prisma.order.deleteMany({ where: { createdBy: userId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
    });

    it('should create and list orders', async () => {
        // 1. Create Order
        const createRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                clientName: 'Integration Test Client',
                description: 'Test Order Description',
                priority: 'HIGH',
                responsibleId: userId,
            });

        expect(createRes.status).toBe(201);
        expect(createRes.body.data).toHaveProperty('id');
        expect(createRes.body.data.orderNumber).toBeDefined();

        const orderId = createRes.body.data.id;

        // 2. List Orders
        const listRes = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${authToken}`);

        expect(listRes.status).toBe(200);
        expect(Array.isArray(listRes.body.data.orders)).toBe(true);
        const createdOrder = listRes.body.data.orders.find((o: any) => o.id === orderId);
        expect(createdOrder).toBeDefined();
        expect(createdOrder.clientName).toBe('Integration Test Client');
    });
});

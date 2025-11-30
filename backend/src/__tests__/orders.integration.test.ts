import request from 'supertest';
import app from '../app.js';
import { OrderModel } from '../infra/db/models/Order.js';
import { OrderState } from '../domain/entities/Order.js';
import { UserModel } from '../infra/db/models/User.js';
import { connectDatabase, disconnectDatabase } from '../shared/config/database.js';

describe('Orders Integration Tests', () => {
  let accessToken: string;

  beforeAll(async () => {
    await connectDatabase();

    // Crear usuario de prueba y obtener token
    const password = 'Admin123!';
    await UserModel.create({
      email: 'admin@cermont.com',
      password,
      name: 'Admin',
      role: 'ADMIN',
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cermont.com', password: 'Admin123!' });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await OrderModel.deleteMany({});
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        clientName: 'Test Client',
        description: 'Test order description with more than 10 chars',
        location: 'Test Location',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clientName).toBe(orderData.clientName);
      expect(response.body.data.state).toBe(OrderState.SOLICITUD);
    });

    it('should return 400 if description is too short', async () => {
      const orderData = {
        clientName: 'Test',
        description: 'short',
        location: 'Loc',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should list orders with pagination', async () => {
      await OrderModel.create({
        clientName: 'Client 1',
        description: 'Description 1',
        location: 'Location 1',
        state: OrderState.SOLICITUD,
        createdBy: 'test-suite',
      });

      const response = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
    });
  });
});

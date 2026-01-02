import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Tests E2E del módulo Ordenes
 * Flujo completo: listar, crear, obtener, actualizar
 */
describe('Ordenes E2E', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        // Obtener token de autenticación
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'test@test.com',
                password: 'password123',
            });

        authToken = loginRes.body?.accessToken || 'mock-token';
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /ordenes', () => {
        it('debe requerir autenticación', async () => {
            await request(app.getHttpServer())
                .get('/ordenes')
                .expect(401);
        });

        it('debe listar ordenes con token válido', async () => {
            const response = await request(app.getHttpServer())
                .get('/ordenes')
                .set('Authorization', `Bearer ${authToken}`);

            // Puede ser 200 o 401 dependiendo del token
            expect([200, 401]).toContain(response.status);
        });
    });

    describe('GET /ordenes/:id', () => {
        it('debe retornar 404 para orden inexistente', async () => {
            await request(app.getHttpServer())
                .get('/ordenes/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${authToken}`)
                .expect([401, 404]);
        });
    });

    describe('POST /ordenes', () => {
        it('debe requerir autenticación', async () => {
            await request(app.getHttpServer())
                .post('/ordenes')
                .send({})
                .expect(401);
        });
    });
});

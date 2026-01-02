/**
 * @test Auth E2E Tests
 *
 * Tests de integración para el módulo de autenticación.
 * Inspirado en samchon/backend y fastapi-template: TDD con SDK.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test data
    const testUser = {
        email: `test-${Date.now()}@cermont.test`,
        password: 'TestPassword123!',
        name: 'Test User',
    };

    let accessToken: string;
    let refreshToken: string;

    function extractRefreshTokenCookie(setCookieHeader?: string[] | string): string {
        const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : (setCookieHeader ? [setCookieHeader] : []);
        const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
        if (!refreshCookie) {
            throw new Error('Expected refreshToken cookie to be set');
        }
        // Cookie header should be the key=value pair
        return refreshCookie.split(';')[0];
    }

    function extractRefreshTokenValue(setCookieHeader?: string[] | string): string {
        const cookiePair = extractRefreshTokenCookie(setCookieHeader);
        return cookiePair.replace(/^refreshToken=/, '');
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Configurar igual que main.ts
        app.setGlobalPrefix('api');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
            }),
        );

        prisma = app.get(PrismaService);

        await app.init();
    });

    afterAll(async () => {
        // Limpiar usuario de test
        try {
            await prisma.user.deleteMany({
                where: { email: testUser.email },
            });
        } catch {
            // Ignorar si no existe
        }

        await app.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body.user).not.toHaveProperty('password');

            accessToken = response.body.token;
            refreshToken = extractRefreshTokenValue(response.headers['set-cookie']);
        });

        it('should reject duplicate email', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(testUser)
                .expect(409); // Conflict
        });

        it('should reject invalid email format', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email',
                })
                .expect(400);
        });

        it('should reject weak password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'another@test.com',
                    password: '123',
                })
                .expect(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');

            accessToken = response.body.token;
            refreshToken = extractRefreshTokenValue(response.headers['set-cookie']);
        });

        it('should reject invalid password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should reject non-existent user', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'anypassword',
                })
                .expect(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('email', testUser.email);
            expect(response.body).not.toHaveProperty('password');
        });

        it('should reject without token', async () => {
            await request(app.getHttpServer())
                .get('/api/auth/me')
                .expect(401);
        });

        it('should reject invalid token', async () => {
            await request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh tokens with valid refresh token', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('token');

            // Actualizar tokens para siguientes tests
            accessToken = response.body.token;
            refreshToken = extractRefreshTokenValue(response.headers['set-cookie']);
        });

        it('should reject invalid refresh token', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-refresh-token' })
                .expect(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout and invalidate refresh token', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken })
                .expect(200);

            // El refresh token ya no debería funcionar
            await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(401);
        });
    });
});

describe('HealthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/health', () => {
        it('should return ok status', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/health/ready', () => {
        it('should return ready status with DB check', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/health/ready')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('checks');
            expect(response.body.checks).toHaveProperty('database');
            expect(response.body.checks.database).toHaveProperty('status', 'ok');
        });
    });

    describe('GET /api/health/live', () => {
        it('should return live status', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/health/live')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
        });
    });
});

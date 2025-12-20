/**
 * @util MainBootstrap
 *
 * Punto de entrada de la API NestJS (bootstrap, CORS, ValidationPipe y Swagger).
 * 
 * Seguridad aplicada:
 * - Validación estricta de variables de entorno
 * - Helmet (headers HTTP de seguridad)
 * - CORS configurado
 * - ValidationPipe global
 * - Rate limiting (ThrottlerGuard)
 * - Request ID para tracing
 *
 * Uso: Se ejecuta al iniciar el servidor (node dist/main.js).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

// Request ID header name
const REQUEST_ID_HEADER = 'x-request-id';

async function bootstrap() {
    try {
        // =====================================================
        // ENVIRONMENT VALIDATION (fail fast if invalid)
        // =====================================================
        console.log('🔍 Step 1: Validating environment...');
        const env = validateEnv();
        console.log('✅ Step 1: Environment validated');

        console.log('🔍 Step 2: Creating NestJS application...');
        let app;
        try {
            app = await NestFactory.create(AppModule, {
                logger: ['error', 'warn'], // Enable error logging to see module errors
            });
            console.log('✅ Step 2: Application created');
        } catch (error) {
            console.error('❌ Error creating NestJS application:');
            console.error(error);
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            process.exit(1);
        }

        console.log('🔍 Step 3: Getting Winston logger...');
        // Get Winston logger instance
        const logger = app.get(WINSTON_MODULE_PROVIDER);
        console.log('✅ Step 3: Logger obtained');


        // Global prefix for API routes
        app.setGlobalPrefix('api');

        // =====================================================
        // SECURITY MIDDLEWARE
        // =====================================================

        // Helmet - Headers de seguridad HTTP
        app.use(helmet({
            contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    scriptSrc: ["'self'"],
                    fontSrc: ["'self'", 'https:', 'data:'],
                    connectSrc: ["'self'"],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                },
            } : false, // Desactivar CSP en desarrollo para Swagger
            crossOriginEmbedderPolicy: false, // Para permitir cargar recursos externos
        }));

        // Request ID middleware - para tracing/correlación
        app.use((req: { headers: Record<string, string>; requestId?: string }, res: { setHeader: (name: string, value: string) => void }, next: () => void) => {
            const requestId = req.headers[REQUEST_ID_HEADER] || uuidv4();
            req.requestId = requestId;
            res.setHeader(REQUEST_ID_HEADER, requestId);
            next();
        });

        // CORS configuration - Development friendly
        app.enableCors({
            origin: true, // Allow all origins in development
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
        });

        // Cookie parser middleware
        app.use(cookieParser());

        // Global validation pipe
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

        // =====================================================
        // SWAGGER DOCUMENTATION
        // =====================================================
        // Temporalmente deshabilitado debido a dependencia circular
        // TODO: Corregir dependencia circular en DTOs y reactivar Swagger
        const port = process.env.PORT || 4000;
        try {
            const config = new DocumentBuilder()
                .setTitle('Cermont API')
                .setDescription('API para Sistema de Gestión de Órdenes Cermont')
                .setVersion('1.0')
                .addBearerAuth()
                .addApiKey(
                    { type: 'apiKey', name: REQUEST_ID_HEADER, in: 'header' },
                    'request-id'
                )
                .build();
            const document = SwaggerModule.createDocument(app, config, {
                deepScanRoutes: false, // Evitar escaneo profundo que causa dependencias circulares
            });
            SwaggerModule.setup('docs', app, document);
            logger.log('📚 Swagger docs: http://localhost:' + port + '/docs', 'Bootstrap');
        } catch (swaggerError) {
            logger.warn('⚠️ Swagger deshabilitado debido a error: ' + (swaggerError instanceof Error ? swaggerError.message : 'Unknown error'));
        }

        // =====================================================
        // START SERVER
        // =====================================================
        await app.listen(port);

        logger.info(`🚀 Cermont API running on port ${port}`, { context: 'Bootstrap' });
        logger.info(`❤️ Health check: http://localhost:${port}/api/health`, { context: 'Bootstrap' });
        logger.info(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'PRODUCTION MODE' : 'DEVELOPMENT MODE'}`, { context: 'Bootstrap' });
    } catch (error) {
        console.error('❌ Error during bootstrap:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
}

bootstrap().catch((error) => {
    console.error('❌ Error starting server:', error);
    process.exit(1);
});

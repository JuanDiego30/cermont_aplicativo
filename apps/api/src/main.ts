/**
 * ARCHIVO: main.ts
 * FUNCION: Punto de entrada de la API NestJS con bootstrap completo
 * IMPLEMENTACION: Configura Helmet, CORS, ValidationPipe, Swagger y middleware de seguridad
 * DEPENDENCIAS: @nestjs/core, @nestjs/swagger, helmet, cookie-parser, uuid
 * EXPORTS: Ninguno (ejecuta bootstrap al iniciar)
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from './app.module';

// Request ID header name
const REQUEST_ID_HEADER = 'x-request-id';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

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

    // CORS configuration
    // Configurar CORS
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
        ],
        credentials: true,
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
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // =====================================================
    // START SERVER
    // =====================================================
    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 Cermont API running on port ${port}`);
    logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
    logger.log(`❤️ Health check: http://localhost:${port}/api/health`);
    logger.log(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'PRODUCTION MODE' : 'DEVELOPMENT MODE'}`);
}

bootstrap();

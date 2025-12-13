/**
 * @util MainBootstrap
 *
 * Punto de entrada de la API NestJS (bootstrap, CORS, ValidationPipe y Swagger).
 *
 * Uso: Se ejecuta al iniciar el servidor (node dist/main.js).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // Global prefix for API routes
    app.setGlobalPrefix('api');

    // CORS configuration
    app.enableCors({
        origin:
            process.env.CORS_ORIGIN ||
            process.env.FRONTEND_URL ||
            'http://localhost:3000',
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

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Cermont API')
        .setDescription('API para Sistema de Gestión de Órdenes Cermont')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log(`Cermont API running on port ${port}`);
    logger.log(`Swagger docs: http://localhost:${port}/docs`);
    logger.log(`Health check: http://localhost:${port}/api/health`);
}

bootstrap();

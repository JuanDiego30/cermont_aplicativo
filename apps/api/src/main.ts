/**
 * NestJS Application Entry Point
 * Cermont API - Sistema de Gestión de Órdenes
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix for API routes
    app.setGlobalPrefix('api');

    // CORS configuration
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

    console.log(`🚀 Cermont API running on port ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
    console.log(`💚 Health check: http://localhost:${port}/api/health`);
}

bootstrap();

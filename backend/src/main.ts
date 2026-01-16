import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;

    // Security Middleware
    app.use(helmet());
    app.use(compression());
    app.use(cookieParser());

    // CORS Configuration
    app.enableCors({
      origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:4200',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-custom-header'],
    });

    // Global Prefix
    app.setGlobalPrefix('api');

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Global Exception Filter (ya configurado en app.module.ts)
    // No es necesario agregarlo aquí ya que está en los providers del módulo

    // Swagger Documentation
    const config = new DocumentBuilder()
      .setTitle('Cermont API')
      .setDescription('API para gestión de mantenimiento y órdenes de trabajo')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación y autorización')
      .addTag('orders', 'Gestión de órdenes')
      .addTag('maintenance', 'Mantenimiento')
      .addTag('users', 'Usuarios')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Start Server
    await app.listen(port);

    logger.log(`🚀 API corriendo en http://localhost:${port}/api`);
    logger.log(`📚 Documentación en http://localhost:${port}/api/docs`);
    logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();

/**
 * Script para exportar OpenAPI/Swagger JSON
 *
 * Uso: npm run openapi:export
 * Genera: openapi.json en la raíz del proyecto API
 */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function exportOpenApi() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
        .setTitle('Cermont API')
        .setDescription('API para Sistema de Gestión de Órdenes Cermont')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Guardar como JSON
    writeFileSync('openapi.json', JSON.stringify(document, null, 2));
    console.log('✅ OpenAPI spec exported to openapi.json');

    await app.close();
    process.exit(0);
}

exportOpenApi().catch((err) => {
    console.error('❌ Failed to export OpenAPI:', err);
    process.exit(1);
});

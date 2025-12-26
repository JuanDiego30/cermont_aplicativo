/**
 * @module AppModule
 *
 * Módulo raíz: registra módulos de negocio y configura providers globales.
 *
 * Uso: Importado por NestFactory.create(AppModule) en main.ts.
 */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
// Logger nativo de NestJS - Sin dependencias externas
import { join } from 'path';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

import { OrdenesModule } from './modules/ordenes/ordenes.module';
import { PlaneacionModule } from './modules/planeacion/planeacion.module';
import { KitsModule } from './modules/kits/kits.module';
import { EjecucionModule } from './modules/ejecucion/ejecucion.module';
import { EvidenciasModule } from './modules/evidencias/evidencias.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { HesModule } from './modules/hes/hes.module';
// TODO: Create LineasVidaModule - currently disabled
// import { LineasVidaModule } from './modules/lineas-vida/lineas-vida.module';
import { CostosModule } from './modules/costos/costos.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
// DELETED: MantenimientosModule - CERMONT uses order-based maintenance, not scheduled preventive maintenance
import { FormulariosModule } from './modules/formularios/formularios.module';
import { CierreAdministrativoModule } from './modules/cierre-administrativo/cierre-administrativo.module';

// New modules
// DELETED: ArchivadoModule - Replaced by archivado-historico module (coming in Phase 3)
import { SyncModule } from './modules/sync/sync.module';
import { PdfGenerationModule } from './modules/pdf-generation/pdf-generation.module';
import { AdminModule } from './modules/admin/admin.module';
import { WeatherModule } from './modules/weather/weather.module';
// DELETED: EmailModule - Redundant with AlertasModule (email functionality moved there)
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';

import { AlertasModule } from './modules/alertas/alertas.module';
import { KpisModule } from './modules/kpis/kpis.module';

// NEW MODULES - Phase 3 Backend Refactoring
import { CertificacionesModule } from './modules/certificaciones/certificaciones.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { ArchivadoHistoricoModule } from './modules/archivado-historico/archivado-historico.module';
import { OrdersModule } from './modules/orders/orders.module';

// Common providers
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';
import {
    PrismaExceptionFilter,
    PrismaValidationFilter,
    PrismaConnectionFilter,
    PrismaPanicFilter,
} from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthController } from './health.controller';
import { CustomThrottleGuard } from './common/guards/throttle.guard';
import { LoggerService } from './common/logging/logger.service';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Event Emitter for domain events (MUST be before feature modules)
        EventEmitterModule.forRoot({
            global: true,
            wildcard: false,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 20,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),

        // Rate limiting - Múltiples límites para diferentes escenarios
        // Previene ataques DDoS y brute force
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 10000, // 10 segundos
                limit: 100,  // INCREASED: 100 requests (was 20)
            },
            {
                name: 'medium',
                ttl: 60000, // 60 segundos
                limit: 500, // INCREASED: 500 requests (was 100)
            },
            {
                name: 'long',
                ttl: 3600000, // 1 hora
                limit: 5000,  // INCREASED: 5000 requests (was 1000)
            },
        ]),

        // In-memory cache for expensive operations (dashboard stats, KPIs)
        CacheModule.register({
            isGlobal: true,
            ttl: 300000, // 5 minutos en ms
            max: 100,    // Máximo 100 items en caché
        }),

        // Logger nativo de NestJS (configurado en main.ts)
        // No requiere módulo adicional - LoggerService usa Logger de @nestjs/common

        // Static files (uploads)
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),

        // Core
        PrismaModule,

        // Feature modules - MINIMAL SET FOR TESTING
        AuthModule,
        OrdenesModule,
        PlaneacionModule,
        KitsModule,
        EjecucionModule,
        DashboardModule,
        // ReportesModule,
        // HesModule,
        // LineasVidaModule,
        // CostosModule,
        // ChecklistsModule,
        // MantenimientosModule, // DELETED
        // FormulariosModule,
        // CierreAdministrativoModule,

        // New modules (Módulos 1-4 según documento) - DISABLED
        // ArchivadoModule,    // Módulo 4: Archivado automático
        // SyncModule,         // Módulo 1: Sincronización offline
        // PdfGenerationModule, // Generación de informes PDF
        // AdminModule,        // Módulo 3: Administración RBAC
        // WeatherModule,      // Módulo Meteorológico (Open-Meteo + NASA)
        // EmailModule,
        // TecnicosModule,

        // AlertasModule,      // Sistema de Alertas Automáticas
        KpisModule,         // Dashboard KPIs y Métricas

        // NEW MODULES - Phase 3 Backend Refactoring
        CertificacionesModule,    // Gestión de certificaciones técnicos/equipos
        ClientesModule,           // Gestión de clientes (SIERRACOL)
        FacturacionModule,        // SES Ariba + Facturación
        ArchivadoHistoricoModule, // Archivado automático mensual
        OrdersModule,             // NEW: Standardized English Orders module

        // Schedule module for CRON jobs
        ScheduleModule.forRoot(),
    ],
    controllers: [HealthController],
    providers: [
        // Filtros de excepciones (orden importa: más específico primero)
        // Prisma errors - más específicos
        {
            provide: APP_FILTER,
            useClass: PrismaPanicFilter,
        },
        {
            provide: APP_FILTER,
            useClass: PrismaConnectionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: PrismaValidationFilter,
        },
        {
            provide: APP_FILTER,
            useClass: PrismaExceptionFilter,
        },
        // HTTP exception - catch-all para el resto
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        // Global catch-all exception filter
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        // Rate limiting guard (applies global, pero JWT va después)
        {
            provide: APP_GUARD,
            useClass: CustomThrottleGuard,
        },
        // JWT Guard global (todas las rutas protegidas por defecto)
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        // Global logger service
        LoggerService,
    ],
})
export class AppModule implements NestModule {
    // Security middleware avanzado duplicaba parte de la configuración
    // ya aplicada en main.ts (helmet, requestId, headers). Para reducir
    // complejidad y evitar conflictos de headers/CSP, se eliminó su uso
    // global aquí. Si se requiere en el futuro, se puede aplicar de forma
    // más granular por rutas específicas.
    configure(consumer: MiddlewareConsumer) {
        // No se aplican middlewares adicionales globales por ahora.
    }
}

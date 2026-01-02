/**
 * @module AppModule
 *
 * Módulo raíz: registra módulos de negocio y configura providers globales.
 *
 * Uso: Importado por NestFactory.create(AppModule) en main.ts.
 */
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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

import { NotificationsModule } from './modules/notifications/notifications.module';

import { AlertasModule } from './modules/alertas/alertas.module';
import { KpisModule } from './modules/kpis/kpis.module';

// NEW MODULES - Phase 3 Backend Refactoring
import { CertificacionesModule } from './modules/certificaciones/certificaciones.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { ArchivadoHistoricoModule } from './modules/archivado-historico/archivado-historico.module';


// Common providers
import {
    PrismaExceptionFilter,
    PrismaValidationFilter,
    PrismaConnectionFilter,
    PrismaPanicFilter,
} from './common/filters/prisma-exception.filter';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { HealthController } from './health.controller';
import { CustomThrottleGuard } from './common/guards/throttle.guard';
// import { LoggerService } from './common/logging/logger.service'; // REMOVED LEGACY
import { LoggerService } from './lib/logging/logger.service'; // NEW
import { GlobalExceptionFilter } from './lib/shared/filters/global-exception.filter'; // NEW
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
    imports: [
        // ... imports remain same ...
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
        /*
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
        */

        // In-memory cache for expensive operations (dashboard stats, KPIs)
        CacheModule.register({
            isGlobal: true,
            ttl: 300000, // 5 minutos en ms
            max: 100,    // Máximo 100 items en caché
        }),

        // Logger nativo de NestJS (configurado en main.ts)
        // No requiere módulo adicional - LoggerService usa Logger de @nestjs/common

        // Static files (uploads)
        /*
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),
        */

        // Core
        PrismaModule,

        // Feature modules - ACTIVATED
        AuthModule,
        NotificationsModule,
        // OrdenesModule,
        // PlaneacionModule,
        // KitsModule,
        // EjecucionModule,
        // DashboardModule,
        // ReportesModule,    // ✅ Activado
        // HesModule,         // ✅ Activado
        // LineasVidaModule, // TODO: Create LineasVidaModule
        // CostosModule,      // ✅ Activado
        // ChecklistsModule,  // ✅ Activado
        // MantenimientosModule, // DELETED - CERMONT uses order-based maintenance
        // FormulariosModule, // ✅ Activado
        // CierreAdministrativoModule, // ✅ Activado

        // New modules - ACTIVATED
        // ArchivadoModule,    // Replaced by ArchivadoHistoricoModule
        // SyncModule,         // ✅ Activado - Módulo 1: Sincronización offline
        // PdfGenerationModule, // ✅ Activado - Generación de informes PDF
        // AdminModule,        // ✅ Activado - Módulo 3: Administración RBAC
        // WeatherModule,      // ✅ Activado - Módulo Meteorológico (Open-Meteo + NASA)
        // EmailModule,       // DELETED - Redundant with AlertasModule
        // TecnicosModule,     // ✅ Activado

        // AlertasModule,      // ✅ Activado - Sistema de Alertas Automáticas
        // KpisModule,         // Dashboard KPIs y Métricas

        // NEW MODULES - Phase 3 Backend Refactoring
        // CertificacionesModule,    // Gestión de certificaciones técnicos/equipos
        // ClientesModule,           // Gestión de clientes (SIERRACOL)
        // FacturacionModule,        // SES Ariba + Facturación
        // ArchivadoHistoricoModule, // Archivado automático mensual

        // Schedule module for CRON jobs
        // ScheduleModule.forRoot(),
    ],
    controllers: [HealthController],
    providers: [
        // Logging global de requests (sin activar guards/filtros globales aún)
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpLoggingInterceptor,
        },
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
        // Correlation ID para todos los requests
        consumer
            .apply(RequestIdMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}

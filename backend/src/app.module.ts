/**
 * @module AppModule
 *
 * Módulo raíz: registra módulos de negocio y configura providers globales.
 *
 * Uso: Importado por NestFactory.create(AppModule) en main.ts.
 */
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
// Logger nativo de NestJS - Sin dependencias externas

// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { HesModule } from './modules/hes/hes.module';
import { KitsModule } from './modules/kits/kits.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PlanningModule } from './modules/planning/planning.module';
// ...

import { ReportsModule } from './modules/reports/reports.module';
// TODO: Create LineasVidaModule - currently disabled
// import { LineasVidaModule } from './modules/lineas-vida/lineas-vida.module';
// REMOVED: ArchivingModule - Not needed for MVP thesis
import { CostsModule } from './modules/costs/costs.module';

// ...

// DELETED: MantenimientosModule - CERMONT uses order-based maintenance, not scheduled preventive maintenance
import { AdministrativeClosureModule } from './modules/administrative-closure/administrative-closure.module';
import { FormsModule } from './modules/forms/forms.module';

// New modules
// DELETED: ArchivadoModule - Replaced by archivado-historico module (coming in Phase 3)
import { AdminModule } from './modules/admin/admin.module';
import { PdfGenerationModule } from './modules/pdf-generation/pdf-generation.module';
// REMOVED: SyncModule, WeatherModule - Not needed for MVP thesis
// DELETED: EmailModule - Redundant with AlertasModule (email functionality moved there)
import { TechniciansModule } from './modules/technicians/technicians.module';

import { NotificationsModule } from './modules/notifications/notifications.module';

import { AlertsModule } from './modules/alerts/alerts.module';
import { KpisModule } from './modules/kpis/kpis.module';

// NEW MODULES - Phase 3 Backend Refactoring
// REMOVED: CertificationsModule - Not needed for MVP thesis
import { InvoicingModule } from './modules/invoicing/invoicing.module';

// Common providers
import { HealthController } from './health.controller';
import {
  PrismaConnectionFilter,
  PrismaExceptionFilter,
  PrismaPanicFilter,
  PrismaValidationFilter,
} from './shared/filters/prisma-exception.filter';
import { CustomThrottleGuard } from './shared/guards/throttle.guard';
import { HttpLoggingInterceptor } from './shared/interceptors/http-logging.interceptor';
// import { LoggerService } from './shared/logging/logger.service'; // REMOVED LEGACY
import { validate as validateEnv } from './config/env.validation';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter'; // NEW
import { LoggerService } from './shared/logging/logger.service'; // NEW
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';

@Module({
  imports: [
    // ... imports remain same ...
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: config => validateEnv(config),
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
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000, // 10 segundos
        limit: 100, // 100 requests
      },
      {
        name: 'medium',
        ttl: 60000, // 60 segundos
        limit: 500, // 500 requests
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 5000, // 5000 requests
      },
    ]),

    // In-memory cache for expensive operations (dashboard stats, KPIs)
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutos en ms
      max: 100, // Máximo 100 items en caché
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
    OrdersModule,
    PlanningModule,
    KitsModule,
    ExecutionModule,
    DashboardModule,
    ReportsModule,
    HesModule,
    // LineasVidaModule, // TODO: Create LineasVidaModule
    CostsModule,
    // MantenimientosModule, // DELETED - CERMONT uses order-based maintenance
    FormsModule,

    AdministrativeClosureModule,
    EvidenceModule,

    // Essential modules for MVP
    PdfGenerationModule,
    AdminModule,
    TechniciansModule,

    AlertsModule,
    KpisModule,

    // MVP modules
    InvoicingModule,

    // Schedule module for CRON jobs
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [
    // Logging global de requests (sin activar guards/filtros globales aún)
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    // Global Exception Filter - Catches ALL unhandled exceptions
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Prisma specific exception filters (higher priority)
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaValidationFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaConnectionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaPanicFilter,
    },
    // Rate limiting guard
    {
      provide: APP_GUARD,
      useClass: CustomThrottleGuard,
    },
    // JWT Authentication guard - protects all routes by default
    // Use @Public() decorator to make routes publicly accessible
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Roles authorization guard - checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

/**
 * @module AppModule
 *
 * Módulo raíz: registra módulos de negocio y configura providers globales.
 *
 * Uso: Importado por NestFactory.create(AppModule) en main.ts.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { OrdenesModule } from './modules/ordenes/ordenes.module';
import { PlaneacionModule } from './modules/planeacion/planeacion.module';
import { KitsModule } from './modules/kits/kits.module';
import { EjecucionModule } from './modules/ejecucion/ejecucion.module';
import { EvidenciasModule } from './modules/evidencias/evidencias.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { HesModule } from './modules/hes/hes.module';
import { LineasVidaModule } from './modules/lineas-vida/lineas-vida.module';
import { CostosModule } from './modules/costos/costos.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { MantenimientosModule } from './modules/mantenimientos/mantenimientos.module';
import { FormulariosModule } from './modules/formularios/formularios.module';
import { CierreAdministrativoModule } from './modules/cierre-administrativo/cierre-administrativo.module';

// New modules
import { ArchivadoModule } from './modules/archivado/archivado.module';
import { SyncModule } from './modules/sync/sync.module';
import { PdfGenerationModule } from './modules/pdf-generation/pdf-generation.module';
import { AdminModule } from './modules/admin/admin.module';
import { WeatherModule } from './modules/weather/weather.module';
import { EmailModule } from './modules/email/email.module';
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';

// Common providers
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import {
    PrismaExceptionFilter,
    PrismaValidationFilter,
    PrismaConnectionFilter,
    PrismaPanicFilter,
} from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthController } from './health.controller';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
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

        // Static files (uploads)
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),

        // Core
        PrismaModule,

        // Feature modules
        AuthModule,
        UsuariosModule,
        OrdenesModule,
        PlaneacionModule,
        KitsModule,
        EjecucionModule,
        EvidenciasModule,
        DashboardModule,
        ReportesModule,
        HesModule,
        LineasVidaModule,
        CostosModule,
        ChecklistsModule,
        MantenimientosModule,
        FormulariosModule,
        CierreAdministrativoModule,

        // New modules (Módulos 1-4 según documento)
        ArchivadoModule,    // Módulo 4: Archivado automático
        SyncModule,         // Módulo 1: Sincronización offline
        PdfGenerationModule, // Generación de informes PDF
        AdminModule,        // Módulo 3: Administración RBAC
        WeatherModule,      // Módulo Meteorológico (Open-Meteo + NASA)
        EmailModule,
        TecnicosModule,

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
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        // Rate limiting guard (applies globally)
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }

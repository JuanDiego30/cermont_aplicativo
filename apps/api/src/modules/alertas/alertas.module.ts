/**
 * @module AlertasModule
 * 
 * Módulo NestJS para gestión de alertas
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertasController, PreferenciasController } from './infrastructure/controllers';
import {
  EnviarAlertaUseCase,
  ObtenerHistorialAlertasUseCase,
  MarcarComoLeidaUseCase,
  ActualizarPreferenciasUseCase,
  ReintentarEnvioUseCase,
  DetectarActasSinFirmarUseCase,
} from './application/use-cases';
import {
  AlertaRepository,
  PreferenciaAlertaRepository,
} from './infrastructure/persistence';
import {
  ALERTA_REPOSITORY,
  PREFERENCIA_ALERTA_REPOSITORY,
} from './domain/repositories';
import {
  EmailSenderService,
  PushNotificationService,
  SmsSenderService,
  InAppNotificationService,
  NotificationSenderFactory,
} from './infrastructure/services';
import { NotificationQueueService } from './infrastructure/queue';
import { AlertasGateway } from './infrastructure/gateway/alertas.gateway';

@Module({
  imports: [PrismaModule, ConfigModule, NotificationsModule],
  controllers: [AlertasController, PreferenciasController],
  providers: [
    // Repositories
    {
      provide: ALERTA_REPOSITORY,
      useClass: AlertaRepository,
    },
    {
      provide: PREFERENCIA_ALERTA_REPOSITORY,
      useClass: PreferenciaAlertaRepository,
    },
    // Use Cases
    EnviarAlertaUseCase,
    ObtenerHistorialAlertasUseCase,
    MarcarComoLeidaUseCase,
    ActualizarPreferenciasUseCase,
    ReintentarEnvioUseCase,
    DetectarActasSinFirmarUseCase,
    // Notification Services (Strategy Pattern)
    EmailSenderService,
    PushNotificationService,
    SmsSenderService,
    InAppNotificationService,
    NotificationSenderFactory,
    // WebSocket Gateway
    AlertasGateway,
    {
      provide: 'AlertasGateway',
      useExisting: AlertasGateway,
    },
    // Notification Queue Service
    NotificationQueueService,
    {
      provide: 'NotificationQueueService',
      useExisting: NotificationQueueService,
    },
  ],
  exports: [
    ALERTA_REPOSITORY,
    PREFERENCIA_ALERTA_REPOSITORY,
    EnviarAlertaUseCase,
    ReintentarEnvioUseCase,
    DetectarActasSinFirmarUseCase,
  ],
})
export class AlertasModule { }

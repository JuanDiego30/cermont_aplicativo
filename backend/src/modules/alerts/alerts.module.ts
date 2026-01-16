/**
 * @module AlertsModule
 * @description Simplified Alerts module (Vibe-Coding: Service Pattern)
 * MVP: Deshabilitado NotificationQueueService - requiere repositorio abstracto
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertasGateway } from './gateway/alertas.gateway';
// MVP: Queue deshabilitado - requiere ALERTA_REPOSITORY
// import { NotificationQueueService } from './queue/notification-queue.service';
import {
  EmailSenderService,
  InAppNotificationService,
  NotificationSenderFactory,
  PushNotificationService,
  SmsSenderService,
} from './strategies';

@Module({
  imports: [PrismaModule, ConfigModule, NotificationsModule],
  controllers: [AlertsController],
  providers: [
    AlertsService,
    // Notification Services (Strategy Pattern - Preserved)
    EmailSenderService,
    PushNotificationService,
    SmsSenderService,
    InAppNotificationService,
    NotificationSenderFactory,
    // WebSocket Gateway
    AlertasGateway,
    // MVP: Queue deshabilitado - no esencial para formularios de inspección
    // NotificationQueueService,
    // {
    //   provide: 'NotificationQueueService',
    //   useClass: NotificationQueueService,
    // },
  ],
  exports: [AlertsService],
})
export class AlertsModule {}

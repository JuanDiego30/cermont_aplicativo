/**
 * @module AlertsModule
 * @description Simplified Alerts module (Vibe-Coding: Service Pattern)
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertasController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertasGateway } from './gateway/alertas.gateway';
import { NotificationQueueService } from './queue/notification-queue.service';
import {
    EmailSenderService,
    InAppNotificationService,
    NotificationSenderFactory,
    PushNotificationService,
    SmsSenderService,
} from './strategies';

@Module({
  imports: [PrismaModule, ConfigModule, NotificationsModule],
  controllers: [AlertasController],
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
    // Queue
    NotificationQueueService,
    {
      provide: 'NotificationQueueService',
      useClass: NotificationQueueService, // Simplified provider
    },
  ],
  exports: [AlertsService, 'NotificationQueueService'],
})
export class AlertsModule {}

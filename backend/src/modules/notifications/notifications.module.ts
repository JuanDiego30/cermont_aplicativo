import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailQueueService } from './email/email-queue.service';
import { EmailService } from './email/email.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailQueueService, NotificationsService],
  exports: [EmailService, EmailQueueService, NotificationsService],
})
export class NotificationsModule {}

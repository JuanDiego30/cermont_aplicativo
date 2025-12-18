
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './infrastructure/controllers/email.controller';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { SendBulkEmailsUseCase } from './application/use-cases/send-bulk-emails.use-case';

@Module({
    imports: [ConfigModule],
    controllers: [EmailController],
    providers: [
        {
            provide: 'EmailRepository',
            useClass: NodemailerEmailService,
        },
        SendEmailUseCase,
        SendBulkEmailsUseCase,
        NodemailerEmailService, // Exporting service directly if needed by other modules internally
    ],
    exports: [SendEmailUseCase, 'EmailRepository'],
})
export class EmailModule { }

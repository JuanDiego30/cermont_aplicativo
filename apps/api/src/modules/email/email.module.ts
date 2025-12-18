import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure layer
import { EmailController } from './infrastructure/controllers/email.controller';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service';

// Application layer
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';

// Domain layer
import { EMAIL_SERVICE_TOKEN } from './domain/repositories/email.repository.interface';

/**
 * Module: Email
 * Gestión de emails con arquitectura DDD
 * 
 * Capas:
 * - Domain: Entidades, Value Objects, Interfaces
 * - Application: Use Cases, DTOs
 * - Infrastructure: Controllers, Services (Nodemailer)
 */
@Module({
    imports: [ConfigModule],
    controllers: [EmailController],
    providers: [
        // ✅ Use Cases
        SendEmailUseCase,

        // ✅ Services (con inyección de interfaz)
        {
            provide: EMAIL_SERVICE_TOKEN,
            useClass: NodemailerEmailService,
        },
    ],
    exports: [SendEmailUseCase, EMAIL_SERVICE_TOKEN],
})
export class EmailModule { }

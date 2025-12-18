
import { Injectable, Inject } from '@nestjs/common';
import { SendEmailDto } from '../dto/send-email.dto';
import { EmailMessage } from '../../domain/entities/email-message.entity';
import { EmailRepository } from '../../domain/repositories/email.repository.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendEmailUseCase {
    constructor(
        @Inject('EmailRepository')
        private readonly emailRepository: EmailRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(dto: SendEmailDto): Promise<void> {
        // 1. Obtener remitente por configuración (para asegurar que sea uno válido)
        const from = this.configService.get<string>('SMTP_FROM') || 'noreply@cermont.com';

        // 2. Crear entidad de Dominio (aplica reglas de negocio)
        const email = EmailMessage.create({
            from,
            to: dto.to,
            subject: dto.subject,
            content: dto.content,
            cc: dto.cc,
            bcc: dto.bcc,
            attachments: dto.attachments,
            metadata: dto.metadata,
        });

        // 3. Enviar mediante repositorio (infraestructura)
        await this.emailRepository.send(email);
        email.markAsSent();

        // 4. Log opcional (historial)
        // await this.emailRepository.logSentEmail(email);
    }
}

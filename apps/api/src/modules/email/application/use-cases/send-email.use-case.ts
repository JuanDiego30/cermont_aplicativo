import { Injectable, Logger, Inject } from '@nestjs/common';
import { Email } from '../../domain/entities/email.entity';
import { IEmailService, EMAIL_SERVICE_TOKEN } from '../../domain/repositories/email.repository.interface';
import { SendEmailDto } from '../dto/send-email.dto';

/**
 * Use Case: Enviar Email
 * 
 * Responsabilidad: Orquestar el envío de un email
 * - Validar datos de entrada
 * - Crear entidad Email del dominio
 * - Delegar envío al servicio de infraestructura
 * - Registrar resultado
 */
@Injectable()
export class SendEmailUseCase {
    private readonly logger = new Logger(SendEmailUseCase.name);

    constructor(
        @Inject(EMAIL_SERVICE_TOKEN)
        private readonly emailService: IEmailService,
    ) { }

    /**
     * Ejecutar el caso de uso
     */
    async execute(dto: SendEmailDto): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }> {
        this.logger.log(`Enviando email a: ${dto.to.join(', ')}`);

        try {
            // ✅ Crear entidad de dominio (con validaciones)
            const email = Email.create(
                dto.from,
                dto.to,
                dto.subject,
                dto.text || '',
                dto.html || '',
            );

            // ✅ Delegar envío al servicio de infraestructura
            const result = await this.emailService.send(email);

            // ✅ Marcar estado según resultado
            if (result.success) {
                email.markAsSent();
                this.logger.log(`✅ Email enviado exitosamente: ${result.messageId}`);
            } else {
                email.markAsFailed(result.error || 'Error desconocido');
                this.logger.error(`❌ Error al enviar email: ${result.error}`);
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`❌ Error en SendEmailUseCase: ${errorMessage}`);

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}

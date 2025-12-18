import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Email } from '../../domain/entities/email.entity';
import { IEmailService } from '../../domain/repositories/email.repository.interface';

/**
 * Implementación: NodemailerEmailService
 * Implementa IEmailService usando Nodemailer para SMTP
 */
@Injectable()
export class NodemailerEmailService implements IEmailService {
    private readonly logger = new Logger(NodemailerEmailService.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        this.initializeTransporter();
    }

    /**
     * Inicializar transporter de Nodemailer
     */
    private initializeTransporter(): void {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT');
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASSWORD');

        if (!host || !port || !user || !pass) {
            this.logger.warn('⚠️  SMTP no configurado, los emails no se enviarán');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465, // true para 465, false para otros puertos
                auth: { user, pass },
            });

            this.logger.log(`✅ Nodemailer inicializado (${host}:${port})`);
        } catch (error) {
            this.logger.error('❌ Error inicializando Nodemailer', error);
        }
    }

    /**
     * Enviar un email
     */
    async send(email: Email): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }> {
        if (!this.transporter) {
            this.logger.warn('⚠️  SMTP no configurado, email no enviado');
            return {
                success: false,
                error: 'SMTP no configurado',
            };
        }

        try {
            const info = await this.transporter.sendMail({
                from: email.from.getValue(),
                to: email.to.map(addr => addr.getValue()).join(', '),
                subject: email.subject,
                text: email.body,
                html: email.html,
            });

            this.logger.log(`✅ Email enviado: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`❌ Error al enviar email: ${errorMessage}`);

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Enviar emails en bulk
     */
    async sendBulk(emails: Email[]): Promise<{
        success: boolean;
        sent: number;
        failed: number;
        errors: string[];
    }> {
        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const email of emails) {
            const result = await this.send(email);
            if (result.success) {
                sent++;
            } else {
                failed++;
                if (result.error) {
                    errors.push(result.error);
                }
            }
        }

        return {
            success: failed === 0,
            sent,
            failed,
            errors,
        };
    }
}


import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailRepository } from '../../domain/repositories/email.repository.interface';
import { EmailMessage, Attachment } from '../../domain/entities/email-message.entity';

@Injectable()
export class NodemailerEmailService implements EmailRepository {
    private readonly transporter: nodemailer.Transporter;
    private readonly logger = new Logger(NodemailerEmailService.name);

    constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        // Fallback a process.env si ConfigService no está disponible
        const host = this.configService?.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
        const port = this.configService?.get<number>('SMTP_PORT') || Number(process.env.SMTP_PORT) || 587;
        const user = this.configService?.get<string>('SMTP_USER') || process.env.SMTP_USER;
        const pass = this.configService?.get<string>('SMTP_PASS') || process.env.SMTP_PASS;
        const secure = this.configService?.get<boolean>('SMTP_SECURE') || process.env.SMTP_SECURE === 'true';

        if (!host || !user || !pass) {
            this.logger.warn('SMTP configuration missing. Emails may fail.');
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });
    }

    async send(email: EmailMessage): Promise<void> {
        const plain = email.toPlainObject();

        try {
            this.logger.log(`Sending email to ${plain.to} with subject "${plain.subject}"`);

            await this.transporter.sendMail({
                from: plain.from,
                to: plain.to,
                cc: plain.cc,
                bcc: plain.bcc,
                subject: plain.subject,
                html: plain.content,
                attachments: plain.attachments?.map((att: Attachment) => ({
                    filename: att.filename,
                    content: att.content,
                    contentType: att.contentType
                })),
            });

            this.logger.log(`Email sent successfully to ${plain.to}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.stack : String(error);
            this.logger.error(`Failed to send email to ${plain.to}`, errorMessage);
            throw error;
        }
    }

    async logSentEmail(email: EmailMessage): Promise<void> {
        this.logger.debug(`[DB LOG] Email ${email.id} logged.`);
    }
}

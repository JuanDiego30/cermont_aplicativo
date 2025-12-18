import { Email } from '../entities/email.entity';

/**
 * Interfaz: IEmailService
 * Define el contrato para servicios de email (Nodemailer, SendGrid, etc.)
 */
export interface IEmailService {
    /**
     * Enviar un email
     */
    send(email: Email): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;

    /**
     * Enviar múltiples emails en bulk
     */
    sendBulk(emails: Email[]): Promise<{
        success: boolean;
        sent: number;
        failed: number;
        errors: string[];
    }>;
}

/**
 * Token de inyección para IEmailService
 */
export const EMAIL_SERVICE_TOKEN = 'IEmailService';

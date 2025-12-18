
import { EmailMessage } from '../entities/email-message.entity';

export interface EmailRepository {
    /**
     * Envía el mensaje real mediante el proveedor externo (Nodemailer/SendGrid)
     */
    send(email: EmailMessage): Promise<void>;

    /**
     * Guarda el historial de envío (opcional, si se requiere log en BD)
     */
    logSentEmail(email: EmailMessage): Promise<void>;
}

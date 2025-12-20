
import { EmailAddress } from '../value-objects/email-address.vo';
import { EmailSubject } from '../value-objects/email-subject.vo';
import { EmailContent } from '../value-objects/email-content.vo';
import { BusinessRuleViolationError } from '../../../../common/errors/domain-error.base';

export interface Attachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    size?: number;
}

export interface CreateEmailMessageProps {
    from: string;
    to: string;
    subject: string;
    content: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Attachment[];
    metadata?: Record<string, any>;
}

/**
 * Entidad de dominio que representa un mensaje de email
 * con todas sus reglas de negocio.
 */
export class EmailMessage {
    private constructor(
        public readonly id: string,
        public readonly from: EmailAddress,
        public readonly to: EmailAddress,
        public readonly subject: EmailSubject,
        public readonly content: EmailContent,
        public readonly cc?: EmailAddress[],
        public readonly bcc?: EmailAddress[],
        public readonly attachments?: Attachment[],
        public sentAt?: Date,
        public readonly metadata?: Record<string, any>,
    ) { }

    /**
     * Factory method para crear un nuevo email
     * Aplica todas las validaciones de negocio
     */
    static create(props: CreateEmailMessageProps): EmailMessage {
        // Convertir a VOs para instanciar (lo cual dispara validaciones individuales)
        const fromVO = EmailAddress.create(props.from);
        const toVO = EmailAddress.create(props.to);

        // Regla: No se puede enviar email a uno mismo (anti-spam básico)
        if (fromVO.getValue() === toVO.getValue()) {
            throw new BusinessRuleViolationError('No se puede enviar email a la misma dirección', 'SAME_SENDER_RECIPIENT');
        }

        const ccVOs = props.cc?.map(email => EmailAddress.create(email));
        const bccVOs = props.bcc?.map(email => EmailAddress.create(email));

        // Regla: Límite de destinatarios
        const totalRecipients = 1 + (ccVOs?.length || 0) + (bccVOs?.length || 0);
        if (totalRecipients > 50) {
            throw new BusinessRuleViolationError('Máximo 50 destinatarios por email', 'MAX_RECIPIENTS_EXCEEDED');
        }

        // Regla: Tamaño attachments
        const totalAttachmentSize = props.attachments?.reduce(
            (sum, att) => sum + (att.size || 0),
            0
        ) || 0;

        if (totalAttachmentSize > 10 * 1024 * 1024) {
            throw new BusinessRuleViolationError('El tamaño total de attachments no puede exceder 10MB', 'ATTACHMENT_SIZE_EXCEEDED');
        }

        return new EmailMessage(
            this.generateId(),
            fromVO,
            toVO,
            EmailSubject.create(props.subject),
            EmailContent.create(props.content),
            ccVOs,
            bccVOs,
            props.attachments,
            undefined,
            props.metadata,
        );
    }

    /**
     * Marca el email como enviado
     */
    markAsSent(): void {
        if (this.sentAt) {
            throw new BusinessRuleViolationError('El email ya fue enviado', 'EMAIL_ALREADY_SENT');
        }
        this.sentAt = new Date();
    }

    /**
     * Verifica si el email ya fue enviado
     */
    isSent(): boolean {
        return this.sentAt !== undefined;
    }

    /**
     * Obtiene el tamaño total del email (para límites)
     */
    getSize(): number {
        const contentSize = this.content.getValue().length;
        const attachmentsSize = this.attachments?.reduce(
            (sum, att) => sum + (att.size || 0),
            0
        ) || 0;

        return contentSize + attachmentsSize;
    }

    /**
     * Convierte la entidad a objeto plano (para persistencia/envío)
     */
    toPlainObject() {
        return {
            id: this.id,
            from: this.from.getValue(),
            to: this.to.getValue(),
            subject: this.subject.getValue(),
            content: this.content.getValue(),
            cc: this.cc?.map(email => email.getValue()),
            bcc: this.bcc?.map(email => email.getValue()),
            attachments: this.attachments,
            sentAt: this.sentAt,
            metadata: this.metadata,
        };
    }

    private static generateId(): string {
        return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

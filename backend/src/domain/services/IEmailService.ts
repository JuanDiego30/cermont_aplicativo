export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailParams {
  to: string | string[];
  subject: string;
  
  // Contenido (debe proveerse al menos uno)
  html?: string;
  text?: string;
  templateId?: string; // ID de plantilla en servicio externo (ej: SendGrid)
  templateData?: Record<string, unknown>;

  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Servicio de Infraestructura: Email
 * Responsabilidad única: Entregar correos.
 * NO debe contener lógica de negocio (bienvenidas, alertas, etc).
 */
export interface IEmailService {
  send(params: EmailParams): Promise<void>;
  
  /**
   * Notifica a un técnico que se le ha asignado una orden.
   */
  notifyOrderAssigned?(
    email: string,
    technicianName: string,
    order: { orderNumber: string; clientName: string; description: string }
  ): Promise<void>;
}

export type EmailAddress = string;

export interface SendEmailInput {
  to: EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  from?: EmailAddress;
  replyTo?: EmailAddress;

  /**
   * Número máximo de intentos (reintentos) ante fallo.
   * Si no se especifica, se usa configuración por defecto.
   */
  maxAttempts?: number;
}

export interface SendEmailResult {
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
}

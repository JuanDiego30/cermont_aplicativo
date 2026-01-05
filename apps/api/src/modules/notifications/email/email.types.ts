export type EmailAddress = string;

import type { EmailTemplateName } from "./email-templates";

export interface SendEmailInput {
  to: EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  from?: EmailAddress;
  replyTo?: EmailAddress;

  /**
   * Plantilla de email (Handlebars) registrada en el módulo de notificaciones.
   * Si se envía, se renderiza a html/text encolando el email.
   */
  template?: EmailTemplateName;
  templateData?: Record<string, unknown>;

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

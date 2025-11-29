/**
 * Forgot Password Use Case
 * 
 * Genera un token de recuperación de contraseña y envía el email.
 * 
 * Características:
 * - Genera token único y seguro
 * - Limita solicitudes por usuario (evita spam)
 * - Envía email con enlace de recuperación
 * - No revela si el email existe (seguridad)
 * 
 * @file src/app/auth/use-cases/ForgotPassword.ts
 */

import crypto from 'crypto';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IPasswordResetRepository } from '../../../domain/repositories/IPasswordResetRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import type { EmailParams } from '../../../domain/services/IEmailService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { SYSTEM_USER_ID } from '../../../shared/constants/system.js';
import { logger } from '../../../shared/utils/logger.js';

// Constantes de configuración
const TOKEN_CONFIG = {
  /** Longitud del token en bytes (32 bytes = 64 caracteres hex) */
  LENGTH_BYTES: 32,
  /** Tiempo de expiración en horas */
  EXPIRATION_HOURS: 1,
  /** Tiempo mínimo entre solicitudes (minutos) */
  COOLDOWN_MINUTES: 5,
} as const;

const ERROR_MESSAGES = {
  MISSING_EMAIL: 'El email es requerido',
  INVALID_EMAIL: 'Formato de email inválido',
  TOO_MANY_REQUESTS: 'Ya se envió un correo de recuperación recientemente. Intente más tarde.',
} as const;

// Mensaje genérico para no revelar si el email existe
const SUCCESS_MESSAGE = 'Si el email existe en nuestro sistema, recibirá un correo con instrucciones para recuperar su contraseña.';

interface ForgotPasswordInput {
  email: string;
  frontendUrl?: string;
  ip?: string;
  userAgent?: string;
}

interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Interface mínima para el servicio de email (solo necesita send)
 */
interface IEmailSender {
  send(params: EmailParams): Promise<void>;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly emailService: IEmailSender,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    const { email, frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000', ip, userAgent } = input;

    // Validación básica
    if (!email || typeof email !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_EMAIL);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }

    try {
      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(normalizedEmail);

      // IMPORTANTE: Siempre devolver éxito para no revelar si el email existe
      if (!user) {
        await this.logAttempt(normalizedEmail, false, 'Email no encontrado', ip, userAgent);
        return {
          success: true,
          message: SUCCESS_MESSAGE,
        };
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        await this.logAttempt(normalizedEmail, false, 'Usuario inactivo', ip, userAgent, user.id);
        return {
          success: true,
          message: SUCCESS_MESSAGE,
        };
      }

      // Verificar si ya hay un token activo reciente (cooldown)
      const existingToken = await this.passwordResetRepository.findActiveByEmail(normalizedEmail);
      if (existingToken) {
        const cooldownMs = TOKEN_CONFIG.COOLDOWN_MINUTES * 60 * 1000;
        const tokenAge = Date.now() - existingToken.createdAt.getTime();
        
        if (tokenAge < cooldownMs) {
          // Silenciosamente devolver éxito (no revelar que ya se envió)
          await this.logAttempt(normalizedEmail, false, 'Cooldown activo', ip, userAgent, user.id);
          return {
            success: true,
            message: SUCCESS_MESSAGE,
          };
        }
      }

      // Generar token seguro
      const token = crypto.randomBytes(TOKEN_CONFIG.LENGTH_BYTES).toString('hex');
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + TOKEN_CONFIG.EXPIRATION_HOURS);

      // Guardar token en la base de datos
      await this.passwordResetRepository.create({
        token,
        userId: user.id,
        email: normalizedEmail,
        expiresAt,
      });

      // Construir enlace de recuperación
      const resetLink = `${frontendUrl}/forgot-password?token=${token}`;

      // Enviar email
      await this.sendResetEmail(normalizedEmail, user.name, resetLink);

      // Registrar auditoría
      await this.logAttempt(normalizedEmail, true, 'Token generado y email enviado', ip, userAgent, user.id);

      logger.info(`Password reset requested for email: ${normalizedEmail}`);

      return {
        success: true,
        message: SUCCESS_MESSAGE,
      };

    } catch (e) {
      logger.error('Error in ForgotPasswordUseCase:', { error: e });
      
      // Aún en caso de error, devolver éxito por seguridad
      return {
        success: true,
        message: SUCCESS_MESSAGE,
      };
    }
  }

  private async sendResetEmail(email: string, userName: string, resetLink: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .warning { color: #dc3545; font-size: 12px; margin-top: 20px; }
            .link-text { word-break: break-all; font-size: 12px; color: #666; background: #f0f0f0; padding: 10px; border-radius: 3px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
              </p>

              <p class="link-text">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                ${resetLink}
              </p>
              
              <p class="warning">
                ⚠️ Este enlace expirará en ${TOKEN_CONFIG.EXPIRATION_HOURS} hora(s).<br/>
                Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.
              </p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responder.</p>
              <p>&copy; ${new Date().getFullYear()} CERMONT S.A.S. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetLink}

Este enlace expirará en ${TOKEN_CONFIG.EXPIRATION_HOURS} hora(s).

Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.

Saludos,
CERMONT S.A.S.
    `;

    const emailParams: EmailParams = {
      to: email,
      subject: 'Recuperación de Contraseña - CERMONT S.A.S.',
      html: htmlContent,
      text: textContent,
    };

    await this.emailService.send(emailParams);
  }

  private async logAttempt(
    email: string,
    success: boolean,
    reasonMsg: string,
    ip?: string,
    userAgent?: string,
    userId?: string,
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        userId: userId || SYSTEM_USER_ID,
        action: AuditAction.PASSWORD_RESET_REQUEST,
        entityType: 'User',
        entityId: userId || 'N/A',
        before: null,
        after: {
          email,
          success,
        },
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason: reasonMsg,
      });
    } catch (e) {
      logger.error('Error logging password reset attempt:', { error: e });
    }
  }
}

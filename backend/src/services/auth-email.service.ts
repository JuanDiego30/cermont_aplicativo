/**
 * Auth Email Service — sends password reset emails via the email gateway.
 *
 * Separated from the auth service to avoid circular dependencies
 * and to keep email concerns isolated.
 */
import { createLogger } from "../common/utils/logger";
import { env } from "../config/env";
import { emailGateway } from "./messaging/email.gateway";

const log = createLogger("auth-email");

export interface SendResetPasswordEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send a password reset email to the user.
 */
export async function sendResetPasswordEmail(
  email: string,
  resetToken: string,
): Promise<SendResetPasswordEmailResult> {
  const frontendUrl = env.FRONTEND_URL;
  const resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

  const htmlBody = [
    "<h2>Restablecimiento de contraseña</h2>",
    "<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>",
    "<p><a href=\"" + resetUrl + "\">" + resetUrl + "</a></p>",
    "<p>Este enlace expira en 1 hora.</p>",
    "<p>Si no solicitaste este cambio, ignora este mensaje.</p>",
    "<p>Atentamente,<br/>CERMONT S.A.S.</p>",
  ].join("");

  try {
    const result = await emailGateway.send({
      to: email,
      subject: "Restablecimiento de contraseña - CERMONT S.A.S.",
      body: "Restablece tu contraseña en: " + resetUrl,
      htmlBody,
    });

    if (!result.success) {
      log.error("Failed to send password reset email", {
        email,
        error: result.error ?? "unknown",
      });
    }

    return { success: result.success, error: result.error };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log.error("Exception sending password reset email", {
      email,
      error: msg,
    });
    return {
      success: false,
      error: msg,
    };
  }
}

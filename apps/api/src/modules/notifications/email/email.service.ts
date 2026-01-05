import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

type NodemailerTestMessageInfo = Parameters<
  typeof nodemailer.getTestMessageUrl
>[0];

import type { SendEmailInput, SendEmailResult } from "./email.types";

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  private transporter: Transporter | null = null;
  private etherealReady = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.initializeTransporter();
  }

  private getFromAddress(): string {
    return (
      this.config.get<string>("EMAIL_FROM") ||
      this.config.get<string>("SMTP_FROM") ||
      this.config.get<string>("SMTP_USER") ||
      "noreply@cermont.com"
    );
  }

  private getDefaultMaxAttempts(): number {
    const raw = this.config.get<string>("EMAIL_MAX_ATTEMPTS") || "3";
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
  }

  private getRetryDelayMs(attempt: number): number {
    // Exponential backoff básico: base * 2^(attempt-1)
    const raw = this.config.get<string>("EMAIL_RETRY_DELAY_MS") || "500";
    const base = Number.parseInt(raw, 10);
    const baseMs = Number.isFinite(base) && base >= 0 ? base : 500;
    return baseMs * Math.pow(2, Math.max(0, attempt - 1));
  }

  private async sleep(ms: number): Promise<void> {
    if (ms <= 0) return;
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  private async initializeTransporter(): Promise<void> {
    const smtpHost = this.config.get<string>("SMTP_HOST");
    const smtpPort = this.config.get<string>("SMTP_PORT");
    const smtpUser = this.config.get<string>("SMTP_USER");
    const smtpPass = this.config.get<string>("SMTP_PASS");

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const port = Number.parseInt(smtpPort, 10);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.logger.log("✅ EmailService configurado con SMTP");
      return;
    }

    // Fallback para desarrollo: Ethereal (no usar en producción)
    const nodeEnv = this.config.get<string>("NODE_ENV") || "development";
    if (nodeEnv === "production") {
      this.logger.warn(
        "SMTP no configurado (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS). Emails deshabilitados en producción.",
      );
      this.transporter = null;
      return;
    }

    this.logger.warn(
      "SMTP no configurado. Se intentará usar Ethereal Email (solo desarrollo). Configure SMTP_* para producción.",
    );

    // Se crea bajo demanda para evitar overhead si nunca se envía nada.
    this.transporter = null;
    this.etherealReady = false;
  }

  private async ensureEtherealTransporter(): Promise<void> {
    if (this.transporter) return;
    if (this.etherealReady) return;

    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    this.etherealReady = true;

    this.logger.warn("⚠️  Usando Ethereal Email (solo desarrollo).");
  }

  private extractMessageId(info: unknown): string | undefined {
    if (!info || typeof info !== "object") return undefined;

    const record = info as Record<string, unknown>;
    const messageId = record.messageId;
    return typeof messageId === "string" && messageId.length > 0
      ? messageId
      : undefined;
  }

  private extractAddressList(
    info: unknown,
    key: "accepted" | "rejected",
  ): string[] | undefined {
    if (!info || typeof info !== "object") return undefined;

    const record = info as Record<string, unknown>;
    const raw = record[key];
    if (!Array.isArray(raw)) return undefined;

    const values = raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const address = (item as Record<string, unknown>).address;
          if (typeof address === "string") return address;
        }
        return undefined;
      })
      .filter((value): value is string => Boolean(value));

    return values.length > 0 ? values : undefined;
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const toList = Array.isArray(input.to) ? input.to : [input.to];
    const to = toList.filter(Boolean);

    if (to.length === 0) {
      throw new Error("EmailService: destinatario vacío");
    }

    const from = input.from || this.getFromAddress();
    const maxAttempts = input.maxAttempts ?? this.getDefaultMaxAttempts();

    const nodeEnv = this.config.get<string>("NODE_ENV") || "development";

    if (!this.transporter) {
      if (nodeEnv === "production") {
        this.logger.warn(
          "EmailService: transporter no configurado; omitiendo envío.",
          {
            to,
            subject: input.subject,
          },
        );
        return {};
      }

      await this.ensureEtherealTransporter();
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const info = await this.transporter!.sendMail({
          from,
          to,
          replyTo: input.replyTo,
          subject: input.subject,
          html: input.html,
          text: input.text,
        });

        const messageId = this.extractMessageId(info);

        // Ethereal preview URL (solo si aplica)
        try {
          const previewUrl = nodemailer.getTestMessageUrl(
            info as unknown as NodemailerTestMessageInfo,
          );
          if (previewUrl) {
            this.logger.log(`📧 Email enviado (Ethereal): ${previewUrl}`);
          }
        } catch {
          // no-op
        }

        this.logger.log("📧 Email enviado", {
          to,
          subject: input.subject,
          messageId,
          attempt,
        });

        return {
          messageId,
          accepted: this.extractAddressList(info, "accepted"),
          rejected: this.extractAddressList(info, "rejected"),
        };
      } catch (error) {
        lastError = error;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn("EmailService: fallo enviando email", {
          to,
          subject: input.subject,
          attempt,
          error: errorMessage,
        });

        if (attempt < maxAttempts) {
          await this.sleep(this.getRetryDelayMs(attempt));
        }
      }
    }

    const finalMessage =
      lastError instanceof Error ? lastError.message : String(lastError);
    this.logger.error("EmailService: agotados reintentos", {
      to,
      subject: input.subject,
      attempts: maxAttempts,
      error: finalMessage,
    });

    throw lastError instanceof Error ? lastError : new Error(finalMessage);
  }
}

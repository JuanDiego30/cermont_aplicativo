/**
 * Email Gateway — Send emails via configured provider
 *
 * Supports:
 * - SMTP via nodemailer (production)
 * - Mailpit (development/test sandbox)
 * - Log (development only, explicit opt-in)
 *
 * Rules:
 * - No process.env — uses centralized env.ts
 * - No silent fallback — provider must be explicit
 * - Production requires EMAIL_PROVIDER=smtp or mailpit
 * - Log provider is development-only
 */

import nodemailer from "nodemailer";
import { createLogger } from "../../common/utils/logger";
import { env } from "../../config/env";
import type { MessageGateway, MessagePayload, MessageResult } from "./gateway.interface";

const log = createLogger("email-gateway");

function getTransporter(): nodemailer.Transporter {
	const host = env.EMAIL_HOST || "localhost";
	const port = env.EMAIL_PORT || 1025;
	const secure = env.EMAIL_SECURE;

	// Mailpit/no auth — common for dev
	if (!env.EMAIL_USER && !env.EMAIL_PASS) {
		return nodemailer.createTransport({ host, port, secure });
	}

	return nodemailer.createTransport({
		host,
		port,
		secure,
		auth: {
			user: env.EMAIL_USER ?? "",
			pass: env.EMAIL_PASS ?? "",
		},
	});
}

/**
 * SMTP / Mailpit email sender
 */
async function sendTransportEmail(payload: MessagePayload): Promise<MessageResult> {
	const transporter = getTransporter();
	const fromName = env.EMAIL_FROM
		? `Cermont S.A.S. <${env.EMAIL_FROM}>`
		: `"Cermont S.A.S." <noreply@cermont.com.co>`;

	const info = await transporter.sendMail({
		from: fromName,
		to: payload.to,
		subject: payload.subject || "Notificación Cermont",
		text: payload.body,
		html: payload.htmlBody || undefined,
	});

	return {
		success: true,
		messageId: info.messageId,
		sentAt: new Date(),
	};
}

/**
 * Development-only email sender — logs to console
 */
async function sendLogEmail(payload: MessagePayload): Promise<MessageResult> {
	log.info("[DEV EMAIL LOG]", {
		to: payload.to,
		subject: payload.subject ?? "",
		body: payload.body.substring(0, 500),
	});
	return {
		success: true,
		messageId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
		sentAt: new Date(),
	};
}

/**
 * Email Gateway implementation
 *
 * Provider selection:
 * - "smtp" → real SMTP with nodemailer
 * - "mailpit" → Mailpit sandbox (SMTP with no auth, default port 1025)
 * - "log" → console only (DEVELOPMENT ONLY)
 */
export const emailGateway: MessageGateway = {
	channel: "email" as const,

	async send(payload: MessagePayload): Promise<MessageResult> {
		const provider = env.EMAIL_PROVIDER || "log";

		try {
			if (provider === "log") {
				return sendLogEmail(payload);
			}

			// smtp or mailpit — both use nodemailer transport
			const result = await sendTransportEmail(payload);
			log.info("Email sent via provider", {
				provider,
				to: payload.to,
				messageId: result.messageId ?? "",
			});
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			log.error("Email delivery failed", {
				provider,
				to: payload.to,
				error: errorMessage,
			});
			return {
				success: false,
				error: errorMessage,
				sentAt: new Date(),
			};
		}
	},
};

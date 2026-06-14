/**
 * Email Gateway — Send emails via configured provider
 *
 * Supports nodemailer for SMTP transport or a logger-based mock for development.
 * In production, configure EMAIL_* environment variables for provider credentials.
 */

import { createLogger } from "../../common/utils/logger";
import type { MessageGateway, MessagePayload, MessageResult } from "./gateway.interface";

const log = createLogger("email-gateway");

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@cermont.com.co";

/**
 * Development-only email sender — logs to console
 */
async function sendDevEmail(payload: MessagePayload): Promise<MessageResult> {
	log.info("[DEV EMAIL]", {
		to: payload.to,
		subject: payload.subject ?? "",
		body: payload.body.substring(0, 200),
	});
	return {
		success: true,
		messageId: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
		sentAt: new Date(),
	};
}

/**
 * Production email sender — uses nodemailer SMTP transport
 * Falls back to dev logger if nodemailer is not available or config is missing
 */
async function sendProductionEmail(payload: MessagePayload): Promise<MessageResult> {
	try {
		// Dynamic import — nodemailer may not be installed (optional dependency)
		let createTransport: (opts: Record<string, unknown>) => {
			sendMail: (opts: Record<string, unknown>) => Promise<{ messageId: string }>;
		};
		try {
			const nodemailer = require("nodemailer");
			createTransport = nodemailer.createTransport.bind(nodemailer);
		} catch {
			log.warn("nodemailer not installed — falling back to dev email log");
			return sendDevEmail(payload);
		}

		const transporter = createTransport({
			host: process.env.EMAIL_HOST || "smtp.gmail.com",
			port: Number(process.env.EMAIL_PORT) || 587,
			secure: process.env.EMAIL_SECURE === "true",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const info = await transporter.sendMail({
			from: `"Cermont S.A.S." <${EMAIL_FROM}>`,
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
	} catch (error) {
		log.error("Failed to send email", { to: payload.to, error: String(error) });
		return {
			success: false,
			error: String(error),
			sentAt: new Date(),
		};
	}
}

/**
 * Email Gateway implementation
 */
export const emailGateway: MessageGateway = {
	channel: "email" as const,

	async send(payload: MessagePayload): Promise<MessageResult> {
		if (!EMAIL_ENABLED) {
			return sendDevEmail(payload);
		}
		return sendProductionEmail(payload);
	},
};

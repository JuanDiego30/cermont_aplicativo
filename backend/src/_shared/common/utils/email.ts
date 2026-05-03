import { createLogger } from "./logger";

const log = createLogger("email-service");

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

/**
 * Mock email service — Logs emails to console and observability layer.
 * In production, this would use nodemailer or a cloud provider (SES, SendGrid).
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
	const { to, subject, html } = options;

	log.info("📧 Outgoing email", {
		to,
		subject,
		bodyPreview: `${html.slice(0, 50)}...`,
	});

	// For development/demonstration as requested
	console.log("=========================================");
	console.log(`TO:      ${to}`);
	console.log(`SUBJECT: ${subject}`);
	console.log("-----------------------------------------");
	console.log("BODY (HTML):");
	console.log(html);
	console.log("=========================================");
}

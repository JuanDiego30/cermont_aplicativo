import { createLogger } from "../common/utils/logger";
import { messagingService } from "./messaging";

const log = createLogger("email-service");

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
	try {
		await messagingService.push({
			channel: "email",
			to: options.to,
			subject: options.subject,
			body: options.html,
			template: "",
			variables: {},
		});
		return true;
	} catch (error) {
		log.error("Failed to send email", {
			to: options.to,
			subject: options.subject,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

interface ProposalEmailData {
	proposalCode: string;
	proposalId: string;
	total: number;
	clientEmail: string;
	clientName: string;
}

export async function enviarEmailPropuesta(data: ProposalEmailData): Promise<boolean> {
	const portalUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/portal/proposals/${data.proposalId}`;

	const html = `
		<h2>Propuesta ${data.proposalCode}</h2>
		<p>Estimado(a) ${data.clientName},</p>
		<p>Se ha generado una nueva propuesta por valor de <strong>$${data.total.toLocaleString("es-CO")}</strong>.</p>
		<p>Para revisar y aprobar, haga clic en el siguiente enlace:</p>
		<p><a href="${portalUrl}">${portalUrl}</a></p>
		<p>Atentamente,<br/>CERMONT S.A.S.</p>
	`;

	return sendEmail({
		to: data.clientEmail,
		subject: `Nueva propuesta CERMONT: ${data.proposalCode}`,
		html,
	});
}

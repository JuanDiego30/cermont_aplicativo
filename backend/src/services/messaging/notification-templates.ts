/**
 * Notification Templates
 *
 * Template definitions for different notification types.
 * Supports variables interpolation for dynamic content.
 */

export interface CompiledTemplate {
	title: string;
	body: string;
	emailSubject?: string;
	emailBody?: string;
	smsBody?: string;
}

const TEMPLATES: Record<string, (vars: Record<string, string>) => CompiledTemplate> = {
	work_assigned: (v) => ({
		title: `Orden de trabajo asignada: ${v.orderCode || ""}`,
		body: `Se te ha asignado la orden ${v.orderCode || ""} en ${v.clientName || "el cliente"}.`,
		emailSubject: `Nueva orden asignada: ${v.orderCode || ""}`,
		emailBody: `<p>Se te ha asignado la orden <strong>${v.orderCode || ""}</strong>.</p>
<p>Cliente: ${v.clientName || "N/A"}<br/>
Ubicación: ${v.location || "N/A"}<br/>
Tipo de servicio: ${v.serviceType || "N/A"}</p>`,
		smsBody: `Orden ${v.orderCode || ""} asignada. Cliente: ${v.clientName || "N/A"}.`,
	}),

	proposal_approved: (v) => ({
		title: `Propuesta aprobada: ${v.proposalCode || ""}`,
		body: `La propuesta ${v.proposalCode || ""} para ${v.clientName || ""} ha sido aprobada.`,
		emailSubject: `Propuesta aprobada — ${v.proposalCode || ""}`,
		emailBody: `<p>La propuesta <strong>${v.proposalCode || ""}</strong> ha sido aprobada.</p>
<p>Cliente: ${v.clientName || "N/A"}<br/>
Valor: ${v.amount || "N/A"}</p>`,
	}),

	execution_started: (v) => ({
		title: `Ejecución iniciada: ${v.orderCode || ""}`,
		body: `La ejecución de la orden ${v.orderCode || ""} ha comenzado en ${v.location || "el sitio"}.`,
		emailSubject: `Ejecución en curso — ${v.orderCode || ""}`,
	}),

	ses_approved: (v) => ({
		title: `SES aprobada: ${v.sesCode || ""}`,
		body: `La hoja de entrada de servicio ${v.sesCode || ""} ha sido aprobada. Factura lista para generar.`,
		emailSubject: `SES aprobada — ${v.sesCode || ""}`,
		emailBody: `<p>La SES <strong>${v.sesCode || ""}</strong> ha sido aprobada.</p>
<p>Ya puedes generar la factura correspondiente.</p>`,
	}),

	invoice_sent: (v) => ({
		title: `Factura emitida: ${v.invoiceCode || ""}`,
		body: `La factura ${v.invoiceCode || ""} por $${v.amount || "0"} ha sido emitida a ${v.clientName || ""}.`,
		emailSubject: `Factura ${v.invoiceCode || ""} — ${v.clientName || ""}`,
		emailBody: `<p>Se ha emitido la factura <strong>${v.invoiceCode || ""}</strong>.</p>
<p>Cliente: ${v.clientName || "N/A"}<br/>
Valor: $${v.amount || "0"}<br/>
Vencimiento: ${v.dueDate || "N/A"}</p>`,
	}),

	payment_received: (v) => ({
		title: `Pago recibido: $${v.amount || "0"}`,
		body: `Se ha recibido el pago de $${v.amount || "0"} para la factura ${v.invoiceCode || ""}.`,
		emailSubject: `Pago recibido — Factura ${v.invoiceCode || ""}`,
	}),

	certification_expiring: (v) => ({
		title: `Certificación próxima a vencer: ${v.certificationName || ""}`,
		body: `La certificación "${v.certificationName || ""}" vence el ${v.expiryDate || ""}.`,
		emailSubject: `ALERTA: Certificación por vencer — ${v.certificationName || ""}`,
		emailBody: `<p><strong>Certificación próxima a vencer</strong></p>
<p>Nombre: ${v.certificationName || "N/A"}<br/>
Vence: ${v.expiryDate || "N/A"}<br/>
Responsable: ${v.holderName || "N/A"}</p>`,
		smsBody: `VENCE: ${v.certificationName || ""} expira el ${v.expiryDate || ""}`,
	}),

	maintenance_due: (v) => ({
		title: `Mantenimiento programado: ${v.assetName || ""}`,
		body: `El activo "${v.assetName || ""}" requiere mantenimiento para el ${v.dueDate || ""}.`,
		emailSubject: `Mantenimiento programado — ${v.assetName || ""}`,
	}),

	payment_overdue: (v) => ({
		title: `Factura vencida: ${v.invoiceCode || ""}`,
		body: `La factura ${v.invoiceCode || ""} por $${v.amount || "0"} está vencida desde el ${v.dueDate || ""}.`,
		emailSubject: `FACTURA VENCIDA — ${v.invoiceCode || ""}`,
		emailBody: `<p><strong>Factura vencida</strong></p>
<p>Factura: ${v.invoiceCode || "N/A"}<br/>
Cliente: ${v.clientName || "N/A"}<br/>
Valor: $${v.amount || "0"}<br/>
Vencimiento: ${v.dueDate || "N/A"}<br/>
Días vencida: ${v.overdueDays || "0"}</p>`,
		smsBody: `VENCIDA: Factura ${v.invoiceCode || ""} por $${v.amount || "0"} venceció el ${v.dueDate || ""}`,
	}),

	report_approved: (v) => ({
		title: `Informe aprobado: ${v.reportCode || ""}`,
		body: `El informe técnico ${v.reportCode || ""} para la orden ${v.orderCode || ""} ha sido aprobado.`,
		emailSubject: `Informe aprobado — ${v.reportCode || ""}`,
	}),
};

/**
 * Compile a notification template with the given variables
 */
export function compileNotificationTemplate(
	templateName: string,
	variables: Record<string, string> = {},
): CompiledTemplate | null {
	const templateFn = TEMPLATES[templateName];
	if (!templateFn) {
		return null;
	}
	return templateFn(variables);
}

/**
 * Check if a template exists
 */
export function hasTemplate(templateName: string): boolean {
	return templateName in TEMPLATES;
}

/**
 * Get all available template names
 */
export function getAvailableTemplates(): string[] {
	return Object.keys(TEMPLATES);
}

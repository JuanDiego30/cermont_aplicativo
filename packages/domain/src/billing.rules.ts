/**
 * Billing Rules — SES, Invoice, Payment chain definitions
 *
 * SSOT for billing chain steps and next-action resolution.
 */

export const BILLING_CHAIN_STEPS = ["ses", "invoice", "invoice_approval", "payment"] as const;

export type BillingStep = (typeof BILLING_CHAIN_STEPS)[number];

export interface BillingState {
	currentStep: BillingStep | null;
	sesApproved: boolean;
	invoiceSent: boolean;
	invoiceApproved: boolean;
	paymentCompleted: boolean;
}

/** Get the next pending billing action */
export function getNextBillingAction(state: BillingState): BillingStep | null {
	if (!state.sesApproved) return "ses";
	if (!state.invoiceSent) return "invoice";
	if (!state.invoiceApproved) return "invoice_approval";
	if (!state.paymentCompleted) return "payment";
	return null;
}

/** Label for billing steps (Spanish) */
export const BILLING_STEP_LABELS: Record<BillingStep, string> = {
	ses: "SES / Ariba",
	invoice: "Factura",
	invoice_approval: "Aprobación de Factura",
	payment: "Pago",
};

/** Billing step descriptions */
export const BILLING_STEP_DESCRIPTIONS: Record<BillingStep, string> = {
	ses: "Crear y aprobar Service Entry Sheet",
	invoice: "Emitir y enviar factura",
	invoice_approval: "Obtener aprobación de factura",
	payment: "Registrar pago",
};

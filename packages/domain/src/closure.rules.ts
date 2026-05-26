/**
 * Closure Rules — Administrative closure chain (steps 11-14)
 *
 * Hard gates that enforce the closure sequence:
 * Reports → Delivery Records → SES → Invoice → Payment → Close
 * SSOT for administrative closure validation.
 */

export interface ServiceCaseClosureContext {
	/** Has approved technical report */
	hasApprovedReport: boolean;
	/** Has signed delivery record */
	hasSignedDeliveryRecord: boolean;
	/** Has approved SES */
	hasApprovedSES: boolean;
	/** Has approved invoice */
	hasApprovedInvoice: boolean;
	/** Has completed payment */
	hasCompletedPayment: boolean;
	/** Has accounting closure */
	hasAccountingClosure: boolean;
	/** User role attempting the action */
	userRole: string;
}

export interface ClosureBlocker {
	code: string;
	message: string;
	step: string;
}

/** Check if SES can be created (requires signed delivery record) */
export function canCreateSES(context: Pick<ServiceCaseClosureContext, "hasSignedDeliveryRecord">): {
	allowed: boolean;
	blockers: ClosureBlocker[];
} {
	const blockers: ClosureBlocker[] = [];
	if (!context.hasSignedDeliveryRecord) {
		blockers.push({
			code: "DELIVERY_RECORD_NOT_SIGNED",
			message: "No se puede crear SES sin acta de entrega firmada",
			step: "client_signature",
		});
	}
	return { allowed: blockers.length === 0, blockers };
}

/** Check if invoice can be created (requires approved SES) */
export function canCreateInvoice(context: Pick<ServiceCaseClosureContext, "hasApprovedSES">): {
	allowed: boolean;
	blockers: ClosureBlocker[];
} {
	const blockers: ClosureBlocker[] = [];
	if (!context.hasApprovedSES) {
		blockers.push({
			code: "SES_NOT_APPROVED",
			message: "No se puede crear factura sin SES aprobada",
			step: "ses",
		});
	}
	return { allowed: blockers.length === 0, blockers };
}

/** Check if payment can be registered (requires approved invoice) */
export function canRegisterPayment(
	context: Pick<ServiceCaseClosureContext, "hasApprovedInvoice">,
): {
	allowed: boolean;
	blockers: ClosureBlocker[];
} {
	const blockers: ClosureBlocker[] = [];
	if (!context.hasApprovedInvoice) {
		blockers.push({
			code: "INVOICE_NOT_APPROVED",
			message: "No se puede registrar pago sin factura aprobada",
			step: "invoice",
		});
	}
	return { allowed: blockers.length === 0, blockers };
}

/** Check if service case can be closed (ALL gates must pass) */
export function canCloseServiceCase(context: ServiceCaseClosureContext): {
	allowed: boolean;
	blockers: ClosureBlocker[];
} {
	const blockers: ClosureBlocker[] = [];

	const reportCheck = canCreateSES({ hasSignedDeliveryRecord: context.hasSignedDeliveryRecord });
	blockers.push(...reportCheck.blockers);

	const sesValid = canCreateInvoice({ hasApprovedSES: context.hasApprovedSES });
	blockers.push(...sesValid.blockers);

	const payValid = canRegisterPayment({ hasApprovedInvoice: context.hasApprovedInvoice });
	blockers.push(...payValid.blockers);

	if (!context.hasApprovedReport) {
		blockers.push({
			code: "REPORT_NOT_APPROVED",
			message: "Informe técnico no aprobado",
			step: "technical_report",
		});
	}

	if (!context.hasCompletedPayment) {
		blockers.push({
			code: "PAYMENT_REQUIRED",
			message: "No se puede cerrar la obra sin pago completado",
			step: "payment",
		});
	}

	return { allowed: blockers.length === 0, blockers };
}

/** Check if a service case can be deleted (gerente only, no accounting closure) */
export function canDeleteServiceCase(
	context: Pick<ServiceCaseClosureContext, "hasAccountingClosure" | "userRole">,
): {
	allowed: boolean;
	blockers: ClosureBlocker[];
} {
	const blockers: ClosureBlocker[] = [];

	if (context.userRole !== "gerente") {
		blockers.push({
			code: "INSUFFICIENT_PERMISSIONS",
			message: "Solo gerente puede eliminar obras",
			step: "closure",
		});
	}

	if (context.hasAccountingClosure) {
		blockers.push({
			code: "HAS_ACCOUNTING_CLOSURE",
			message: "No se puede eliminar obra con cierre contable",
			step: "closure",
		});
	}

	return { allowed: blockers.length === 0, blockers };
}

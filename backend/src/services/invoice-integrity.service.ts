import { UnprocessableError } from "../common/errors/AppError";

interface BillingLineSnapshot {
	description: string;
	quantity: number;
	unit: string;
	unitPrice: number;
	total: number;
}

interface InvoiceIntegritySnapshot {
	serviceEntrySheetId: string;
	workOrderId: string;
	currency: string;
	amount: number;
	taxAmount: number;
	totalAmount: number;
	invoiceLines: BillingLineSnapshot[];
}

interface ServiceEntrySheetIntegritySnapshot {
	id: string;
	status: string;
	workOrderId: string;
	currency: string;
	amount: number;
	taxAmount: number;
	totalAmount: number;
	serviceLines: BillingLineSnapshot[];
}

function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

function failMismatch(field: string): never {
	throw new UnprocessableError(
		`Invoice field ${field} does not match the approved SES`,
		"INVOICE_SES_MISMATCH",
	);
}

function assertMoneyMatches(field: string, invoiceValue: number, sesValue: number): void {
	if (roundMoney(invoiceValue) !== roundMoney(sesValue)) {
		failMismatch(field);
	}
}

function normalizedLines(lines: BillingLineSnapshot[]): string {
	return JSON.stringify(
		lines.map((line) => ({
			description: line.description.trim(),
			quantity: line.quantity,
			unit: line.unit.trim(),
			unitPrice: roundMoney(line.unitPrice),
			total: roundMoney(line.total),
		})),
	);
}

export function assertInvoiceMatchesServiceEntrySheet(
	invoice: InvoiceIntegritySnapshot,
	ses: ServiceEntrySheetIntegritySnapshot,
): void {
	if (ses.status !== "approved") {
		throw new UnprocessableError(
			"SES must be approved before invoice processing",
			"INVOICE_SES_NOT_APPROVED",
		);
	}
	if (invoice.serviceEntrySheetId !== ses.id) {
		failMismatch("serviceEntrySheetId");
	}
	if (invoice.workOrderId !== ses.workOrderId) {
		failMismatch("workOrderId");
	}
	if (invoice.currency !== ses.currency) {
		failMismatch("currency");
	}

	assertMoneyMatches("amount", invoice.amount, ses.amount);
	assertMoneyMatches("taxAmount", invoice.taxAmount, ses.taxAmount);
	assertMoneyMatches("totalAmount", invoice.totalAmount, ses.totalAmount);

	if (normalizedLines(invoice.invoiceLines) !== normalizedLines(ses.serviceLines)) {
		failMismatch("invoiceLines");
	}
}

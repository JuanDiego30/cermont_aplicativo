import type { DeliveryRecord, Invoice, Payment, ServiceEntrySheet } from "@cermont/shared-types";

interface RecordRow {
	id: string;
	code: string;
	status: string;
	title: string;
	subtitle: string;
	amount?: number;
	currency?: string;
	href?: string;
	updatedAt: string;
}

export function deliveryRows(items: DeliveryRecord[]): RecordRow[] {
	return items.map((item) => ({
		id: item._id,
		code: item.code,
		status: item.status,
		title: item.clientRepresentative || "Acta sin representante asignado",
		subtitle: `Orden ${item.workOrderId} · Informe ${item.technicalReportId}`,
		href: `/delivery-records/${item._id}`,
		updatedAt: item.updatedAt,
	}));
}

export function sesRows(items: ServiceEntrySheet[]): RecordRow[] {
	return items.map((item) => ({
		id: item._id,
		code: item.code,
		status: item.status,
		title: item.clientName,
		subtitle: item.aribaDocumentNumber
			? `Ariba ${item.aribaDocumentNumber}`
			: `Orden ${item.workOrderId}`,
		amount: item.totalAmount,
		currency: item.currency,
		href: `/billing/ses/${item._id}`,
		updatedAt: item.updatedAt,
	}));
}

export function invoiceRows(items: Invoice[]): RecordRow[] {
	return items.map((item) => ({
		id: item._id,
		code: item.invoiceNumber || item.code,
		status: item.status,
		title: item.clientName,
		subtitle: item.serviceEntrySheetCode
			? `SES ${item.serviceEntrySheetCode}`
			: `Orden ${item.workOrderId}`,
		amount: item.totalAmount,
		currency: item.currency,
		href: `/billing/invoices/${item._id}`,
		updatedAt: item.updatedAt ?? "",
	}));
}

export function paymentRows(items: Payment[]): RecordRow[] {
	return items.map((item) => ({
		id: item._id,
		code: item.paymentReference,
		status: item.status,
		title: `Pago ${item.paymentMethod}`,
		subtitle: `Factura ${item.invoiceId} · Orden ${item.workOrderId}`,
		amount: item.amount,
		currency: item.currency,
		href: `/payments/${item._id}`,
		updatedAt: item.updatedAt ?? "",
	}));
}

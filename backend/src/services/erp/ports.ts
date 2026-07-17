export interface ErpInvoicePayload {
	invoiceNumber: string;
	clientName: string;
	clientNit?: string;
	totalAmount: number;
	currency: string;
	issueDate: string;
	description?: string;
	lineItems?: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
}

export interface ErpSesPayload {
	sesNumber: string;
	workOrderCode: string;
	period: { from: string; to: string };
	totalAmount: number;
	currency: string;
	clientName: string;
}

export interface ErpSendResult {
	success: boolean;
	externalId?: string;
	status: string;
	syncedAt: string;
	provider: string;
	error?: string;
}

export interface ErpStatusResult {
	externalId: string;
	status: string;
	lastSyncedAt?: string;
	provider: string;
	error?: string;
}

export interface ErpPaymentResult {
	paymentId: string;
	amount: number;
	currency: string;
	date: string;
	reference: string;
	clientName?: string;
}

export interface IERPService {
	sendInvoice(payload: ErpInvoicePayload, provider?: string): Promise<ErpSendResult>;
	sendSES(payload: ErpSesPayload, provider?: string): Promise<ErpSendResult>;
	queryStatus(externalId: string, provider?: string): Promise<ErpStatusResult>;
	getPayments(
		filters: { from?: string; to?: string; clientId?: string },
		provider?: string,
	): Promise<ErpPaymentResult[]>;
}

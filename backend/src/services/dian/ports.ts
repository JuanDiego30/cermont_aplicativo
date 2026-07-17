export interface DianInvoicePayload {
	invoiceId: string;
	invoiceNumber: string;
	prefix: string;
	issueDate: string;
	issueTime: string;
	currency: string;
	totalAmount: number;
	taxableAmount: number;
	ivaAmount: number;
	seller: {
		nit: string;
		businessName: string;
		address: string;
		phone: string;
		email: string;
	};
	buyer: {
		documentType: string;
		documentNumber: string;
		businessName: string;
		address: string;
		email: string;
	};
	lineItems: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
}

export interface DianSendResult {
	success: boolean;
	cufe?: string;
	trackId?: string;
	documentHash?: string;
	error?: string;
	errorCode?: string;
}

export interface DianStatusResult {
	cufe: string;
	status: string;
	description: string;
	trackId: string;
	timestamp: string;
}

export interface DianCufeInput {
	invoiceNumber: string;
	issueDate: string;
	issueTime: string;
	sellerNit: string;
	buyerDoc: string;
	taxableAmount: number;
	ivaAmount: number;
	totalAmount: number;
	softwareSecurityCode: string;
}

export interface IDIANService {
	sendInvoice(payload: DianInvoicePayload, config: unknown): Promise<DianSendResult>;
	checkStatus(cufe: string, trackId?: string): Promise<DianStatusResult>;
	getCufe(input: DianCufeInput): string;
}

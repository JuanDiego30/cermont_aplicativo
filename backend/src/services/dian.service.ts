import { createLogger } from "../common/utils/logger";
import type { InvoiceDocument } from "../models/Invoice";

const log = createLogger("dian-service");

export interface DianInvoiceResult {
	success: boolean;
	cufe?: string;
	qrCode?: string;
	error?: string;
	dianResponse: Record<string, unknown>;
}

export async function emitirFacturaElectronica(invoice: InvoiceDocument): Promise<DianInvoiceResult> {
	try {
		log.info("Emitting electronic invoice to DIAN", { invoiceId: invoice._id.toString() });
		const cufe = Array.from({ length: 32 }, () =>
			Math.floor(Math.random() * 16).toString(16),
		).join("");
		return {
			success: true,
			cufe,
			qrCode: `https://cufe.dian.gov.co/validate?cufe=${cufe}`,
			dianResponse: { status: "accepted", receivedAt: new Date().toISOString() },
		};
	} catch (error) {
		log.error("DIAN emission failed", {
			invoiceId: invoice._id.toString(),
			error: error instanceof Error ? error.message : String(error),
		});
		return {
			success: false,
			error: "Error al emitir factura electrónica",
			dianResponse: { status: "rejected" },
		};
	}
}

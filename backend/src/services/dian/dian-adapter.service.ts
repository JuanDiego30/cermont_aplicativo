import { createHash, randomUUID } from "node:crypto";
import { createLogger } from "../../common/utils/logger";
import type { DianConfigurationDocument } from "../../modules/dian/dian.config.model";
import { executeWithRetryAndDlq } from "../integration";
import type {
	DianCufeInput,
	DianInvoicePayload,
	DianSendResult,
	DianStatusResult,
	IDIANService,
} from "./ports";

const log = createLogger("dian-adapter");

function simulateDianSubmission(
	_payload: DianInvoicePayload,
	_config: DianConfigurationDocument,
): DianSendResult {
	const cufe = Array.from({ length: 96 }, () => Math.floor(Math.random() * 16).toString(16))
		.join("")
		.toUpperCase();

	return {
		success: true,
		cufe,
		trackId: `DIAN-TRACK-${randomUUID().slice(0, 8)}`,
		documentHash: Array.from({ length: 64 }, () =>
			Math.floor(Math.random() * 16).toString(16),
		).join(""),
	};
}

function computeCufe(input: DianCufeInput): string {
	const concatString = [
		input.invoiceNumber,
		input.issueDate,
		input.issueTime,
		input.sellerNit,
		input.buyerDoc,
		input.taxableAmount.toFixed(2),
		input.ivaAmount.toFixed(2),
		input.totalAmount.toFixed(2),
		"",
		"2",
		input.softwareSecurityCode,
	].join("");

	return createHash("sha384").update(concatString, "utf8").digest("hex").toUpperCase();
}

function simulateDianStatusCheck(cufe: string): DianStatusResult {
	return {
		cufe,
		status: "accepted",
		description: "Documento aceptado por DIAN (modo prueba)",
		trackId: `TRACK-${cufe.slice(0, 8)}`,
		timestamp: new Date().toISOString(),
	};
}

async function dianSendInvoiceHandler(
	payload: DianInvoicePayload,
	config: DianConfigurationDocument,
): Promise<DianSendResult> {
	if (config.environment === "production") {
		log.error("DIAN production gateway requires XAdES certificate", {
			invoiceId: payload.invoiceId,
		});
		throw new Error("DIAN production gateway requires XAdES certificate configuration");
	}
	return simulateDianSubmission(payload, config);
}

async function dianCheckStatusHandler(cufe: string, _trackId?: string): Promise<DianStatusResult> {
	return simulateDianStatusCheck(cufe);
}

export const DianAdapter: IDIANService = {
	async sendInvoice(payload: DianInvoicePayload, config: unknown): Promise<DianSendResult> {
		const dianConfig = config as DianConfigurationDocument;
		const result = await executeWithRetryAndDlq(
			() => dianSendInvoiceHandler(payload, dianConfig),
			payload as unknown as Record<string, unknown>,
			{
				maxRetries: 3,
				baseDelayMs: 1000,
				operation: "dian_send_invoice",
				entityType: "Invoice",
				entityId: payload.invoiceId,
				provider: "dian",
				environment: dianConfig.environment,
			},
		);
		if (result.success) {
			return result.data;
		}
		return {
			success: false,
			error: result.error,
			errorCode: result.errorCode,
		};
	},

	async checkStatus(cufe: string, trackId?: string): Promise<DianStatusResult> {
		const result = await executeWithRetryAndDlq(
			() => dianCheckStatusHandler(cufe, trackId),
			{ cufe, trackId },
			{
				maxRetries: 2,
				baseDelayMs: 500,
				operation: "dian_check_status",
				entityType: "Invoice",
				entityId: cufe,
				provider: "dian",
			},
		);
		if (result.success) {
			return result.data;
		}
		return {
			cufe,
			status: "unknown",
			description: result.error,
			trackId: trackId ?? "",
			timestamp: new Date().toISOString(),
		};
	},

	getCufe(input: DianCufeInput): string {
		return computeCufe(input);
	},
};

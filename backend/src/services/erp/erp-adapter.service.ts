import { createLogger } from "../../common/utils/logger";
import { executeWithRetryAndDlq } from "../integration";
import { erpEngine } from "./erp-core-engine";
import type {
	ErpInvoicePayload,
	ErpPaymentResult,
	ErpSendResult,
	ErpSesPayload,
	ErpStatusResult,
	IERPService,
} from "./ports";

const _log = createLogger("erp-adapter");

async function erpSendInvoiceHandler(
	payload: ErpInvoicePayload,
	provider: string,
): Promise<ErpSendResult> {
	const adapter = erpEngine.getProvider(provider);
	if (!adapter) {
		throw new Error(`No ERP adapter registered for provider: ${provider}`);
	}
	if (!adapter.enabled) {
		throw new Error(`ERP adapter is disabled: ${provider}`);
	}
	const result = await adapter.execute("submit_invoice", {
		...payload,
		provider,
	});
	if (!result.success) {
		throw new Error(result.error ?? `ERP ${provider} invoice submission failed`);
	}
	return {
		success: true,
		externalId:
			((result.data as Record<string, unknown>)?.externalId as string) ?? payload.invoiceNumber,
		status: "submitted",
		syncedAt: new Date().toISOString(),
		provider,
	};
}

async function erpSendSesHandler(payload: ErpSesPayload, provider: string): Promise<ErpSendResult> {
	const adapter = erpEngine.getProvider(provider);
	if (!adapter) {
		throw new Error(`No ERP adapter registered for provider: ${provider}`);
	}
	if (!adapter.enabled) {
		throw new Error(`ERP adapter is disabled: ${provider}`);
	}
	const result = await adapter.execute("create_order", {
		...payload,
		provider,
	});
	if (!result.success) {
		throw new Error(result.error ?? `ERP ${provider} SES submission failed`);
	}
	return {
		success: true,
		externalId: payload.sesNumber,
		status: "submitted",
		syncedAt: new Date().toISOString(),
		provider,
	};
}

async function erpQueryStatusHandler(
	externalId: string,
	provider: string,
): Promise<ErpStatusResult> {
	const adapter = erpEngine.getProvider(provider);
	if (!adapter) {
		throw new Error(`No ERP adapter registered for provider: ${provider}`);
	}
	if (!adapter.enabled) {
		throw new Error(`ERP adapter is disabled: ${provider}`);
	}
	const healthResult = await adapter.healthCheck();
	if (!healthResult.success) {
		return {
			externalId,
			status: "unknown",
			provider,
			error: healthResult.error,
		};
	}
	return {
		externalId,
		status: "connected",
		lastSyncedAt: new Date().toISOString(),
		provider,
	};
}

async function erpGetPaymentsHandler(
	_filters: { from?: string; to?: string; clientId?: string },
	provider: string,
): Promise<ErpPaymentResult[]> {
	const adapter = erpEngine.getProvider(provider);
	if (!adapter?.enabled) {
		return [];
	}
	const result = await adapter.execute("check_payment", {
		..._filters,
		provider,
	});
	if (!result.success || !result.data) {
		return [];
	}
	const data = result.data as { payments?: ErpPaymentResult[] };
	return data.payments ?? [];
}

export const ErpAdapter: IERPService = {
	async sendInvoice(payload: ErpInvoicePayload, provider: string = "fssm"): Promise<ErpSendResult> {
		const result = await executeWithRetryAndDlq(
			() => erpSendInvoiceHandler(payload, provider),
			payload as unknown as Record<string, unknown>,
			{
				maxRetries: 3,
				baseDelayMs: 1000,
				operation: "erp_send_invoice",
				entityType: "Invoice",
				entityId: payload.invoiceNumber,
				provider,
			},
		);
		if (result.success) {
			return result.data;
		}
		return {
			success: false,
			status: "failed",
			syncedAt: new Date().toISOString(),
			provider,
			error: result.error,
		};
	},

	async sendSES(payload: ErpSesPayload, provider: string = "fssm"): Promise<ErpSendResult> {
		const result = await executeWithRetryAndDlq(
			() => erpSendSesHandler(payload, provider),
			payload as unknown as Record<string, unknown>,
			{
				maxRetries: 3,
				baseDelayMs: 1000,
				operation: "erp_send_ses",
				entityType: "ServiceEntrySheet",
				entityId: payload.sesNumber,
				provider,
			},
		);
		if (result.success) {
			return result.data;
		}
		return {
			success: false,
			status: "failed",
			syncedAt: new Date().toISOString(),
			provider,
			error: result.error,
		};
	},

	async queryStatus(externalId: string, provider: string = "fssm"): Promise<ErpStatusResult> {
		const result = await executeWithRetryAndDlq(
			() => erpQueryStatusHandler(externalId, provider),
			{ externalId, provider },
			{
				maxRetries: 2,
				baseDelayMs: 500,
				operation: "erp_query_status",
				entityType: "Integration",
				entityId: externalId,
				provider,
			},
		);
		if (result.success) {
			return result.data;
		}
		return {
			externalId,
			status: "error",
			provider,
			error: result.error,
		};
	},

	async getPayments(
		filters: { from?: string; to?: string; clientId?: string },
		provider: string = "fssm",
	): Promise<ErpPaymentResult[]> {
		const result = await executeWithRetryAndDlq(
			() => erpGetPaymentsHandler(filters, provider),
			filters as unknown as Record<string, unknown>,
			{
				maxRetries: 2,
				baseDelayMs: 500,
				operation: "erp_get_payments",
				entityType: "Payment",
				entityId: filters.clientId ?? "all",
				provider,
			},
		);
		if (result.success) {
			return result.data;
		}
		return [];
	},
};

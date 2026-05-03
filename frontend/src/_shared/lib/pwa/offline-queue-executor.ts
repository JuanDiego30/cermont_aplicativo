/**
 * Offline Queue — Action Execution Logic
 */

import { toSerializedError } from "@cermont/shared-types";
import { toApiUrl } from "@/_shared/lib/http/api-client";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import {
	type OfflineAction,
	type OfflineExecutionResult,
	PERMANENT_FAILURE_STATUSES,
} from "./offline-queue-types";

const logger = createLogger("pwa:offline-queue");

function serializePayloadValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "null";
	}
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => serializePayloadValue(item)).join(",")}]`;
	}
	if (value instanceof File) {
		return JSON.stringify({
			kind: "file",
			name: value.name,
			size: value.size,
			type: value.type,
			lastModified: value.lastModified,
		});
	}
	if (value instanceof Blob) {
		return JSON.stringify({ kind: "blob", size: value.size, type: value.type });
	}
	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
			.filter(([key]) => key !== "idempotencyKey")
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, nestedValue]) => `${JSON.stringify(key)}:${serializePayloadValue(nestedValue)}`);
		return `{${entries.join(",")}}`;
	}
	return JSON.stringify(String(value));
}

export function buildDedupeKey(
	action: Omit<OfflineAction, "id" | "createdAt" | "retries" | "status">,
): string {
	return `${action.type}:${serializePayloadValue(action.payload)}`;
}

async function readResponseError(response: Response): Promise<string> {
	try {
		const text = (await response.clone().text()).trim();
		if (text.length > 0) {
			try {
				const payload = JSON.parse(text) as { error?: unknown };
				if (payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
					return payload.error.trim();
				}
			} catch {
				return text;
			}
		}
	} catch {
		// ignore
	}
	return response.statusText || `HTTP ${response.status}`;
}

function extractOrderId(payload: Record<string, unknown>): string | null {
	const candidate = payload.orderId ?? payload.workOrderId ?? payload.work_order_id ?? payload.id;
	return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

function extractPayloadString(payload: Record<string, unknown>, key: string): string | null {
	const candidate = payload[key];
	return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

function resolveEndpoint(
	endpointTemplate: string,
	payload: Record<string, unknown>,
): string | null {
	return endpointTemplate.replace(/\[([^\]]+)\]/g, (segment, rawParam) => {
		const param = String(rawParam);
		const value = param === "id" ? extractOrderId(payload) : extractPayloadString(payload, param);
		if (!value) {
			throw new Error(`Missing route parameter: ${segment}`);
		}
		return encodeURIComponent(value);
	});
}

interface ActionRequestConfig {
	endpointTemplate: string;
	method: "POST" | "PATCH";
}

function getActionRequestConfig(actionType: OfflineAction["type"]): ActionRequestConfig | null {
	switch (actionType) {
		case "CREATE_EVIDENCE":
			return { endpointTemplate: "/evidences", method: "POST" };
		case "CREATE_CHECKLIST":
			return { endpointTemplate: "/checklists", method: "POST" };
		case "UPDATE_CHECKLIST":
			return {
				endpointTemplate: "/checklists/[checklistId]/items/[itemId]",
				method: "PATCH",
			};
		case "COMPLETE_CHECKLIST":
			return { endpointTemplate: "/checklists/[checklistId]/validate", method: "POST" };
		case "UPDATE_ORDER_STATUS":
			return { endpointTemplate: "/orders/[id]/status", method: "PATCH" };
		case "ADD_COST":
			return { endpointTemplate: "/orders/[id]/costs", method: "POST" };
		case "UPDATE_ORDER":
			return { endpointTemplate: "/orders/[id]", method: "PATCH" };
		case "CREATE_INSPECTION":
			return { endpointTemplate: "/orders/[id]/inspections", method: "POST" };
		case "UPDATE_INSPECTION":
			return { endpointTemplate: "/orders/[id]/inspections/[inspectionId]", method: "PATCH" };
		case "UPSERT_CLOSURE":
			return { endpointTemplate: "/orders/[id]/closure", method: "POST" };
		case "COMPLETE_EXECUTION_PHASE":
			return { endpointTemplate: "/orders/[id]/execution-phase", method: "PATCH" };
		case "COMPLETE_PROCEDURE_STEP":
			return {
				endpointTemplate: "/checklists/[checklistId]/items/[itemId]",
				method: "PATCH",
			};
		default:
			return null;
	}
}

function buildEvidenceFormData(payload: Record<string, unknown>, file: File): FormData {
	const formData = new FormData();
	formData.append("file", file);

	if (typeof payload.orderId === "string") {
		formData.append("orderId", payload.orderId);
	}
	if (typeof payload.type === "string") {
		formData.append("type", payload.type);
	}
	if (typeof payload.description === "string") {
		formData.append("description", payload.description);
	}
	if (typeof payload.capturedAt === "string") {
		formData.append("capturedAt", payload.capturedAt);
	}

	return formData;
}

async function mapResponseToResult(response: Response): Promise<OfflineExecutionResult> {
	if (response.ok) {
		return { ok: true };
	}

	return {
		ok: false,
		error: await readResponseError(response),
		permanent: PERMANENT_FAILURE_STATUSES.has(response.status),
	};
}

async function sendJsonRequest(
	endpoint: string,
	method: string,
	payload: Record<string, unknown>,
): Promise<OfflineExecutionResult> {
	const response = await fetch(endpoint, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	return mapResponseToResult(response);
}

async function sendEvidenceUpload(
	endpoint: string,
	payload: Record<string, unknown>,
): Promise<OfflineExecutionResult> {
	const queuedFile = getQueuedFile(payload);
	if (!queuedFile) {
		return {
			ok: false,
			error: "La evidencia encolada no contiene un archivo válido",
			permanent: true,
		};
	}

	const response = await fetch(endpoint, {
		method: "POST",
		headers:
			typeof payload.idempotencyKey === "string"
				? { "Idempotency-Key": payload.idempotencyKey }
				: undefined,
		body: buildEvidenceFormData(payload, queuedFile),
	});

	return mapResponseToResult(response);
}

function base64ToBlob(base64: string, mimeType: string): Blob {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return new Blob([bytes], { type: mimeType || "application/octet-stream" });
}

function getQueuedFile(payload: Record<string, unknown>): File | null {
	const payloadFile = payload.file;
	const fileName = typeof payload.fileName === "string" ? payload.fileName : "evidence";
	const fileType =
		typeof payload.fileType === "string" ? payload.fileType : "application/octet-stream";

	if (payloadFile instanceof File) {
		return payloadFile;
	}
	if (payloadFile instanceof Blob) {
		return new File([payloadFile], fileName, { type: payloadFile.type || fileType });
	}

	const fileBase64 = typeof payload.fileBase64 === "string" ? payload.fileBase64 : "";
	if (!fileBase64) {
		return null;
	}

	const blob = base64ToBlob(fileBase64, fileType);
	return new File([blob], fileName, { type: fileType });
}

export async function executeAction(action: OfflineAction): Promise<OfflineExecutionResult> {
	const actionConfig = getActionRequestConfig(action.type);
	if (!actionConfig) {
		return { ok: false, error: "Tipo de acción offline no soportado", permanent: true };
	}

	let endpoint: string | null = null;
	try {
		endpoint = toApiUrl(resolveEndpoint(actionConfig.endpointTemplate, action.payload) ?? "");
	} catch (_rawError: unknown) {
		return {
			ok: false,
			error: "No se pudo resolver el endpoint de sincronización",
			permanent: true,
		};
	}

	if (!endpoint) {
		logger.error("No se pudo resolver endpoint para acción offline", { actionType: action.type });
		return {
			ok: false,
			error: "No se pudo resolver el endpoint de sincronización",
			permanent: true,
		};
	}

	try {
		if (action.type === "CREATE_EVIDENCE") {
			return await sendEvidenceUpload(endpoint, action.payload);
		}

		return await sendJsonRequest(endpoint, actionConfig.method, action.payload);
	} catch (rawError: unknown) {
		const error = toSerializedError(rawError);
		logger.error("Error ejecutando acción offline", { actionType: action.type, error });
		return {
			ok: false,
			error: "Error de red durante sincronización",
			permanent: false,
		};
	}
}

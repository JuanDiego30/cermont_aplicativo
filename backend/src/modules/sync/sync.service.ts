/**
 * sync.service.ts — Servicio de sincronización offline (DOC-06, DOC-10)
 *
 * Procesa un lote de operaciones encoladas en IndexedDB por el Service Worker.
 * Cada op tiene: id (UUID), type (entidad), action (CRUD), payload, timestamp.
 *
 * SRP: Solo procesa el batch. Cada entidad tiene su propio servicio.
 * Fault-tolerant: errores en operaciones individuales NO detienen el batch.
 *
 * DOC REFERENCE: DOC-06 §6 (Offline Sync), DOC-07 §5.2 (Order FSM)
 */

import type { OfflineOperation, SyncResult } from "@cermont/shared-types";
import { AppError } from "../../common/errors/AppError";
import * as OrderSvc from "../../modules/order/order.service";
import * as ChecklistSvc from "../checklist/checklist.service";

/**
 * Procesa un batch de operaciones offline.
 * Las operaciones exitosas se cuentan; las fallidas se reportan sin lanzar.
 *
 * PARAMETER: actorRole is required for order state transitions (DOC-07 FSM)
 * PARAMETER: actorId is required for audit logging
 */
export async function processSyncBatch(
	operations: OfflineOperation[],
	actorRole: string,
	actorId: string,
): Promise<SyncResult> {
	const result: SyncResult = { processed: 0, failed: 0, errors: [] };

	for (const op of operations) {
		try {
			await applyOperation(op, actorRole, actorId);
			result.processed++;
		} catch (err) {
			result.failed++;
			result.errors.push({
				id: op.id,
				error: err instanceof Error ? err.message : "Unknown error",
			});
		}
	}

	return result;
}

async function applyOperation(
	op: OfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	switch (op.type) {
		case "order":
			await applyOrderOperation(op, actorRole, actorId);
			break;
		case "checklist":
			await applyChecklistOperation(op, actorRole, actorId);
			break;
		case "evidence":
			await applyEvidenceOperation(op, actorRole, actorId);
			break;
		default: {
			const exhaustive: never = op.type;
			throw new AppError(`Unsupported entity type: ${exhaustive}`, 400, "UNSUPPORTED_ENTITY");
		}
	}
}

async function applyOrderOperation(
	op: OfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload as Record<string, unknown>;
	switch (op.action) {
		case "create":
			await OrderSvc.createOrder(payload as Parameters<typeof OrderSvc.createOrder>[0], actorId);
			break;
		case "update": {
			const { id, status, observations } = payload as {
				id?: string;
				status?: string;
				observations?: string;
			};
			if (!id || !status) {
				throw new AppError("order update requires id and status", 400, "MISSING_FIELDS");
			}
			// FIXED: Pass actorRole + actorId per DOC-07 FSM requirements
			await OrderSvc.updateOrderStatus(
				id,
				status as OrderSvc.OrderStatus,
				actorRole,
				actorId,
				observations,
			);
			break;
		}
		default:
			throw new AppError(
				`Order action '${op.action}' not supported in offline sync`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

async function applyChecklistOperation(
	op: OfflineOperation,
	_actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload as Record<string, unknown>;
	switch (op.action) {
		case "create": {
			const { orderId } = payload as { orderId?: string };
			if (!orderId) {
				throw new AppError("checklist create requires orderId", 400, "MISSING_FIELDS");
			}
			await ChecklistSvc.createChecklist(orderId, actorId);
			break;
		}
		case "update": {
			const { checklistId, itemId, completed, observation } = payload as {
				checklistId?: string;
				itemId?: string;
				completed?: boolean;
				observation?: string;
			};
			if (!checklistId || !itemId || completed === undefined) {
				throw new AppError(
					"checklist update requires checklistId, itemId, completed",
					400,
					"MISSING_FIELDS",
				);
			}
			await ChecklistSvc.updateChecklistItem(
				checklistId,
				itemId,
				{ completed, observation },
				actorId,
			);
			break;
		}
		default:
			throw new AppError(
				`Checklist action '${op.action}' not supported in offline sync`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

async function applyEvidenceOperation(
	op: OfflineOperation,
	_actorRole: string,
	_actorId: string,
): Promise<void> {
	const payload = op.payload as Record<string, unknown>;
	switch (op.action) {
		case "create": {
			const { orderId, type } = payload as {
				orderId?: string;
				type?: "before" | "during" | "after" | "defect" | "safety" | "signature";
			};
			if (!orderId || !type) {
				throw new AppError("evidence create requires orderId and type", 400, "MISSING_FIELDS");
			}
			throw new AppError(
				"Offline evidence sync is not supported yet because it requires a real file payload",
				422,
				"OFFLINE_EVIDENCE_NOT_SUPPORTED",
			);
		}
		default:
			throw new AppError(
				`Evidence action '${op.action}' not supported in offline sync`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

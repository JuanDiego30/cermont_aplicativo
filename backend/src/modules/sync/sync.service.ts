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

import type {
  OfflineOperation,
  OfflineWorkRequestPayload,
  OfflineSiteVisitPayload,
  OfflinePlanningPacketPayload,
  OfflineExecutionPayload,
  OfflineEvidencePayload,
  SyncResult,
} from "@cermont/shared-types";
import type { UserRole } from "@cermont/domain";
import { AppError } from "../../common/errors/AppError";
import * as OrderSvc from "../../modules/order/order.service";
import * as ChecklistSvc from "../checklist/checklist.service";
import * as EvidenceSvc from "../evidence/evidence.service";
import * as OrderCRUD from "../../modules/order/order-crud.service";
import * as WorkRequestSvc from "../../modules/work-requests/work-requests.service";
import * as SiteVisitSvc from "../../modules/site-visit/site-visit.service";
import * as PlanningPacketSvc from "../../modules/planning-packet/planning-packet.service";
import * as ExecutionSessionSvc from "../../modules/execution-session/execution-session.service";

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
    case "work-request":
      await applyWorkRequestOperation(op as OfflineOperation & { payload: OfflineWorkRequestPayload }, actorRole, actorId);
      break;
    case "site-visit":
      await applySiteVisitOperation(op as OfflineOperation & { payload: OfflineSiteVisitPayload }, actorRole, actorId);
      break;
    case "planning-packet":
      await applyPlanningPacketOperation(op as OfflineOperation & { payload: OfflinePlanningPacketPayload }, actorRole, actorId);
      break;
    case "execution-session":
      await applyExecutionSessionOperation(op as OfflineOperation & { payload: OfflineExecutionPayload }, actorRole, actorId);
      break;
    case "cost":
    case "delivery-record":
    case "service-entry-sheet":
    case "invoice":
    case "payment":
    case "technical-report":
    case "purchase-order": {
      // These entity types are defined for future offline support
      // but handlers are not yet implemented - mark as unsupported for now
      throw new AppError(
        `Offline sync for '${op.type}' is not yet implemented`,
        501,
        "SYNC_NOT_IMPLEMENTED",
      );
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

/**
 * Validate image magic bytes (PNG, JPEG, WebP, GIF)
 */
function hasValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 8) {
    return false;
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  // WebP/GIF: RIFF (52 49 46 46) or GIF8 (47 49 46 38)
  if (
    (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) ||
    (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38)
  ) {
    return true;
  }
  return false;
}

async function applyEvidenceOperation(
  op: OfflineOperation,
  actorRole: string,
  actorId: string,
): Promise<void> {
  const payload = op.payload as OfflineEvidencePayload;

  switch (op.action) {
    case "create": {
      // SECURITY: Verify user has access to this order/service case before uploading evidence
      await OrderCRUD.getOrderByIdWithAuth(payload.serviceCaseId, { _id: actorId, role: actorRole });

      if (!payload.temporaryUrl) {
        throw new AppError("Evidence create requires temporaryUrl", 400, "MISSING_FIELDS");
      }

      const buffer = Buffer.from(payload.temporaryUrl, "base64");

      if (!hasValidImageMagicBytes(buffer)) {
        throw new AppError("Invalid file type. Must be PNG, JPEG, WebP, or GIF", 400, "INVALID_FILE_TYPE");
      }

      if (buffer.length > 10 * 1024 * 1024) {
        throw new AppError("File exceeds 10MB limit", 400, "FILE_TOO_LARGE");
      }

      const capturedAtDate = payload.capturedAt ? new Date(payload.capturedAt) : new Date();

      await EvidenceSvc.createEvidenceV2(
        {
          phase: payload.phase,
          category: payload.category,
          serviceCaseId: payload.serviceCaseId,
          workOrderId: payload.workOrderId,
          executionSessionId: payload.executionSessionId,
          description: payload.description,
          mimeType: payload.mimeType,
          sizeBytes: payload.sizeBytes,
          temporaryUrl: payload.temporaryUrl,
          gpsLocation: payload.gpsLocation,
          capturedAt: capturedAtDate.toISOString(),
          uploadedBy: payload.uploadedBy,
          deviceId: payload.deviceId,
          syncStatus: payload.syncStatus,
        },
        buffer,
        actorId,
        { idempotencyKey: payload.clientMutationId },
      );
      break;
    }
    default:
      throw new AppError(`Evidence action '${op.action}' not supported in offline sync`, 400, "UNSUPPORTED_ACTION");
  }
}

/**
 * Apply work request offline operation
 */
async function applyWorkRequestOperation(
  op: OfflineOperation & { payload: OfflineWorkRequestPayload },
  _actorRole: string,
  actorId: string,
): Promise<void> {
  const payload = op.payload;

  switch (op.action) {
    case "create": {
      await WorkRequestSvc.createWorkRequest(payload, actorId);
      break;
    }
    case "update": {
      await WorkRequestSvc.updateWorkRequest(op.id, payload, actorId, _actorRole);
      break;
    }
    case "delete": {
      await WorkRequestSvc.deleteWorkRequest(op.id, actorId, _actorRole);
      break;
    }
    default:
      throw new AppError(`Work request action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
  }
}

/**
 * Apply site visit offline operation
 */
async function applySiteVisitOperation(
  op: OfflineOperation & { payload: OfflineSiteVisitPayload },
  _actorRole: string,
  actorId: string,
): Promise<void> {
  const payload = op.payload;

  switch (op.action) {
    case "create": {
      await SiteVisitSvc.createSiteVisit(payload, actorId);
      break;
    }
    case "update": {
      await SiteVisitSvc.updateSiteVisit(op.id, payload);
      break;
    }
    default:
      throw new AppError(`Site visit action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
  }
}

/**
 * Apply planning packet offline operation
 */
async function applyPlanningPacketOperation(
  op: OfflineOperation & { payload: OfflinePlanningPacketPayload },
  _actorRole: string,
  actorId: string,
): Promise<void> {
  const payload = op.payload;

  switch (op.action) {
    case "create": {
      await PlanningPacketSvc.createPlanningPacket(payload, actorId);
      break;
    }
    case "update": {
      await PlanningPacketSvc.updatePlanningPacket(op.id, payload, _actorRole);
      break;
    }
    default:
      throw new AppError(`Planning packet action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
  }
}

/**
 * Apply execution session offline operation
 */
async function applyExecutionSessionOperation(
  op: OfflineOperation & { payload: OfflineExecutionPayload },
  _actorRole: string,
  actorId: string,
): Promise<void> {
  const payload = op.payload;

  switch (op.action) {
    case "create": {
      await ExecutionSessionSvc.createExecutionSession(payload, { _id: actorId, role: _actorRole as UserRole });
      break;
    }
    default:
      throw new AppError(`Execution session action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
  }
}

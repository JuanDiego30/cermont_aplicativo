/**
 * sync.service.ts — Servicio de sincronización offline (DOC-06, DOC-10)
 *
 * Procesa lotes de operaciones encoladas localmente. Acepta el contrato
 * moderno `localId/entityType/operation` y el contrato legacy `id/type/action`
 * mientras se completa la migración de IndexedDB nativo a Dexie.
 */

import type { UserRole } from "@cermont/domain";
import {
	CreateCostSchema,
	CreateDeliveryRecordV2Schema,
	type CreateOrderInput,
	CreateOrderInvoiceSchema,
	CreateOrderSchema,
	CreateOrderServiceEntrySheetSchema,
	CreateTechnicalReportSchema,
	type LegacyOfflineEntityType,
	type OfflineEntityType,
	type OfflineEvidencePayload,
	type OfflineExecutionPayload,
	type OfflineOperation,
	type OfflineOperationType,
	type OfflineOutboxItem,
	type OfflinePlanningPacketPayload,
	type OfflineSiteVisitPayload,
	type OfflineSyncItemResult,
	type OfflineWorkRequestPayload,
	ReconcilePaymentSchema,
	RegisterInvoicePaymentSchema,
	SignDeliveryRecordSchema,
	type SyncResult,
	UpdateCostSchema,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors/AppError";
import {
	Cost,
	DeliveryRecord,
	Invoice,
	Payment,
	ServiceEntrySheet,
	TechnicalReport,
} from "../../models";
import { PurchaseOrderModel } from "../../models/PurchaseOrder";
import * as ExecutionSessionSvc from "../../modules/execution-session/execution-session.service";
import * as OrderSvc from "../../modules/order/order.service";
import * as OrderCRUD from "../../modules/order/order-crud.service";
import * as PlanningPacketSvc from "../../modules/planning-packet/planning-packet.service";
import * as SiteVisitSvc from "../../modules/site-visit/site-visit.service";
import * as WorkRequestSvc from "../../modules/work-requests/work-requests.service";
import * as ChecklistSvc from "../checklist/checklist.service";
import * as CostSvc from "../cost/cost.service";
import * as EvidenceSvc from "../evidence/evidence.service";
import * as AdministrativeWorkflowSvc from "../order/administrative-workflow.service";
import * as PurchaseOrderSvc from "../purchase-order/purchase-order.service";

type LegacyAction = "create" | "update" | "delete";

interface NormalizedOfflineOperation {
	id: string;
	type: LegacyOfflineEntityType;
	action: LegacyAction;
	payload: OfflineOperation["payload"];
}

const MODERN_TO_LEGACY_ENTITY: Partial<Record<OfflineEntityType, LegacyOfflineEntityType>> = {
	work_request: "work-request",
	site_visit: "site-visit",
	work_order: "order",
	planning_packet: "planning-packet",
	execution_session: "execution-session",
	checklist_submission: "checklist",
	evidence: "evidence",
	cost_record: "cost",
	delivery_record: "delivery-record",
	client_acceptance: "delivery-record",
	service_entry_sheet: "service-entry-sheet",
	invoice: "invoice",
	invoice_approval: "invoice",
	payment_record: "payment",
	technical_report: "technical-report",
	purchase_order: "purchase-order",
};

const MODERN_TO_LEGACY_ACTION: Record<OfflineOperationType, LegacyAction> = {
	create: "create",
	update: "update",
	delete: "delete",
	upload_file: "create",
	submit_form: "create",
	transition_state: "update",
};

function isModernOfflineOperation(op: OfflineOperation): op is OfflineOutboxItem {
	return "localId" in op && "entityType" in op && "operation" in op;
}

function buildBatchId(): string {
	return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOperationLocalId(op: OfflineOperation): string {
	return isModernOfflineOperation(op) ? op.localId : op.id;
}

function normalizeOperation(op: OfflineOperation): NormalizedOfflineOperation {
	if (!isModernOfflineOperation(op)) {
		return {
			id: op.id,
			type: op.type,
			action: op.action,
			payload: op.payload,
		};
	}

	const legacyType = MODERN_TO_LEGACY_ENTITY[op.entityType];
	if (!legacyType) {
		throw new AppError(
			`Offline sync for '${op.entityType}' is not yet implemented`,
			501,
			"SYNC_NOT_IMPLEMENTED",
		);
	}

	return {
		id: op.serverId ?? op.localId,
		type: legacyType,
		action: MODERN_TO_LEGACY_ACTION[op.operation],
		payload: op.payload,
	};
}

function toSyncItemResult(op: OfflineOperation, error?: unknown): OfflineSyncItemResult {
	const localId = getOperationLocalId(op);
	if (!error) {
		return { localId, status: "synced" };
	}

	const message = error instanceof Error ? error.message : "Unknown error";
	const isConflict =
		error instanceof AppError && (error.statusCode === 409 || error.code === "CONFLICT");

	if (isConflict) {
		return {
			localId,
			status: "conflict",
			error: message,
			conflict: { reason: message },
		};
	}

	return { localId, status: "failed", error: message };
}

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
	batchId = buildBatchId(),
): Promise<SyncResult> {
	const result: SyncResult = { batchId, results: [], processed: 0, failed: 0, errors: [] };

	for (const op of operations) {
		try {
			await applyOperation(op, actorRole, actorId);
			result.processed++;
			result.results.push(toSyncItemResult(op));
		} catch (err) {
			result.failed++;
			result.results.push(toSyncItemResult(op, err));
			result.errors.push({
				id: getOperationLocalId(op),
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
	const normalized = normalizeOperation(op);

	switch (normalized.type) {
		case "order":
			await applyOrderOperation(normalized, actorRole, actorId);
			break;
		case "checklist":
			await applyChecklistOperation(normalized, actorRole, actorId);
			break;
		case "evidence":
			await applyEvidenceOperation(normalized, actorRole, actorId);
			break;
		case "work-request":
			await applyWorkRequestOperation(
				normalized as NormalizedOfflineOperation & { payload: OfflineWorkRequestPayload },
				actorRole,
				actorId,
			);
			break;
		case "site-visit":
			await applySiteVisitOperation(
				normalized as NormalizedOfflineOperation & { payload: OfflineSiteVisitPayload },
				actorRole,
				actorId,
			);
			break;
		case "planning-packet":
			await applyPlanningPacketOperation(
				normalized as NormalizedOfflineOperation & { payload: OfflinePlanningPacketPayload },
				actorRole,
				actorId,
			);
			break;
		case "execution-session":
			await applyExecutionSessionOperation(
				normalized as NormalizedOfflineOperation & { payload: OfflineExecutionPayload },
				actorRole,
				actorId,
			);
			break;
		case "cost":
			await applyCostOperation(normalized, actorRole, actorId);
			break;
		case "delivery-record":
			await applyDeliveryRecordOperation(normalized, actorRole, actorId);
			break;
		case "service-entry-sheet":
			await applyServiceEntrySheetOperation(normalized, actorRole, actorId);
			break;
		case "invoice":
			await applyInvoiceOperation(normalized, actorRole, actorId);
			break;
		case "payment":
			await applyPaymentOperation(normalized, actorRole, actorId);
			break;
		case "technical-report":
			await applyTechnicalReportOperation(normalized, actorRole, actorId);
			break;
		case "purchase-order":
			await applyPurchaseOrderOperation(normalized, actorRole, actorId);
			break;
		default:
			throw new AppError(
				`Offline sync for '${normalized.type}' is not yet implemented`,
				501,
				"SYNC_NOT_IMPLEMENTED",
			);
	}
}

/**
 * Apply technical report offline operation
 */
async function applyTechnicalReportOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = CreateTechnicalReportSchema.parse(op.payload);
	const executionSessionId = (op.payload as { executionSessionId?: string }).executionSessionId;

	if (!executionSessionId) {
		throw new AppError(
			"technical-report creation requires executionSessionId",
			400,
			"MISSING_FIELDS",
		);
	}

	switch (op.action) {
		case "create": {
			const existing = await TechnicalReport.findOne({
				$or: [
					...(payload.clientMutationId ? [{ clientMutationIds: payload.clientMutationId }] : []),
					{ executionSessionId },
				],
			});
			if (existing) {
				return;
			}
			await AdministrativeWorkflowSvc.createTechnicalReportFromExecutionSession(
				executionSessionId,
				{
					...payload,
					findings: payload.findings || [],
					deviations: payload.deviations || [],
				},
				{ _id: actorId, role: actorRole },
			);
			break;
		}
		case "update":
			await AdministrativeWorkflowSvc.updateTechnicalReport(op.id, {
				...payload,
				findings: payload.findings || [],
				deviations: payload.deviations || [],
			});
			break;
		default:
			throw new AppError(
				`Technical report action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply delivery record offline operation
 */
async function applyDeliveryRecordOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = CreateDeliveryRecordV2Schema.parse(op.payload);
	const technicalReportId = (op.payload as { technicalReportId?: string }).technicalReportId;
	const action = (op.payload as { action?: string }).action;

	switch (op.action) {
		case "create": {
			if (!technicalReportId) {
				throw new AppError(
					"delivery-record creation requires technicalReportId",
					400,
					"MISSING_FIELDS",
				);
			}
			const existing = await DeliveryRecord.findOne({
				$or: [
					...(payload.clientMutationId ? [{ clientMutationIds: payload.clientMutationId }] : []),
					{ technicalReportId },
				],
			});
			if (existing) {
				return;
			}
			await AdministrativeWorkflowSvc.createDeliveryRecordFromTechnicalReport(
				technicalReportId,
				payload,
				{ _id: actorId, role: actorRole },
			);
			break;
		}
		case "update":
			if (action === "sign") {
				const signPayload = SignDeliveryRecordSchema.parse(op.payload);
				await AdministrativeWorkflowSvc.signDeliveryRecord(op.id, signPayload);
			} else if (action === "send") {
				await AdministrativeWorkflowSvc.sendDeliveryRecord(op.id, payload, {
					_id: actorId,
					role: actorRole,
				});
			}
			break;
		default:
			throw new AppError(
				`Delivery record action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply service entry sheet offline operation
 */
async function applyServiceEntrySheetOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = CreateOrderServiceEntrySheetSchema.parse(op.payload);
	const deliveryRecordId = (op.payload as { deliveryRecordId?: string }).deliveryRecordId;
	const action = (op.payload as { action?: string }).action;

	switch (op.action) {
		case "create": {
			if (!deliveryRecordId) {
				throw new AppError("SES creation requires deliveryRecordId", 400, "MISSING_FIELDS");
			}
			const existing = await ServiceEntrySheet.findOne({
				$or: [
					...(payload.clientMutationId
						? [{ "commandHistory.clientMutationId": payload.clientMutationId }]
						: []),
					{ deliveryRecordId },
				],
			});
			if (existing) {
				return;
			}
			await AdministrativeWorkflowSvc.createServiceEntrySheetFromDeliveryRecord(
				deliveryRecordId,
				payload,
				{ _id: actorId, role: actorRole },
			);
			break;
		}
		case "update":
			if (action === "submit") {
				await AdministrativeWorkflowSvc.submitServiceEntrySheet(op.id, payload, {
					_id: actorId,
					role: actorRole,
				});
			}
			break;
		default:
			throw new AppError(`SES action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
	}
}

/**
 * Apply invoice offline operation
 */
async function applyInvoiceOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = CreateOrderInvoiceSchema.parse(op.payload);
	const serviceEntrySheetId = (op.payload as { serviceEntrySheetId?: string }).serviceEntrySheetId;
	const action = (op.payload as { action?: string }).action;

	switch (op.action) {
		case "create": {
			if (!serviceEntrySheetId) {
				throw new AppError("invoice creation requires serviceEntrySheetId", 400, "MISSING_FIELDS");
			}
			const existing = await Invoice.findOne({
				$or: [
					...(payload.clientMutationId
						? [{ "commandHistory.clientMutationId": payload.clientMutationId }]
						: []),
					{ serviceEntrySheetId },
				],
			});
			if (existing) {
				return;
			}
			await AdministrativeWorkflowSvc.createInvoiceFromServiceEntrySheet(
				serviceEntrySheetId,
				payload,
				{ _id: actorId, role: actorRole },
			);
			break;
		}
		case "update":
			if (action === "submit") {
				await AdministrativeWorkflowSvc.submitInvoice(op.id, { _id: actorId, role: actorRole });
			}
			break;
		default:
			throw new AppError(`Invoice action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
	}
}

/**
 * Apply payment offline operation
 */
async function applyPaymentOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = RegisterInvoicePaymentSchema.parse(op.payload);
	const invoiceId = (op.payload as { invoiceId?: string }).invoiceId;
	const action = (op.payload as { action?: string }).action;

	switch (op.action) {
		case "create": {
			if (!invoiceId) {
				throw new AppError("payment creation requires invoiceId", 400, "MISSING_FIELDS");
			}
			const existing = await Payment.findOne({
				$or: [
					...(payload.clientMutationId
						? [{ "commandHistory.clientMutationId": payload.clientMutationId }]
						: []),
					{ paymentReference: payload.paymentReference },
				],
			});
			if (existing) {
				return;
			}
			await AdministrativeWorkflowSvc.registerPaymentForInvoice(invoiceId, payload, {
				_id: actorId,
				role: actorRole,
			});
			break;
		}
		case "update":
			if (action === "reconcile") {
				const reconcilePayload = ReconcilePaymentSchema.parse(op.payload);
				await AdministrativeWorkflowSvc.reconcilePayment(op.id, reconcilePayload, {
					_id: actorId,
					role: actorRole,
				});
			}
			break;
		default:
			throw new AppError(`Payment action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
	}
}

/**
 * Apply cost offline operation
 */
async function applyCostOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	switch (op.action) {
		case "create": {
			const payload = CreateCostSchema.parse(op.payload);
			const existing = await Cost.findOne({
				orderId: payload.orderId,
				category: payload.category,
				description: payload.description,
				actualAmount: payload.actualAmount,
				recordedBy: actorId,
			});
			if (existing) {
				return;
			}
			await CostSvc.createCost(payload, actorId);
			break;
		}
		case "update": {
			const payload = UpdateCostSchema.parse(op.payload);
			await CostSvc.updateCost(op.id, payload, actorId, actorRole);
			break;
		}
		default:
			throw new AppError(`Cost action '${op.action}' not supported`, 400, "UNSUPPORTED_ACTION");
	}
}

/**
 * Apply purchase order offline operation
 */
async function applyPurchaseOrderOperation(
	op: NormalizedOfflineOperation,
	_actorRole: string,
	actorId: string,
): Promise<void> {
	const rawPayload = op.payload as { proposalId?: string; poNumber?: string };
	switch (op.action) {
		case "create": {
			const existing = await PurchaseOrderModel.findOne({
				proposalId: rawPayload.proposalId,
				poNumber: rawPayload.poNumber,
			});
			if (existing) {
				return;
			}
			await PurchaseOrderSvc.registerPurchaseOrder(
				op.payload as {
					proposalId: string;
					poNumber: string;
					contractReference?: string;
					serviceAccount: string;
					billingAccount: string;
					approvedAmount: number;
					currency: string;
					receivedAt: string;
					attachments?: Array<{ url: string; filename: string }>;
				},
				actorId,
			);
			break;
		}
		default:
			throw new AppError(
				`Purchase order action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

async function applyOrderOperation(
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload;
	switch (op.action) {
		case "create":
			await OrderSvc.createOrder(parseCreateOrderPayload(payload), actorId);
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

function parseCreateOrderPayload(payload: NormalizedOfflineOperation["payload"]): CreateOrderInput {
	const parsed = CreateOrderSchema.safeParse(payload);
	if (!parsed.success) {
		throw new AppError(
			"order create payload is invalid",
			400,
			"VALIDATION_FAILED",
			parsed.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		);
	}
	return parsed.data;
}

async function applyChecklistOperation(
	op: NormalizedOfflineOperation,
	_actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload;
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
	op: NormalizedOfflineOperation,
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload as OfflineEvidencePayload;

	switch (op.action) {
		case "create": {
			// SECURITY: Verify user has access to this order/service case before uploading evidence
			await OrderCRUD.getOrderByIdWithAuth(payload.serviceCaseId, {
				_id: actorId,
				role: actorRole,
			});

			if (!payload.temporaryUrl) {
				throw new AppError("Evidence create requires temporaryUrl", 400, "MISSING_FIELDS");
			}

			const buffer = Buffer.from(payload.temporaryUrl, "base64");

			if (!hasValidImageMagicBytes(buffer)) {
				throw new AppError(
					"Invalid file type. Must be PNG, JPEG, WebP, or GIF",
					400,
					"INVALID_FILE_TYPE",
				);
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
			throw new AppError(
				`Evidence action '${op.action}' not supported in offline sync`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply work request offline operation
 */
async function applyWorkRequestOperation(
	op: NormalizedOfflineOperation & { payload: OfflineWorkRequestPayload },
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
			throw new AppError(
				`Work request action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply site visit offline operation
 */
async function applySiteVisitOperation(
	op: NormalizedOfflineOperation & { payload: OfflineSiteVisitPayload },
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
			throw new AppError(
				`Site visit action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply planning packet offline operation
 */
async function applyPlanningPacketOperation(
	op: NormalizedOfflineOperation & { payload: OfflinePlanningPacketPayload },
	actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload;

	switch (op.action) {
		case "create": {
			await PlanningPacketSvc.createPlanningPacket(payload, actorId);
			break;
		}
		case "update": {
			await PlanningPacketSvc.updatePlanningPacket(op.id, payload, actorId, actorRole);
			break;
		}
		default:
			throw new AppError(
				`Planning packet action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

/**
 * Apply execution session offline operation
 */
async function applyExecutionSessionOperation(
	op: NormalizedOfflineOperation & { payload: OfflineExecutionPayload },
	_actorRole: string,
	actorId: string,
): Promise<void> {
	const payload = op.payload;

	switch (op.action) {
		case "create": {
			await ExecutionSessionSvc.createExecutionSession(payload, {
				_id: actorId,
				role: _actorRole as UserRole,
			});
			break;
		}
		default:
			throw new AppError(
				`Execution session action '${op.action}' not supported`,
				400,
				"UNSUPPORTED_ACTION",
			);
	}
}

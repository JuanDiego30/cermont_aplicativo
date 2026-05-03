/**
 * Order Service Helpers
 *
 * Pure utility functions for order service:
 * - Order response formatting
 * - Order code generation
 * - Audit logging helper
 *
 * These are internal helpers, not exported as public API.
 */

import type {
	CostBaseline,
	ExecutionPhaseType,
	OrderAssetDetails,
	OrderCommercial,
	OrderHes,
	OrderLogistics,
	OrderReferences,
	OrderResourceAssignment,
	OrderScheduleSla,
} from "@cermont/shared-types";
import type { Types } from "mongoose";
import { toIsoString } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import type { MaterialItem } from "../../_shared/config/kit-templates";
import { type AuditLogInput, createAuditLog } from "../../audit/application/service";
import type { OrderDocumentFields } from "../infrastructure/model";
import type { OrderPriority, OrderStatus, OrderType } from "./rules";

/**
 * Order document shape as returned from Mongoose (lean or hydrated).
 *
 * Some repository methods can return IDs as strings (for populated/lean docs),
 * so this type intentionally accepts both ObjectId-like and string values.
 */
type OrderDoc = Omit<
	OrderDocumentFields,
	| "assignedTo"
	| "supervisedBy"
	| "proposalId"
	| "createdBy"
	| "gpsLocation"
	| "assetDetails"
	| "scheduleSla"
	| "resourceAssignment"
	| "hes"
	| "commercial"
	| "logistics"
	| "references"
	| "executionPhase"
	| "archived"
> & {
	_id: { toString(): string };
	assignedTo?: Types.ObjectId | string | { toString(): string };
	supervisedBy?: Types.ObjectId | string | { toString(): string };
	proposalId?: Types.ObjectId | string | { toString(): string };
	createdBy: Types.ObjectId | string | { toString(): string };
	followUpWorkOrderId?: Types.ObjectId | string | { toString(): string };
	dueDate?: Date | string;
	slaDueDate?: Date | string;
	slaStatus?: string;
	workPerformed?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt: string | Date;
	};
	customerFeedback?: string;
	assetDetails?: Omit<OrderAssetDetails, "lastInterventionAt"> & {
		lastInterventionAt?: string | Date;
	};
	scheduleSla?: Omit<OrderScheduleSla, "scheduledStartAt" | "dueAt" | "recurrence"> & {
		scheduledStartAt?: string | Date;
		dueAt?: string | Date;
		recurrence: Omit<OrderScheduleSla["recurrence"], "endsAt"> & { endsAt?: string | Date };
	};
	resourceAssignment?: Omit<
		OrderResourceAssignment,
		"technicianIds" | "supervisorId" | "hesResponsibleId" | "vehicleResourceId"
	> & {
		technicianIds: Array<Types.ObjectId | string | { toString(): string }>;
		supervisorId?: Types.ObjectId | string | { toString(): string };
		hesResponsibleId?: Types.ObjectId | string | { toString(): string };
		vehicleResourceId?: Types.ObjectId | string | { toString(): string };
	};
	hes?: Omit<OrderHes, "ptwDocumentId"> & {
		ptwDocumentId?: Types.ObjectId | string | { toString(): string };
	};
	commercial?: OrderCommercial;
	logistics?: OrderLogistics;
	references?: Omit<
		OrderReferences,
		"attachmentDocumentIds" | "relatedOrderId" | "parentOrderId"
	> & {
		attachmentDocumentIds: Array<Types.ObjectId | string | { toString(): string }>;
		relatedOrderId?: Types.ObjectId | string | { toString(): string };
		parentOrderId?: Types.ObjectId | string | { toString(): string };
	};
	executionPhase?: {
		current?: ExecutionPhaseType | string;
		preStartCompletedAt?: Date | string;
		inExecutionCompletedAt?: Date | string;
		closureCompletedAt?: Date | string;
	};
	archived?: boolean;
};

export interface OrderResponse {
	_id: string;
	code: string;
	type: OrderType;
	status: OrderStatus;
	priority: OrderPriority;
	description: string;
	assetId: string;
	assetName: string;
	location: string;
	assignedTo?: string;
	assignedToName?: string;
	supervisedBy?: string;
	materials: MaterialItem[];
	planning: {
		scheduledStartAt?: string;
		estimatedHours?: number;
		crewSize?: number;
		kitTemplateId?: string;
		kitSnapshot?: {
			kitTemplateId: string;
			name: string;
			activityType?: string;
			tools: Array<{ name: string; quantity: number; specifications?: string }>;
			equipment: Array<{ name: string; quantity: number; certificateRequired: boolean }>;
		};
		astDocumentId?: string;
		supportDocumentIds: string[];
		planningReadyAt?: string;
		planningReadyBy?: string;
	};
	startedAt?: string;
	completedAt?: string;
	observations?: string;
	invoiceReady: boolean;
	reportGenerated: boolean;
	reportPdfGenerated: boolean;
	hasApprovedReport: boolean;
	billing: {
		sesNumber?: string;
		sesStatus: "pending" | "registered" | "approved";
		sesApprovedAt?: string;
		invoiceNumber?: string;
		invoiceStatus: "pending" | "sent" | "approved" | "paid";
		invoiceApprovedAt?: string;
		paidAt?: string;
		billingNotes?: string;
	};
	executionPhase: {
		current?: ExecutionPhaseType;
		preStartCompletedAt?: string;
		inExecutionCompletedAt?: string;
		closureCompletedAt?: string;
	};
	proposalId?: string;
	poNumber?: string;
	followUpWorkOrderId?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt: string;
	};
	assetDetails: OrderAssetDetails;
	scheduleSla: OrderScheduleSla;
	resourceAssignment: OrderResourceAssignment;
	hes: OrderHes;
	commercial: OrderCommercial;
	logistics: OrderLogistics;
	references: OrderReferences;
	dueDate?: string;
	slaDueDate?: string;
	slaStatus?: string;
	workPerformed?: string;
	customerFeedback?: string;
	costBaseline?: CostBaseline;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: response formatting centralizes legacy and enterprise OT shapes.
export function formatOrderResponse(
	doc: OrderDoc,
	options?: {
		hasApprovedReport?: boolean;
	},
): OrderResponse {
	const planning = doc.planning ?? { supportDocumentIds: [] };
	const billing = doc.billing ?? { sesStatus: "pending", invoiceStatus: "pending" };
	const hasApprovedReport = options?.hasApprovedReport ?? false;
	const scheduleSla = doc.scheduleSla ?? {
		estimatedDuration: { unit: "hours" as const },
		maintenanceWindow: {},
		responseLevel: undefined,
		recurrence: { enabled: false },
	};
	const resourceAssignment = doc.resourceAssignment ?? {
		technicianIds: [],
		employeeType: undefined,
		supervisorId: undefined,
		hesResponsibleId: undefined,
		requiredCertifications: [],
		vehicleResourceId: undefined,
	};
	const hes = doc.hes ?? {
		requiresPTW: false,
		permitTypes: [],
		requiresAST: false,
		riskLevel: "medium" as const,
		specificRisks: [],
		requiresIsolation: false,
	};
	const references = doc.references ?? {
		attachmentDocumentIds: [],
		relatedOrderId: undefined,
		parentOrderId: undefined,
		prerequisites: [],
	};
	const executionPhase = formatExecutionPhase(doc.executionPhase);
	const costBaseline = formatCostBaseline(doc.costBaseline);

	return {
		_id: doc._id.toString(),
		code: doc.code,
		type: doc.type,
		status: doc.status,
		priority: doc.priority,
		description: doc.description,
		assetId: doc.assetId,
		assetName: doc.assetName,
		location: doc.location,
		assignedTo: doc.assignedTo?.toString(),
		assignedToName: doc.assignedToName,
		supervisedBy: doc.supervisedBy?.toString(),
		materials: doc.materials || [],
		planning: {
			scheduledStartAt: toIsoString(planning.scheduledStartAt),
			estimatedHours: planning.estimatedHours,
			crewSize: planning.crewSize,
			kitTemplateId: planning.kitTemplateId,
			...(planning.kitSnapshot ? { kitSnapshot: planning.kitSnapshot } : {}),
			astDocumentId: planning.astDocumentId?.toString(),
			supportDocumentIds: (planning.supportDocumentIds ?? []).map((entry) => entry.toString()),
			planningReadyAt: toIsoString(planning.planningReadyAt),
			planningReadyBy: planning.planningReadyBy?.toString(),
		},
		startedAt: toIsoString(doc.startedAt),
		completedAt: toIsoString(doc.completedAt),
		observations: doc.observations,
		invoiceReady: doc.invoiceReady,
		reportGenerated: doc.reportGenerated,
		reportPdfGenerated: doc.reportGenerated,
		hasApprovedReport,
		billing: {
			sesNumber: billing.sesNumber,
			sesStatus: billing.sesStatus,
			sesApprovedAt: toIsoString(billing.sesApprovedAt),
			invoiceNumber: billing.invoiceNumber,
			invoiceStatus: billing.invoiceStatus,
			invoiceApprovedAt: toIsoString(billing.invoiceApprovedAt),
			paidAt: toIsoString(billing.paidAt),
			billingNotes: billing.billingNotes,
		},
		executionPhase,
		assetDetails: {
			warrantyStatus: doc.assetDetails?.warrantyStatus ?? "na",
			conditionForWork: doc.assetDetails?.conditionForWork,
			...(doc.assetDetails?.serialTag && { serialTag: doc.assetDetails.serialTag }),
			...(doc.assetDetails?.model && { model: doc.assetDetails.model }),
			...(doc.assetDetails?.manufacturer && { manufacturer: doc.assetDetails.manufacturer }),
			...(doc.assetDetails?.lastInterventionAt && {
				lastInterventionAt: toIsoString(doc.assetDetails.lastInterventionAt),
			}),
		},
		scheduleSla: {
			...scheduleSla,
			scheduledStartAt: toIsoString(scheduleSla.scheduledStartAt),
			dueAt: toIsoString(scheduleSla.dueAt),
			recurrence: {
				...scheduleSla.recurrence,
				endsAt: toIsoString(scheduleSla.recurrence.endsAt),
			},
		},
		resourceAssignment: {
			...resourceAssignment,
			technicianIds: resourceAssignment.technicianIds.map((entry) => entry.toString()),
			supervisorId: resourceAssignment.supervisorId?.toString(),
			hesResponsibleId: resourceAssignment.hesResponsibleId?.toString(),
			vehicleResourceId: resourceAssignment.vehicleResourceId?.toString(),
		},
		hes: {
			...hes,
			ptwDocumentId: hes.ptwDocumentId?.toString(),
		},
		commercial: doc.commercial ?? { isBillable: false, businessUnit: undefined },
		logistics: doc.logistics ?? {
			additionalMaterials: [],
			requiresSpecialTransport: false,
		},
		references: {
			...references,
			attachmentDocumentIds: references.attachmentDocumentIds.map((entry) => entry.toString()),
			relatedOrderId: references.relatedOrderId?.toString(),
			parentOrderId: references.parentOrderId?.toString(),
		},
		proposalId: doc.proposalId?.toString(),
		poNumber: doc.poNumber,
		...(costBaseline ? { costBaseline } : {}),
		createdBy: doc.createdBy.toString(),
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
		// Include additional fields from schema
		...(doc.followUpWorkOrderId && { followUpWorkOrderId: doc.followUpWorkOrderId.toString() }),
		...(doc.gpsLocation && {
			gpsLocation: {
				lat: doc.gpsLocation.lat,
				lng: doc.gpsLocation.lng,
				...(doc.gpsLocation.accuracy && { accuracy: doc.gpsLocation.accuracy }),
				capturedAt:
					doc.gpsLocation.capturedAt instanceof Date
						? doc.gpsLocation.capturedAt.toISOString()
						: String(doc.gpsLocation.capturedAt),
			},
		}),
		...(doc.dueDate && { dueDate: toIsoString(doc.dueDate) }),
		...(doc.slaDueDate && { slaDueDate: toIsoString(doc.slaDueDate) }),
		...(doc.slaStatus && { slaStatus: doc.slaStatus }),
		...(doc.workPerformed && { workPerformed: doc.workPerformed }),
		...(doc.customerFeedback && { customerFeedback: doc.customerFeedback }),
	};
}

function formatCostBaseline(costBaseline: OrderDoc["costBaseline"]) {
	if (!costBaseline) {
		return;
	}

	const frozenAt =
		costBaseline.frozenAt instanceof Date
			? costBaseline.frozenAt.toISOString()
			: costBaseline.frozenAt;

	return {
		...costBaseline,
		proposalId: costBaseline.proposalId.toString(),
		frozenAt,
	};
}

function isExecutionPhaseType(value?: string): value is ExecutionPhaseType {
	return value === "PRE_START" || value === "IN_EXECUTION" || value === "CLOSURE";
}

function formatExecutionPhase(
	executionPhase: OrderDoc["executionPhase"],
): OrderResponse["executionPhase"] {
	if (!executionPhase) {
		return {};
	}

	const preStartCompletedAt = toIsoString(executionPhase.preStartCompletedAt);
	const inExecutionCompletedAt = toIsoString(executionPhase.inExecutionCompletedAt);
	const closureCompletedAt = toIsoString(executionPhase.closureCompletedAt);

	return {
		...(isExecutionPhaseType(executionPhase.current) ? { current: executionPhase.current } : {}),
		...(preStartCompletedAt ? { preStartCompletedAt } : {}),
		...(inExecutionCompletedAt ? { inExecutionCompletedAt } : {}),
		...(closureCompletedAt ? { closureCompletedAt } : {}),
	};
}

/**
 * Generate unique order code
 * Format: OT-YYYYMM-NNNN (e.g., OT-202603-0042)
 *
 * Uses atomic MongoDB counter ($inc via findOneAndUpdate) to ensure
 * no race conditions when concurrent requests generate codes.
 */
export async function generateOrderCode(): Promise<string> {
	const now = new Date();
	const yearMonth = now.toISOString().slice(0, 7).replace("-", "");

	// Atomic increment — safe under concurrent requests
	const seq = await container.counterRepository.inc(yearMonth);
	const sequence = String(seq).padStart(4, "0");
	return `OT-${yearMonth}-${sequence}`;
}

/**
 * Audit log input type (re-export from audit.service)
 */
export type { AuditLogInput } from "../../audit/application/service";

/**
 * Create audit log entry (non-blocking)
 *
 * Wrapper that re-exports createAuditLog for order service usage.
 * Audit logging is fire-and-forget and should never block main operations.
 *
 * @param data - Audit log data
 */
export function logAudit(data: AuditLogInput): void {
	// Fire-and-forget: audit logs should not block main operation
	createAuditLog(data);
}

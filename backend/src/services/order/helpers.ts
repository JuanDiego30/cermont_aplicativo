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

import type { Types } from "mongoose";
import type { MaterialItem } from "../../config/kit-templates";
import { Counter } from "../../models";
import type { OrderDocumentFields } from "../../models/Order";
import { type AuditLogInput, createAuditLog } from "../../modules/audit/audit.service";
import type { OrderPriority, OrderStatus, OrderType } from "./order-rules";

/** Order document shape as returned from Mongoose (lean or hydrated) */
type OrderDoc = OrderDocumentFields & {
	_id: { toString(): string };
	assignedTo?: Types.ObjectId | { toString(): string };
	supervisedBy?: Types.ObjectId | { toString(): string };
	proposalId?: Types.ObjectId | { toString(): string };
	createdBy: Types.ObjectId | { toString(): string };
	followUpWorkOrderId?: Types.ObjectId | { toString(): string };
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
};

function toIsoString(value: Date | string): string {
	return value instanceof Date ? value.toISOString() : value;
}

export interface OrderSnapshot {
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
	startedAt?: string;
	completedAt?: string;
	observations?: string;
	invoiceReady: boolean;
	reportGenerated: boolean;
	proposalId?: string;
	followUpWorkOrderId?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt: string;
	};
	dueDate?: string;
	slaDueDate?: string;
	slaStatus?: string;
	workPerformed?: string;
	customerFeedback?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export function formatOrderResponse(doc: OrderDoc): OrderSnapshot {
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
		startedAt: doc.startedAt ? toIsoString(doc.startedAt) : doc.startedAt,
		completedAt: doc.completedAt ? toIsoString(doc.completedAt) : doc.completedAt,
		observations: doc.observations,
		invoiceReady: doc.invoiceReady,
		reportGenerated: doc.reportGenerated,
		proposalId: doc.proposalId?.toString(),
		createdBy: doc.createdBy.toString(),
		createdAt: toIsoString(doc.createdAt),
		updatedAt: toIsoString(doc.updatedAt),
		// Include additional fields from schema
		...(doc.followUpWorkOrderId && { followUpWorkOrderId: doc.followUpWorkOrderId.toString() }),
		...(doc.gpsLocation && {
			gpsLocation: {
				lat: doc.gpsLocation.lat,
				lng: doc.gpsLocation.lng,
				...(typeof doc.gpsLocation.accuracy === "number" && { accuracy: doc.gpsLocation.accuracy }),
				capturedAt: toIsoString(doc.gpsLocation.capturedAt),
			},
		}),
		...(doc.dueDate && { dueDate: toIsoString(doc.dueDate) }),
		...(doc.slaDueDate && { slaDueDate: toIsoString(doc.slaDueDate) }),
		...(doc.slaStatus && { slaStatus: doc.slaStatus }),
		...(doc.workPerformed && { workPerformed: doc.workPerformed }),
		...(doc.customerFeedback && { customerFeedback: doc.customerFeedback }),
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
	const seq = await Counter.inc(yearMonth);
	const sequence = String(seq).padStart(4, "0");
	return `OT-${yearMonth}-${sequence}`;
}

/**
 * Audit log input type (re-export from audit.service)
 */
export type { AuditLogInput } from "../../modules/audit/audit.service";

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

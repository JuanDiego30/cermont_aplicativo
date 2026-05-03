/**
 * Order State Service — Business Logic Layer
 *
 * Handles order lifecycle operations:
 * - updateOrderStatus: State machine transitions
 * - assignOrder: Assign to technician/operator
 * - deleteOrder: Soft delete (cancel)
 * - getOrderReport: Report generation via pdf-generator.service
 *
 * CRUD operations are in order-crud.service.ts
 */

import { normalizeUserRole } from "@cermont/shared-types/rbac";
import { BadRequestError, NotFoundError, UnprocessableError } from "../../_shared/common/errors";
import { createLogger, parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { getOrderSummary } from "../../costs/application/service";
import { ReportService } from "../../reports/application/service";
import { formatOrderResponse, logAudit, type OrderResponse } from "../domain/helpers";
import { OrderStatus, validateStateTransition } from "../domain/rules";
import { generateOrderPdf } from "./pdf-generator.service";
import { isPlanningComplete } from "./planning.service";

const log = createLogger("order-state-service");

/**
 * Change order status — strict state machine
 *
 * @param orderId - Order ID
 * @param newStatus - Target status
 * @param actorRole - Role of the user making the transition
 * @param actorId - User ID making the transition
 * @param observations - Optional observation/note for the transition
 * @returns OrderResponse
 * @throws NotFoundError if order doesn't exist
 * @throws BadRequestError if transition invalid
 */
export async function updateOrderStatus(
	orderId: string,
	newStatus: OrderStatus,
	actorRole: string,
	actorId: string,
	observations?: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Validate transition
	validateStateTransition(order.status, newStatus, actorRole);

	// Sprint 2.2 — Business Gates
	if (newStatus === "in_progress") {
		await validateExecutionStartRequirements(orderId);
	}

	if (newStatus === "completed") {
		await validateCompletionRequirements(orderId);
	}

	// Update status and timestamps
	const oldStatus = order.status;

	if (observations) {
		order.observations = observations;
	}

	// Track execution timeline
	if (newStatus === "in_progress" && !order.startedAt) {
		order.startedAt = new Date();
	}

	if (newStatus === "completed" && !order.completedAt) {
		order.completedAt = new Date();
	}

	if (newStatus === "closed") {
		await validateClosingRequirements(orderId);
		order.invoiceReady = true;
	}

	if (newStatus === "ready_for_invoicing") {
		await validateInvoicingRequirements(orderId);
		order.invoiceReady = true;
	}

	order.status = newStatus;

	await container.orderRepository.save(order);

	// Create Audit Log
	logAudit({
		action: "STATUS_CHANGED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: actorId,
		before: { status: oldStatus },
		after: { status: newStatus, invoiceReady: order.invoiceReady },
		metadata: {
			observations,
			changedBy: actorId,
			changedAt: new Date().toISOString(),
			previousStatus: oldStatus,
			newStatus,
		},
	});

	if (newStatus === "completed") {
		void ReportService.syncDraftAndGeneratePdf(orderId, actorId).catch((error: unknown) => {
			log.warn("Failed to auto-generate report draft after completion", {
				orderId,
				error: error instanceof Error ? error.message : String(error),
			});
		});
	}

	return formatOrderResponse(order);
}

/**
 * Sprint 2.2 Gate: assigned -> in_progress
 * Requires mandatory checklist completion (at least initialized/reviewed)
 */
async function validateExecutionStartRequirements(orderId: string): Promise<void> {
	const order = await container.orderRepository.findByIdLean(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	if (order.hes?.requiresPTW) {
		const hasSignedPtw = await hasSignedPtwDocument(order, orderId);

		if (!hasSignedPtw) {
			throw new UnprocessableError(
				"Adjunta el permiso de trabajo firmado antes de iniciar.",
				"ORDER_PTW_REQUIRED",
			);
		}
	}

	if (!isPlanningComplete(order)) {
		throw new UnprocessableError(
			"Cannot start execution: operational planning is incomplete. Schedule, crew, kit, AST, and support documents are required.",
			"EXECUTION_GATE_PLANNING_INCOMPLETE",
		);
	}

	const checklist = await container.checklistRepository.findOneLean({
		orderId: parseObjectId(orderId).toString(),
	});

	if (!checklist) {
		throw new UnprocessableError(
			"Cannot start execution: No checklist found for this order. Please contact administrator.",
			"EXECUTION_GATE_NO_CHECKLIST",
		);
	}

	// Business rule: technical must review items before starting
	// In our system, they just need to have the checklist ready
}

async function hasSignedPtwDocument(
	order: {
		hes?: { ptwDocumentId?: string | { toString(): string } };
		references?: { attachmentDocumentIds?: Array<string | { toString(): string }> };
		planning?: { supportDocumentIds?: Array<string | { toString(): string }> };
	},
	orderId: string,
): Promise<boolean> {
	const candidateIds = new Set<string>();

	if (order.hes?.ptwDocumentId) {
		candidateIds.add(order.hes.ptwDocumentId.toString());
	}

	for (const documentId of order.references?.attachmentDocumentIds ?? []) {
		candidateIds.add(documentId.toString());
	}

	for (const documentId of order.planning?.supportDocumentIds ?? []) {
		candidateIds.add(documentId.toString());
	}

	if (candidateIds.size === 0) {
		return false;
	}

	const documents = await container.documentRepository.findLean({
		_id: { $in: Array.from(candidateIds).map((documentId) => parseObjectId(documentId)) },
		order_id: parseObjectId(orderId),
		category: "ptw",
		signed: true,
	});

	return documents.length > 0;
}

/**
 * Sprint 2.2 Gate: in_progress -> completed
 * Requires mandatory checklist completion and all materials verified
 */
async function validateCompletionRequirements(orderId: string): Promise<void> {
	const checklist = await container.checklistRepository.findOneLean({
		orderId: parseObjectId(orderId).toString(),
	});

	if (!checklist || checklist.status !== "completed") {
		throw new UnprocessableError(
			"Cannot complete order: Mandatory checklist is pending completion.",
			"EXECUTION_GATE_CHECKLIST_INCOMPLETE",
		);
	}

	const order = await container.orderRepository.findByIdLean(orderId);
	const pendingMaterials = order?.materials?.filter((m) => !m.delivered).length || 0;

	if (pendingMaterials > 0) {
		throw new UnprocessableError(
			`Cannot complete order: ${pendingMaterials} materials are still pending delivery verification.`,
			"EXECUTION_GATE_MATERIALS_PENDING",
		);
	}
}

/**
 * Assign order to a technician/operator
 */
export async function assignOrder(orderId: string, userId: string): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const user = await container.userRepository.findByIdLean(userId);
	if (!user) {
		throw new NotFoundError("User", userId);
	}

	const assigneeRole = normalizeUserRole(user.role);
	if (assigneeRole !== "technician" && assigneeRole !== "operator") {
		throw new BadRequestError("Order can only be assigned to a technician or operator");
	}

	const oldAssignedTo = order.assignedTo;
	order.assignedTo =
		typeof user._id === "string" ? parseObjectId(user._id) : (user._id as typeof order.assignedTo);
	order.assignedToName = user.name;
	order.status = "assigned";

	await container.orderRepository.save(order);

	logAudit({
		action: "ORDER_ASSIGNED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: "system",
		before: { assignedTo: oldAssignedTo?.toString() },
		after: { assignedTo: userId, status: "assigned" },
	});

	return formatOrderResponse(order);
}

/**
 * Delete order (soft delete/cancel)
 */
export async function deleteOrder(orderId: string, userId?: string): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	order.status = "cancelled";
	order.deletedAt = new Date();
	if (userId) {
		order.deletedBy = parseObjectId(userId);
	}

	await container.orderRepository.save(order);

	logAudit({
		action: "ORDER_CANCELLED",
		entity: "Order",
		entityId: orderId,
		userId: userId ?? "system",
	});

	return formatOrderResponse(order);
}

/**
 * Business rule: Before closing an order, costs must be reviewed.
 */
async function validateClosingRequirements(orderId: string): Promise<void> {
	const summary = await getOrderSummary(orderId);

	if (!summary.hasCosts) {
		throw new UnprocessableError(
			"The order cannot be closed until at least one cost is recorded",
			"ORDER_HAS_NO_COSTS",
		);
	}
}

/**
 * Business rule: Before invoicing, work report must be generated and approved.
 */
async function validateInvoicingRequirements(orderId: string): Promise<void> {
	const report = await container.workReportRepository.findOneLean({
		orderId: parseObjectId(orderId).toString(),
	});

	if (!report || report.status !== "approved") {
		throw new UnprocessableError(
			"El informe tecnico debe estar aprobado antes de marcar la orden como lista para facturacion. Apruebe el informe en la seccion de Reportes.",
			"ORDER_REPORT_NOT_APPROVED",
		);
	}
}

/**
 * Generate PDF for order
 */
export async function getOrderReport(orderId: string, type: "technical" | "delivery") {
	return generateOrderPdf({ orderId, type });
}

// Re-export types for consumers
export type { OrderResponse };
export { OrderStatus };

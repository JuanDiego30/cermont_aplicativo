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

import { BadRequestError, NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { Order, User, WorkReport } from "../../models";
import type { OrderSnapshot } from "../../services/order/helpers";
import { formatOrderResponse, logAudit } from "../../services/order/helpers";
import { OrderStatus, validateStateTransition } from "../../services/order/order-rules";
import { generateOrderPdf } from "../../services/pdf-generator.service";
import { getOrderSummary } from "../cost/cost.service";
import { assertAdministrativeClosureReady } from "./order-closure.service";

type OrderStatusMutationTarget = {
	startedAt?: Date;
	completedAt?: Date;
	invoiceReady?: boolean;
	observations?: string;
};

function applyOrderStatusTimeline(
	order: OrderStatusMutationTarget,
	newStatus: OrderStatus,
	observations?: string,
): void {
	if (observations) {
		order.observations = observations;
	}

	if (newStatus === "in_progress" && !order.startedAt) {
		order.startedAt = new Date();
	}

	if (newStatus === "completed" && !order.completedAt) {
		order.completedAt = new Date();
	}
}

async function assertOrderCanClose(orderId: string): Promise<void> {
	const costSummary = await getOrderSummary(orderId);

	if (!costSummary.hasCosts) {
		throw new UnprocessableError(
			"The order cannot be closed until at least one cost is recorded",
			"ORDER_NO_COSTS_RECORDED",
		);
	}

	if (costSummary.variance < 0) {
		throw new UnprocessableError(
			"The order cannot be closed with a negative cost variance without approval",
			"ORDER_NEGATIVE_VARIANCE_UNAPPROVED",
		);
	}

	await assertAdministrativeClosureReady(orderId);
}

async function assertOrderCanBeMarkedReadyForInvoicing(orderId: string): Promise<void> {
	const costSummary = await getOrderSummary(orderId);

	if (!costSummary.hasCosts) {
		throw new UnprocessableError(
			"The order cannot be marked ready for invoicing until at least one cost is recorded",
			"ORDER_NO_COSTS_RECORDED",
		);
	}

	const approvedReport = await WorkReport.findOne({ orderId, status: "approved" }).lean();

	if (!approvedReport) {
		throw new UnprocessableError(
			"The order cannot be marked ready for invoicing until a work report is approved",
			"ORDER_REPORT_NOT_APPROVED",
		);
	}
}

async function applyOrderInvoicingRules(
	order: OrderStatusMutationTarget,
	orderId: string,
	newStatus: OrderStatus,
): Promise<void> {
	if (newStatus === "closed") {
		await assertOrderCanClose(orderId);
		order.invoiceReady = true;
		return;
	}

	if (newStatus === "ready_for_invoicing") {
		await assertOrderCanBeMarkedReadyForInvoicing(orderId);
		order.invoiceReady = true;
	}
}

/**
 * Change order status — strict state machine
 *
 * @param orderId - Order ID
 * @param newStatus - Target status
 * @param actorRole - Role of the user making the transition
 * @param actorId - User ID making the transition
 * @param observations - Optional observation/note for the transition
 * @returns OrderSnapshot
 * @throws NotFoundError if order doesn't exist
 * @throws BadRequestError if transition invalid
 */
export async function updateOrderStatus(
	orderId: string,
	newStatus: OrderStatus,
	actorRole: string,
	actorId: string,
	observations?: string,
): Promise<OrderSnapshot> {
	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Validate transition
	validateStateTransition(order.status, newStatus, actorRole);

	// Update status and timestamps
	const oldStatus = order.status;

	applyOrderStatusTimeline(order, newStatus, observations);
	await applyOrderInvoicingRules(order, orderId, newStatus);

	order.status = newStatus;

	await order.save();

	// Create Audit Log
	await logAudit({
		action: "STATUS_CHANGED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: actorId,
		before: { status: oldStatus },
		after: { status: newStatus, invoiceReady: order.invoiceReady },
		metadata: observations ? { observations } : { observationsStatus: "not_provided" },
	});

	return formatOrderResponse(order);
}

/**
 * Assign order to a technician/operator
 *
 * @param orderId - Order ID
 * @param userId - Technician/operator user ID
 * @returns OrderSnapshot
 * @throws NotFoundError if order or user doesn't exist
 * @throws BadRequestError if user is not tecnico/operador
 */
export async function assignOrder(orderId: string, userId: string): Promise<OrderSnapshot> {
	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Verify user exists and has appropriate role
	const user = await User.findById(userId).lean();

	if (!user) {
		throw new NotFoundError("User", userId);
	}

	if (!["tecnico", "operador"].includes(user.role)) {
		throw new BadRequestError(
			`User role '${user.role}' cannot be assigned to orders. Only tecnico/operador allowed.`,
		);
	}

	if (!user.isActive) {
		throw new BadRequestError(`User '${user.email}' is deactivated`);
	}

	// Assign
	order.assignedTo = user._id;
	order.assignedToName = user.name;

	// Auto-transition to assigned if currently open
	if (order.status === "open") {
		order.status = "assigned";
	}

	await order.save();

	// Create Audit Log for assignment
	await logAudit({
		action: "ORDER_ASSIGNED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: userId,
		after: {
			assignedTo: user._id.toString(),
			assignedToName: user.name,
			status: order.status,
		},
	});

	return formatOrderResponse(order);
}

/**
 * Soft delete order (mark as cancelled or archived)
 *
 * @param orderId - Order ID
 * @returns OrderSnapshot
 * @throws NotFoundError if order doesn't exist
 */
export async function deleteOrder(orderId: string): Promise<OrderSnapshot> {
	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Soft delete: mark as cancelled instead of removing
	order.status = "cancelled";
	await order.save();

	// Create Audit Log for deletion
	await logAudit({
		action: "ORDER_DELETED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: order.createdBy.toString(),
		before: { status: "open" },
		after: { status: "cancelled" },
	});

	return formatOrderResponse(order);
}

/**
 * Get order report — generates the PDF via pdf-generator.service
 *
 * @param orderId - Order ID
 * @returns PDF buffer, filename and content-type
 * @throws NotFoundError if order doesn't exist
 */
export async function getOrderReport(orderId: string): Promise<{
	filename: string;
	contentType: string;
	buffer: Buffer;
	mock: boolean;
}> {
	const order = await Order.findById(orderId).lean();

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Generate real PDF using pdf-generator.service
	const pdfBuffer = await generateOrderPdf({ orderId, type: "technical" });

	return {
		filename: `informe-${order.code}.pdf`,
		contentType: "application/pdf",
		buffer: pdfBuffer,
		mock: false,
	};
}

// Re-export types for consumers
export type { OrderSnapshot };
export { OrderStatus };

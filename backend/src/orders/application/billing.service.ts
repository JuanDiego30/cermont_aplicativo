/**
 * Billing Pipeline Service — Business Logic Layer
 *
 * Queries orders that are awaiting invoicing and computes aging metrics.
 * An order is considered "awaiting invoicing" when its status is
 * `completed` or `ready_for_invoicing`.
 *
 * Returns a flat list of billing-pipeline items plus an optional
 * grouping by "client" (derived from the order's `createdBy` user).
 *
 * FIX: Use Repository Pattern instead of direct model access
 *
 * @todo (Monitor) File size approaching 500 lines. Consider decomposing if it grows.
 */

import type {
	BatchCloseOrdersInput,
	BatchMarkReadyForInvoicingInput,
	BatchRegisterSesInput,
	BillingPipelineGroup,
	BillingPipelineItem,
	BillingPipelineResponse,
	BillingPipelineSummary,
	CreateDeliveryRecordInput,
	UpdateOrderBillingInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../_shared/common/errors";
import { toIsoString } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { formatOrderResponse, logAudit, type OrderResponse } from "../domain/helpers";
import { updateOrderStatus } from "./state.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MS_PER_DAY = 86_400_000;

function computeDaysWaiting(completedAt: Date | null): number {
	if (!completedAt) {
		return -1;
	}
	const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
	return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the full billing pipeline.
 *
 * 1. Fetches all orders with status `completed` or `ready_for_invoicing`.
 * 2. Computes `daysWaiting` from `completedAt`.
 * 3. Groups results by the user who created the order (client).
 * 4. Returns summary statistics.
 */
export async function getBillingPipeline(): Promise<BillingPipelineResponse> {
	const pipelineQuery = {
		$or: [
			{ status: { $in: ["completed", "ready_for_invoicing"] } },
			{ status: "closed", "billing.invoiceStatus": { $ne: "paid" } },
		],
	};
	const totalOrders = await container.orderRepository.countDocuments(pipelineQuery);
	const orders = await container.orderRepository.findPaginated(pipelineQuery, {
		skip: 0,
		limit: Math.max(totalOrders, 1),
		sort: { completedAt: 1 },
	});
	const creatorIds = Array.from(new Set(orders.map((doc) => doc.createdBy.toString())));
	const users = creatorIds.length
		? await container.userRepository.find(
				{ _id: { $in: creatorIds } },
				{ limit: creatorIds.length, sort: { name: 1 } },
			)
		: [];
	const clientNamesById = new Map(users.map((user) => [user._id.toString(), user.name]));
	const orderIds = orders.map((order) => order._id.toString());
	const deliveryRecords = orderIds.length
		? await container.documentRepository.find({
				order_id: { $in: orderIds.map((id) => new Types.ObjectId(id)) },
				category: "delivery_record",
			})
		: [];
	const deliveryByOrderId = new Map(
		deliveryRecords.map((document) => [
			document.order_id?.toString(),
			{ hasDeliveryRecord: true, deliveryRecordSigned: Boolean(document.signed) },
		]),
	);

	// Build pipeline items
	const pipeline: BillingPipelineItem[] = orders.map((doc) => {
		const createdBy = doc.createdBy.toString();
		return {
			_id: doc._id.toString(),
			code: doc.code,
			type: doc.type,
			status: doc.status as BillingPipelineItem["status"],
			assetName: doc.assetName,
			location: doc.location,
			description: doc.description,
			completedAt: toIsoString(doc.completedAt) ?? null,
			daysWaiting: computeDaysWaiting(doc.completedAt ?? null),
			invoiceReady: doc.invoiceReady ?? false,
			createdBy,
			clientName: clientNamesById.get(createdBy) ?? null,
			sesStatus: doc.billing?.sesStatus,
			invoiceStatus: doc.billing?.invoiceStatus,
			paidAt: toIsoString(doc.billing?.paidAt) ?? null,
			nteAmount: doc.commercial?.nteAmount ?? 0,
			hasDeliveryRecord: deliveryByOrderId.get(doc._id.toString())?.hasDeliveryRecord ?? false,
			deliveryRecordSigned:
				deliveryByOrderId.get(doc._id.toString())?.deliveryRecordSigned ?? false,
		};
	});

	// Group by createdBy (client)
	const groupMap = new Map<string, BillingPipelineGroup>();

	for (const item of pipeline) {
		const key = item.createdBy;
		const existing = groupMap.get(key);

		if (existing) {
			existing.orders.push(item);
			existing.totalOrders += 1;
			existing.totalDaysWaiting += Math.max(item.daysWaiting, 0);
			existing.averageDaysWaiting =
				Math.round((existing.totalDaysWaiting / existing.totalOrders) * 100) / 100;
		} else {
			groupMap.set(key, {
				clientName: item.clientName,
				createdBy: key,
				orders: [item],
				totalOrders: 1,
				totalDaysWaiting: Math.max(item.daysWaiting, 0),
				averageDaysWaiting: Math.max(item.daysWaiting, 0),
			});
		}
	}

	const groupedByClient = Array.from(groupMap.values());

	// Summary statistics
	const validDays = pipeline
		.filter((item) => item.daysWaiting >= 0)
		.map((item) => item.daysWaiting);
	const totalAwaitingInvoicing = pipeline.length;
	const totalCompletedNotReady = pipeline.filter(
		(item) => item.status === "completed" && !item.invoiceReady,
	).length;
	const totalReadyForInvoicing = pipeline.filter(
		(item) => item.status === "ready_for_invoicing",
	).length;
	const totalClosedPendingPayment = pipeline.filter(
		(item) => item.status === "closed" && item.invoiceStatus !== "paid",
	).length;

	const averageDaysWaiting =
		validDays.length > 0
			? Math.round((validDays.reduce((a, b) => a + b, 0) / validDays.length) * 100) / 100
			: 0;
	const maxDaysWaiting = validDays.length > 0 ? Math.max(...validDays) : 0;

	const summary: BillingPipelineSummary = {
		totalAwaitingInvoicing,
		totalCompletedNotReady,
		totalReadyForInvoicing,
		totalClosedPendingPayment,
		averageDaysWaiting,
		maxDaysWaiting,
	};
	const financialSummary = pipeline.reduce(
		(acc, item) => {
			const amount = Number(item.nteAmount ?? 0);
			acc.totalCopInPipeline += amount;
			if (item.status === "completed") {
				acc.copByStage.completed += amount;
			}
			if (item.status === "ready_for_invoicing") {
				acc.copByStage.readyForInvoicing += amount;
			}
			if (item.sesStatus !== "registered" && item.sesStatus !== "approved") {
				acc.copByStage.sesPending += amount;
			}
			if (
				item.invoiceStatus !== "sent" &&
				item.invoiceStatus !== "approved" &&
				item.invoiceStatus !== "paid"
			) {
				acc.copByStage.invoicePending += amount;
			}
			if (item.invoiceStatus === "paid") {
				acc.copByStage.paid += amount;
			}
			return acc;
		},
		{
			totalCopInPipeline: 0,
			copByStage: {
				completed: 0,
				readyForInvoicing: 0,
				sesPending: 0,
				invoicePending: 0,
				paid: 0,
			},
		},
	);

	return {
		pipeline,
		groupedByClient,
		summary,
		financialSummary,
	};
}

export async function batchMarkReadyForInvoicing(
	payload: BatchMarkReadyForInvoicingInput,
	actorRole: string,
	actorId: string,
): Promise<OrderResponse[]> {
	const updatedOrders: OrderResponse[] = [];

	for (const orderId of payload.orderIds) {
		const order = await updateOrderStatus(orderId, "ready_for_invoicing", actorRole, actorId);
		updatedOrders.push(order);
	}

	return updatedOrders;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

type BillingSnapshot = {
	sesNumber?: string;
	sesStatus: "pending" | "registered" | "approved";
	sesApprovedAt?: Date;
	invoiceNumber?: string;
	invoiceStatus: "pending" | "sent" | "approved" | "paid";
	invoiceApprovedAt?: Date;
	paidAt?: Date;
	billingNotes?: string;
};

function getCurrentBilling(order: { billing?: Partial<BillingSnapshot> }): BillingSnapshot {
	return {
		sesNumber: order.billing?.sesNumber,
		sesStatus: order.billing?.sesStatus ?? "pending",
		sesApprovedAt: order.billing?.sesApprovedAt,
		invoiceNumber: order.billing?.invoiceNumber,
		invoiceStatus: order.billing?.invoiceStatus ?? "pending",
		invoiceApprovedAt: order.billing?.invoiceApprovedAt,
		paidAt: order.billing?.paidAt,
		billingNotes: order.billing?.billingNotes,
	};
}

function resolveBillingFields(
	payload: UpdateOrderBillingInput,
	currentBilling: BillingSnapshot,
): {
	sesNumber?: string;
	invoiceNumber?: string;
	sesStatus: BillingSnapshot["sesStatus"];
	invoiceStatus: BillingSnapshot["invoiceStatus"];
	billingNotes?: string;
} {
	const sesNumber =
		payload.sesNumber !== undefined
			? normalizeOptionalString(payload.sesNumber)
			: currentBilling.sesNumber;
	const invoiceNumber =
		payload.invoiceNumber !== undefined
			? normalizeOptionalString(payload.invoiceNumber)
			: currentBilling.invoiceNumber;

	return {
		sesNumber,
		invoiceNumber,
		sesStatus: payload.sesStatus ?? (sesNumber ? "registered" : currentBilling.sesStatus),
		invoiceStatus: payload.invoiceStatus ?? (invoiceNumber ? "sent" : currentBilling.invoiceStatus),
		billingNotes:
			payload.billingNotes !== undefined
				? normalizeOptionalString(payload.billingNotes)
				: currentBilling.billingNotes,
	};
}

function buildUpdatedBillingSnapshot(
	currentBilling: BillingSnapshot,
	resolvedFields: ReturnType<typeof resolveBillingFields>,
): BillingSnapshot {
	return {
		...currentBilling,
		sesNumber: resolvedFields.sesNumber,
		sesStatus: resolvedFields.sesStatus,
		sesApprovedAt:
			resolvedFields.sesStatus === "approved"
				? (currentBilling.sesApprovedAt ?? new Date())
				: undefined,
		invoiceNumber: resolvedFields.invoiceNumber,
		invoiceStatus: resolvedFields.invoiceStatus,
		invoiceApprovedAt:
			resolvedFields.invoiceStatus === "approved" || resolvedFields.invoiceStatus === "paid"
				? (currentBilling.invoiceApprovedAt ?? new Date())
				: undefined,
		paidAt:
			resolvedFields.invoiceStatus === "paid" ? (currentBilling.paidAt ?? new Date()) : undefined,
		billingNotes: resolvedFields.billingNotes,
	};
}

function applyBillingStatusToOrder(
	order: {
		invoiceReady: boolean;
		status: string;
	},
	invoiceStatus: BillingSnapshot["invoiceStatus"],
): void {
	if (invoiceStatus !== "pending") {
		order.invoiceReady = true;
	}

	if (invoiceStatus === "paid") {
		order.status = "closed";
	}
}

export async function updateOrderBilling(
	orderId: string,
	payload: UpdateOrderBillingInput,
	actorId: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const currentBilling = getCurrentBilling(order);
	const resolvedFields = resolveBillingFields(payload, currentBilling);

	order.billing = buildUpdatedBillingSnapshot(currentBilling, resolvedFields);
	applyBillingStatusToOrder(order, resolvedFields.invoiceStatus);

	await container.orderRepository.save(order);

	logAudit({
		action: "ORDER_BILLING_UPDATED",
		entity: "Order",
		entityId: orderId,
		userId: actorId,
		after: {
			sesStatus: resolvedFields.sesStatus,
			invoiceStatus: resolvedFields.invoiceStatus,
			invoiceReady: order.invoiceReady,
			status: order.status,
		},
	});

	return formatOrderResponse(order);
}

export async function batchCloseOrders(
	payload: BatchCloseOrdersInput,
	actorId: string,
): Promise<OrderResponse[]> {
	const updatedOrders: OrderResponse[] = [];

	for (const orderId of payload.orderIds) {
		const order = await container.orderRepository.findById(orderId);

		if (!order) {
			throw new NotFoundError("Order", orderId);
		}

		if (order.status !== "ready_for_invoicing") {
			throw new UnprocessableError(
				`Order ${order.code} must be ready for invoicing before batch closure`,
				"ORDER_NOT_READY_FOR_BATCH_CLOSE",
			);
		}

		const currentBilling = order.billing ?? { sesStatus: "pending", invoiceStatus: "pending" };
		const sesNumber = normalizeOptionalString(payload.sesNumber) ?? currentBilling.sesNumber;

		order.billing = {
			...currentBilling,
			sesNumber,
			sesStatus: sesNumber ? "registered" : currentBilling.sesStatus,
			billingNotes:
				payload.billingNotes !== undefined
					? normalizeOptionalString(payload.billingNotes)
					: currentBilling.billingNotes,
		};
		order.invoiceReady = true;
		order.status = "closed";

		await container.orderRepository.save(order);

		logAudit({
			action: "ORDER_BATCH_CLOSED",
			entity: "Order",
			entityId: orderId,
			userId: actorId,
			after: {
				status: order.status,
				sesStatus: order.billing.sesStatus,
				invoiceStatus: order.billing.invoiceStatus,
			},
		});

		updatedOrders.push(formatOrderResponse(order));
	}

	return updatedOrders;
}

export async function batchRegisterSes(
	payload: BatchRegisterSesInput,
	actorId: string,
): Promise<OrderResponse[]> {
	const updatedOrders: OrderResponse[] = [];

	for (const entry of payload.orders) {
		const order = await container.orderRepository.findById(entry.orderId);
		if (!order) {
			throw new NotFoundError("Order", entry.orderId);
		}
		const currentBilling = getCurrentBilling(order);
		order.billing = {
			...currentBilling,
			sesNumber: normalizeOptionalString(entry.sesNumber),
			sesStatus: "registered",
		};
		await container.orderRepository.save(order);
		logAudit({
			action: "ORDER_SES_REGISTERED",
			entity: "Order",
			entityId: entry.orderId,
			userId: actorId,
			after: { sesNumber: entry.sesNumber, sesStatus: "registered" },
		});
		updatedOrders.push(formatOrderResponse(order));
	}

	return updatedOrders;
}

export async function createDeliveryRecord(
	orderId: string,
	payload: CreateDeliveryRecordInput,
	actorId: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}
	if (order.status !== "completed" && order.status !== "ready_for_invoicing") {
		throw new UnprocessableError(
			"Order must be completed or ready for invoicing to create a delivery record",
			"ORDER_NOT_READY_FOR_DELIVERY_RECORD",
		);
	}

	await container.documentRepository.create({
		title: payload.title,
		category: "delivery_record",
		file_url: payload.fileUrl ?? `delivery-record://${orderId}`,
		uploaded_by: actorId,
		order_id: orderId,
		signed: payload.signed,
		...(payload.signed ? { signedBy: actorId, signedAt: new Date() } : {}),
	});

	logAudit({
		action: "ORDER_DELIVERY_RECORD_CREATED",
		entity: "Order",
		entityId: orderId,
		userId: actorId,
		after: { signed: payload.signed },
	});

	return formatOrderResponse(order);
}

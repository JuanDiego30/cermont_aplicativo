/**
 * Order CRUD Service — Business Logic Layer
 *
 * Handles core CRUD operations for orders:
 * - createOrder: Create new work orders
 * - listOrders: Paginated listing with filters
 * - getOrderById: Single order retrieval (with ownership check)
 * - updateOrder: Update order fields (not status)
 *
 * State transitions are in order-state.service.ts
 */

import { ADMIN_ROLES } from "@cermont/domain";
import { ForbiddenError, NotFoundError } from "../../common/errors/AppError";
import type { MaterialItem } from "../../config/kit-templates";
import { getDefaultKitForOrderType } from "../../config/kit-templates";
import { Order } from "../../models";
import * as ChecklistSvc from "../checklist/checklist.service";
import type { OrderResponse } from "../../services/order/helpers";
import { formatOrderResponse, generateOrderCode, logAudit } from "../../services/order/helpers";
import { OrderPriority, OrderStatus, OrderType } from "../../services/order/order-rules";
import { assertProposalReadyForWorkOrder } from "../purchase-order/purchase-order.service";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Create a new order
 *
 * @param payload - Order creation payload
 * @param createdBy - User ID creating the order
 * @returns OrderResponse
 */
export async function createOrder(
	payload: {
		type: OrderType;
		priority: OrderPriority;
		description: string;
		assetId: string;
		assetName: string;
		location: string;
		proposalId?: string;
		materials?: MaterialItem[];
		kitTemplate?: string;
		customFields?: Record<string, string | number | boolean>;
	},
	createdBy: string,
): Promise<OrderResponse> {
	if (payload.proposalId) {
		await assertProposalReadyForWorkOrder(payload.proposalId);
	}

	// Generate unique code
	const code = await generateOrderCode();

	// Resolve materials: use explicit materials or apply kit template
	let materials = payload.materials || [];
	if (!materials.length && payload.kitTemplate) {
		const kit = getDefaultKitForOrderType(payload.type);
		if (kit) {
			materials = kit.materials;
		}
	}

	const order = new Order({
		code,
		type: payload.type,
		priority: payload.priority,
		description: payload.description,
		assetId: payload.assetId,
		assetName: payload.assetName,
		location: payload.location,
		proposalId: payload.proposalId,
		materials,
		status: "open",
		invoiceReady: false,
		reportGenerated: false,
		createdBy,
		customFields: payload.customFields || {},
	});

	await order.save();

	// Create Audit Log for order creation
	logAudit({
		action: "ORDER_CREATED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: createdBy,
		after: {
			code: order.code,
			type: order.type,
			priority: order.priority,
			status: order.status,
			proposalId: payload.proposalId,
		},
	});

	if (payload.kitTemplate) {
		await ChecklistSvc.createChecklist(order._id.toString(), createdBy, {
			kitTemplate: payload.kitTemplate,
		});
	} else {
		await ChecklistSvc.createChecklist(order._id.toString(), createdBy);
	}

	return formatOrderResponse(order);
}

/**
 * Get all orders (paginated, with optional filters)
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param filters - Optional: { status?, priority?, assignedTo?, search?, role? (for visibility) }
 * @returns { orders: OrderResponse[], total, page, limit, pages }
 */
export async function listOrders(
	page: number = 1,
	limit: number = 20,
	filters?: {
		status?: OrderStatus;
		priority?: OrderPriority;
		assignedTo?: string;
		search?: string;
		role?: string; // Visibility filter
		createdBy?: string; // For cliente RBAC filter
	},
) {
	const query: Record<string, unknown> = {};

	if (filters?.status) {
		query.status = filters.status;
	}
	if (filters?.priority) {
		query.priority = filters.priority;
	}
	if (filters?.assignedTo) {
		query.assignedTo = filters.assignedTo;
	}

	const searchTerm = filters?.search?.trim();
	if (searchTerm) {
		const searchRegex = new RegExp(escapeRegExp(searchTerm), "i");
		query.$or = [
			{ code: searchRegex },
			{ description: searchRegex },
			{ assetName: searchRegex },
			{ location: searchRegex },
			{ assignedToName: searchRegex },
		];
	}

	// Role-based visibility
	if (filters?.role === "tecnico" || filters?.role === "operador") {
		if (filters?.assignedTo) {
			query.assignedTo = filters.assignedTo;
		}
	} else if (filters?.role === "cliente") {
		if (filters?.createdBy) {
			query.createdBy = filters.createdBy;
		}
	}

	const skip = (page - 1) * limit;
	const total = await Order.countDocuments(query);
	const orders = await Order.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean();

	const pages = Math.ceil(total / limit);

	return {
		orders: orders.map(formatOrderResponse),
		total,
		page,
		limit,
		pages,
	};
}

/**
 * Get order by ID with ownership verification
 *
 * SECURITY FIX: RT-001 - BOLA/IDOR Prevention
 * Verifies that the requesting user has access to the order:
 * - Admin roles (gerente, residente, administrativo) can access all orders
 * - tecnico/operador can only access orders they are assigned to
 * - cliente can only access orders they created
 *
 * @param orderId - Order MongoDB ObjectId as string
 * @param requestingUser - The user requesting the order { _id, role }
 * @returns OrderResponse
 * @throws NotFoundError if order doesn't exist
 * @throws ForbiddenError if user doesn't have access
 */
export async function getOrderByIdWithAuth(
	orderId: string,
	requestingUser: { _id: string; role: string },
): Promise<OrderResponse> {
	const order = await Order.findById(orderId).lean();

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Check if user has access to this order
	const isAdmin = ADMIN_ROLES.includes(requestingUser.role as (typeof ADMIN_ROLES)[number]);
	const isOwner = order.createdBy?.toString() === requestingUser._id;
	const isAssigned = order.assignedTo?.toString() === requestingUser._id;

	if (!isAdmin && !isOwner && !isAssigned) {
		throw new ForbiddenError("You do not have access to this order");
	}

	return formatOrderResponse(order);
}

/**
 * Get order by ID (legacy - without auth check, for internal use only)
 * @deprecated Use getOrderByIdWithAuth instead
 *
 * @param orderId - Order MongoDB ObjectId as string
 * @returns OrderResponse
 * @throws NotFoundError if order doesn't exist
 */
export async function getOrderById(orderId: string): Promise<OrderResponse> {
	const order = await Order.findById(orderId).lean();

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	return formatOrderResponse(order);
}

/**
 * Update order fields (name, description, location, etc.) with ownership check
 *
 * Does NOT handle state transitions — use updateOrderStatus for that.
 *
 * SECURITY FIX: RT-001 - BOLA/IDOR Prevention
 *
 * @param orderId - Order ID
 * @param payload - Partial update payload
 * @param requestingUser - The user requesting the update { _id, role }
 * @returns OrderResponse
 * @throws NotFoundError if order doesn't exist
 * @throws ForbiddenError if user doesn't have access
 */
export async function updateOrder(
	orderId: string,
	payload: {
		description?: string;
		location?: string;
		priority?: OrderPriority;
		observations?: string;
	},
	requestingUser?: { _id: string; role: string },
): Promise<OrderResponse> {
	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// If user context provided, check ownership (for PUT /api/orders/:id)
	if (requestingUser) {
		const isAdmin = ADMIN_ROLES.includes(requestingUser.role as (typeof ADMIN_ROLES)[number]);
		const isOwner = order.createdBy?.toString() === requestingUser._id;

		if (!isAdmin && !isOwner) {
			throw new ForbiddenError("You do not have permission to update this order");
		}
	}

	if (payload.description) {
		order.description = payload.description;
	}
	if (payload.location) {
		order.location = payload.location;
	}
	if (payload.priority) {
		order.priority = payload.priority;
	}
	if (payload.observations !== undefined) {
		order.observations = payload.observations;
	}

	await order.save();
	return formatOrderResponse(order);
}

// Re-export types for consumers
export type { OrderResponse };
export { OrderPriority, OrderStatus, OrderType };

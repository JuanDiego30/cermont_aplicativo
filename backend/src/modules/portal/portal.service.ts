/**
 * Portal Service — Cliente Portal API (read-only views for client role)
 *
 * Exposes limited, read-only data for clients to:
 * - View their active work orders and their status
 * - View/download proposals, invoices, technical reports
 * - View evidence from their orders
 * - Approve/reject proposals and invoices
 * - Sign delivery records
 */

import { Types } from "mongoose";
import { NotFoundError } from "../../common/errors/AppError";
import { DeliveryRecord, Invoice, Order, Proposal, TechnicalReport, User } from "../../models";

interface PortalClient {
	clientId: string;
	clientName: string;
}

interface PortalOrderSummary {
	_id: string;
	code: string;
	status: string;
	serviceType: string;
	createdAt: string;
	updatedAt: string;
}

interface PortalOrderDetail extends PortalOrderSummary {
	description: string;
	assignedTo?: string;
	assignedToName?: string;
	serviceSite?: string;
	proposals: Array<{ _id: string; code: string; status: string; total: number }>;
	invoices: Array<{ _id: string; code: string; status: string; totalAmount: number }>;
	technicalReports: Array<{ _id: string; code: string; status: string }>;
	deliveryRecords: Array<{ _id: string; code: string; status: string }>;
}

interface PortalInvoiceSummary {
	_id: string;
	code: string;
	status: string;
	amount: number;
	totalAmount: number;
	issueDate?: string;
	dueDate?: string;
}

interface PortalProposalSummary {
	_id: string;
	code?: string;
	status: string;
	total: number;
	createdAt: string;
}

/**
 * Resolve the client's User record to get linked client info
 */
async function resolveClient(userId: string): Promise<PortalClient> {
	const user = await User.findById(userId).lean<{
		_id: Types.ObjectId;
		name: string;
		email: string;
	}>();
	if (!user) {
		throw new NotFoundError("User", userId);
	}

	return {
		clientId: user._id.toString(),
		clientName: user.name,
	};
}

/**
 * List active orders for a client
 */
export async function listClientOrders(clientUserId: string): Promise<PortalOrderSummary[]> {
	const client = await resolveClient(clientUserId);

	const orders = await Order.find({
		$or: [
			{ clientId: new Types.ObjectId(client.clientId) },
			{ createdBy: new Types.ObjectId(client.clientId) },
		],
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	return orders.map((d) => {
		const o = d as unknown as Record<string, unknown>;
		return {
			_id: String(o._id ?? ""),
			code: String(o.code ?? ""),
			status: String(o.status ?? ""),
			serviceType: String(o.serviceType ?? o.type ?? ""),
			createdAt: String(o.createdAt ?? ""),
			updatedAt: String(o.updatedAt ?? ""),
		};
	});
}

/**
 * Get order detail with linked documents for a client
 */
export async function getClientOrderDetail(
	orderId: string,
	clientUserId: string,
): Promise<PortalOrderDetail> {
	await resolveClient(clientUserId);
	const orderObjectId = new Types.ObjectId(orderId);

	const order = await Order.findById(orderObjectId).lean();
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const [proposals, invoices, technicalReports, deliveryRecords] = await Promise.all([
		Proposal.find({ orderId: orderObjectId }).sort({ createdAt: -1 }).lean(),
		Invoice.find({ workOrderId: orderObjectId }).sort({ createdAt: -1 }).lean(),
		TechnicalReport.find({ workOrderId: orderObjectId }).sort({ createdAt: -1 }).lean(),
		DeliveryRecord.find({ workOrderId: orderObjectId }).sort({ createdAt: -1 }).lean(),
	]);

	return {
		_id: order._id.toString(),
		code: order.code ?? "",
		status: order.status,
		serviceType: (order as unknown as Record<string, string>).serviceType ?? "",
		description: (order as unknown as Record<string, string>).description ?? "",
		assignedTo: order.assignedTo?.toString(),
		serviceSite:
			(order as unknown as Record<string, string>).serviceSite ??
			(order as unknown as Record<string, string>).location ??
			"",
		createdAt: order.createdAt?.toISOString() ?? "",
		updatedAt: order.updatedAt?.toISOString() ?? "",
		proposals: proposals.map((p) => ({
			_id: p._id.toString(),
			code: p.code ?? "",
			status: p.status,
			total: p.total ?? 0,
		})),
		invoices: invoices.map((inv) => ({
			_id: inv._id.toString(),
			code: inv.code ?? "",
			status: inv.status,
			totalAmount: inv.totalAmount ?? 0,
		})),
		technicalReports: technicalReports.map((r) => ({
			_id: r._id.toString(),
			code: r.code ?? "",
			status: r.status,
		})),
		deliveryRecords: deliveryRecords.map((dr) => ({
			_id: dr._id.toString(),
			code: dr.code ?? "",
			status: dr.status,
		})),
	};
}

/**
 * List invoices for a client
 */
export async function listClientInvoices(clientUserId: string): Promise<PortalInvoiceSummary[]> {
	const client = await resolveClient(clientUserId);

	const invoices = await Invoice.find({
		clientId: new Types.ObjectId(client.clientId),
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	return invoices.map((inv) => ({
		_id: inv._id.toString(),
		code: inv.code ?? "",
		status: inv.status,
		amount: inv.amount ?? 0,
		totalAmount: inv.totalAmount ?? 0,
		issueDate: inv.issueDate?.toISOString(),
		dueDate: inv.dueDate?.toISOString(),
	}));
}

/**
 * List proposals for a client
 */
export async function listClientProposals(clientUserId: string): Promise<PortalProposalSummary[]> {
	const client = await resolveClient(clientUserId);

	const proposals = await Proposal.find({
		clientId: new Types.ObjectId(client.clientId),
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	return proposals.map((p) => ({
		_id: p._id.toString(),
		code: p.code,
		status: p.status,
		total: p.total ?? 0,
		createdAt: p.createdAt?.toISOString() ?? "",
	}));
}

/**
 * Get client dashboard summary
 */
export async function getClientDashboard(clientUserId: string) {
	const client = await resolveClient(clientUserId);
	const clientObjectId = new Types.ObjectId(client.clientId);

	const [orderCount, activeOrders, pendingApprovalCount, unpaidInvoices] = await Promise.all([
		Order.countDocuments({
			$or: [{ clientId: clientObjectId }, { createdBy: clientObjectId }],
		}),
		Order.countDocuments({
			$or: [{ clientId: clientObjectId }, { createdBy: clientObjectId }],
			status: { $in: ["in_progress", "assigned", "planning"] },
		}),
		Proposal.countDocuments({
			clientId: clientObjectId,
			status: "sent",
		}),
		Invoice.countDocuments({
			clientId: clientObjectId,
			status: { $in: ["issued", "sent", "submitted", "approved"] },
		}),
	]);

	return {
		clientName: client.clientName,
		totalOrders: orderCount,
		activeOrders,
		pendingApprovals: pendingApprovalCount,
		unpaidInvoices,
	};
}

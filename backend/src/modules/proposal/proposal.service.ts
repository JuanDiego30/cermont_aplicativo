/**
 * Proposal Service for Cermont Backend
 *
 * Handles proposal management business logic:
 * - CRUD operations for proposals
 * - Status transitions (approve, reject)
 * - Conversion to work orders
 *
 * DOC REFERENCE: DOC-07 Section Propuestas Comerciales, DOC-09
 * DOC REFERENCE: ISSUE-030 — Use OrderService.createOrder() instead of direct Order creation
 */

import type {
	ConvertProposalToOrderInput,
	CreateProposalInput,
	ProposalStatus,
} from "@cermont/shared-types";
import mongoose from "mongoose";
import { AppError, ForbiddenError, ServiceUnavailableError } from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import { escapeRegExp } from "../../common/utils/normalization";
import type { AuthClaims } from "../../common/utils/request";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { Counter, Proposal } from "../../models";
import * as OrderService from "../../modules/order/order.service";

type ProposalOrderInput = Parameters<typeof OrderService.createOrder>[0];
type ProposalItemInput = CreateProposalInput["items"][number];

const log = createLogger("proposal-service");

interface ProposalViewer extends Pick<AuthClaims, "_id" | "email" | "role"> {}

function normalizeEmail(value: unknown): string {
	return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getClientEmailPattern(email: string): RegExp {
	const normalizedEmail = normalizeEmail(email);

	if (!normalizedEmail) {
		throw new ForbiddenError("Client email is required to access proposals");
	}

	return new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i");
}

function canViewerSeeAllProposals(viewer: ProposalViewer): boolean {
	return viewer.role !== "cliente";
}

function assertProposalAccess(proposal: { clientEmail?: string }, viewer: ProposalViewer): void {
	if (canViewerSeeAllProposals(viewer)) {
		return;
	}

	const viewerEmail = normalizeEmail(viewer.email);
	const proposalEmail = normalizeEmail(proposal.clientEmail);

	if (!proposalEmail || proposalEmail !== viewerEmail) {
		throw new ForbiddenError("You can only access your own proposals");
	}
}

async function generateProposalCode(): Promise<string> {
	const year = new Date().getFullYear().toString();
	const sequence = await Counter.inc(`PROP-${year}`);
	return `PROP-${year}-${String(sequence).padStart(4, "0")}`;
}

function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

export function calculateProposalTotals(
	inputItems: ProposalItemInput[],
	taxRate: number = 0.19,
): {
	items: Array<ProposalItemInput & { total: number }>;
	subtotal: number;
	taxRate: number;
	total: number;
} {
	const items = inputItems.map((item) => ({
		...item,
		total: roundMoney(item.quantity * item.unitCost),
	}));
	const subtotal = roundMoney(items.reduce((sum, item) => sum + item.total, 0));
	const tax = roundMoney(subtotal * taxRate);

	return {
		items,
		subtotal,
		taxRate,
		total: roundMoney(subtotal + tax),
	};
}

/**
 * Create a new proposal
 * Flow: clientName + items -> Proposal (draft)
 */
export async function createProposal(data: CreateProposalInput, userId: string) {
	const { items, subtotal, taxRate, total } = calculateProposalTotals(data.items);
	const code = await generateProposalCode();
	const clientEmail = data.clientEmail?.trim().toLowerCase() || undefined;

	const proposal = new Proposal({
		code,
		title: data.title,
		clientName: data.clientName,
		clientEmail,
		items,
		subtotal,
		taxRate,
		total,
		validUntil: new Date(data.validUntil),
		notes: data.notes,
		status: "draft",
		createdBy: userId,
		...(data.serviceCaseId ? { serviceCaseId: data.serviceCaseId } : {}),
	});

	await proposal.save();
	await proposal.populate(["createdBy", "approvedBy"]);

	log.info("Proposal created", { proposalId: String(proposal._id) });
	return proposal;
}

/**
 * Get proposals by order ID
 */
export async function findProposalsByOrderId(orderId: string, viewer: ProposalViewer) {
	const where: Record<string, unknown> = {
		generatedOrders: new mongoose.Types.ObjectId(orderId),
	};

	if (!canViewerSeeAllProposals(viewer)) {
		where.clientEmail = getClientEmailPattern(viewer.email ?? "");
	}

	return Proposal.find(where)
		.populate("createdBy", "name email")
		.populate("approvedBy", "name email")
		.sort({ createdAt: -1 })
		.lean();
}

/**
 * Get all proposals with pagination
 */
export async function findAllProposals(
	filters: { status?: ProposalStatus },
	viewer: ProposalViewer,
	page: number = 1,
	limit: number = 50,
) {
	const where: Record<string, unknown> = {};
	if (filters.status) {
		where.status = filters.status;
	}
	if (!canViewerSeeAllProposals(viewer)) {
		where.clientEmail = getClientEmailPattern(viewer.email ?? "");
	}

	const skip = (page - 1) * limit;

	let data: unknown[];
	let total: number;

	try {
		[data, total] = await Promise.all([
			Proposal.find(where)
				.populate("createdBy", "name email")
				.populate("approvedBy", "name email")
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(skip)
				.lean(),
			Proposal.countDocuments(where),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

	return { data, total };
}

/**
 * Get proposal by ID
 */
export async function findProposalById(id: string, viewer: ProposalViewer) {
	const proposal = await Proposal.findById(id)
		.populate("createdBy", "name email")
		.populate("approvedBy", "name email")
		.populate("generatedOrders")
		.lean();

	if (!proposal) {
		throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
	}

	assertProposalAccess(proposal, viewer);
	return proposal;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
	draft: ["sent"],
	sent: ["approved", "rejected"],
	approved: ["converted"],
	rejected: [],
	expired: [],
	converted: [],
};

/**
 * Update proposal status with transition validation
 */
export async function updateProposalStatus(
	id: string,
	status: ProposalStatus,
	userId: string,
	_poNumber?: string,
	notes?: string,
	approvedAt?: string,
) {
	const proposal = await Proposal.findById(id);
	if (!proposal) {
		throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
	}

	const allowed = ALLOWED_TRANSITIONS[proposal.status];
	if (!allowed?.includes(status)) {
		throw new AppError(
			`No se puede cambiar de ${proposal.status} a ${status}`,
			400,
			"INVALID_TRANSITION",
		);
	}

	proposal.status = status;
	if (notes) {
		proposal.statusNotes = notes;
	}

	if (status === "approved") {
		const recalculated = calculateProposalTotals(proposal.items, proposal.taxRate);
		proposal.items = recalculated.items;
		proposal.subtotal = recalculated.subtotal;
		proposal.total = recalculated.total;
		proposal.approvedBy = userId as unknown as mongoose.Types.ObjectId;
		proposal.approvedAt = approvedAt ? new Date(approvedAt) : new Date();
	} else {
		proposal.approvedBy = undefined;
		proposal.approvedAt = undefined;
	}

	await proposal.save();
	await proposal.populate(["createdBy", "approvedBy"]);

	log.info("Proposal status updated", { proposalId: id, status });
	return proposal;
}

/**
 * Approve a proposal
 */
export async function approveProposal(id: string, userId: string, poNumber?: string) {
	return updateProposalStatus(id, "approved", userId, poNumber);
}

/**
 * Reject a proposal
 */
export async function rejectProposal(id: string, userId: string) {
	return updateProposalStatus(id, "rejected", userId);
}

/**
 * Convert approved proposal to work order (OT)
 *
 * Flow per DOC-07:
 * 1. Proposal must be approved
 * 2. Create new Order via OrderService.createOrder() per ISSUE-030
 * 3. Update Proposal with generatedOrders reference
 *
 * @param proposalId - Proposal ID to convert
 * @param orderData - Additional order context (asset, location, type)
 * @param userId - User creating the order
 * @returns Created Order
 * @throws AppError if proposal not approved
 */
export async function convertProposalToOrder(
	proposalId: string,
	orderData: ConvertProposalToOrderInput,
	userId: string,
) {
	// Fetch proposal
	const proposal = await Proposal.findById(proposalId);
	if (!proposal) {
		throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
	}

	// Verify proposal is approved
	if (proposal.status !== "approved") {
		throw new AppError(
			`Propuesta debe estar aprobada. Estado actual: ${proposal.status}`,
			400,
			"PROPOSAL_NOT_APPROVED",
		);
	}

	const recalculated = calculateProposalTotals(proposal.items, proposal.taxRate);
	proposal.items = recalculated.items;
	proposal.subtotal = recalculated.subtotal;
	proposal.total = recalculated.total;

	// Convert proposal items to order materials
	const materials = proposal.items.map((item) => ({
		name: item.description,
		quantity: item.quantity,
		unit: item.unit,
		unitCost: item.unitCost,
		delivered: false,
	}));

	// FIX (ISSUE-030): Use OrderService.createOrder() instead of direct Order creation
	// This ensures consistent Order creation logic and audit logging
	const orderInput: ProposalOrderInput = {
		type: orderData.type,
		priority: orderData.priority,
		description: orderData.description || proposal.title,
		assetId: orderData.assetId,
		assetName: orderData.assetName,
		location: orderData.location,
		proposalId,
		materials,
	};
	const order = await OrderService.createOrder(orderInput, userId);

	// Update proposal with generated order reference
	proposal.generatedOrders = proposal.generatedOrders || [];
	proposal.generatedOrders.push(order._id as unknown as mongoose.Types.ObjectId);
	await proposal.save();

	log.info("Proposal converted to order", {
		proposalId,
		orderId: String(order._id),
		orderCode: order.code,
	});

	return order;
}

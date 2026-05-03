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
 * FIX: Use Repository Pattern instead of direct model access
 * FIX: Strong typing with ProposalDocument from shared-types
 */

import type {
	ConvertProposalToOrderInput,
	CreateProposalInput,
	ProposalDocument,
	ProposalStatus,
} from "@cermont/shared-types";
import mongoose from "mongoose";
import { AppError, ForbiddenError } from "../../_shared/common/errors";
import { createLogger, escapeRegExp } from "../../_shared/common/utils";
import { sendEmail } from "../../_shared/common/utils/email";
import type { AuthPayload } from "../../_shared/common/utils/request";
import { container } from "../../_shared/config/container";
import type { EnterpriseCreateOrderPayload } from "../../orders/application/service";
import * as OrderService from "../../orders/application/service";
import { getReportTemplateSettings } from "../../reports/application/settings.service";
import { canConvertToOrder, isValidStatusTransition } from "../domain/proposal.rules";
import { generateProposalPdf } from "./pdf-generator.service";

type ProposalOrderInput = EnterpriseCreateOrderPayload;

const log = createLogger("proposal-service");

interface ProposalViewer extends Pick<AuthPayload, "_id" | "email" | "role"> {}

function normalizeEmail(value: unknown): string {
	return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getClientEmailPattern(email: ProposalViewer["email"]): RegExp {
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
	const sequence = await container.counterRepository.inc(`PROP-${year}`);
	return `PROP-${year}-${String(sequence).padStart(4, "0")}`;
}

export const ProposalService = {
	/**
	 * Create a new proposal
	 * Flow: clientName + items -> Proposal (draft)
	 */
	async create(data: CreateProposalInput, userId: string): Promise<ProposalDocument> {
		const items = data.items.map((item) => ({
			...item,
			total: item.quantity * item.unitCost,
		}));
		const subtotal = items.reduce((sum, item) => sum + item.total, 0);
		const taxRate = 0.19;
		const tax = subtotal * taxRate;
		const total = subtotal + tax;
		const code = await generateProposalCode();
		const clientEmail = data.clientEmail?.trim().toLowerCase() || undefined;

		const proposal = await container.proposalRepository.create({
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
		});

		return container.proposalRepository.saveAndPopulate(proposal, ["createdBy", "approvedBy"]);
	},

	/**
	 * Get proposals by order ID
	 */
	async findByOrderId(orderId: string, viewer: ProposalViewer): Promise<ProposalDocument[]> {
		const where: Record<string, unknown> = {
			generatedOrders: new mongoose.Types.ObjectId(orderId),
		};

		if (!canViewerSeeAllProposals(viewer)) {
			where.clientEmail = getClientEmailPattern(viewer.email);
		}

		return container.proposalRepository.findPaginated(where, {
			skip: 0,
			limit: 1000,
			sort: { createdAt: -1 },
			populate: ["createdBy", "approvedBy"],
		});
	},

	/**
	 * Get all proposals with pagination
	 */
	async findAll(
		filters: { status?: ProposalStatus },
		viewer: ProposalViewer,
		page: number = 1,
		limit: number = 50,
	): Promise<{ data: ProposalDocument[]; total: number }> {
		const where: Record<string, unknown> = {};
		if (filters.status) {
			where.status = filters.status;
		}
		if (!canViewerSeeAllProposals(viewer)) {
			where.clientEmail = getClientEmailPattern(viewer.email);
		}

		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			container.proposalRepository.findPaginated(where, {
				skip,
				limit,
				sort: { createdAt: -1 },
				populate: ["createdBy", "approvedBy"],
			}),
			container.proposalRepository.countDocuments(where),
		]);

		return { data, total };
	},

	/**
	 * Get proposal by ID
	 */
	async findById(id: string, viewer: ProposalViewer): Promise<ProposalDocument> {
		const proposal = await container.proposalRepository.findByIdPopulated(id);

		if (!proposal) {
			throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
		}

		assertProposalAccess(proposal, viewer);
		return proposal;
	},

	/**
	 * Update proposal status
	 */
	async updateStatus(
		id: string,
		status: ProposalStatus,
		userId: string,
		poNumber?: string,
	): Promise<ProposalDocument> {
		const proposal = await container.proposalRepository.findById(id);
		if (!proposal) {
			throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
		}

		if (!isValidStatusTransition(proposal.status as ProposalStatus, status)) {
			throw new AppError(
				`Transicion de estado invalida: ${proposal.status} -> ${status}`,
				400,
				"INVALID_PROPOSAL_TRANSITION",
			);
		}

		proposal.status = status;
		if (status === "approved") {
			proposal.approvedBy = userId;
			proposal.approvedAt = new Date();
			const normalizedPoNumber = poNumber?.trim();
			proposal.poNumber =
				normalizedPoNumber && normalizedPoNumber.length > 0
					? normalizedPoNumber
					: proposal.poNumber;
		} else {
			proposal.approvedBy = undefined;
			proposal.approvedAt = undefined;
			proposal.poNumber = undefined;
		}

		const savedProposal = await container.proposalRepository.saveAndPopulate(proposal, [
			"createdBy",
			"approvedBy",
		]);

		// Email Trigger
		if (status === "sent" && proposal.clientEmail) {
			await sendEmail({
				to: proposal.clientEmail,
				subject: `Propuesta Comercial CERMONT - ${proposal.code}`,
				html: `
					<h1>Propuesta Comercial</h1>
					<p>Estimado ${proposal.clientName},</p>
					<p>Adjuntamos la propuesta comercial <strong>${proposal.code}</strong> para el trabajo: <em>${proposal.title}</em>.</p>
					<p>Valor total: <strong>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(proposal.total)}</strong></p>
					<p>Quedamos atentos a su aprobación.</p>
				`,
			});
		}

		return savedProposal;
	},

	/**
	 * Approve a proposal
	 */
	async approve(id: string, userId: string, poNumber?: string) {
		return ProposalService.updateStatus(id, "approved", userId, poNumber);
	},

	/**
	 * Reject a proposal
	 */
	async reject(id: string, userId: string) {
		return ProposalService.updateStatus(id, "rejected", userId);
	},

	/**
	 * Generate a PDF for the proposal.
	 */
	async generatePdf(
		id: string,
		viewer: ProposalViewer,
	): Promise<{ buffer: Buffer; proposal: ProposalDocument }> {
		const proposal = await ProposalService.findById(id, viewer);
		const proposalObjectId = new mongoose.Types.ObjectId(proposal._id.toString());
		const linkedOrder =
			(await container.orderRepository.findOne({
				$or: [{ proposalId: proposalObjectId }, { "costBaseline.proposalId": proposalObjectId }],
			})) ?? undefined;
		const settings = await getReportTemplateSettings();
		const buffer = await generateProposalPdf({ proposal, linkedOrder, settings });

		return { buffer, proposal };
	},

	/**
	 * Convert approved proposal to work order (OT)
	 */
	async convertToOrder(proposalId: string, orderData: ConvertProposalToOrderInput, userId: string) {
		const proposal = await container.proposalRepository.findById(proposalId);
		if (!proposal) {
			throw new AppError("Propuesta no encontrada", 404, "PROPOSAL_NOT_FOUND");
		}

		const { canConvert, reason } = canConvertToOrder(
			proposal.status as ProposalStatus,
			(proposal.items?.length ?? 0) > 0,
			!!proposal.poNumber,
		);

		if (!canConvert) {
			throw new AppError(
				reason || "La propuesta no cumple los requisitos para ser convertida",
				400,
				"PROPOSAL_CONVERSION_FORBIDDEN",
			);
		}

		const materials = proposal.items.map((item) => ({
			name: item.description,
			quantity: item.quantity,
			unit: item.unit,
			unitCost: item.unitCost,
			delivered: false,
		}));

		const costBaseline = {
			proposalId: proposal._id.toString(),
			proposalCode: proposal.code,
			subtotal: proposal.subtotal,
			taxRate: proposal.taxRate,
			total: proposal.total,
			items: proposal.items.map((item) => ({
				description: item.description,
				unit: item.unit,
				quantity: item.quantity,
				unitCost: item.unitCost,
				total: item.total,
			})),
			poNumber: proposal.poNumber,
			frozenAt: new Date().toISOString(),
		};

		const orderInput: ProposalOrderInput = {
			type: orderData.type,
			priority: orderData.priority,
			description: orderData.description || proposal.title,
			assetId: orderData.assetId,
			assetName: orderData.assetName,
			location: orderData.location,
			materials,
			proposalId: proposalId,
			poNumber: proposal.poNumber,
			costBaseline,
		};
		const order = await OrderService.createOrder(orderInput, userId);

		await container.costControlRepository.create({
			order_id: new mongoose.Types.ObjectId(order._id.toString()),
			currency: "COP",
			budget_estimated: proposal.subtotal,
			budget_approved: proposal.total,
			actual_items: proposal.items.map((item) => ({
				category: "other",
				description: item.description,
				unit: item.unit || "un",
				quantity: item.quantity,
				unit_price: item.unitCost,
				total: item.unitCost * item.quantity,
				isBudgeted: true,
			})),
			actual_total: 0,
			variance: 0 - proposal.total,
			variance_pct: proposal.total > 0 ? -1 : 0,
			notes: `Baseline seeded from proposal ${proposal.code}${proposal.poNumber ? ` / PO ${proposal.poNumber}` : ""}`,
			created_by: new mongoose.Types.ObjectId(userId),
		});

		proposal.generatedOrders = proposal.generatedOrders || [];
		proposal.generatedOrders.push(order._id.toString());
		await container.proposalRepository.save(proposal);

		log.info("Proposal converted to order", {
			proposalId,
			orderId: String(order._id),
			orderCode: order.code,
		});

		return order;
	},
};

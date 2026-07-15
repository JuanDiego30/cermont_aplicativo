/**
 * Proposal Controller — Thin HTTP layer for proposal management
 *
 * DOC-11 Regla 2 compliance:
 * - NO try/catch blocks (Express 5 propagates async errors natively)
 * - Delegates all business logic to ProposalService
 * - Returns standardized HTTP responses
 */

import type { Proposal as ProposalResponse } from "@cermont/shared-types";
import {
	ApproveProposalSchema,
	ConvertProposalToOrderSchema,
	CreateProposalSchema,
	ListProposalsQuerySchema,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	UpdateProposalStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { offsetToPage, toIsoString } from "../../common/utils/mapping";
import { requireUser } from "../../common/utils/request";
import { generateProposalCostPdf } from "../../services/pdf-generator.service";
import {
	approveProposal as approveProposalService,
	approveWithSupport as approveWithSupportService,
	convertProposalToOrder as convertProposalToOrderService,
	createProposal as createProposalService,
	findAllProposals,
	findProposalById,
	findProposalsByOrderId,
	getProposalCostBreakdown as getProposalCostBreakdownService,
	rejectProposal as rejectProposalService,
	updateProposalStatus as updateProposalStatusService,
} from "./proposal.service";

interface ProposalRecord {
	_id: string | { toString(): string };
	code: string;
	title: string;
	clientName: string;
	clientEmail?: string;
	status: ProposalResponse["status"];
	validUntil: Date | string;
	items: ProposalResponse["items"];
	subtotal: number;
	taxRate: number;
	total: number;
	notes?: string;
	createdBy: string | { toString(): string };
	approvedBy?: string | { toString(): string };
	approvedAt?: Date | string;
	generatedOrders?: Array<string | { toString(): string }>;
	createdAt: Date | string;
	updatedAt: Date | string;
}

function serializeProposal(proposal: ProposalRecord): ProposalResponse {
	return {
		_id: String(proposal._id),
		code: proposal.code,
		title: proposal.title,
		clientName: proposal.clientName,
		...(proposal.clientEmail ? { clientEmail: proposal.clientEmail } : {}),
		status: proposal.status,
		validUntil: toIsoString(proposal.validUntil) || new Date().toISOString(),
		items: proposal.items,
		subtotal: proposal.subtotal,
		taxRate: proposal.taxRate,
		total: proposal.total,
		...(proposal.notes ? { notes: proposal.notes } : {}),
		createdBy: String(proposal.createdBy),
		...(proposal.approvedBy ? { approvedBy: String(proposal.approvedBy) } : {}),
		...(proposal.approvedAt ? { approvedAt: toIsoString(proposal.approvedAt) } : {}),
		generatedOrders: (proposal.generatedOrders ?? [])
			.map((orderId) => String(orderId))
			.filter(Boolean),
		createdAt: toIsoString(proposal.createdAt) || new Date().toISOString(),
		updatedAt: toIsoString(proposal.updatedAt) || new Date().toISOString(),
	};
}

export const getProposalCostBreakdown = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const breakdown = await getProposalCostBreakdownService(id, user);
	return sendSuccess(res, breakdown);
};

export const createProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const proposal = await createProposalService(CreateProposalSchema.parse(req.body), user._id);
	return sendCreated(res, serializeProposal(proposal as ProposalRecord));
};

export const getProposalsByOrderId = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { order_id } = ProposalOrderIdParamsSchema.parse(req.params);
	const proposals = await findProposalsByOrderId(order_id, user);
	return sendSuccess(
		res,
		proposals.map((proposal) => serializeProposal(proposal as ProposalRecord)),
	);
};

export const getAllProposals = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { status, limit, offset, page } = ListProposalsQuerySchema.parse(req.query);
	const limitValue = limit ?? 50;
	const pageValue = page ?? (offset != null ? offsetToPage(offset, limitValue) : 1);

	const result = await findAllProposals({ status }, user, pageValue, limitValue);

	return sendPaginated(
		res,
		result.data.map((proposal) => serializeProposal(proposal as ProposalRecord)),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getProposalById = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const proposal = await findProposalById(id, user);
	return sendSuccess(res, serializeProposal(proposal as ProposalRecord));
};

export const updateProposalStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { status, poNumber } = UpdateProposalStatusSchema.parse(req.body);
	const proposal = await updateProposalStatusService(id, status, user._id, poNumber);
	return sendSuccess(res, serializeProposal(proposal as ProposalRecord));
};

export const approveProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { poNumber } = ApproveProposalSchema.parse(req.body);
	const proposal = await approveProposalService(id, user._id, poNumber);
	return sendSuccess(res, serializeProposal(proposal as ProposalRecord));
};

export const approveWithSupport = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { supportType, supportDescription } = req.body as {
		supportType: "verbal" | "email" | "document";
		supportDescription: string;
	};
	if (!supportType || !["verbal", "email", "document"].includes(supportType)) {
		res.status(400).json({
			success: false,
			error: { code: "VALIDATION_ERROR", message: "supportType debe ser verbal, email o document" },
		});
		return;
	}
	if (!supportDescription || supportDescription.trim().length < 10) {
		res.status(400).json({
			success: false,
			error: { code: "VALIDATION_ERROR", message: "supportDescription debe tener al menos 10 caracteres" },
		});
		return;
	}
	const proposal = await approveWithSupportService(id, user._id, {
		supportType,
		supportDescription: supportDescription.trim(),
	});
	res.status(200).json({
		success: true,
		data: {
			proposal: serializeProposal(proposal as ProposalRecord),
			approvalMethod: "bypass_with_support",
			metadata: { supportType, supportDescription: supportDescription.trim() },
		},
	});
};

export const rejectProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const proposal = await rejectProposalService(id, user._id);
	return sendSuccess(res, serializeProposal(proposal as ProposalRecord));
};

export const getProposalPdf = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	await findProposalById(id, user); // verify access
	const pdfBuffer = await generateProposalCostPdf(id);
	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `attachment; filename="propuesta-${id}-costos.pdf"`);
	res.status(200).send(pdfBuffer);
};

export const convertProposalToOrder = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const orderData = ConvertProposalToOrderSchema.parse(req.body);
	const order = await convertProposalToOrderService(id, orderData, user._id);
	const proposal = await findProposalById(id, user);

	res.status(201).json({
		success: true,
		data: {
			order,
			proposal: serializeProposal(proposal as ProposalRecord),
		},
	});
};

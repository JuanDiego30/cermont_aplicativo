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
import {
	approveProposal as approveProposalService,
	convertProposalToOrder as convertProposalToOrderService,
	createProposal as createProposalService,
	findAllProposals,
	findProposalById,
	findProposalsByOrderId,
	rejectProposal as rejectProposalService,
	updateProposalStatus as updateProposalStatusService,
} from "./proposal.service";

interface ProposalRecord {
	_id: unknown;
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
	createdBy: unknown;
	approvedBy?: unknown;
	approvedAt?: Date | string;
	generatedOrders?: unknown[];
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
	const pageValue = page ?? (offset !== undefined ? offsetToPage(offset, limitValue) : 1);

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

export const rejectProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const proposal = await rejectProposalService(id, user._id);
	return sendSuccess(res, serializeProposal(proposal as ProposalRecord));
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

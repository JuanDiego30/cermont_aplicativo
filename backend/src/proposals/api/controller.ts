import {
	ApproveProposalSchema,
	ConvertProposalToOrderSchema,
	CreateProposalSchema,
	ListProposalsQuerySchema,
	type Proposal,
	type ProposalDocument,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	UpdateProposalStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import { offsetToPage, toIsoString, toStringId } from "../../_shared/common/utils";
import { requireUser } from "../../_shared/common/utils/request";
import { ProposalService } from "../application/service";

function serializeProposal(proposal: ProposalDocument): Proposal {
	return {
		_id: toStringId(proposal._id),
		code: proposal.code,
		title: proposal.title,
		clientName: proposal.clientName,
		...(proposal.clientEmail ? { clientEmail: proposal.clientEmail } : {}),
		status: proposal.status,
		validUntil: toIsoString(proposal.validUntil) ?? new Date().toISOString(),
		items: proposal.items,
		subtotal: proposal.subtotal,
		taxRate: proposal.taxRate,
		total: proposal.total,
		...(proposal.notes ? { notes: proposal.notes } : {}),
		...(proposal.poNumber ? { poNumber: proposal.poNumber } : {}),
		createdBy: toStringId(proposal.createdBy),
		...(proposal.approvedBy ? { approvedBy: toStringId(proposal.approvedBy) } : {}),
		...(toIsoString(proposal.approvedAt) ? { approvedAt: toIsoString(proposal.approvedAt) } : {}),
		generatedOrders: (proposal.generatedOrders ?? [])
			.map((orderId) => toStringId(orderId))
			.filter(Boolean),
		createdAt: toIsoString(proposal.createdAt) ?? new Date().toISOString(),
		updatedAt: toIsoString(proposal.updatedAt) ?? new Date().toISOString(),
	};
}

export const createProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const proposal = await ProposalService.create(CreateProposalSchema.parse(req.body), user._id);
	return sendCreated(res, serializeProposal(proposal));
};

export const getProposalsByOrderId = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { order_id } = ProposalOrderIdParamsSchema.parse(req.params);
	const proposals = await ProposalService.findByOrderId(order_id, user);
	return sendSuccess(res, proposals.map(serializeProposal));
};

export const getAllProposals = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { status, limit, offset, page } = ListProposalsQuerySchema.parse(req.query);
	const limitValue = limit ?? 50;
	const pageValue = page ?? (offset !== undefined ? offsetToPage(offset, limitValue) : 1);

	const result = await ProposalService.findAll({ status }, user, pageValue, limitValue);

	return sendPaginated(
		res,
		result.data.map(serializeProposal),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getProposalById = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const proposal = await ProposalService.findById(id, user);
	return sendSuccess(res, serializeProposal(proposal));
};

export const updateProposalStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { status, poNumber } = UpdateProposalStatusSchema.parse(req.body);
	const proposal = await ProposalService.updateStatus(id, status, user._id, poNumber);
	return sendSuccess(res, serializeProposal(proposal));
};

export const approveProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { poNumber } = ApproveProposalSchema.parse(req.body);
	const proposal = await ProposalService.approve(id, user._id, poNumber);
	return sendSuccess(res, serializeProposal(proposal));
};

export const rejectProposal = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const proposal = await ProposalService.reject(id, user._id);
	return sendSuccess(res, serializeProposal(proposal));
};

export const generateProposalPdf = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const { buffer, proposal } = await ProposalService.generatePdf(id, user);

	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `attachment; filename="proposal-${proposal.code}.pdf"`);
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
};

export const convertProposalToOrder = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { id } = ProposalIdSchema.parse(req.params);
	const orderData = ConvertProposalToOrderSchema.parse(req.body);
	const order = await ProposalService.convertToOrder(id, orderData, user._id);
	const proposal = await ProposalService.findById(id, user);

	res.status(201).json({
		success: true,
		data: {
			order,
			proposal: serializeProposal(proposal),
		},
	});
};

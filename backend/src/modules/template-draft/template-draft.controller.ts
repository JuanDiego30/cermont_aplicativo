/**
 * TemplateDraft Controller — PROMPT 14
 * Thin HTTP layer for template drafts.
 */

import {
	ApproveTemplateDraftSchema,
	CreateTemplateDraftSchema,
	RejectTemplateDraftSchema,
	TemplateDraftIdSchema,
	TemplateDraftListQuerySchema,
	UpdateTemplateDraftSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	approveTemplateDraft,
	convertTemplateDraftToTemplate,
	createTemplateDraft,
	deleteTemplateDraft,
	getAllTemplateDrafts,
	getTemplateDraftById,
	rejectTemplateDraft,
	submitDraftForReview,
	type TemplateDraftFilters,
	updateTemplateDraft,
} from "./template-draft.service";

export const create = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const body = CreateTemplateDraftSchema.parse(req.body);
	const result = await createTemplateDraft(body, String(user._id));
	return sendCreated(res, result);
};

export const getById = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	const result = await getTemplateDraftById(id);
	return sendSuccess(res, result);
};

export const getAll = async (req: Request, res: Response) => {
	const query = TemplateDraftListQuerySchema.parse(req.query);
	const filters: TemplateDraftFilters = {};
	if (query.status) {
		filters.status = query.status;
	}
	if (query.serviceType) {
		filters.serviceTypes = query.serviceType;
	}
	if (query.targetStage) {
		filters.targetStages = query.targetStage;
	}

	const result = await getAllTemplateDrafts(filters, {
		page: query.page,
		limit: query.limit,
	});

	return sendPaginated(
		res,
		result.data,
		result.pagination.total,
		result.pagination.page,
		result.pagination.limit,
	);
};

export const update = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	const body = UpdateTemplateDraftSchema.parse(req.body);
	const result = await updateTemplateDraft(id, body, String(user._id));
	return sendSuccess(res, result);
};

export const approve = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	const body = ApproveTemplateDraftSchema.parse(req.body ?? {});
	const result = await approveTemplateDraft(id, String(user._id), body.reviewerNotes);
	return sendSuccess(res, result);
};

export const reject = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	const body = RejectTemplateDraftSchema.parse(req.body);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	if (!body.rejectionReason) {
		throw new BadRequestError("Rejection reason is required");
	}
	const result = await rejectTemplateDraft(id, String(user._id), body.rejectionReason);
	return sendSuccess(res, result);
};

export const convert = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	const result = await convertTemplateDraftToTemplate(id, String(user._id));
	return sendSuccess(res, result);
};

export const remove = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	await deleteTemplateDraft(id, String(user._id));
	return sendSuccess(res, { message: "Draft deleted successfully" });
};

export const submitForReview = async (req: Request, res: Response) => {
	const { id } = TemplateDraftIdSchema.parse(req.params);
	const user = requireUser(req);
	if (!id) {
		throw new BadRequestError("Draft ID is required");
	}
	const result = await submitDraftForReview(id, String(user._id));
	return sendSuccess(res, result);
};

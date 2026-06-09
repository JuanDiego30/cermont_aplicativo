/**
 * ServiceCase Controller — Thin HTTP layer
 *
 * Layer: authenticate → authorize → validate → controller → res.json()
 */

import {
	ListServiceCasesQuerySchema,
	ServiceCaseIdParamsSchema,
	StepContextQuerySchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestError } from "../../common/errors";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { Document, ServiceCase } from "../../models";
import { getConsolidatedReport } from "../../modules/order/order-closure.service";
import {
	applyClosingEvidenceMetadata,
	type ClosingEvidenceRoutingOutcome,
} from "../../services/closing-evidence-routing.service";
import { buildServiceCaseStepContext } from "../../services/service-case-step-context.service";
import * as ServiceCaseService from "./service-case.service";

export async function listServiceCases(req: Request, res: Response): Promise<void> {
	const query = ListServiceCasesQuerySchema.parse(req.query);
	const result = await ServiceCaseService.getServiceCases(query);

	res.status(200).json({
		success: true,
		data: result.data,
		pagination: {
			page: result.page,
			limit: result.limit,
			total: result.total,
			totalPages: Math.ceil(result.total / result.limit),
		},
	});
}

export async function getServiceCase(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const serviceCase = await ServiceCaseService.getServiceCaseById(id);

	if (!serviceCase) {
		res.status(404).json({
			success: false,
			error: { code: "SERVICE_CASE_NOT_FOUND", message: "Service case not found" },
		});
		return;
	}

	sendSuccess(res, serviceCase);
}

export async function getServiceCaseStepContext(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const { stepCode } = StepContextQuerySchema.parse(req.query);

	const context = await buildServiceCaseStepContext(id, stepCode);
	sendSuccess(res, context);
}

export async function getServiceCaseWorkflow(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const workflow = await ServiceCaseService.buildServiceCaseWorkflowView(id);

	if (!workflow) {
		res.status(404).json({
			success: false,
			error: { code: "SERVICE_CASE_NOT_FOUND", message: "Service case not found" },
		});
		return;
	}

	sendSuccess(res, workflow);
}

export async function getServiceCaseSummary(_req: Request, res: Response): Promise<void> {
	const summary = await ServiceCaseService.getServiceCaseSummary();
	sendSuccess(res, summary);
}

export async function advanceServiceCase(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const user = requireUser(req);

	const result = await ServiceCaseService.advanceServiceCaseState(id, String(user._id));

	if (!result.success) {
		res.status(409).json({
			code: "STEP_TRANSITION_BLOCKED",
			error: result.error,
			details: result.blockers,
			message: result.message,
		});
		return;
	}

	sendSuccess(res, result.serviceCase);
}

export async function bulkClosingEvidenceForCase(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const { documentIds } = req.body;

	if (!Array.isArray(documentIds)) {
		throw new BadRequestError("documentIds must be an array");
	}

	const results: Array<{ documentId: string } & ClosingEvidenceRoutingOutcome> = [];

	for (const docId of documentIds) {
		if (!Types.ObjectId.isValid(docId)) {
			continue;
		}

		const doc = await Document.findById(docId);
		if (!doc) {
			continue;
		}

		const routing = applyClosingEvidenceMetadata(doc, { serviceCaseId: id });
		await doc.save();

		results.push({
			documentId: docId,
			...routing,
		});
	}

	sendSuccess(res, {
		processed: results.length,
		details: results,
	});
}

export async function getCaseClosingStatus(req: Request, res: Response): Promise<void> {
	const { id } = ServiceCaseIdParamsSchema.parse(req.params);
	const serviceCase = await ServiceCase.findById(id);

	if (!serviceCase) {
		res.status(404).json({
			success: false,
			error: { code: "SERVICE_CASE_NOT_FOUND", message: "Service case not found" },
		});
		return;
	}

	const orderId = serviceCase.artifacts.workOrder?.id?.toString() || serviceCase._id.toString();
	const report = await getConsolidatedReport(orderId, serviceCase._id.toString());
	sendSuccess(res, report);
}

/**
 * POST /api/service-cases/:id/close
 * Close a service case
 */
export async function closeServiceCase(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const user = requireUser(req);

	const result = await ServiceCaseService.closeServiceCase(id, String(user._id));
	sendSuccess(res, result);
}

/**
 * POST /api/service-cases/:id/archive
 * Archive a service case
 */
export async function archiveServiceCase(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const user = requireUser(req);

	const result = await ServiceCaseService.archiveServiceCase(id, String(user._id));
	sendSuccess(res, result);
}

/**
 * Document Template Controller — persistent template inventory.
 */

import {
	type CreateDocumentTemplate,
	CreateDocumentTemplateSchema,
	DocumentTemplateIdSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { DocumentTemplate, type IDocumentTemplateDocument } from "../../models/DocumentTemplate";

interface DocumentTemplateResponse {
	_id: string;
	name: string;
	templateName: string;
	sourceType: IDocumentTemplateDocument["sourceType"];
	status: IDocumentTemplateDocument["status"];
	requiresSignature: boolean;
	requiresPhotos: boolean;
	requiresGps: boolean;
	requiresOffline: boolean;
	createdAt: string;
	updatedAt: string;
	description?: string;
	serviceType?: string;
	businessUnit?: string;
	frequencyOfUse?: string;
	billingCriticality?: string;
	layoutStability?: string;
	createdBy?: string;
	updatedBy?: string;
}

type DocumentTemplateCreatePayload = {
	templateName: string;
	sourceType: CreateDocumentTemplate["sourceType"];
	status: IDocumentTemplateDocument["status"];
	requiresSignature: boolean;
	requiresPhotos: boolean;
	requiresGps: boolean;
	requiresOffline: boolean;
	createdBy: string;
	updatedBy: string;
	description?: string;
	serviceType?: string;
	businessUnit?: string;
	frequencyOfUse?: string;
	billingCriticality?: string;
	layoutStability?: string;
};

function sendValidationError(res: Response, code: string, message: string, details: object): void {
	res.status(400).json({
		success: false,
		error: { code, message, details },
	});
}

function toTemplateResponse(template: IDocumentTemplateDocument): DocumentTemplateResponse {
	const response: DocumentTemplateResponse = {
		_id: template._id.toString(),
		name: template.templateName,
		templateName: template.templateName,
		sourceType: template.sourceType,
		status: template.status,
		requiresSignature: template.requiresSignature,
		requiresPhotos: template.requiresPhotos,
		requiresGps: template.requiresGps,
		requiresOffline: template.requiresOffline,
		createdAt: template.createdAt.toISOString(),
		updatedAt: template.updatedAt.toISOString(),
	};

	if (template.description) {
		response.description = template.description;
	}
	if (template.serviceType) {
		response.serviceType = template.serviceType;
	}
	if (template.businessUnit) {
		response.businessUnit = template.businessUnit;
	}
	if (template.frequencyOfUse) {
		response.frequencyOfUse = template.frequencyOfUse;
	}
	if (template.billingCriticality) {
		response.billingCriticality = template.billingCriticality;
	}
	if (template.layoutStability) {
		response.layoutStability = template.layoutStability;
	}
	if (template.createdBy) {
		response.createdBy = template.createdBy.toString();
	}
	if (template.updatedBy) {
		response.updatedBy = template.updatedBy.toString();
	}

	return response;
}

function buildCreatePayload(
	body: CreateDocumentTemplate,
	userId: string,
): DocumentTemplateCreatePayload {
	const payload: DocumentTemplateCreatePayload = {
		templateName: body.templateName,
		sourceType: body.sourceType,
		status: body.status ?? "draft",
		requiresSignature: body.requiresSignature ?? false,
		requiresPhotos: body.requiresPhotos ?? false,
		requiresGps: body.requiresGps ?? false,
		requiresOffline: body.requiresOffline ?? false,
		createdBy: userId,
		updatedBy: userId,
	};

	if (body.description) {
		payload.description = body.description;
	}
	if (body.serviceType) {
		payload.serviceType = body.serviceType;
	}
	if (body.businessUnit) {
		payload.businessUnit = body.businessUnit;
	}
	if (body.frequencyOfUse) {
		payload.frequencyOfUse = body.frequencyOfUse;
	}
	if (body.billingCriticality) {
		payload.billingCriticality = body.billingCriticality;
	}
	if (body.layoutStability) {
		payload.layoutStability = body.layoutStability;
	}

	return payload;
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
	const parsed = CreateDocumentTemplateSchema.safeParse(req.body);
	if (!parsed.success) {
		sendValidationError(
			res,
			"VALIDATION_ERROR",
			"Invalid document template payload",
			parsed.error.flatten(),
		);
		return;
	}

	const user = requireUser(req);
	const template = await DocumentTemplate.create(buildCreatePayload(parsed.data, user._id));

	res.status(201).json({ success: true, data: toTemplateResponse(template) });
}

export async function listTemplates(_req: Request, res: Response): Promise<void> {
	const templates = await DocumentTemplate.find().sort({ updatedAt: -1 }).limit(100).exec();
	sendSuccess(res, templates.map(toTemplateResponse));
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
	const parsed = DocumentTemplateIdSchema.safeParse(req.params);
	if (!parsed.success) {
		sendValidationError(
			res,
			"INVALID_TEMPLATE_ID",
			"Document template id must be a Mongo ObjectId",
			parsed.error.flatten(),
		);
		return;
	}

	const template = await DocumentTemplate.findById(parsed.data.id).exec();
	if (!template) {
		res.status(404).json({
			success: false,
			error: { code: "TEMPLATE_NOT_FOUND", message: "Document template not found" },
		});
		return;
	}

	sendSuccess(res, toTemplateResponse(template));
}

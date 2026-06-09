import { Types } from "mongoose";
import { FormSubmission, type FormSubmissionDocument } from "../../models/FormSubmission";

export interface CreateFormSubmissionInput {
	templateId: string;
	stepCode: string;
	serviceCaseId?: string;
	executionSessionId?: string;
	values: Record<string, unknown>;
	photoAttachments?: Array<{
		fieldKey: string;
		fileId: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
	}>;
	submittedBy: string;
	status?: "draft" | "submitted";
}

export interface ListFormSubmissionsFilter {
	serviceCaseId?: string;
	templateId?: string;
	stepCode?: string;
	status?: string;
	page?: number;
	limit?: number;
}

export async function createFormSubmission(
	input: CreateFormSubmissionInput,
): Promise<FormSubmissionDocument> {
	const doc = await FormSubmission.create({
		templateId: input.templateId,
		stepCode: input.stepCode,
		serviceCaseId: input.serviceCaseId ? new Types.ObjectId(input.serviceCaseId) : undefined,
		executionSessionId: input.executionSessionId
			? new Types.ObjectId(input.executionSessionId)
			: undefined,
		values: input.values,
		photoAttachments: input.photoAttachments ?? [],
		submittedBy: new Types.ObjectId(input.submittedBy),
		submittedAt: new Date(),
		status: input.status ?? "submitted",
	});

	return doc;
}

export async function getFormSubmissionById(id: string): Promise<FormSubmissionDocument | null> {
	if (!Types.ObjectId.isValid(id)) {
		return null;
	}
	return FormSubmission.findById(id).lean<FormSubmissionDocument>();
}

export async function listFormSubmissions(filter: ListFormSubmissionsFilter) {
	const query: Record<string, unknown> = {};

	if (filter.serviceCaseId && Types.ObjectId.isValid(filter.serviceCaseId)) {
		query.serviceCaseId = new Types.ObjectId(filter.serviceCaseId);
	}
	if (filter.templateId) {
		query.templateId = filter.templateId;
	}
	if (filter.stepCode) {
		query.stepCode = filter.stepCode;
	}
	if (filter.status) {
		query.status = filter.status;
	}

	const page = Math.max(1, filter.page ?? 1);
	const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		FormSubmission.find(query)
			.sort({ submittedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean<FormSubmissionDocument[]>(),
		FormSubmission.countDocuments(query),
	]);

	return { items, total, page, limit };
}

export async function archiveFormSubmission(id: string): Promise<FormSubmissionDocument | null> {
	if (!Types.ObjectId.isValid(id)) {
		return null;
	}
	return FormSubmission.findByIdAndUpdate(
		id,
		{ status: "archived" },
		{ new: true },
	).lean<FormSubmissionDocument>();
}

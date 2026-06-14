/**
 * TemplateDraft Service — Business Logic Layer
 *
 * CRUD operations + state transitions for template drafts.
 * Must be reviewed and approved before conversion to DocumentTemplateVersion.
 */

import {
	CERMONT_OPERATIONAL_STEPS,
	type TemplateFieldType,
	type TemplatePermission,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError";
import { Document, DocumentTemplate, DocumentTemplateVersion } from "../../models";
import type { IDocumentTemplateVersionDocument } from "../../models/DocumentTemplateVersion";
import { type ITemplateDraftDocument, TemplateDraft } from "../../models/TemplateDraft";
import { createAuditLog } from "../audit/audit.service";

export interface TemplateDraftFilters {
	name?: RegExp;
	serviceTypes?: string[] | string;
	status?: ITemplateDraftDocument["status"];
	targetStages?: string[] | string;
	targetStepCode?: string;
}

type DraftSection = ITemplateDraftDocument["sections"][number];
type DraftField = DraftSection["fields"][number];
type DraftTable = ITemplateDraftDocument["tables"][number];

export interface CreateTemplateDraftCommand {
	documentSourceFileId: string;
	extractionJobId: string;
	name: string;
	description?: string;
	serviceTypes: string[];
	targetStages: string[];
	targetStepCode?: string;
	sections: ITemplateDraftDocument["sections"];
	tables: ITemplateDraftDocument["tables"];
	rules: ITemplateDraftDocument["rules"];
	exportHints: ITemplateDraftDocument["exportHints"];
	confidence?: number;
}

export interface UpdateTemplateDraftCommand {
	name?: string;
	description?: string;
	serviceTypes?: string[];
	targetStages?: string[];
	targetStepCode?: string;
	sections?: ITemplateDraftDocument["sections"];
	tables?: ITemplateDraftDocument["tables"];
	rules?: ITemplateDraftDocument["rules"];
	exportHints?: ITemplateDraftDocument["exportHints"];
	confidence?: number;
}

function normalizeFieldKind(fieldKind: DraftField["fieldKind"]): TemplateFieldType {
	switch (fieldKind) {
		case "boolean":
		case "checkbox":
		case "checklist":
		case "currency":
		case "date":
		case "datetime":
		case "file":
		case "gps":
		case "multi_select":
		case "number":
		case "photo":
		case "radio":
		case "repeatable_group":
		case "section":
		case "select":
		case "signature":
		case "text":
		case "textarea":
			return fieldKind;
		default:
			return "text";
	}
}

function normalizeTargetStepCode(
	targetStepCode: string | undefined,
): IDocumentTemplateVersionDocument["targetStepCode"] {
	if (!targetStepCode) {
		return undefined;
	}

	return CERMONT_OPERATIONAL_STEPS.find((step) => step.code === targetStepCode)?.code;
}

function normalizeDraftSections(
	sections: ITemplateDraftDocument["sections"] | undefined,
): ITemplateDraftDocument["sections"] | undefined {
	if (!sections) {
		return sections;
	}

	return sections.map((section, sectionIndex) => ({
		...section,
		order: section.order ?? sectionIndex,
		fields: (section.fields || []).map((field, fieldIndex) => ({
			...field,
			order: field.order ?? fieldIndex,
			options: field.options || [],
		})),
	}));
}

function resolveDraftFieldCount(draft: ITemplateDraftDocument): number {
	return (draft.sections || []).reduce(
		(count, section) => count + (section.fields?.length || 0),
		0,
	);
}

function assertDraftStructureReady(draft: ITemplateDraftDocument): void {
	if (!draft.sections?.length) {
		throw new BadRequestError(
			"DRAFT_WITHOUT_SECTIONS",
			"El borrador debe tener al menos una sección antes de revisión o publicación.",
		);
	}

	if (resolveDraftFieldCount(draft) === 0) {
		throw new BadRequestError(
			"DRAFT_WITHOUT_FIELDS",
			"El borrador debe tener al menos un campo operativo antes de revisión o publicación.",
		);
	}

	if (!draft.targetStepCode) {
		throw new BadRequestError(
			"DRAFT_WITHOUT_TARGET_STEP",
			"El borrador debe estar asociado a un paso operativo antes de publicarse.",
		);
	}
}

function inferSourceTypeFromFileUrl(
	fileUrl: string | undefined,
): "docx" | "image" | "manual" | "pdf" | "xls" | "xlsx" {
	if (!fileUrl) {
		return "manual";
	}

	const lower = fileUrl.toLowerCase();
	if (lower.endsWith(".xlsx")) {
		return "xlsx";
	}
	if (lower.endsWith(".xls")) {
		return "xls";
	}
	if (lower.endsWith(".pdf")) {
		return "pdf";
	}
	if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
		return "docx";
	}
	if (/\.(png|jpg|jpeg|webp|gif|heic|heif|tif|tiff)$/.test(lower)) {
		return "image";
	}
	return "manual";
}

function resolveTemplateFlags(draft: ITemplateDraftDocument) {
	const fields = (draft.sections || []).flatMap((section) => section.fields || []);

	return {
		requiresSignature: fields.some((field) => field.fieldKind === "signature"),
		requiresPhotos: fields.some((field) => field.fieldKind === "photo"),
		requiresGps: fields.some((field) => field.fieldKind === "gps"),
		requiresOffline: draft.targetStepCode === "step_06_execution",
	};
}

function buildDefaultPermissions(targetStepCode: string | undefined): TemplatePermission[] {
	const step = CERMONT_OPERATIONAL_STEPS.find((current) => current.code === targetStepCode);
	const allowedRoles = step?.allowedRoles || ["gerente", "residente", "administrativo"];

	return allowedRoles.map((role) => ({
		role,
		canView: true,
		canCreate: role !== "cliente",
		canUpdate: role !== "cliente",
		canDelete: role === "gerente" || role === "administrativo",
		canApprove: role === "gerente" || role === "administrativo",
	}));
}

function mapDraftField(field: DraftField) {
	return {
		fieldId: field.fieldId,
		name: field.normalizedName || field.fieldId,
		type: normalizeFieldKind(field.fieldKind),
		label: field.label || field.fieldId,
		description: field.helpText,
		placeholder: field.placeholder,
		defaultValue: field.defaultValue,
		required: !!field.required,
		readOnly: !!field.readOnly,
		visible: field.visible !== false,
		options: field.options || [],
		allowOtherOption: !!field.allowOtherOption,
		otherOptionLabel: field.otherOptionLabel,
		visibleWhen: field.visibleWhen,
		requiredWhen: field.requiredWhen,
		order: field.order ?? 0,
	};
}

function mapDraftSection(section: DraftSection) {
	return {
		sectionId: section.sectionId,
		name: section.title,
		description: section.description,
		order: section.order,
		fields: (section.fields || []).map(mapDraftField),
		repeatable: !!section.repeatable,
		metadata: { sourceReference: section.sourceReference },
	};
}

function mapDraftTable(table: DraftTable) {
	return {
		tableId: table.tableId,
		name: table.title,
		description: table.description,
		columns: (table.columns || []).map((column) => ({
			columnId: column.columnId,
			name: column.name,
			type: normalizeFieldKind(column.fieldKind),
			required: !!column.required,
			width: column.width,
		})),
		allowAddRows: !!table.allowAddRows,
		allowDeleteRows: !!table.allowDeleteRows,
		maxRows: table.maxRows,
		metadata: { sourceReference: table.sourceReference },
	};
}

function mapDraftExportLayout(draft: ITemplateDraftDocument) {
	const preferred = draft.exportHints?.[0];
	if (!preferred) {
		return undefined;
	}

	return {
		format: preferred.format,
		orientation: preferred.orientation || "portrait",
		pageSize: preferred.pageSize || "A4",
		showHeader: preferred.showHeader !== false,
		showFooter: preferred.showFooter !== false,
		showLogo: preferred.showLogo !== false,
		showPageNumbers: preferred.showPageNumbers !== false,
	};
}

/**
 * List all template drafts with pagination and filtering
 */
export async function getAllTemplateDrafts(
	filters: TemplateDraftFilters = {},
	options: { page: number; limit: number } = { page: 1, limit: 20 },
) {
	const skip = (options.page - 1) * options.limit;
	const [data, total] = await Promise.all([
		TemplateDraft.find(filters).sort({ createdAt: -1 }).skip(skip).limit(options.limit).exec(),
		TemplateDraft.countDocuments(filters),
	]);

	return {
		data,
		pagination: {
			total,
			page: options.page,
			limit: options.limit,
		},
	};
}

/**
 * Get a single template draft by ID
 */
export async function getTemplateDraftById(
	id: string,
): Promise<ITemplateDraftDocument | undefined> {
	if (!Types.ObjectId.isValid(id)) {
		return undefined;
	}
	const draft = await TemplateDraft.findById(id).exec();
	return draft ?? undefined;
}

function buildDraftAuditSnapshot(draft: ITemplateDraftDocument) {
	return {
		name: draft.name,
		status: draft.status,
		serviceTypes: [...draft.serviceTypes],
		targetStages: [...draft.targetStages],
		...(draft.targetStepCode
			? { targetStepCode: draft.targetStepCode }
			: { targetStepStatus: "not_assigned" }),
		sectionCount: draft.sections.length,
		fieldCount: draft.sections.reduce((total, section) => total + section.fields.length, 0),
		tableCount:
			draft.tables.length +
			draft.sections.reduce((total, section) => total + section.tables.length, 0),
		ruleCount: draft.rules.length,
	};
}

/**
 * Create a new template draft manually or from ingestion
 */
export async function createTemplateDraft(
	dto: CreateTemplateDraftCommand,
	userId: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.create({
		...dto,
		sections: normalizeDraftSections(dto.sections),
		documentSourceFileId: new Types.ObjectId(dto.documentSourceFileId),
		extractionJobId: new Types.ObjectId(dto.extractionJobId),
		status: "draft",
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_CREATED",
		after: buildDraftAuditSnapshot(draft),
	});

	return draft;
}

/**
 * Update an existing template draft
 */
export async function updateTemplateDraft(
	id: string,
	dto: UpdateTemplateDraftCommand,
	userId: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.findById(id);
	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	if (draft.status === "converted_to_template") {
		throw new BadRequestError(
			"DRAFT_ALREADY_CONVERTED",
			"Cannot update a draft that has already been converted to a template",
		);
	}

	const before = buildDraftAuditSnapshot(draft);
	Object.assign(draft, {
		...dto,
		sections: normalizeDraftSections(dto.sections),
	});
	await draft.save();

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_UPDATED",
		before,
		after: buildDraftAuditSnapshot(draft),
	});

	return draft;
}

/**
 * Approve a template draft
 */
export async function approveTemplateDraft(
	id: string,
	userId: string,
	reviewerNotes?: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.findById(id);
	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	if (draft.status !== "review_required" && draft.status !== "draft") {
		throw new BadRequestError(
			"INVALID_DRAFT_STATUS",
			`Only drafts in 'review_required' or 'draft' status can be approved. Current status: ${draft.status}`,
		);
	}

	assertDraftStructureReady(draft);
	draft.status = "approved";
	draft.reviewerId = new Types.ObjectId(userId);
	draft.reviewedAt = new Date();
	draft.reviewerNotes = reviewerNotes;
	await draft.save();

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_APPROVED",
		after: { status: "approved" },
	});

	return draft;
}

/**
 * Reject a template draft
 */
export async function rejectTemplateDraft(
	id: string,
	userId: string,
	reason: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.findById(id);
	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	draft.status = "rejected";
	draft.rejectionReason = reason;
	draft.reviewerId = new Types.ObjectId(userId);
	draft.reviewedAt = new Date();
	await draft.save();

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_REJECTED",
		after: { status: "rejected", reason },
	});

	return draft;
}

/**
 * Convert an approved draft into a published DocumentTemplateVersion
 */
export async function convertTemplateDraftToTemplate(
	id: string,
	userId: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.findById(id);
	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	if (draft.status !== "approved") {
		throw new BadRequestError(
			"DRAFT_NOT_APPROVED",
			"Only approved drafts can be converted to templates",
		);
	}

	assertDraftStructureReady(draft);

	const sourceDocument = await Document.findById(draft.documentSourceFileId).lean();
	const sourceType = inferSourceTypeFromFileUrl(sourceDocument?.file_url);
	const flags = resolveTemplateFlags(draft);

	// Look up or create parent DocumentTemplate
	let template = await DocumentTemplate.findOne({ templateName: draft.name });
	if (!template) {
		template = await DocumentTemplate.create({
			templateName: draft.name,
			description: draft.description,
			serviceType: draft.serviceTypes?.[0] || "mantenimiento",
			sourceType,
			...flags,
			status: "ready_for_import",
			createdBy: new Types.ObjectId(userId),
		});
	}

	// Calculate the next version number
	const latestVersion = await DocumentTemplateVersion.findOne({ documentTemplateId: template._id })
		.sort({ versionNumber: -1 })
		.exec();
	const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

	// Map draft sections/fields/tables to versioned template structure
	const mappedSections = (draft.sections || []).map(mapDraftSection);

	// Create DocumentTemplateVersion
	const templateVersion = await DocumentTemplateVersion.create({
		documentTemplateId: template._id,
		versionNumber,
		status: "published",
		sections: mappedSections,
		tables: (draft.tables || []).map(mapDraftTable),
		rules: draft.rules || [],
		permissions: buildDefaultPermissions(draft.targetStepCode),
		exportLayout: mapDraftExportLayout(draft),
		targetStepCode: normalizeTargetStepCode(draft.targetStepCode),
		sourceFileId: draft.documentSourceFileId,
		confidenceScore: draft.confidence || 1.0,
		importNotes: "Converted from reviewed draft",
		publishedAt: new Date(),
		publishedBy: new Types.ObjectId(userId),
		createdBy: new Types.ObjectId(userId),
	});

	draft.status = "converted_to_template";
	draft.convertedTemplateVersionId = templateVersion._id;

	await draft.save();

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_CONVERTED",
		after: { status: "converted_to_template" },
	});

	return draft;
}

/**
 * Delete TemplateDraft (soft delete - only drafts can be deleted)
 */
export async function deleteTemplateDraft(id: string, userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("INVALID_DRAFT_ID", "Invalid draft ID format");
	}

	const draft = await TemplateDraft.findById(id);

	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	if (draft.status === "converted_to_template") {
		throw new BadRequestError(
			"CANNOT_DELETE_CONVERTED_DRAFT",
			"Already converted drafts cannot be deleted",
		);
	}

	// For simple soft delete, we'll just remove it if it's a draft
	await TemplateDraft.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: id,
		action: "TEMPLATE_DRAFT_DELETED",
	});
}

/**
 * Submit draft for review
 */
export async function submitDraftForReview(
	id: string,
	userId: string,
): Promise<ITemplateDraftDocument> {
	const draft = await TemplateDraft.findById(id);
	if (!draft) {
		throw new NotFoundError("TemplateDraft", id);
	}

	if (draft.status !== "draft") {
		throw new BadRequestError(
			"INVALID_DRAFT_STATUS",
			"Only drafts in 'draft' status can be submitted",
		);
	}

	assertDraftStructureReady(draft);
	draft.status = "review_required";
	await draft.save();

	await createAuditLog({
		userId,
		entity: "TemplateDraft",
		entityId: draft._id.toString(),
		action: "TEMPLATE_DRAFT_SUBMITTED_FOR_REVIEW",
		after: { status: "review_required" },
	});

	return draft;
}

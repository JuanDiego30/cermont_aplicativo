import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Generated Document ────────────────────────────────────────────────────────

export const GeneratedDocumentStatusEnum = z.enum([
	"pending",
	"processing",
	"completed",
	"failed",
	"archived",
]);
export type GeneratedDocumentStatus = z.infer<typeof GeneratedDocumentStatusEnum>;

export const GeneratedDocumentSchema = z.object({
	_id: ObjectIdSchema,
	title: z.string().min(1),
	documentTemplateId: ObjectIdSchema,
	templateResponseId: ObjectIdSchema,
	format: z.enum(["pdf", "xlsx", "zip", "json"]),
	status: GeneratedDocumentStatusEnum,
	storagePath: z.string().optional(),
	downloadUrl: z.string().optional(),
	fileSize: z.number().optional(),
	pageCount: z.number().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	errorMessage: z.string().optional(),
	startedAt: z.string().datetime(),
	completedAt: z.string().datetime().optional(),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type GeneratedDocument = z.infer<typeof GeneratedDocumentSchema>;

// ─── Export Template Layout ────────────────────────────────────────────────────

export const ExportTemplateLayoutSchema = z.object({
	_id: ObjectIdSchema.optional(),
	templateId: ObjectIdSchema,
	format: z.enum(["pdf", "xlsx", "json"]).default("pdf"),
	orientation: z.enum(["portrait", "landscape"]).default("portrait"),
	pageSize: z.enum(["A4", "Letter", "Legal"]).default("A4"),
	showHeader: z.boolean().default(true),
	showFooter: z.boolean().default(true),
	showLogo: z.boolean().default(true),
	logoUrl: z.string().optional(),
	showPageNumbers: z.boolean().default(true),
	showWatermark: z.boolean().default(false),
	watermarkText: z.string().optional(),
	includeSections: z.array(z.string()).optional(),
	excludeSections: z.array(z.string()).optional(),
	customCss: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ExportTemplateLayout = z.infer<typeof ExportTemplateLayoutSchema>;

// ─── Document Render Job ───────────────────────────────────────────────────────

export const CreateRenderJobSchema = z.object({
	templateResponseId: z.string().min(1),
	format: z.enum(["pdf", "xlsx", "json"]).default("pdf"),
	layoutId: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateRenderJob = z.infer<typeof CreateRenderJobSchema>;

// ─── Export Package ────────────────────────────────────────────────────────────

export const ExportPackageSchema = z.object({
	_id: ObjectIdSchema,
	name: z.string().min(1),
	entityType: z.string(),
	entityId: z.string(),
	documentIds: z.array(z.string()),
	zipPath: z.string().optional(),
	status: GeneratedDocumentStatusEnum,
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
});

export type ExportPackage = z.infer<typeof ExportPackageSchema>;

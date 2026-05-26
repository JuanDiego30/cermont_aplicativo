import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import {
	ClosingEvidenceKindSchema,
	DocumentLinkedEntityTypeSchema,
	DocumentPurposeSchema,
} from "./document-ingestion.schema";

export const DocumentIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const DocumentLifecycleStatusSchema = z.enum(["active", "archived", "deleted"]);
export type DocumentLifecycleStatus = z.infer<typeof DocumentLifecycleStatusSchema>;

export const DocumentListQuerySchema = z
	.object({
		order_id: z.union([ObjectIdSchema, z.literal("")]).optional(),
		orderId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		serviceCaseId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		linkedEntityId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		purpose: DocumentPurposeSchema.optional(),
		stepCode: CermontOperationalStepCodeSchema.optional(),
		stepId: CermontOperationalStepCodeSchema.optional(),
		includeArchived: z.coerce.boolean().optional(),
		page: z.coerce.number().int().min(1).optional(),
		limit: z.coerce.number().int().min(1).max(100).optional(),
	})
	.strip();

export const UploadDocumentSchema = z
	.object({
		title: z.string().min(1).max(200).trim(),
		order_id: z.union([ObjectIdSchema, z.literal("")]).optional(),
		orderId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		purpose: DocumentPurposeSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		requirementKey: z.string().min(1).max(120).optional(),
	})
	.strict();

export const CreateDocumentSchema = UploadDocumentSchema;

export const DocumentAssociationSchema = z
	.object({
		orderId: ObjectIdSchema.optional(),
		serviceCaseId: ObjectIdSchema.optional(),
		purpose: DocumentPurposeSchema,
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		requirementKey: z.string().min(1).max(120).optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: ObjectIdSchema.optional(),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
	})
	.strict();

export const AssociateDocumentSchema = z
	.object({
		orderId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		serviceCaseId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		purpose: DocumentPurposeSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		requirementKey: z.string().min(1).max(120).optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: z.union([ObjectIdSchema, z.literal("")]).optional(),
	})
	.strict();

export const SignDocumentSchema = z
	.object({
		signedBy: ObjectIdSchema,
	})
	.strict();

export const ArchiveDocumentSchema = z
	.object({
		reason: z.string().min(1).max(500).optional(),
	})
	.strict();

export const DocumentSchema = z
	.object({
		_id: ObjectIdSchema,
		title: z.string(),
		file_url: z.string(),
		file_size: z.number().int().nonnegative().optional(),
		mime_type: z.string().optional(),
		uploaded_by: ObjectIdSchema,
		order_id: ObjectIdSchema.optional(),
		purpose: DocumentPurposeSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: ObjectIdSchema.optional(),
		closingEvidenceKind: ClosingEvidenceKindSchema.optional(),
		associations: z.array(DocumentAssociationSchema).default([]),
		signed: z.boolean().optional(),
		signedBy: ObjectIdSchema.optional(),
		signedAt: z.string().datetime().optional(),
		lifecycleStatus: DocumentLifecycleStatusSchema.default("active"),
		archivedAt: z.string().datetime().optional(),
		archivedBy: ObjectIdSchema.optional(),
		archiveReason: z.string().max(500).optional(),
		retentionUntil: z.string().datetime().optional(),
		deletedAt: z.string().datetime().optional(),
		deletedBy: ObjectIdSchema.optional(),
		deleteReason: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type DocumentId = z.infer<typeof DocumentIdSchema>;
export type DocumentListQuery = z.infer<typeof DocumentListQuerySchema>;
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type DocumentAssociation = z.infer<typeof DocumentAssociationSchema>;
export type AssociateDocumentInput = z.infer<typeof AssociateDocumentSchema>;
export type SignDocumentInput = z.infer<typeof SignDocumentSchema>;
export type ArchiveDocumentInput = z.infer<typeof ArchiveDocumentSchema>;
export type Document = z.infer<typeof DocumentSchema>;

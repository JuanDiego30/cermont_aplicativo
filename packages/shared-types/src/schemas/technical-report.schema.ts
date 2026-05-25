import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import {
	EquipmentUsageSchema,
	ExecutionEvidenceSchema,
	ExecutionIncidentSchema,
	FieldSignatureSchema,
	LaborTimeEntrySchema,
	MaterialLineSchema,
} from "./execution-session.schema";

const TECHNICAL_REPORT_STATUS_VALUES = [
	"not_created",
	"draft",
	"generated",
	"reviewed",
	"approved",
	"rejected",
	"cancelled",
] as const;

export const TechnicalReportStatusSchema = z.enum(TECHNICAL_REPORT_STATUS_VALUES);
export type TechnicalReportStatus = z.infer<typeof TechnicalReportStatusSchema>;

export const TechnicalReportSnapshotSchema = z
	.object({
		executionSummary: z.string().min(1).max(3000),
		activitiesPerformed: z.array(z.string().min(1).max(500)).default([]),
		findings: z.array(z.string().min(1).max(1000)).default([]),
		deviations: z.array(z.string().min(1).max(1000)).default([]),
		materialsUsedSnapshot: z.array(MaterialLineSchema).default([]),
		laborSnapshot: z.array(LaborTimeEntrySchema).default([]),
		equipmentUsageSnapshot: z.array(EquipmentUsageSchema).default([]),
		incidentSnapshot: z.array(ExecutionIncidentSchema).default([]),
		evidenceRefs: z.array(ExecutionEvidenceSchema).default([]),
		signatureSnapshot: z
			.object({
				technicalSignature: FieldSignatureSchema.optional(),
				supervisorSignature: FieldSignatureSchema.optional(),
			})
			.strict()
			.default({}),
		generatedAt: z.string().datetime(),
	})
	.strict();

export type TechnicalReportSnapshot = z.infer<typeof TechnicalReportSnapshotSchema>;

export const TechnicalReportSchema = z
	.object({
		_id: ObjectIdSchema,
		workOrderId: ObjectIdSchema,
		executionSessionId: ObjectIdSchema,
		code: z.string().min(1).max(40),
		executionSummary: z.string().min(1).max(3000),
		activitiesPerformed: z.array(z.string().min(1).max(500)).default([]),
		findings: z.array(z.string().min(1).max(1000)).default([]),
		deviations: z.array(z.string().min(1).max(1000)).default([]),
		materialsUsedSnapshot: z.array(MaterialLineSchema).default([]),
		laborSnapshot: z.array(LaborTimeEntrySchema).default([]),
		equipmentUsageSnapshot: z.array(EquipmentUsageSchema).default([]),
		incidentSnapshot: z.array(ExecutionIncidentSchema).default([]),
		evidenceRefs: z.array(ExecutionEvidenceSchema).default([]),
		signatureSnapshot: z
			.object({
				technicalSignature: FieldSignatureSchema.optional(),
				supervisorSignature: FieldSignatureSchema.optional(),
			})
			.strict()
			.default({}),
		generatedPdfUrl: z.string().min(1).max(500).optional(),
		generatedBy: ObjectIdSchema,
		generatedAt: z.string().datetime(),
		reviewedBy: ObjectIdSchema.optional(),
		reviewedAt: z.string().datetime().optional(),
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectionReason: z.string().min(1).max(1000).optional(),
		status: TechnicalReportStatusSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type TechnicalReport = z.infer<typeof TechnicalReportSchema>;

export const TechnicalReportNotCreatedSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		status: z.literal("not_created"),
		message: z.string().min(1).max(300),
	})
	.strict();

export type TechnicalReportNotCreated = z.infer<typeof TechnicalReportNotCreatedSchema>;

export const TechnicalReportReadModelSchema = z.union([
	TechnicalReportSchema,
	TechnicalReportNotCreatedSchema,
]);

export type TechnicalReportReadModel = z.infer<typeof TechnicalReportReadModelSchema>;

export const TechnicalReportIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type TechnicalReportIdParams = z.infer<typeof TechnicalReportIdParamsSchema>;

export const OrderTechnicalReportParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type OrderTechnicalReportParams = z.infer<typeof OrderTechnicalReportParamsSchema>;

export const ListTechnicalReportsQuerySchema = z
	.object({
		workOrderId: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema.optional(),
		status: TechnicalReportStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListTechnicalReportsQuery = z.infer<typeof ListTechnicalReportsQuerySchema>;

export const CreateTechnicalReportSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		executionSummary: z.string().min(1).max(3000).optional(),
		findings: z.array(z.string().min(1).max(1000)).default([]),
		deviations: z.array(z.string().min(1).max(1000)).default([]),
	})
	.strict();

export type CreateTechnicalReportInput = z.infer<typeof CreateTechnicalReportSchema>;

export const GenerateTechnicalReportSchema = CreateTechnicalReportSchema;
export type GenerateTechnicalReportInput = z.infer<typeof GenerateTechnicalReportSchema>;

export const ReviewTechnicalReportSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		reviewNotes: z.string().max(1000).optional(),
	})
	.strict();

export type ReviewTechnicalReportInput = z.infer<typeof ReviewTechnicalReportSchema>;

export const ApproveTechnicalReportSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type ApproveTechnicalReportInput = z.infer<typeof ApproveTechnicalReportSchema>;

export const RejectTechnicalReportSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		reason: z.string().min(5).max(1000),
	})
	.strict();

export type RejectTechnicalReportInput = z.infer<typeof RejectTechnicalReportSchema>;

export const RegenerateTechnicalReportPdfSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RegenerateTechnicalReportPdfInput = z.infer<typeof RegenerateTechnicalReportPdfSchema>;

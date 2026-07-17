import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { DomainBlockerSchema } from "./domain-blocker.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Planning Packet — Readiness gate before field execution
// Replaces the implicit `planning` subdocument on Order.
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Section 2A
// ──────────────────────────────────────────────────────────────────────────────

const PLANNING_PACKET_STATUS_VALUES = [
	"draft",
	"incomplete",
	"ready",
	"blocked",
	"approved",
] as const;

export const PlanningPacketStatusSchema = z.enum(PLANNING_PACKET_STATUS_VALUES);
export type PlanningPacketStatus = z.infer<typeof PlanningPacketStatusSchema>;

const PLANNING_BUSINESS_UNIT_VALUES = ["IT_MNT", "SC", "GEN", "OTROS"] as const;

export const PlanningBusinessUnitSchema = z.enum(PLANNING_BUSINESS_UNIT_VALUES);
export type PlanningBusinessUnit = z.infer<typeof PlanningBusinessUnitSchema>;

const PLANNING_RESPONSIBLE_ROLE_VALUES = [
	"ingeniero_residente",
	"tecnico_electricista",
	"hes",
] as const;

export const PlanningResponsibleRoleSchema = z.enum(PLANNING_RESPONSIBLE_ROLE_VALUES);
export type PlanningResponsibleRole = z.infer<typeof PlanningResponsibleRoleSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ──────────────────────────────────────────────────────────────────────────────

export const CrewMemberSchema = z
	.object({
		userId: ObjectIdSchema,
		name: z.string().min(1).max(200),
		role: z.string().min(1).max(60),
		certificationIds: z.array(ObjectIdSchema).default([]),
	})
	.strict();

export type CrewMember = z.infer<typeof CrewMemberSchema>;

export const PlanningScheduleSchema = z
	.object({
		plannedStartAt: z.string().datetime(),
		plannedEndAt: z.string().datetime(),
		estimatedDurationHours: z.number().positive(),
	})
	.strict();

export type PlanningSchedule = z.infer<typeof PlanningScheduleSchema>;

export const PlanningResourceLineSchema = z
	.object({
		description: z.string().min(1).max(300),
		quantity: z.number().int().positive(),
		unit: z.string().min(1).max(40).optional(),
	})
	.strict();

export type PlanningResourceLine = z.infer<typeof PlanningResourceLineSchema>;

export const PlanningToolSchema = z
	.object({
		name: z.string().min(1).max(200),
		quantity: z.number().int().positive(),
		available: z.boolean(),
		specifications: z.string().max(500).optional(),
	})
	.strict();

export type PlanningTool = z.infer<typeof PlanningToolSchema>;

export const PlanningEquipmentSchema = z
	.object({
		equipmentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		quantity: z.number().int().positive().default(1),
		available: z.boolean(),
		certificateRequired: z.boolean().default(false),
	})
	.strict();

export type PlanningEquipment = z.infer<typeof PlanningEquipmentSchema>;

export const WorkerRequirementsSchema = z
	.object({
		electricistas: z.number().int().min(0).default(0),
		tecnicosTelecomunicacion: z.number().int().min(0).default(0),
		instrumentistas: z.number().int().min(0).default(0),
		obreros: z.number().int().min(0).default(0),
	})
	.strict();

export type WorkerRequirements = z.infer<typeof WorkerRequirementsSchema>;

export const PlanningResponsibleSchema = z
	.object({
		role: PlanningResponsibleRoleSchema,
		userId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200).optional(),
		status: z.enum(["pending", "assigned", "signed"]).default("assigned"),
		signedAt: z.string().datetime().optional(),
		signatureEvidenceId: ObjectIdSchema.optional(),
	})
	.strict();

export type PlanningResponsible = z.infer<typeof PlanningResponsibleSchema>;

export const RequiredCertificationSchema = z
	.object({
		certificationId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		requiredForRoles: z.array(z.string().min(1).max(60)).default([]),
		verified: z.boolean().default(false),
		expiresAt: z.string().datetime().optional(),
	})
	.strict();

export type RequiredCertification = z.infer<typeof RequiredCertificationSchema>;

export const SupportDocumentSchema = z
	.object({
		documentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		url: z.string().url(),
		documentType: z.enum([
			"ats",
			"ast",
			"ptw",
			"procedure",
			"procedimiento",
			"sds",
			"formato_tarea_critica",
			"checklist_equipos",
			"certificacion_equipo",
			"certificacion_personal",
			"other",
		]),
		uploadedAt: z.string().datetime(),
		required: z.boolean().default(false),
	})
	.strict();

export type SupportDocument = z.infer<typeof SupportDocumentSchema>;

export const ReadinessCheckItemSchema = z
	.object({
		itemId: z.string().min(1).max(80),
		label: z.string().min(1).max(300),
		checked: z.boolean().default(false),
		checkedBy: ObjectIdSchema.optional(),
		checkedAt: z.string().datetime().optional(),
	})
	.strict();

export type ReadinessCheckItem = z.infer<typeof ReadinessCheckItemSchema>;

export const PlanningKitSnapshotSchema = z
	.object({
		kitTemplateId: z.string().min(1).max(120),
		name: z.string().min(1).max(200),
		code: z.string().min(1).max(80).optional(),
		version: z.string().min(1).max(40).optional(),
		activityType: z.string().min(1).max(120).optional(),
		estimatedHours: z.number().positive().optional(),
		tools: z.array(PlanningToolSchema).default([]),
		equipment: z.array(PlanningEquipmentSchema).default([]),
		minimumPpe: z.array(z.string().min(1).max(120)).default([]),
	})
	.strict();

export type PlanningKitSnapshot = z.infer<typeof PlanningKitSnapshotSchema>;

export const CostBaselineSnapshotSchema = z
	.object({
		frozenAt: z.string().datetime(),
		frozenBy: z.string(),
		laborCosts: z.number(),
		materialCosts: z.number(),
		equipmentCosts: z.number(),
		totalBudget: z.number(),
		contingencyPercentage: z.number(),
		contingencyAmount: z.number(),
		grandTotal: z.number(),
	})
	.optional();

export type CostBaselineSnapshot = z.infer<typeof CostBaselineSnapshotSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Main entity
// ──────────────────────────────────────────────────────────────────────────────

export const PlanningPacketSchema = z
	.object({
		_id: ObjectIdSchema,
		workOrderId: ObjectIdSchema,
		responsibleInspectorId: ObjectIdSchema.optional(),
		responsibleInspectorName: z.string().min(1).max(200).optional(),
		place: z.string().min(3).max(300).optional(),
		plannedDate: z.string().datetime().optional(),
		businessUnit: PlanningBusinessUnitSchema.optional(),
		scope: z.string().min(20).max(3000).optional(),
		schedule: PlanningScheduleSchema.optional(),
		crew: z.array(CrewMemberSchema).default([]),
		supervisorId: ObjectIdSchema.optional(),
		hesResponsibleId: ObjectIdSchema.optional(),
		kitTemplateId: z.string().min(1).max(120).optional(),
		kitSnapshot: PlanningKitSnapshotSchema.optional(),
		materials: z.array(PlanningResourceLineSchema).default([]),
		tools: z.array(PlanningToolSchema).default([]),
		equipment: z.array(PlanningEquipmentSchema).default([]),
		safetyElements: z.array(PlanningResourceLineSchema).default([]),
		workerRequirements: WorkerRequirementsSchema.default({
			electricistas: 0,
			tecnicosTelecomunicacion: 0,
			instrumentistas: 0,
			obreros: 0,
		}),
		responsibles: z.array(PlanningResponsibleSchema).default([]),
		requiredCertifications: z.array(RequiredCertificationSchema).default([]),
		astRequired: z.boolean().default(false),
		ptwRequired: z.boolean().default(false),
		supportDocuments: z.array(SupportDocumentSchema).default([]),
		planningNotes: z.string().max(2000).optional(),
		readinessChecklist: z.array(ReadinessCheckItemSchema).default([]),
		blockers: z.array(DomainBlockerSchema).default([]),
		status: PlanningPacketStatusSchema,
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		approvalNotes: z.string().max(500).optional(),
		costBaselineSnapshot: CostBaselineSnapshotSchema,
		createdBy: ObjectIdSchema,
		updatedBy: ObjectIdSchema.optional(),
		reopenedBy: ObjectIdSchema.optional(),
		reopenedAt: z.string().datetime().optional(),
		reopenReason: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type PlanningPacket = z.infer<typeof PlanningPacketSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Command schemas
// ──────────────────────────────────────────────────────────────────────────────

export const CreatePlanningPacketSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		responsibleInspectorId: ObjectIdSchema.optional(),
		responsibleInspectorName: z.string().min(1).max(200).optional(),
		place: z.string().min(3).max(300).optional(),
		plannedDate: z.string().datetime().optional(),
		businessUnit: PlanningBusinessUnitSchema.optional(),
		scope: z.string().min(20).max(3000).optional(),
		schedule: PlanningScheduleSchema.optional(),
		crew: z.array(CrewMemberSchema).optional(),
		supervisorId: ObjectIdSchema.optional(),
		hesResponsibleId: ObjectIdSchema.optional(),
		kitTemplateId: z.string().min(1).max(120).optional(),
		kitSnapshot: PlanningKitSnapshotSchema.optional(),
		materials: z.array(PlanningResourceLineSchema).optional(),
		tools: z.array(PlanningToolSchema).optional(),
		equipment: z.array(PlanningEquipmentSchema).optional(),
		safetyElements: z.array(PlanningResourceLineSchema).optional(),
		workerRequirements: WorkerRequirementsSchema.optional(),
		responsibles: z.array(PlanningResponsibleSchema).optional(),
		requiredCertifications: z.array(RequiredCertificationSchema).optional(),
		astRequired: z.boolean().default(false),
		ptwRequired: z.boolean().default(false),
		supportDocuments: z.array(SupportDocumentSchema).optional(),
		readinessChecklist: z.array(ReadinessCheckItemSchema).optional(),
		planningNotes: z.string().max(2000).optional(),
	})
	.strict();

export type CreatePlanningPacketInput = z.infer<typeof CreatePlanningPacketSchema>;

export const UpdatePlanningPacketSchema = z
	.object({
		responsibleInspectorId: ObjectIdSchema.optional(),
		responsibleInspectorName: z.string().min(1).max(200).optional(),
		place: z.string().min(3).max(300).optional(),
		plannedDate: z.string().datetime().optional(),
		businessUnit: PlanningBusinessUnitSchema.optional(),
		scope: z.string().min(20).max(3000).optional(),
		schedule: PlanningScheduleSchema.optional(),
		crew: z.array(CrewMemberSchema).optional(),
		supervisorId: ObjectIdSchema.optional(),
		hesResponsibleId: ObjectIdSchema.optional(),
		kitTemplateId: z.string().min(1).max(120).optional(),
		kitSnapshot: PlanningKitSnapshotSchema.optional(),
		materials: z.array(PlanningResourceLineSchema).optional(),
		tools: z.array(PlanningToolSchema).optional(),
		equipment: z.array(PlanningEquipmentSchema).optional(),
		safetyElements: z.array(PlanningResourceLineSchema).optional(),
		workerRequirements: WorkerRequirementsSchema.optional(),
		responsibles: z.array(PlanningResponsibleSchema).optional(),
		requiredCertifications: z.array(RequiredCertificationSchema).optional(),
		astRequired: z.boolean().optional(),
		ptwRequired: z.boolean().optional(),
		supportDocuments: z.array(SupportDocumentSchema).optional(),
		planningNotes: z.string().max(2000).optional(),
		readinessChecklist: z.array(ReadinessCheckItemSchema).optional(),
	})
	.strict();

export type UpdatePlanningPacketInput = z.infer<typeof UpdatePlanningPacketSchema>;

export const ValidatePlanningReadinessSchema = z.object({}).strict();
export type ValidatePlanningReadinessInput = z.infer<typeof ValidatePlanningReadinessSchema>;

export const ApprovePlanningPacketSchema = z
	.object({
		approvedBy: ObjectIdSchema.optional(),
		notes: z.string().max(500).optional(),
	})
	.strict();

export type ApprovePlanningPacketInput = z.infer<typeof ApprovePlanningPacketSchema>;

export const PlanningPacketIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type PlanningPacketIdParams = z.infer<typeof PlanningPacketIdParamsSchema>;

export const OrderPlanningPacketParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type OrderPlanningPacketParams = z.infer<typeof OrderPlanningPacketParamsSchema>;

export const CreateOrderPlanningPacketSchema = CreatePlanningPacketSchema.omit({
	workOrderId: true,
}).partial();
export type CreateOrderPlanningPacketInput = z.infer<typeof CreateOrderPlanningPacketSchema>;

export const ReopenPlanningPacketSchema = z
	.object({
		reason: z.string().min(1).max(500).optional(),
	})
	.strict();
export type ReopenPlanningPacketInput = z.infer<typeof ReopenPlanningPacketSchema>;

export const PlanningPacketListQuerySchema = z
	.object({
		workOrderId: ObjectIdSchema.optional(),
		status: PlanningPacketStatusSchema.optional(),
		limit: z.coerce.number().int().min(1).max(100).default(50),
	})
	.strict();
export type PlanningPacketListQuery = z.infer<typeof PlanningPacketListQuerySchema>;

export const ApplyPlanningKitSchema = z
	.object({
		kitTemplateId: z.string().min(1).max(120),
	})
	.strict();

export type ApplyPlanningKitInput = z.infer<typeof ApplyPlanningKitSchema>;

// ─── Spec-015: Planning readiness report ─────────────────────────────────────

export const PlanningReadinessCheckSchema = z
	.object({
		key: z.string().min(1),
		label: z.string().min(1),
		passed: z.boolean(),
	})
	.strict();
export type PlanningReadinessCheck = z.infer<typeof PlanningReadinessCheckSchema>;

export const PlanningReadinessReportSchema = z
	.object({
		planningPacketId: z.string().min(1),
		status: PlanningPacketStatusSchema,
		canExecute: z.boolean(),
		blockingReasons: z.array(z.string()),
		checks: z.array(PlanningReadinessCheckSchema),
		generatedAt: z.string().datetime(),
	})
	.strict();
export type PlanningReadinessReport = z.infer<typeof PlanningReadinessReportSchema>;

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

const EXECUTION_SESSION_STATUS_VALUES = [
	"draft",
	"ready",
	"in_progress",
	"paused",
	"completed",
	"cancelled",
	"sync_pending",
	"sync_failed",
] as const;

export const ExecutionSessionStatusSchema = z.enum(EXECUTION_SESSION_STATUS_VALUES);
export type ExecutionSessionStatus = z.infer<typeof ExecutionSessionStatusSchema>;

const EXECUTION_COMMAND_TYPE_VALUES = [
	"start_execution",
	"pause_execution",
	"resume_execution",
	"complete_execution",
	"cancel_execution",
	"add_evidence",
	"add_material_usage",
	"add_tool_usage",
	"add_equipment_usage",
	"add_labor_entry",
	"add_incident",
	"resolve_incident",
	"add_observation",
	"add_signature",
	"submit_checklist",
	"submit_dynamic_form",
] as const;

export const ExecutionCommandTypeSchema = z.enum(EXECUTION_COMMAND_TYPE_VALUES);
export type ExecutionCommandType = z.infer<typeof ExecutionCommandTypeSchema>;

const EXECUTION_OFFLINE_SYNC_STATUS_VALUES = ["pending", "syncing", "synced", "failed"] as const;

export const ExecutionOfflineSyncStatusSchema = z.enum(EXECUTION_OFFLINE_SYNC_STATUS_VALUES);
export type ExecutionOfflineSyncStatus = z.infer<typeof ExecutionOfflineSyncStatusSchema>;

export const OfflineSyncStateSchema = ExecutionOfflineSyncStatusSchema;
export type OfflineSyncState = ExecutionOfflineSyncStatus;

const EXECUTION_BLOCKER_VALUES = [
	"planning_not_approved",
	"work_order_not_ready",
	"execution_already_started",
	"execution_not_started",
	"missing_required_checklist",
	"missing_required_evidence",
	"missing_required_signature",
	"missing_labor_entries",
	"missing_material_usage",
	"open_incident",
	"sync_pending",
	"cancelled",
	"already_completed",
] as const;

export const ExecutionSessionBlockerCodeSchema = z.enum(EXECUTION_BLOCKER_VALUES);
export type ExecutionSessionBlockerCode = z.infer<typeof ExecutionSessionBlockerCodeSchema>;

const EXECUTION_NEXT_ACTION_VALUES = [
	"start_execution",
	"complete_required_checklist",
	"capture_required_evidence",
	"record_material_usage",
	"record_labor_time",
	"resolve_incident",
	"collect_signature",
	"finish_execution",
	"sync_pending_commands",
	"generate_technical_report",
] as const;

export const ExecutionSessionNextActionCodeSchema = z.enum(EXECUTION_NEXT_ACTION_VALUES);
export type ExecutionSessionNextActionCode = z.infer<typeof ExecutionSessionNextActionCodeSchema>;

export const ExecutionGpsPointSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		accuracy: z.number().nonnegative().optional(),
		capturedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionGpsPoint = z.infer<typeof ExecutionGpsPointSchema>;

export const GpsPointSchema = ExecutionGpsPointSchema;
export type GpsPoint = ExecutionGpsPoint;

export const ExecutionEvidenceReferenceSchema = z
	.object({
		evidenceId: ObjectIdSchema,
		documentId: ObjectIdSchema.optional(),
		type: z.enum(["image", "video", "document"]),
		phase: z.enum(["before", "during", "after", "incident", "checklist"]).default("during"),
		description: z.string().max(500).optional(),
		fieldRef: z.string().max(120).optional(),
		incidentId: z.string().max(80).optional(),
		materialUsageId: z.string().max(80).optional(),
		gpsPoint: ExecutionGpsPointSchema.optional(),
		uploadedBy: ObjectIdSchema,
		uploadedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionEvidenceReference = z.infer<typeof ExecutionEvidenceReferenceSchema>;

export const ExecutionEvidenceSchema = ExecutionEvidenceReferenceSchema;
export type ExecutionEvidence = ExecutionEvidenceReference;

export const ExecutionDocumentReferenceSchema = z
	.object({
		documentImportId: ObjectIdSchema,
		documentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(240),
		mimeType: z.string().min(1).max(160),
		uploadedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionDocumentReference = z.infer<typeof ExecutionDocumentReferenceSchema>;

export const ExecutionChecklistResponseSchema = z
	.object({
		responseId: z.string().min(1).max(80),
		checklistId: z.string().min(1).max(120),
		itemId: z.string().min(1).max(120),
		label: z.string().min(1).max(500),
		value: z.union([z.string(), z.number(), z.boolean()]),
		required: z.boolean().default(false),
		evidenceIds: z.array(ObjectIdSchema).default([]),
		answeredAt: z.string().datetime(),
		answeredBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionChecklistResponse = z.infer<typeof ExecutionChecklistResponseSchema>;

export const ChecklistEntrySchema = ExecutionChecklistResponseSchema;
export type ChecklistEntry = ExecutionChecklistResponse;

export const ExecutionDynamicFormResponseSchema = z
	.object({
		responseId: z.string().min(1).max(80),
		templateId: ObjectIdSchema.optional(),
		templateResponseId: ObjectIdSchema.optional(),
		fieldKey: z.string().min(1).max(120),
		label: z.string().min(1).max(500),
		value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
		required: z.boolean().default(false),
		evidenceIds: z.array(ObjectIdSchema).default([]),
		answeredAt: z.string().datetime(),
		answeredBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionDynamicFormResponse = z.infer<typeof ExecutionDynamicFormResponseSchema>;

export const ExecutionMaterialUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		materialId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		quantityPlanned: z.number().nonnegative().default(0),
		quantityUsed: z.number().nonnegative(),
		unit: z.string().min(1).max(50),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionMaterialUsage = z.infer<typeof ExecutionMaterialUsageSchema>;

export const MaterialLineSchema = ExecutionMaterialUsageSchema;
export type MaterialLine = ExecutionMaterialUsage;

export const ExecutionToolUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		toolId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		quantityPlanned: z.number().int().nonnegative().default(0),
		quantityUsed: z.number().int().nonnegative(),
		condition: z.enum(["ok", "damaged", "lost", "returned"]).default("ok"),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionToolUsage = z.infer<typeof ExecutionToolUsageSchema>;

export const ExecutionEquipmentUsageSchema = z
	.object({
		usageId: z.string().min(1).max(80),
		equipmentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(200),
		startedAt: z.string().datetime(),
		endedAt: z.string().datetime().optional(),
		hoursUsed: z.number().nonnegative().optional(),
		condition: z.enum(["ok", "damaged", "returned"]).default("ok"),
		notes: z.string().max(500).optional(),
		recordedAt: z.string().datetime(),
		recordedBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionEquipmentUsage = z.infer<typeof ExecutionEquipmentUsageSchema>;

export const EquipmentUsageSchema = ExecutionEquipmentUsageSchema;
export type EquipmentUsage = ExecutionEquipmentUsage;

export const ExecutionLaborEntrySchema = z
	.object({
		laborEntryId: z.string().min(1).max(80),
		userId: ObjectIdSchema,
		role: z.string().min(1).max(80),
		startedAt: z.string().datetime(),
		endedAt: z.string().datetime(),
		durationMinutes: z.number().int().positive(),
		description: z.string().min(1).max(500),
		notes: z.string().max(500).optional(),
	})
	.strict();
export type ExecutionLaborEntry = z.infer<typeof ExecutionLaborEntrySchema>;

export const LaborTimeEntrySchema = ExecutionLaborEntrySchema;
export type LaborTimeEntry = ExecutionLaborEntry;

export const ExecutionIncidentSchema = z
	.object({
		incidentId: z.string().min(1).max(80),
		type: z.enum(["safety", "quality", "environmental", "technical", "client", "other"]),
		severity: z.enum(["low", "medium", "high", "critical"]),
		description: z.string().min(5).max(2000),
		actionTaken: z.string().max(2000).optional(),
		occurredAt: z.string().datetime(),
		reportedBy: ObjectIdSchema,
		evidenceIds: z.array(ObjectIdSchema).default([]),
		resolved: z.boolean().default(false),
		resolvedAt: z.string().datetime().optional(),
		resolvedBy: ObjectIdSchema.optional(),
	})
	.strict();
export type ExecutionIncident = z.infer<typeof ExecutionIncidentSchema>;

export const ExecutionObservationSchema = z
	.object({
		observationId: z.string().min(1).max(80),
		description: z.string().min(1).max(2000),
		createdAt: z.string().datetime(),
		createdBy: ObjectIdSchema,
	})
	.strict();
export type ExecutionObservation = z.infer<typeof ExecutionObservationSchema>;

export const ExecutionSignatureSchema = z
	.object({
		signatureId: z.string().min(1).max(80),
		signedBy: ObjectIdSchema,
		signedByName: z.string().min(1).max(200),
		role: z.string().min(1).max(80),
		signatureType: z.enum(["technician", "supervisor", "client", "hes"]),
		imageDocumentId: ObjectIdSchema.optional(),
		signatureUrl: z.string().url().optional(),
		signedAt: z.string().datetime(),
		confirmed: z.boolean().default(false),
	})
	.strict();
export type ExecutionSignature = z.infer<typeof ExecutionSignatureSchema>;

export const FieldSignatureSchema = ExecutionSignatureSchema;
export type FieldSignature = ExecutionSignature;

export const ExecutionSessionBlockerSchema = z
	.object({
		code: ExecutionSessionBlockerCodeSchema,
		message: z.string().min(1).max(300),
		severity: z.enum(["warning", "blocking", "critical"]).default("blocking"),
	})
	.strict();
export type ExecutionSessionBlocker = z.infer<typeof ExecutionSessionBlockerSchema>;

export const ExecutionSessionNextActionSchema = z
	.object({
		code: ExecutionSessionNextActionCodeSchema,
		label: z.string().min(1).max(200),
		route: z.string().min(1).max(200).optional(),
	})
	.strict();
export type ExecutionSessionNextAction = z.infer<typeof ExecutionSessionNextActionSchema>;

export const ExecutionCommandSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		commandType: ExecutionCommandTypeSchema,
		createdAt: z.string().datetime().optional(),
	})
	.strict();
export type ExecutionCommand = z.infer<typeof ExecutionCommandSchema>;

export const CreateExecutionSessionSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
		workOrderId: ObjectIdSchema,
		planningPacketId: ObjectIdSchema.optional(),
		serviceCaseId: ObjectIdSchema.optional(),
		assignedCrew: z.array(ObjectIdSchema).default([]),
	})
	.strict();
export type CreateExecutionSessionInput = z.infer<typeof CreateExecutionSessionSchema>;

export const CreateOrderExecutionSessionSchema = CreateExecutionSessionSchema.omit({
	workOrderId: true,
}).partial();
export type CreateOrderExecutionSessionInput = z.infer<typeof CreateOrderExecutionSessionSchema>;

export const StartExecutionSessionCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("start_execution").default("start_execution"),
	startGps: ExecutionGpsPointSchema.optional(),
	startedAt: z.string().datetime().optional(),
}).strict();
export type StartExecutionSessionCommand = z.infer<typeof StartExecutionSessionCommandSchema>;

export const PauseExecutionSessionCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("pause_execution").default("pause_execution"),
	reason: z.string().min(1).max(500).optional(),
}).strict();
export type PauseExecutionSessionCommand = z.infer<typeof PauseExecutionSessionCommandSchema>;

export const ResumeExecutionSessionCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("resume_execution").default("resume_execution"),
	resumedAt: z.string().datetime().optional(),
}).strict();
export type ResumeExecutionSessionCommand = z.infer<typeof ResumeExecutionSessionCommandSchema>;

export const CompleteExecutionSessionCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("complete_execution").default("complete_execution"),
	endGps: ExecutionGpsPointSchema.optional(),
	completedAt: z.string().datetime().optional(),
}).strict();
export type CompleteExecutionSessionCommand = z.infer<typeof CompleteExecutionSessionCommandSchema>;

export const CancelExecutionSessionCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("cancel_execution").default("cancel_execution"),
	cancellationReason: z.string().min(5).max(800),
}).strict();
export type CancelExecutionSessionCommand = z.infer<typeof CancelExecutionSessionCommandSchema>;

export const AddExecutionEvidenceCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_evidence").default("add_evidence"),
	evidence: ExecutionEvidenceReferenceSchema.omit({ uploadedAt: true }),
}).strict();
export type AddExecutionEvidenceCommand = z.infer<typeof AddExecutionEvidenceCommandSchema>;

export const AddExecutionMaterialUsageCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_material_usage").default("add_material_usage"),
	material: ExecutionMaterialUsageSchema,
}).strict();
export type AddExecutionMaterialUsageCommand = z.infer<
	typeof AddExecutionMaterialUsageCommandSchema
>;

export const AddExecutionToolUsageCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_tool_usage").default("add_tool_usage"),
	tool: ExecutionToolUsageSchema,
}).strict();
export type AddExecutionToolUsageCommand = z.infer<typeof AddExecutionToolUsageCommandSchema>;

export const AddExecutionEquipmentUsageCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_equipment_usage").default("add_equipment_usage"),
	equipment: ExecutionEquipmentUsageSchema,
}).strict();
export type AddExecutionEquipmentUsageCommand = z.infer<
	typeof AddExecutionEquipmentUsageCommandSchema
>;

export const AddExecutionLaborEntryCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_labor_entry").default("add_labor_entry"),
	labor: ExecutionLaborEntrySchema,
}).strict();
export type AddExecutionLaborEntryCommand = z.infer<typeof AddExecutionLaborEntryCommandSchema>;

export const AddExecutionIncidentCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_incident").default("add_incident"),
	incident: ExecutionIncidentSchema.omit({ resolved: true, resolvedAt: true, resolvedBy: true }),
}).strict();
export type AddExecutionIncidentCommand = z.infer<typeof AddExecutionIncidentCommandSchema>;

export const ResolveExecutionIncidentCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("resolve_incident").default("resolve_incident"),
	incidentId: z.string().min(1).max(80),
	actionTaken: z.string().min(1).max(2000),
}).strict();
export type ResolveExecutionIncidentCommand = z.infer<typeof ResolveExecutionIncidentCommandSchema>;

export const AddExecutionObservationCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_observation").default("add_observation"),
	observation: ExecutionObservationSchema,
}).strict();
export type AddExecutionObservationCommand = z.infer<typeof AddExecutionObservationCommandSchema>;

export const AddExecutionSignatureCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("add_signature").default("add_signature"),
	signature: ExecutionSignatureSchema,
}).strict();
export type AddExecutionSignatureCommand = z.infer<typeof AddExecutionSignatureCommandSchema>;

export const SubmitExecutionChecklistCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("submit_checklist").default("submit_checklist"),
	response: ExecutionChecklistResponseSchema,
}).strict();
export type SubmitExecutionChecklistCommand = z.infer<typeof SubmitExecutionChecklistCommandSchema>;

export const SubmitExecutionDynamicFormCommandSchema = ExecutionCommandSchema.extend({
	commandType: z.literal("submit_dynamic_form").default("submit_dynamic_form"),
	response: ExecutionDynamicFormResponseSchema,
}).strict();
export type SubmitExecutionDynamicFormCommand = z.infer<
	typeof SubmitExecutionDynamicFormCommandSchema
>;

export const ExecutionOfflineCommandSchema = z.discriminatedUnion("commandType", [
	StartExecutionSessionCommandSchema,
	PauseExecutionSessionCommandSchema,
	ResumeExecutionSessionCommandSchema,
	CompleteExecutionSessionCommandSchema,
	CancelExecutionSessionCommandSchema,
	AddExecutionEvidenceCommandSchema,
	AddExecutionMaterialUsageCommandSchema,
	AddExecutionToolUsageCommandSchema,
	AddExecutionEquipmentUsageCommandSchema,
	AddExecutionLaborEntryCommandSchema,
	AddExecutionIncidentCommandSchema,
	ResolveExecutionIncidentCommandSchema,
	AddExecutionObservationCommandSchema,
	AddExecutionSignatureCommandSchema,
	SubmitExecutionChecklistCommandSchema,
	SubmitExecutionDynamicFormCommandSchema,
]);
export type ExecutionOfflineCommand = z.infer<typeof ExecutionOfflineCommandSchema>;

export const ExecutionCommandResultSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		commandType: ExecutionCommandTypeSchema,
		status: z.enum(["processed", "deduplicated", "failed"]),
		message: z.string().max(300).optional(),
	})
	.strict();
export type ExecutionCommandResult = z.infer<typeof ExecutionCommandResultSchema>;

export const ExecutionSyncBatchSchema = z
	.object({
		commands: z.array(ExecutionOfflineCommandSchema).min(1).max(100),
	})
	.strict();
export type ExecutionSyncBatch = z.infer<typeof ExecutionSyncBatchSchema>;

export const ExecutionSyncBatchResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.array(ExecutionCommandResultSchema),
	})
	.strict();
export type ExecutionSyncBatchResponse = z.infer<typeof ExecutionSyncBatchResponseSchema>;

export const ExecutionSessionSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		id: ObjectIdSchema.optional(),
		code: z.string().min(1).max(40),
		workOrderId: ObjectIdSchema,
		planningPacketId: ObjectIdSchema.optional(),
		serviceCaseId: ObjectIdSchema.optional(),
		status: ExecutionSessionStatusSchema,
		startedAt: z.string().datetime().optional(),
		pausedAt: z.string().datetime().optional(),
		resumedAt: z.string().datetime().optional(),
		completedAt: z.string().datetime().optional(),
		cancelledAt: z.string().datetime().optional(),
		cancellationReason: z.string().max(800).optional(),
		startedBy: ObjectIdSchema.optional(),
		completedBy: ObjectIdSchema.optional(),
		assignedCrew: z.array(ObjectIdSchema).default([]),
		checklistResponses: z.array(ExecutionChecklistResponseSchema).default([]),
		dynamicFormResponses: z.array(ExecutionDynamicFormResponseSchema).default([]),
		materialsUsed: z.array(ExecutionMaterialUsageSchema).default([]),
		toolsUsed: z.array(ExecutionToolUsageSchema).default([]),
		equipmentUsed: z.array(ExecutionEquipmentUsageSchema).default([]),
		laborEntries: z.array(ExecutionLaborEntrySchema).default([]),
		incidents: z.array(ExecutionIncidentSchema).default([]),
		observations: z.array(ExecutionObservationSchema).default([]),
		signatures: z.array(ExecutionSignatureSchema).default([]),
		evidenceIds: z.array(ObjectIdSchema).default([]),
		evidences: z.array(ExecutionEvidenceReferenceSchema).default([]),
		documentImportIds: z.array(ObjectIdSchema).default([]),
		gpsPoints: z.array(ExecutionGpsPointSchema).default([]),
		offlineSyncStatus: ExecutionOfflineSyncStatusSchema.default("synced"),
		lastSyncedAt: z.string().datetime().optional(),
		clientMutationIds: z.array(z.string().uuid()).default([]),
		blockers: z.array(ExecutionSessionBlockerSchema).default([]),
		nextActions: z.array(ExecutionSessionNextActionSchema).default([]),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionSession = z.infer<typeof ExecutionSessionSchema>;

export const ExecutionSessionIdSchema = ObjectIdSchema;
export const ExecutionSessionIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type ExecutionSessionIdParams = z.infer<typeof ExecutionSessionIdParamsSchema>;

export const OrderExecutionSessionParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type OrderExecutionSessionParams = z.infer<typeof OrderExecutionSessionParamsSchema>;

export const ExecutionIncidentIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
		incidentId: z.string().min(1).max(80),
	})
	.strict();
export type ExecutionIncidentIdParams = z.infer<typeof ExecutionIncidentIdParamsSchema>;

export const ExecutionSessionListQuerySchema = z
	.object({
		workOrderId: ObjectIdSchema.optional(),
		serviceCaseId: ObjectIdSchema.optional(),
		status: ExecutionSessionStatusSchema.optional(),
		offlineSyncStatus: ExecutionOfflineSyncStatusSchema.optional(),
		search: z.string().max(100).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();
export type ExecutionSessionListQuery = z.infer<typeof ExecutionSessionListQuerySchema>;

export const ExecutionSessionListItemSchema = ExecutionSessionSchema.pick({
	_id: true,
	id: true,
	code: true,
	workOrderId: true,
	planningPacketId: true,
	serviceCaseId: true,
	status: true,
	startedAt: true,
	completedAt: true,
	assignedCrew: true,
	evidenceIds: true,
	materialsUsed: true,
	laborEntries: true,
	incidents: true,
	offlineSyncStatus: true,
	blockers: true,
	nextActions: true,
	createdAt: true,
	updatedAt: true,
});
export type ExecutionSessionListItem = z.infer<typeof ExecutionSessionListItemSchema>;

export const ExecutionSessionDetailSchema = ExecutionSessionSchema;
export type ExecutionSessionDetail = ExecutionSession;

export const ExecutionSessionListResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.array(ExecutionSessionListItemSchema),
		pagination: z
			.object({
				page: z.number().int().min(1),
				limit: z.number().int().min(1),
				total: z.number().int().min(0),
				totalPages: z.number().int().min(0),
			})
			.strict(),
	})
	.strict();
export type ExecutionSessionListResponse = z.infer<typeof ExecutionSessionListResponseSchema>;

export const ExecutionSessionDetailResponseSchema = z
	.object({
		success: z.literal(true),
		data: ExecutionSessionDetailSchema,
	})
	.strict();
export type ExecutionSessionDetailResponse = z.infer<typeof ExecutionSessionDetailResponseSchema>;

export const StartExecutionSessionSchema = StartExecutionSessionCommandSchema;
export type StartExecutionSessionInput = StartExecutionSessionCommand;

export const FinishExecutionSessionSchema = CompleteExecutionSessionCommandSchema;
export type FinishExecutionSessionInput = CompleteExecutionSessionCommand;

export const SyncExecutionSessionSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		sessionSnapshot: ExecutionSessionSchema.partial().optional(),
	})
	.strict();
export type SyncExecutionSessionInput = z.infer<typeof SyncExecutionSessionSchema>;

export const AddExecutionEvidenceSchema = AddExecutionEvidenceCommandSchema;
export type AddExecutionEvidenceInput = AddExecutionEvidenceCommand;

export const RecordMaterialsUsedSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		materials: z.array(ExecutionMaterialUsageSchema).min(1),
	})
	.strict();
export type RecordMaterialsUsedInput = z.infer<typeof RecordMaterialsUsedSchema>;

export const RecordLaborTimeSchema = AddExecutionLaborEntryCommandSchema;
export type RecordLaborTimeInput = AddExecutionLaborEntryCommand;

export const RecordEquipmentUsageSchema = z
	.object({
		clientMutationId: z.string().uuid(),
		equipment: z.array(ExecutionEquipmentUsageSchema).min(1),
	})
	.strict();
export type RecordEquipmentUsageInput = z.infer<typeof RecordEquipmentUsageSchema>;

export const RegisterExecutionIncidentSchema = AddExecutionIncidentCommandSchema;
export type RegisterExecutionIncidentInput = AddExecutionIncidentCommand;

export const AddFieldObservationSchema = AddExecutionObservationCommandSchema;
export type AddFieldObservationInput = AddExecutionObservationCommand;

export const SignExecutionTechnicianSchema = AddExecutionSignatureCommandSchema;
export type SignExecutionTechnicianInput = AddExecutionSignatureCommand;

export const SignExecutionSupervisorSchema = AddExecutionSignatureCommandSchema;
export type SignExecutionSupervisorInput = AddExecutionSignatureCommand;

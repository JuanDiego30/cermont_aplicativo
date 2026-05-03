import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import {
	type AuditableDocument,
	EmailSchema,
	ObjectIdSchema,
	type SoftDeleteDocument,
} from "./common.schema";
import {
	AssignmentRulesSchema,
	EquipmentSchema,
	KitMaterialSchema,
	KitSafetySchema,
	LinkedChecklistSchema,
	ProcedureStepSchema,
	ToolSchema,
} from "./maintenanceKit.schema";

export const ORDER_STATUS_VALUES = [
	"open",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
	"in_progress",
	"on_hold",
	"report_pending",
	"completed",
	"ready_for_invoicing",
	"acta_signed",
	"ses_sent",
	"invoice_approved",
	"paid",
	"closed",
	"cancelled",
] as const;

export const OrderStatusSchema = z.enum(ORDER_STATUS_VALUES);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type OrderPriority = z.infer<typeof OrderPrioritySchema>;

export const OrderTypeSchema = z.enum([
	"maintenance", // Mantenimiento preventivo/correctivo
	"inspection", // Inspección de seguridad (HES)
	"installation", // Instalación de equipos
	"repair", // Reparación de emergencia
	"decommission", // Descomisionamiento
]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const MaterialItemSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().positive(),
	unit: z.string().min(1),
	unitCost: z.number().nonnegative().optional(),
	delivered: z.boolean().default(false),
});
export type MaterialItem = z.infer<typeof MaterialItemSchema>;

export const OrderPlanningKitSnapshotSchema = z
	.object({
		kitTemplateId: z.string().min(1),
		name: z.string().min(1),
		code: z.string().optional(),
		version: z.string().optional(),
		activityType: z.string().min(1).optional(),
		estimatedHours: z.number().positive().optional(),
		tools: z
			.array(
				ToolSchema.extend({
					confirmedAvailable: z.boolean().default(false),
				}),
			)
			.default([]),
		equipment: z
			.array(
				EquipmentSchema.extend({
					confirmedAvailable: z.boolean().default(false),
				}),
			)
			.default([]),
		procedureSteps: z.array(ProcedureStepSchema).default([]),
		materials: z.array(KitMaterialSchema).default([]),
		baseMaterialCost: z.number().nonnegative().default(0),
		safety: KitSafetySchema.optional(),
		linkedChecklists: z.array(LinkedChecklistSchema).default([]),
		assignmentRules: AssignmentRulesSchema.optional(),
		minimumPpe: z.array(z.string().min(1)).default([]),
	})
	.strip();
export type OrderPlanningKitSnapshot = z.infer<typeof OrderPlanningKitSnapshotSchema>;

export const PersonnelAssignmentSchema = z
	.object({
		technicianId: z.string().min(1),
		name: z.string().min(1),
		role: z.string().min(1),
		requiredCertifications: z.array(z.string()).default([]),
		estimatedHours: z.number().positive().optional(),
	})
	.strip();
export type PersonnelAssignment = z.infer<typeof PersonnelAssignmentSchema>;

export const OrderPlanningSchema = z
	.object({
		scheduledStartAt: z.string().datetime().optional(),
		estimatedHours: z.number().positive().optional(),
		crewSize: z.number().int().min(1).optional(),
		kitTemplateId: z.string().min(1).optional(),
		kitSnapshot: OrderPlanningKitSnapshotSchema.optional(),
		personnelAssignments: z.array(PersonnelAssignmentSchema).default([]),
		astDocumentId: z.string().min(1).optional(),
		supportDocumentIds: z.array(z.string().min(1)).default([]),
		planningReadyAt: z.string().datetime().optional(),
		planningReadyBy: z.string().min(1).optional(),
	})
	.strip();
export type OrderPlanning = z.infer<typeof OrderPlanningSchema>;

export const OrderBillingSesStatusSchema = z.enum(["pending", "registered", "approved"]);
export type OrderBillingSesStatus = z.infer<typeof OrderBillingSesStatusSchema>;

export const OrderBillingInvoiceStatusSchema = z.enum(["pending", "sent", "approved", "paid"]);
export type OrderBillingInvoiceStatus = z.infer<typeof OrderBillingInvoiceStatusSchema>;

export const OrderBillingSchema = z
	.object({
		sesNumber: z.string().trim().optional(),
		sesStatus: OrderBillingSesStatusSchema.default("pending"),
		sesApprovedAt: z.string().datetime().optional(),
		invoiceNumber: z.string().trim().optional(),
		invoiceStatus: OrderBillingInvoiceStatusSchema.default("pending"),
		invoiceApprovedAt: z.string().datetime().optional(),
		paidAt: z.string().datetime().optional(),
		billingNotes: z.string().max(3000).optional(),
	})
	.strip();
export type OrderBilling = z.infer<typeof OrderBillingSchema>;

const GpsLocationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	accuracy: z.number().optional(), // Metros de precisión GPS
	capturedAt: z.string().datetime().optional(),
});

const EmptyGpsLocationSchema = z
	.object({
		lat: z.undefined().optional(),
		lng: z.undefined().optional(),
		accuracy: z.undefined().optional(),
		capturedAt: z.undefined().optional(),
	})
	.strip()
	.transform(() => undefined);

const OptionalGpsLocationSchema = z.union([GpsLocationSchema, EmptyGpsLocationSchema]).optional();

const optionalObjectId = () =>
	z
		.union([ObjectIdSchema, z.literal("")])
		.optional()
		.transform((value) => value || undefined);

const normalizeQueryArray = (value: unknown): unknown[] | undefined => {
	const normalized = normalizeQueryValue(value);
	if (normalized === undefined || normalized === null || normalized === "") {
		return undefined;
	}
	if (Array.isArray(value)) {
		return value.filter((entry) => entry !== "");
	}
	if (typeof normalized === "string") {
		return normalized
			.split(",")
			.map((entry) => entry.trim())
			.filter(Boolean);
	}
	return [normalized];
};

export const WarrantyStatusSchema = z.enum(["active", "expired", "na"]);
export type WarrantyStatus = z.infer<typeof WarrantyStatusSchema>;

export const ConditionForWorkSchema = z.enum(["operational", "out_of_service", "isolated"]);
export type ConditionForWork = z.infer<typeof ConditionForWorkSchema>;

export const ResponseLevelSchema = z.enum(["emergency", "urgent", "standard", "scheduled"]);
export type ResponseLevel = z.infer<typeof ResponseLevelSchema>;

export const EmployeeTypeSchema = z.enum(["in_house", "subcontractor"]);
export type EmployeeType = z.infer<typeof EmployeeTypeSchema>;

export const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const PermitTypeSchema = z.enum([
	"hot_work",
	"confined_space",
	"electrical",
	"lifting",
	"heights",
]);
export type PermitType = z.infer<typeof PermitTypeSchema>;

export const BusinessUnitSchema = z.enum(["IT", "MNT", "SC", "GEN"]);
export type BusinessUnit = z.infer<typeof BusinessUnitSchema>;

export const SpecificRiskSchema = z.enum([
	"heights",
	"electrical",
	"lifting",
	"confined_space",
	"hazardous_substances",
]);
export type SpecificRisk = z.infer<typeof SpecificRiskSchema>;

export const OrderAssetDetailsSchema = z
	.object({
		serialTag: z.string().trim().max(120).optional(),
		model: z.string().trim().max(160).optional(),
		manufacturer: z.string().trim().max(160).optional(),
		lastInterventionAt: z.string().datetime().optional(),
		warrantyStatus: WarrantyStatusSchema.default("na"),
		conditionForWork: z
			.union([ConditionForWorkSchema, z.literal("")])
			.optional()
			.transform((value) => value || undefined),
	})
	.strip();
export type OrderAssetDetails = z.infer<typeof OrderAssetDetailsSchema>;

export const OrderScheduleSlaSchema = z
	.object({
		scheduledStartAt: z.string().datetime().optional(),
		dueAt: z.string().datetime().optional(),
		estimatedDuration: z
			.object({
				value: z.number().positive().optional(),
				unit: z.enum(["hours", "days"]).default("hours"),
			})
			.strip()
			.default({ unit: "hours" }),
		maintenanceWindow: z
			.object({
				startTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.optional(),
				endTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.optional(),
			})
			.strip()
			.default({}),
		responseLevel: z
			.union([ResponseLevelSchema, z.literal("")])
			.optional()
			.transform((value) => value || undefined),
		recurrence: z
			.object({
				enabled: z.boolean().default(false),
				frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
				endsAt: z.string().datetime().optional(),
			})
			.strip()
			.default({ enabled: false }),
	})
	.strip();
export type OrderScheduleSla = z.infer<typeof OrderScheduleSlaSchema>;

export const OrderResourceAssignmentSchema = z
	.object({
		technicianIds: z
			.preprocess(
				(value) => (Array.isArray(value) ? value.filter((entry) => entry !== "") : value),
				z.array(ObjectIdSchema),
			)
			.default([]),
		employeeType: z
			.union([EmployeeTypeSchema, z.literal("")])
			.optional()
			.transform((value) => value || undefined),
		supervisorId: optionalObjectId(),
		hesResponsibleId: optionalObjectId(),
		requiredCertifications: z
			.preprocess(
				(value) => (Array.isArray(value) ? value.filter((entry) => entry !== "") : value),
				z.array(z.string().trim().min(1).max(120)),
			)
			.default([]),
		vehicleResourceId: optionalObjectId(),
	})
	.strip();
export type OrderResourceAssignment = z.infer<typeof OrderResourceAssignmentSchema>;

export const OrderHesSchema = z
	.object({
		requiresPTW: z.boolean().default(false),
		permitTypes: z.array(PermitTypeSchema).default([]),
		requiresAST: z.boolean().default(false),
		riskLevel: RiskLevelSchema.default("medium"),
		specificRisks: z.array(SpecificRiskSchema).default([]),
		requiresIsolation: z.boolean().default(false),
		previousPtwNumber: z.string().trim().max(120).optional(),
		safetyObservations: z.string().trim().max(3000).optional(),
		ptwDocumentId: optionalObjectId(),
	})
	.strip();
export type OrderHes = z.infer<typeof OrderHesSchema>;

export const OrderCommercialSchema = z
	.object({
		clientName: z.string().trim().max(200).optional(),
		billingAccount: z.string().trim().max(200).optional(),
		poNumber: z.string().trim().max(120).optional(),
		contractNumber: z.string().trim().max(120).optional(),
		businessUnit: z
			.union([BusinessUnitSchema, z.literal("")])
			.optional()
			.transform((value) => value || undefined),
		priceListName: z.string().trim().max(160).optional(),
		nteAmount: z.number().nonnegative().optional(),
		proposalReference: z.string().trim().max(160).optional(),
		isBillable: z.boolean().default(false),
	})
	.strip();
export type OrderCommercial = z.infer<typeof OrderCommercialSchema>;

export const AdditionalMaterialSchema = z
	.object({
		name: z.string().trim().min(1).max(200),
		quantity: z.number().positive(),
		unit: z.string().trim().min(1).max(40).default("unidad"),
	})
	.strip();
export type AdditionalMaterial = z.infer<typeof AdditionalMaterialSchema>;

export const OrderLogisticsSchema = z
	.object({
		additionalMaterials: z
			.preprocess(
				(value) =>
					Array.isArray(value)
						? value.filter(
								(entry) =>
									entry &&
									typeof entry === "object" &&
									"name" in entry &&
									String((entry as { name?: unknown }).name ?? "").trim().length > 0,
							)
						: value,
				z.array(AdditionalMaterialSchema),
			)
			.default([]),
		siteAccessNotes: z.string().trim().max(3000).optional(),
		requiresSpecialTransport: z.boolean().default(false),
		specialTransportDescription: z.string().trim().max(1000).optional(),
		specialTools: z.string().trim().max(3000).optional(),
	})
	.strip();
export type OrderLogistics = z.infer<typeof OrderLogisticsSchema>;

export const OrderReferencesSchema = z
	.object({
		attachmentDocumentIds: z
			.preprocess(
				(value) => (Array.isArray(value) ? value.filter((entry) => entry !== "") : value),
				z.array(ObjectIdSchema),
			)
			.default([]),
		relatedOrderId: optionalObjectId(),
		parentOrderId: optionalObjectId(),
		internalNotes: z.string().trim().max(3000).optional(),
		technicianInstructions: z.string().trim().max(3000).optional(),
		prerequisites: z
			.preprocess(
				(value) =>
					Array.isArray(value)
						? value.filter(
								(entry) =>
									entry &&
									typeof entry === "object" &&
									"label" in entry &&
									String((entry as { label?: unknown }).label ?? "").trim().length > 0,
							)
						: value,
				z.array(
					z
						.object({
							label: z.string().trim().min(1).max(200),
							completed: z.boolean().default(false),
						})
						.strip(),
				),
			)
			.default([]),
	})
	.strip();
export type OrderReferences = z.infer<typeof OrderReferencesSchema>;

export const EXECUTION_PHASE_VALUES = ["PRE_START", "IN_EXECUTION", "CLOSURE"] as const;

export const ExecutionPhaseTypeSchema = z.enum(EXECUTION_PHASE_VALUES);
export type ExecutionPhaseType = z.infer<typeof ExecutionPhaseTypeSchema>;

export const ExecutionPhaseSchema = z
	.object({
		current: ExecutionPhaseTypeSchema.optional(),
		preStartCompletedAt: z.string().datetime().optional(),
		preStartVerification: z
			.array(
				z.object({
					id: z.string(),
					label: z.string(),
					checked: z.boolean().default(false),
					checkedAt: z.string().datetime().optional(),
				}),
			)
			.default([]),
		inExecutionCompletedAt: z.string().datetime().optional(),
		closureCompletedAt: z.string().datetime().optional(),
	})
	.strip();
export type ExecutionPhase = z.infer<typeof ExecutionPhaseSchema>;

export const TransitionExecutionPhaseSchema = z
	.object({
		targetPhase: ExecutionPhaseTypeSchema,
	})
	.strip();
export type TransitionExecutionPhaseInput = z.infer<typeof TransitionExecutionPhaseSchema>;

export const CostBaselineSchema = z
	.object({
		proposalId: z.union([ObjectIdSchema, z.string()]),
		proposalCode: z.string(),
		subtotal: z.number().nonnegative(),
		taxRate: z.number().min(0).max(1),
		total: z.number().nonnegative(),
		items: z.array(
			z.object({
				description: z.string(),
				unit: z.string(),
				quantity: z.number(),
				unitCost: z.number(),
				total: z.number(),
			}),
		),
		poNumber: z.string().optional(),
		frozenAt: z.union([z.string().datetime(), z.date()]),
	})
	.strip();

export type CostBaseline = z.infer<typeof CostBaselineSchema>;
export type CostBaselineDocument<TID = string> = Omit<CostBaseline, "proposalId"> & {
	proposalId: TID;
};

function validateHesRules(hes: OrderHes | undefined, ctx: z.RefinementCtx): void {
	if (!hes) {
		return;
	}

	if (hes.riskLevel === "critical" && hes.requiresPTW !== true) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "PTW is required when operational risk is critical",
			path: ["hes", "requiresPTW"],
		});
	}

	if (hes.requiresPTW && hes.permitTypes.length === 0) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "At least one permit type is required when PTW is required",
			path: ["hes", "permitTypes"],
		});
	}
}

function validateCommercialRules(
	commercial: OrderCommercial | undefined,
	ctx: z.RefinementCtx,
): void {
	if (!commercial?.isBillable) {
		return;
	}

	const requiredFields = ["clientName", "billingAccount", "poNumber", "businessUnit"] as const;
	for (const field of requiredFields) {
		if (!commercial[field]) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `${field} is required when the order is billable`,
				path: ["commercial", field],
			});
		}
	}

	if (commercial.nteAmount === undefined) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "nteAmount is required when the order is billable",
			path: ["commercial", "nteAmount"],
		});
	}
}

function validateScheduleRules(
	scheduleSla: OrderScheduleSla | undefined,
	ctx: z.RefinementCtx,
): void {
	if (!scheduleSla?.recurrence.enabled) {
		return;
	}

	if (!scheduleSla.recurrence.frequency) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "frequency is required when recurrence is enabled",
			path: ["scheduleSla", "recurrence", "frequency"],
		});
	}

	if (!scheduleSla.recurrence.endsAt) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "endsAt is required when recurrence is enabled",
			path: ["scheduleSla", "recurrence", "endsAt"],
		});
	}
}

function validateEnterpriseOrderRules(
	value: {
		hes?: OrderHes;
		commercial?: OrderCommercial;
		scheduleSla?: OrderScheduleSla;
	},
	ctx: z.RefinementCtx,
): void {
	validateHesRules(value.hes, ctx);
	validateCommercialRules(value.commercial, ctx);
	validateScheduleRules(value.scheduleSla, ctx);
}

export const OrderSchema = z
	.object({
		_id: z.string(),
		code: z.string().regex(/^OT-\d{6}-\d{4}$/, "Formato: OT-YYYYMM-NNNN"),
		type: OrderTypeSchema,
		status: OrderStatusSchema,
		priority: OrderPrioritySchema,
		description: z.string().min(10).max(2000),

		// Activo / Equipo intervenido
		assetId: z.string(),
		assetName: z.string(),
		location: z.string(), // Descripción textual de la ubicación
		clientEmail: EmailSchema.optional(),
		gpsLocation: OptionalGpsLocationSchema,
		assetDetails: OrderAssetDetailsSchema.default({
			warrantyStatus: "na",
			conditionForWork: undefined,
		}),

		// Personal asignado
		assignedTo: z.string().optional(), // ObjectId del técnico
		assignedToName: z.string().optional(), // Desnormalizado para lecturas
		supervisedBy: z.string().optional(),

		// Materiales del kit típico
		materials: z.array(MaterialItemSchema).default([]),
		planning: OrderPlanningSchema.default({ supportDocumentIds: [], personnelAssignments: [] }),
		scheduleSla: OrderScheduleSlaSchema.default({
			estimatedDuration: { unit: "hours" },
			maintenanceWindow: {},
			responseLevel: undefined,
			recurrence: { enabled: false },
		}),
		resourceAssignment: OrderResourceAssignmentSchema.default({
			technicianIds: [],
			employeeType: undefined,
			supervisorId: undefined,
			hesResponsibleId: undefined,
			requiredCertifications: [],
			vehicleResourceId: undefined,
		}),
		hes: OrderHesSchema.default({
			requiresPTW: false,
			permitTypes: [],
			requiresAST: false,
			riskLevel: "medium",
			specificRisks: [],
			requiresIsolation: false,
			ptwDocumentId: undefined,
		}),
		commercial: OrderCommercialSchema.default({ isBillable: false, businessUnit: undefined }),
		logistics: OrderLogisticsSchema.default({
			additionalMaterials: [],
			requiresSpecialTransport: false,
		}),
		references: OrderReferencesSchema.default({
			attachmentDocumentIds: [],
			relatedOrderId: undefined,
			parentOrderId: undefined,
			prerequisites: [],
		}),

		// Campos de cierre
		startedAt: z.string().datetime().optional(),
		completedAt: z.string().datetime().optional(),
		observations: z.string().max(3000).optional(),
		invoiceReady: z.boolean().default(false),
		reportGenerated: z.boolean().default(false),
		reportPdfGenerated: z.boolean().optional(),
		hasApprovedReport: z.boolean().optional(),
		billing: OrderBillingSchema.default({
			sesStatus: "pending",
			invoiceStatus: "pending",
		}),

		// Ejecución por fases
		executionPhase: ExecutionPhaseSchema.default({ preStartVerification: [] }),

		// Línea base de costos (congelada de propuesta)
		costBaseline: CostBaselineSchema.optional(),
		archived: z.boolean().default(false),

		// Trazabilidad
		proposalId: z.string().optional(), // Vinculación con Propuesta
		poNumber: z.string().trim().optional(),
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),

		// Campos extendidos (SLA, seguimiento)
		followUpWorkOrderId: z.string().optional(),
		dueDate: z.string().datetime().optional(),
		slaDueDate: z.string().datetime().optional(),
		slaStatus: z.string().optional(),
		workPerformed: z.string().optional(),
		customerFeedback: z.string().optional(),
	})
	.strip();
export type Order = z.infer<typeof OrderSchema>;

const BaseCreateOrderSchema = OrderSchema.omit({
	_id: true,
	code: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	reportGenerated: true,
	reportPdfGenerated: true,
	hasApprovedReport: true,
	invoiceReady: true,
	createdBy: true,
	planning: true,
	billing: true,
	costBaseline: true,
}).extend({
	// Permite especificar un kit template por nombre (legacy) o por ID
	kitTemplate: z.string().optional(),
	kitTemplateId: z.string().optional(),
	costBaseline: CostBaselineSchema.optional(),
});

export const CreateOrderSchema = BaseCreateOrderSchema.superRefine(validateEnterpriseOrderRules);
export type CreateOrderInput = z.input<typeof CreateOrderSchema>;

export const UpdateOrderSchema = BaseCreateOrderSchema.pick({
	description: true,
	location: true,
	priority: true,
	assetDetails: true,
	scheduleSla: true,
	resourceAssignment: true,
	hes: true,
	commercial: true,
	logistics: true,
	references: true,
})
	.partial()
	.extend({
		observations: z.string().max(3000).optional(),
	})
	.strip();
export type UpdateOrderInput = z.input<typeof UpdateOrderSchema>;

export const UpdateOrderPlanningSchema = z
	.object({
		scheduledStartAt: z.string().datetime().optional(),
		estimatedHours: z.number().positive().optional(),
		crewSize: z.number().int().min(1).optional(),
		kitTemplateId: z.string().min(1).optional(),
		kitSnapshot: OrderPlanningKitSnapshotSchema.optional(),
		personnelAssignments: z.array(PersonnelAssignmentSchema).optional(),
		astDocumentId: ObjectIdSchema.optional(),
		supportDocumentIds: z.array(ObjectIdSchema).default([]).optional(),
	})
	.strip();
export type UpdateOrderPlanningInput = z.infer<typeof UpdateOrderPlanningSchema>;

export const UpdateOrderBillingSchema = z
	.object({
		sesNumber: z.string().trim().optional(),
		sesStatus: OrderBillingSesStatusSchema.optional(),
		invoiceNumber: z.string().trim().optional(),
		invoiceStatus: OrderBillingInvoiceStatusSchema.optional(),
		billingNotes: z.string().max(3000).optional(),
	})
	.strip();
export type UpdateOrderBillingInput = z.infer<typeof UpdateOrderBillingSchema>;

export const BatchCloseOrdersSchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1),
		sesNumber: z.string().trim().optional(),
		billingNotes: z.string().max(3000).optional(),
	})
	.strip();
export type BatchCloseOrdersInput = z.infer<typeof BatchCloseOrdersSchema>;

export const BatchRegisterSesSchema = z
	.object({
		orders: z
			.array(
				z
					.object({
						orderId: ObjectIdSchema,
						sesNumber: z.string().trim().min(1).max(120),
					})
					.strict(),
			)
			.min(1),
	})
	.strict();
export type BatchRegisterSesInput = z.infer<typeof BatchRegisterSesSchema>;

export const CreateDeliveryRecordSchema = z
	.object({
		title: z.string().trim().min(1).max(200).default("Acta de entrega"),
		fileUrl: z.string().trim().min(1).optional(),
		signed: z.boolean().default(false),
	})
	.strict();
export type CreateDeliveryRecordInput = z.infer<typeof CreateDeliveryRecordSchema>;

export const BatchMarkReadyForInvoicingSchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1),
	})
	.strip();
export type BatchMarkReadyForInvoicingInput = z.infer<typeof BatchMarkReadyForInvoicingSchema>;

export const BatchUpdateStatusSchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1).max(50),
		status: OrderStatusSchema,
		reason: z.string().trim().max(500).optional(),
	})
	.strip();
export type BatchUpdateStatusInput = z.infer<typeof BatchUpdateStatusSchema>;

export const BatchUpdatePrioritySchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1).max(50),
		priority: OrderPrioritySchema,
		reason: z.string().trim().max(500).optional(),
	})
	.strip();
export type BatchUpdatePriorityInput = z.infer<typeof BatchUpdatePrioritySchema>;

export const BatchAssignOrdersSchema = z
	.object({
		orderIds: z.array(ObjectIdSchema).min(1).max(50),
		userId: ObjectIdSchema,
		reason: z.string().trim().max(500).optional(),
	})
	.strip();
export type BatchAssignOrdersInput = z.infer<typeof BatchAssignOrdersSchema>;

export const UpdateOrderStatusSchema = z.object({
	status: OrderStatusSchema,
	observations: z.string().max(3000).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

/**
 * Nuevo contrato para endpoint de transición.
 * - `toStatus`: forma recomendada.
 * - `status`: compatibilidad con endpoint/body legado.
 */
export const TransitionOrderStatusSchema = z
	.object({
		toStatus: OrderStatusSchema.optional(),
		status: OrderStatusSchema.optional(),
		observations: z.string().max(3000).optional(),
	})
	.strip()
	.superRefine((value, ctx) => {
		if (!value.toStatus && !value.status) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "toStatus or status is required",
				path: ["toStatus"],
			});
		}
	})
	.transform(({ toStatus, status, observations }) => {
		const resolvedStatus = toStatus ?? status;

		if (!resolvedStatus) {
			throw new Error("toStatus or status is required");
		}

		return {
			status: resolvedStatus,
			observations,
		};
	});
export type TransitionOrderStatusInput = z.infer<typeof TransitionOrderStatusSchema>;

/**
 * Schema para parámetros de ruta que requieren ID de orden
 * Usado con validateParams middleware
 */
export const OrderIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strip();
export type OrderIdParams = z.infer<typeof OrderIdSchema>;

/**
 * Schema para asignar orden a un usuario
 * Usado en PATCH /api/orders/:id/assign
 */
export const AssignOrderSchema = z
	.object({
		userId: ObjectIdSchema,
	})
	.strip();
export type AssignOrderInput = z.infer<typeof AssignOrderSchema>;

export const UpdatePreStartVerificationSchema = z
	.object({
		items: z.array(
			z.object({
				id: z.string(),
				checked: z.boolean(),
			}),
		),
	})
	.strip();
export type UpdatePreStartVerificationInput = z.infer<typeof UpdatePreStartVerificationSchema>;

export const OrderListQuerySchema = z
	.object({
		status: z.preprocess(normalizeQueryArray, z.array(OrderStatusSchema).optional()),
		priority: z.preprocess(normalizeQueryArray, z.array(OrderPrioritySchema).optional()),
		assignedTo: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		technicianId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		type: z.preprocess(normalizeQueryArray, z.array(OrderTypeSchema).optional()),
		dateFrom: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		dateTo: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
		cursor: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		pagination: z.preprocess(
			normalizeOptionalStringQueryValue,
			z.enum(["offset", "cursor"]).optional(),
		),
	})
	.strip();

export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;

/**
 * Mongoose Document representation for Work Order.
 * Used for type safety in backend services and repositories.
 */
export interface OrderDocument<TID = string>
	extends AuditableDocument<TID>,
		SoftDeleteDocument<TID> {
	code: string;
	type: OrderType;
	status: OrderStatus;
	priority: OrderPriority;
	description: string;
	assetId: string;
	assetName: string;
	location: string;
	clientEmail?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt: Date;
	};
	assetDetails?: Omit<OrderAssetDetails, "lastInterventionAt"> & {
		lastInterventionAt?: Date;
	};
	assignedTo?: TID;
	assignedToName?: string;
	supervisedBy?: TID;
	materials: MaterialItem[];
	scheduleSla?: Omit<OrderScheduleSla, "scheduledStartAt" | "dueAt" | "recurrence"> & {
		scheduledStartAt?: Date;
		dueAt?: Date;
		recurrence: Omit<OrderScheduleSla["recurrence"], "endsAt"> & { endsAt?: Date };
	};
	resourceAssignment?: Omit<
		OrderResourceAssignment,
		"technicianIds" | "supervisorId" | "hesResponsibleId" | "vehicleResourceId"
	> & {
		technicianIds: TID[];
		supervisorId?: TID;
		hesResponsibleId?: TID;
		vehicleResourceId?: TID;
	};
	hes?: Omit<OrderHes, "ptwDocumentId"> & {
		ptwDocumentId?: TID;
	};
	commercial?: OrderCommercial;
	logistics?: OrderLogistics;
	references?: Omit<
		OrderReferences,
		"attachmentDocumentIds" | "relatedOrderId" | "parentOrderId"
	> & {
		attachmentDocumentIds: TID[];
		relatedOrderId?: TID;
		parentOrderId?: TID;
	};
	planning: {
		scheduledStartAt?: Date;
		estimatedHours?: number;
		crewSize?: number;
		kitTemplateId?: string;
		kitSnapshot?: {
			kitTemplateId: string;
			name: string;
			activityType?: string;
			tools: Array<{
				name: string;
				quantity: number;
				specifications?: string;
				confirmedAvailable?: boolean;
			}>;
			equipment: Array<{
				name: string;
				quantity: number;
				certificateRequired: boolean;
				confirmedAvailable?: boolean;
			}>;
			assignmentRules?: {
				requiredSpecialty?: string;
				requiredCertifications: string[];
				minimumPeople: number;
				requiresOnSiteSupervisor: boolean;
			};
		};
		personnelAssignments?: Array<{
			technicianId: TID;
			name: string;
			role: string;
			requiredCertifications: string[];
			estimatedHours?: number;
		}>;
		astDocumentId?: TID;
		supportDocumentIds: TID[];
		planningReadyAt?: Date;
		planningReadyBy?: TID;
	};
	startedAt?: Date;
	completedAt?: Date;
	observations?: string;
	invoiceReady: boolean;
	reportGenerated: boolean;
	reportPdfGenerated?: boolean;
	hasApprovedReport?: boolean;
	poNumber?: string;
	dueDate?: Date;
	slaDueDate?: Date;
	billing: {
		sesNumber?: string;
		sesStatus: OrderBillingSesStatus;
		sesApprovedAt?: Date;
		invoiceNumber?: string;
		invoiceStatus: OrderBillingInvoiceStatus;
		invoiceApprovedAt?: Date;
		paidAt?: Date;
		billingNotes?: string;
	};
	executionPhase: {
		current?: ExecutionPhaseType;
		preStartCompletedAt?: Date;
		preStartVerification: Array<{
			id: string;
			label: string;
			checked: boolean;
			checkedAt?: Date;
		}>;
		inExecutionCompletedAt?: Date;
		closureCompletedAt?: Date;
	};
	proposalId?: TID;
	costBaseline?: CostBaselineDocument<TID>;
}

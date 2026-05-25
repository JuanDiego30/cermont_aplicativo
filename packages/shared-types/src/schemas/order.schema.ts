import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { CustomFieldValuesSchema } from "./custom-field.schema";

const normalizeQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);
const normalizeOptionalStringQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized !== "string") {
		return normalized;
	}

	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const ORDER_STATUS_VALUES = [
	"open",
	"proposal_sent",
	"proposal_approved",
	"planning",
	"assigned",
	"ready_for_execution",
	"execution_in_progress",
	"execution_completed",
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

const ORDER_STATUS_LEGACY_ALIASES: Record<string, (typeof ORDER_STATUS_VALUES)[number]> = {
	"in-progress": "in_progress",
	"on-hold": "on_hold",
	"ready-for-invoicing": "ready_for_invoicing",
	ready_for_invoice: "ready_for_invoicing",
	canceled: "cancelled",
};

/**
 * Normaliza estados legacy/alternativos a los valores canónicos del sistema.
 */
export function normalizeOrderStatus(value: unknown): unknown {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return trimmed;
	}

	return ORDER_STATUS_LEGACY_ALIASES[trimmed] ?? trimmed;
}

const CanonicalOrderStatusSchema = z.enum(ORDER_STATUS_VALUES);
export const OrderStatusSchema = CanonicalOrderStatusSchema;
export type OrderStatus = z.infer<typeof CanonicalOrderStatusSchema>;

export const OrderPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type OrderPriority = z.infer<typeof OrderPrioritySchema>;

export const OrderTypeSchema = z.enum([
	"maintenance", // Mantenimiento preventivo/correctivo
	"inspection", // Inspección de seguridad (HES)
	"installation", // Instalación de equipos
	"repair", // Reparación de emergencia
	"decommission", // Descomisionamiento
	"other", // Otro (especificar en customFields)
]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

const MaterialItemSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().positive(),
	unit: z.string().min(1),
	unitCost: z.number().nonnegative().optional(),
	delivered: z.boolean().default(false),
});

const GpsLocationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	accuracy: z.number().optional(), // Metros de precisión GPS
	capturedAt: z.string().datetime(),
});

const CostBaselineItemSchema = z
	.object({
		description: z.string().min(1),
		unit: z.string().min(1),
		quantity: z.number().positive(),
		unitCost: z.number().nonnegative(),
		total: z.number().nonnegative(),
	})
	.strict();

export const CostBaselineSchema = z
	.object({
		proposalId: ObjectIdSchema,
		proposalCode: z.string().min(1),
		subtotal: z.number().nonnegative(),
		taxRate: z.number().min(0).max(1),
		total: z.number().nonnegative(),
		items: z.array(CostBaselineItemSchema).default([]),
		frozenAt: z.string().datetime(),
	})
	.strict();
export type CostBaseline = z.infer<typeof CostBaselineSchema>;

export const ExecutionPhaseTypeSchema = z.enum(["PRE_START", "IN_EXECUTION", "CLOSURE"]);
export type ExecutionPhaseType = z.infer<typeof ExecutionPhaseTypeSchema>;

export const ExecutionPhaseSchema = z
	.object({
		current: ExecutionPhaseTypeSchema.optional(),
		preStartVerification: z.array(z.string()).default([]),
		preStartCompletedAt: z.string().datetime().optional(),
		inExecutionCompletedAt: z.string().datetime().optional(),
		closureCompletedAt: z.string().datetime().optional(),
	})
	.strip();
export type ExecutionPhase = z.infer<typeof ExecutionPhaseSchema>;

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
		gpsLocation: GpsLocationSchema.optional(),

		// Personal asignado
		assignedTo: z.string().optional(), // ObjectId del técnico
		assignedToName: z.string().optional(), // Desnormalizado para lecturas
		supervisedBy: z.string().optional(),

		// Materiales del kit típico
		materials: z.array(MaterialItemSchema).default([]),

		// Campos de cierre
		startedAt: z.string().datetime().optional(),
		completedAt: z.string().datetime().optional(),
		observations: z.string().max(3000).optional(),
		invoiceReady: z.boolean().default(false),
		reportGenerated: z.boolean().default(false),

		// Trazabilidad
		proposalId: z.string().optional(), // Vinculación con Propuesta
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),

		// Extended fields used by frontend
		dueDate: z.string().optional(), // Fecha de vencimiento
		slaDueDate: z.string().optional(), // Fecha límite SLA
		executionPhase: ExecutionPhaseSchema.default({ preStartVerification: [] }),
		costBaseline: CostBaselineSchema.optional(),
		customFields: CustomFieldValuesSchema,
	})
	.strip();
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = OrderSchema.omit({
	_id: true,
	code: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	reportGenerated: true,
	invoiceReady: true,
	createdBy: true,
}).extend({
	// Permite especificar un kit template por nombre
	kitTemplate: z.string().optional(),
});
export type CreateOrderInput = z.input<typeof CreateOrderSchema>;

export const UpdateOrderSchema = CreateOrderSchema.pick({
	description: true,
	location: true,
	priority: true,
})
	.partial()
	.extend({
		observations: z.string().max(3000).optional(),
	})
	.strip();
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;

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

export const OrderListQuerySchema = z
	.object({
		status: z.preprocess(normalizeOptionalStringQueryValue, OrderStatusSchema.optional()),
		priority: z.preprocess(normalizeOptionalStringQueryValue, OrderPrioritySchema.optional()),
		assignedTo: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();

export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;

// ============================================================================
// Additional Order Types (missing and causing frontend errors)
// ============================================================================

/**
 * Kit snapshot for order planning
 */
export const PlanningKitSnapshotSchema = z.object({
	kitId: z.string(),
	kitName: z.string(),
	items: z.array(
		z.object({
			name: z.string(),
			quantity: z.number(),
			unit: z.string(),
		}),
	),
});
export type PlanningKitSnapshot = z.infer<typeof PlanningKitSnapshotSchema>;

// Alias for frontend compatibility
export const OrderPlanningKitSnapshotSchema = PlanningKitSnapshotSchema;
export type OrderPlanningKitSnapshot = z.infer<typeof OrderPlanningKitSnapshotSchema>;

/**
 * Update order billing schema
 */
export const UpdateOrderBillingSchema = z.object({
	invoiceNumber: z.string().optional(),
	invoiceDate: z.string().datetime().optional(),
	invoiceAmount: z.number().nonnegative().optional(),
	paymentReference: z.string().optional(),
	paymentDate: z.string().datetime().optional(),
});
export type UpdateOrderBillingInput = z.infer<typeof UpdateOrderBillingSchema>;

/**
 * Update order planning schema
 */
export const UpdateOrderPlanningSchema = z.object({
	assignedTo: ObjectIdSchema.optional(),
	scheduledStartAt: z.string().datetime().optional(),
	scheduledEndAt: z.string().datetime().optional(),
	kitTemplate: z.string().optional(),
	kitSnapshot: PlanningKitSnapshotSchema.optional(),
});
export type UpdateOrderPlanningInput = z.infer<typeof UpdateOrderPlanningSchema>;

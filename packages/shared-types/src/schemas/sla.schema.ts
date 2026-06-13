import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { WorkRequestUrgencySchema } from "./work-request.schema";

export const SlaPrioritySchema = WorkRequestUrgencySchema;
export type SlaPriority = z.infer<typeof SlaPrioritySchema>;

export const SlaStatusSchema = z.enum(["active", "breached", "at_risk", "resolved", "escalated"]);

export type SlaStatus = z.infer<typeof SlaStatusSchema>;

export const SlaConfigSchema = z
	.object({
		serviceType: z.string().trim().min(1).max(120),
		clientId: ObjectIdSchema.optional(),
		priority: SlaPrioritySchema,
		responseHours: z.number().int().min(1).max(8760),
		resolutionHours: z.number().int().min(1).max(8760),
		escalationHours: z.number().int().min(1).max(8760),
		penaltyRate: z.number().min(0).max(1).optional(),
		description: z.string().trim().max(300).optional(),
		isActive: z.boolean(),
	})
	.strict()
	.superRefine((config, context) => {
		if (config.responseHours > config.resolutionHours) {
			context.addIssue({
				code: "custom",
				path: ["responseHours"],
				message: "responseHours cannot exceed resolutionHours",
			});
		}
		if (config.escalationHours >= config.resolutionHours) {
			context.addIssue({
				code: "custom",
				path: ["escalationHours"],
				message: "escalationHours must be lower than resolutionHours",
			});
		}
	});

export type SlaConfig = z.infer<typeof SlaConfigSchema>;

export const UpdateSlaConfigsSchema = z
	.object({
		configs: z.array(SlaConfigSchema).min(1).max(200),
	})
	.strict();

export const SlaTrackingQuerySchema = z
	.object({
		status: SlaStatusSchema.optional(),
	})
	.strict();

export const SlaTrackingIdParamsSchema = z
	.object({
		trackingId: ObjectIdSchema,
	})
	.strict();

export const EscalateSlaTrackingSchema = z
	.object({
		reason: z.string().trim().min(5).max(300),
	})
	.strict();

export const SlaServiceCaseSummarySchema = z.object({
	_id: ObjectIdSchema,
	code: z.string(),
	clientName: z.string(),
});

export const SlaTrackingSchema = z.object({
	_id: ObjectIdSchema,
	serviceCaseId: z.union([ObjectIdSchema, SlaServiceCaseSummarySchema]),
	serviceType: z.string(),
	priority: SlaPrioritySchema,
	assignedAt: z.string().datetime(),
	responseDeadline: z.string().datetime(),
	escalationDeadline: z.string().datetime(),
	resolutionDeadline: z.string().datetime(),
	firstResponseAt: z.string().datetime().optional(),
	resolvedAt: z.string().datetime().optional(),
	status: SlaStatusSchema,
	currentStep: z.string(),
	breachReason: z.string().optional(),
	escalationLevel: z.number().int().min(0),
});

export type SlaTracking = z.infer<typeof SlaTrackingSchema>;

export const SlaDashboardSchema = z.object({
	summary: z.object({
		active: z.number().int().min(0),
		breached: z.number().int().min(0),
		atRisk: z.number().int().min(0),
		resolved: z.number().int().min(0),
		escalated: z.number().int().min(0),
		total: z.number().int().min(0),
		complianceRate: z.number().min(0).max(100),
	}),
	breaching: z.array(SlaTrackingSchema),
});

export type SlaDashboard = z.infer<typeof SlaDashboardSchema>;

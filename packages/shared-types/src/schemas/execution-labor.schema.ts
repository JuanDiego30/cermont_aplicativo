import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

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

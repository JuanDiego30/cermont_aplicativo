import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { FieldSignatureSchema } from "./execution-signature.schema";

/**
 * PTW (Permiso de Trabajo) Schema
 *
 * Digital version of the field work permit required before executing
 * high-risk activities (hot work, heights, confined spaces, electrical).
 *
 * Aligned with CERMONT HES permit categories:
 * - Trabajo en frío
 * - Trabajo en caliente
 * - Trabajo eléctrico en frío
 * - Trabajo eléctrico en caliente
 * - Trabajo simplificado
 */
export const PTWCategorySchema = z.enum([
	"frio",
	"caliente",
	"electrico_frio",
	"electrico_caliente",
	"simplificado",
]);
export type PTWCategory = z.infer<typeof PTWCategorySchema>;

export const PTWStatusSchema = z.enum(["draft", "issued", "active", "closed", "cancelled"]);
export type PTWStatus = z.infer<typeof PTWStatusSchema>;

export const PTWRiskSchema = z
	.object({
		description: z.string().min(1).max(300),
		category: z.enum([
			"mecanico",
			"electrico",
			"quimico",
			"biologico",
			"fisico",
			"ergonomico",
			"psicosocial",
		]),
		probability: z.enum(["baja", "media", "alta"]),
		severity: z.enum(["baja", "media", "alta"]),
		controlMeasure: z.string().min(1).max(500),
	})
	.strict();

export type PTWRisk = z.infer<typeof PTWRiskSchema>;

export const PTWSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		category: PTWCategorySchema,
		status: PTWStatusSchema.default("draft"),
		area: z.string().min(1).max(200),
		description: z.string().min(1).max(500),
		risks: z.array(PTWRiskSchema).default([]),
		requiredPPE: z.array(z.string()).default([]),
		validFrom: z.string().datetime(),
		validUntil: z.string().datetime(),
		issuedBy: ObjectIdSchema,
		issuedTo: z.array(ObjectIdSchema).default([]),
		supervisorSignature: FieldSignatureSchema.optional(),
		hesSignature: FieldSignatureSchema.optional(),
		closureNotes: z.string().max(500).optional(),
		closedAt: z.string().datetime().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type PTW = z.infer<typeof PTWSchema>;

export const CreatePTWSchema = z.object({
	category: PTWCategorySchema,
	area: z.string().min(1).max(200),
	description: z.string().min(1).max(500),
	risks: z.array(PTWRiskSchema).default([]),
	requiredPPE: z.array(z.string()).default([]),
	validFrom: z.string().datetime(),
	validUntil: z.string().datetime(),
	supervisorSignature: FieldSignatureSchema.optional(),
});

export type CreatePTW = z.infer<typeof CreatePTWSchema>;

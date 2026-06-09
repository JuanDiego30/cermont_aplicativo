import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { FieldSignatureSchema } from "./execution-signature.schema";

/**
 * AST (Análisis de Seguridad en el Trabajo) Schema
 *
 * Digital version of the Job Safety Analysis (JSA / ATS) form.
 * Each step of the task is broken down with identified hazards
 * and required control measures.
 *
 * Used during execution step (step 6) for field safety briefing.
 */
export const ASTStatusSchema = z.enum(["draft", "reviewed", "approved", "completed", "cancelled"]);
export type ASTStatus = z.infer<typeof ASTStatusSchema>;

export const ASTStepSchema = z
	.object({
		stepNumber: z.number().int().positive(),
		taskDescription: z.string().min(1).max(500),
		hazards: z.array(z.string().min(1).max(200)).default([]),
		controls: z.array(z.string().min(1).max(300)).default([]),
		responsible: z.string().min(1).max(200).optional(),
	})
	.strict();

export type ASTStep = z.infer<typeof ASTStepSchema>;

export const ASTSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		status: ASTStatusSchema.default("draft"),
		workDescription: z.string().min(1).max(500),
		location: z.string().min(1).max(200),
		date: z.string().datetime(),
		crewLeader: z.string().min(1).max(200),
		crewMembers: z.array(z.string()).default([]),
		steps: z.array(ASTStepSchema).default([]),
		additionalControls: z.string().max(500).optional(),
		ppeRequired: z.array(z.string()).default([]),
		emergencyPlan: z.string().max(500).optional(),
		elaboratedBy: FieldSignatureSchema.optional(),
		reviewedBy: FieldSignatureSchema.optional(),
		approvedBy: FieldSignatureSchema.optional(),
		socializedAt: z.string().datetime().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type AST = z.infer<typeof ASTSchema>;

export const CreateASTSchema = z.object({
	workDescription: z.string().min(1).max(500),
	location: z.string().min(1).max(200),
	date: z.string().datetime(),
	crewLeader: z.string().min(1).max(200),
	crewMembers: z.array(z.string()).default([]),
	steps: z.array(ASTStepSchema).default([]),
	ppeRequired: z.array(z.string()).default([]),
});

export type CreateAST = z.infer<typeof CreateASTSchema>;

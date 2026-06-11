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
		executionSessionId: ObjectIdSchema.optional(),
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
	orderId: ObjectIdSchema,
	executionSessionId: ObjectIdSchema.optional(),
	workDescription: z.string().min(1).max(500),
	location: z.string().min(1).max(200),
	date: z.string().datetime(),
	crewLeader: z.string().min(1).max(200),
	crewMembers: z.array(z.string()).default([]),
	steps: z.array(ASTStepSchema).default([]),
	additionalControls: z.string().max(500).optional(),
	ppeRequired: z.array(z.string()).default([]),
	emergencyPlan: z.string().max(500).optional(),
});

export type CreateAST = z.infer<typeof CreateASTSchema>;

export const UpdateASTSchema = CreateASTSchema.partial().omit({ orderId: true });
export type UpdateAST = z.infer<typeof UpdateASTSchema>;

export const ASTIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export const ListASTQuerySchema = z
	.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(100).default(20),
		orderId: ObjectIdSchema.optional(),
		status: ASTStatusSchema.optional(),
	})
	.strict();
export type ListASTQuery = z.infer<typeof ListASTQuerySchema>;

export const SignASTSchema = z
	.object({
		role: z.enum(["elaborated", "reviewed", "approved"]),
		signedByName: z.string().min(1).max(200),
		signatureUrl: z.string().url().optional(),
	})
	.strict();
export type SignAST = z.infer<typeof SignASTSchema>;

/** Valid AST status transitions (FSM) */
export const AST_STATUS_TRANSITIONS: Record<ASTStatus, readonly ASTStatus[]> = {
	draft: ["reviewed", "cancelled"],
	reviewed: ["approved", "draft", "cancelled"],
	approved: ["completed", "cancelled"],
	completed: [],
	cancelled: [],
};

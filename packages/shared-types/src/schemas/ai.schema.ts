import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Assistant Message — Individual message in a conversation thread
// ──────────────────────────────────────────────────────────────────────────────

export const AssistantMessageSchema = z
	.object({
		role: z.enum(["user", "assistant", "system"]),
		content: z.string().min(1).max(8000),
		timestamp: z.string().datetime(),
		metadata: z
			.object({
				suggestedActions: z.array(z.string().max(100)).optional(),
				blockers: z.array(z.string().max(200)).optional(),
				stepKey: CermontOperationalStepCodeSchema.optional(),
				confidence: z.number().min(0).max(1).optional(),
			})
			.optional(),
	})
	.strict();

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Assistant Thread — Conversation thread tied to a ServiceCase
// ──────────────────────────────────────────────────────────────────────────────

export const AssistantThreadSchema = z
	.object({
		_id: ObjectIdSchema,
		threadId: z.string().min(1).max(64),
		serviceCaseId: ObjectIdSchema,
		userId: ObjectIdSchema,
		currentStepKey: CermontOperationalStepCodeSchema,
		messages: z.array(AssistantMessageSchema).default([]),
		context: z
			.object({
				blockers: z.array(z.string().max(200)).default([]),
				allowedActions: z.array(z.string().max(100)).default([]),
				stepRequirements: z.record(z.string(), z.unknown()).default({}),
				userRole: UserRoleSchema,
				serviceCaseCode: z.string().max(40).optional(),
				clientName: z.string().max(200).optional(),
			})
			.default({
				blockers: [],
				allowedActions: [],
				stepRequirements: {},
				userRole: "cliente",
			}),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type AssistantThread = z.infer<typeof AssistantThreadSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Assistant Chat Request — Input for sending a message
// ──────────────────────────────────────────────────────────────────────────────

export const AssistantChatRequestSchema = z
	.object({
		serviceCaseId: z.string().min(1).max(64),
		message: z.string().min(1).max(4000).trim(),
		threadId: z.string().max(64).optional(),
		currentModule: z.string().max(100).optional(),
	})
	.strict();

export type AssistantChatRequest = z.infer<typeof AssistantChatRequestSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Assistant Chat Response — Output from the assistant
// ──────────────────────────────────────────────────────────────────────────────

export const AssistantChatResponseSchema = z
	.object({
		threadId: z.string().min(1).max(64),
		reply: z.string().min(1).max(8000),
		suggestedActions: z.array(z.string().max(100)).optional(),
		blockers: z.array(z.string().max(200)).optional(),
		currentStepKey: CermontOperationalStepCodeSchema.optional(),
	})
	.strict();

export type AssistantChatResponse = z.infer<typeof AssistantChatResponseSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Assistant Status — Health/status endpoint
// ──────────────────────────────────────────────────────────────────────────────

export const AssistantStatusSchema = z
	.object({
		success: z.literal(true),
		status: z.enum(["available", "unavailable", "degraded"]),
		version: z.string().max(20),
		capabilities: z.array(z.string().max(50)),
		message: z.string().max(500),
	})
	.strict();

export type AssistantStatus = z.infer<typeof AssistantStatusSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// AI Error Response — Standardized error for AI endpoints
// ──────────────────────────────────────────────────────────────────────────────

export const AIErrorResponseSchema = z
	.object({
		success: z.literal(false),
		error: z.object({
			code: z.enum([
				"AI_SERVICE_UNAVAILABLE",
				"INVALID_SERVICE_CASE",
				"UNAUTHORIZED",
				"RATE_LIMITED",
				"THREAD_NOT_FOUND",
				"INTERNAL_ERROR",
			]),
			message: z.string().max(500),
			details: z.record(z.string(), z.unknown()).optional(),
		}),
	})
	.strict();

export type AIErrorResponse = z.infer<typeof AIErrorResponseSchema>;

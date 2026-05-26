import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Delivery Package ─────────────────────────────────────────────────────────

export const DeliveryPackageStatusEnum = z.enum([
	"draft",
	"packaging",
	"ready",
	"sending",
	"sent",
	"delivered",
	"failed",
]);

export const DeliveryPackageSchema = z.object({
	_id: ObjectIdSchema,
	orderId: ObjectIdSchema,
	name: z.string().min(1),
	description: z.string().optional(),
	documentIds: z.array(z.string()),
	evidenceIds: z.array(z.string()),
	status: DeliveryPackageStatusEnum,
	zipPath: z.string().optional(),
	zipSize: z.number().optional(),
	recipients: z.array(
		z.object({
			email: z.string().email(),
			name: z.string(),
			role: z.string().optional(),
		}),
	),
	sentAt: z.string().datetime().optional(),
	deliveredAt: z.string().datetime().optional(),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type DeliveryPackage = z.infer<typeof DeliveryPackageSchema>;

// ─── Email Delivery Record ───────────────────────────────────────────────────

export const EmailDeliveryRecordSchema = z.object({
	_id: ObjectIdSchema,
	packageId: ObjectIdSchema,
	recipientEmail: z.string().email(),
	subject: z.string().min(1),
	status: z.enum(["pending", "sent", "delivered", "opened", "clicked", "failed"]),
	providerMessageId: z.string().optional(),
	errorMessage: z.string().optional(),
	sentAt: z.string().datetime(),
});

export type EmailDeliveryRecord = z.infer<typeof EmailDeliveryRecordSchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateDeliveryPackageSchema = z.object({
	orderId: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	documentIds: z.array(z.string()).default([]),
	evidenceIds: z.array(z.string()).default([]),
	recipients: z.array(
		z.object({
			email: z.string().email(),
			name: z.string(),
			role: z.string().optional(),
		}),
	),
});

export type CreateDeliveryPackageInput = z.infer<typeof CreateDeliveryPackageSchema>;

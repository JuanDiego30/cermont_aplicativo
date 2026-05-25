import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Purchase Order Authorization
// Bridges the commercial approval (Proposal approved) to an executable work order.
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Section 2A
// ──────────────────────────────────────────────────────────────────────────────

export const PURCHASE_ORDER_STATUS_VALUES = ["pending", "approved", "rejected"] as const;
export const PURCHASE_ORDER_PERSISTED_STATUS_VALUES = [
	...PURCHASE_ORDER_STATUS_VALUES,
	"received",
	"validated",
] as const;

const PURCHASE_ORDER_STATUS_LEGACY_ALIASES = {
	received: "pending",
	validated: "approved",
} as const satisfies Record<string, (typeof PURCHASE_ORDER_STATUS_VALUES)[number]>;

export function normalizePurchaseOrderStatus(value: unknown): unknown {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return trimmed;
	}

	if (trimmed === "received" || trimmed === "validated") {
		return PURCHASE_ORDER_STATUS_LEGACY_ALIASES[trimmed];
	}

	return trimmed;
}

const CanonicalPurchaseOrderStatusSchema = z.enum(PURCHASE_ORDER_STATUS_VALUES);
export const PurchaseOrderStatusSchema = z.preprocess(
	normalizePurchaseOrderStatus,
	CanonicalPurchaseOrderStatusSchema,
);
export type PurchaseOrderStatus = z.infer<typeof CanonicalPurchaseOrderStatusSchema>;

const PO_CURRENCY_VALUES = ["COP", "USD", "EUR"] as const;

export const PurchaseOrderCurrencySchema = z.enum(PO_CURRENCY_VALUES);
export type PurchaseOrderCurrency = z.infer<typeof PurchaseOrderCurrencySchema>;

export const PurchaseOrderAttachmentSchema = z
	.object({
		url: z.string().url(),
		filename: z.string().min(1).max(255),
		uploadedAt: z.string().datetime(),
	})
	.strict();

export type PurchaseOrderAttachment = z.infer<typeof PurchaseOrderAttachmentSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Main entity schema
// ──────────────────────────────────────────────────────────────────────────────

export const PurchaseOrderAuthorizationSchema = z
	.object({
		_id: ObjectIdSchema,
		proposalId: ObjectIdSchema,
		poNumber: z.string().min(1).max(100),
		contractReference: z.string().max(150).optional(),
		serviceAccount: z.string().min(1).max(100),
		billingAccount: z.string().min(1).max(100),
		approvedAmount: z.number().positive(),
		currency: PurchaseOrderCurrencySchema,
		receivedAt: z.string().datetime(),
		attachments: z.array(PurchaseOrderAttachmentSchema).default([]),
		validatedBy: ObjectIdSchema.optional(),
		status: PurchaseOrderStatusSchema,
		rejectionReason: z.string().max(500).optional(),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type PurchaseOrderAuthorization = z.infer<typeof PurchaseOrderAuthorizationSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Command schemas
// ──────────────────────────────────────────────────────────────────────────────

export const RegisterPurchaseOrderSchema = z
	.object({
		proposalId: ObjectIdSchema,
		poNumber: z.string().min(1).max(100),
		contractReference: z.string().max(150).optional(),
		serviceAccount: z.string().min(1).max(100),
		billingAccount: z.string().min(1).max(100),
		approvedAmount: z.number().positive(),
		currency: PurchaseOrderCurrencySchema,
		receivedAt: z.string().datetime(),
		attachments: z
			.array(
				z
					.object({
						url: z.string().url(),
						filename: z.string().min(1).max(255),
					})
					.strict(),
			)
			.default([]),
	})
	.strict();

export type RegisterPurchaseOrderInput = z.infer<typeof RegisterPurchaseOrderSchema>;

export const ValidatePurchaseOrderSchema = z
	.object({
		validatedBy: ObjectIdSchema,
	})
	.strict();

export type ValidatePurchaseOrderInput = z.infer<typeof ValidatePurchaseOrderSchema>;

export const RejectPurchaseOrderSchema = z
	.object({
		rejectionReason: z.string().min(5).max(500),
	})
	.strict();

export type RejectPurchaseOrderInput = z.infer<typeof RejectPurchaseOrderSchema>;

export const ListPurchaseOrdersQuerySchema = z
	.object({
		proposalId: ObjectIdSchema.optional(),
		status: PurchaseOrderStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListPurchaseOrdersQuery = z.infer<typeof ListPurchaseOrdersQuerySchema>;

export const PurchaseOrderIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export type PurchaseOrderIdParams = z.infer<typeof PurchaseOrderIdParamsSchema>;

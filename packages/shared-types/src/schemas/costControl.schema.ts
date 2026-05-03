/**
 * CostControl Schema — Zod validation for cost tracking
 *
 * Maps to backend model: apps/backend/src/models/CostControl.ts
 * Reference: DOC-09 Section Diccionario de Datos
 */

import { z } from "zod";
import type { MongooseDocument } from "./common.schema";

export const CostControlCategoryEnum = z.enum([
	"labor",
	"materials",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"other",
]);

export type CostControlCategory = z.infer<typeof CostControlCategoryEnum>;

/**
 * Cost line item within a cost control
 */
export const CostLineItemSchema = z.object({
	category: CostControlCategoryEnum,
	description: z.string().min(1).max(500),
	unit: z.string().optional(),
	quantity: z.number().nonnegative(),
	unitPrice: z.number().nonnegative(),
	total: z.number().nonnegative(),
	isBudgeted: z.boolean().default(true),
	notes: z.string().optional(),
});

export type CostLineItem = z.infer<typeof CostLineItemSchema>;

/**
 * Create cost control (budget snapshot)
 */
export const CreateCostControlSchema = z.object({
	orderId: z.string().min(24).max(24),
	currency: z.string().default("COP"),
	budgetEstimated: z.number().nonnegative(),
	budgetApproved: z.number().nonnegative().optional(),
});

export type CreateCostControl = z.infer<typeof CreateCostControlSchema>;

/**
 * Update cost control with line items
 */
export const UpdateCostControlSchema = z.object({
	actualItems: z.array(CostLineItemSchema).default([]),
	budgetApproved: z.number().nonnegative().optional(),
	notes: z.string().optional(),
});

export type UpdateCostControl = z.infer<typeof UpdateCostControlSchema>;

/**
 * Full cost control record (response)
 */
export const CostControlSchema = z.object({
	_id: z.string(),
	orderId: z.string(),
	currency: z.string(),
	budgetEstimated: z.number(),
	budgetApproved: z.number().optional(),
	actualItems: z.array(CostLineItemSchema),
	actualTotal: z.number(),
	variance: z.number(),
	variancePct: z.number(),
	closed: z.boolean(),
	closedAt: z.string().datetime().optional(),
	closedBy: z.string().optional(),
	approvedBy: z.string().optional(),
	notes: z.string().optional(),
	createdBy: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type CostControl = z.infer<typeof CostControlSchema>;

export interface CostControlDocument<TID = string> extends MongooseDocument<TID> {
	orderId: TID;
	currency: string;
	budgetEstimated: number;
	budgetApproved?: number;
	actualItems: CostLineItem[];
	actualTotal: number;
	variance: number;
	variancePct: number;
	closed: boolean;
	closedAt?: Date;
	closedBy?: TID;
	approvedBy?: TID;
	notes?: string;
	createdBy: TID;
}

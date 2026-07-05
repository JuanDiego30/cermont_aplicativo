/**
 * Cost Proposal Suggestion Schemas
 *
 * Defines the contract for the Cost Proposal Assistant feature:
 * POST /api/costs/suggest
 *
 * Reference: docs/PROMPTS/ASSISTANT_COST_PROPOSAL_PROMPT.md
 * Reference: docs/plans/PLAN_COST_PROPOSAL_ASSISTANT.md
 */

import { z } from "zod";
import { statusObjectOf } from "../utils/status-types";
import { CostCategorySchema } from "./cost.schema";

// ─── Activity Types ───────────────────────────────────────────────────────────

export const CostProposalActivityTypeSchema = z.enum([
	"lifeline_horizontal",
	"lifeline_vertical",
	"cctv_installation",
	"cctv_maintenance",
	"anchor_installation",
	"anchor_inspection",
	"structural_inspection",
	"safety_inspection",
	"electrical",
	"refrigeration",
	"civil_works",
	"general_maintenance",
	"other",
]);

export type CostProposalActivityType = z.infer<typeof CostProposalActivityTypeSchema>;

// ─── Location Type ────────────────────────────────────────────────────────────

export const LocationTypeSchema = z.enum(["urban", "rural", "remote"]);

export type LocationType = z.infer<typeof LocationTypeSchema>;

// ─── Measurement ──────────────────────────────────────────────────────────────

export const CostMeasurementSchema = z.object({
	description: z.string().min(1).max(200),
	value: z.number().positive(),
	unit: z.string().min(1).max(50),
});

export type CostMeasurement = z.infer<typeof CostMeasurementSchema>;

// ─── Material Input ───────────────────────────────────────────────────────────

export const CostMaterialInputSchema = z.object({
	name: z.string().min(1).max(200),
	quantity: z.number().positive(),
	unit: z.string().min(1).max(50),
	estimatedPrice: z.number().nonnegative().optional(),
});

export type CostMaterialInput = z.infer<typeof CostMaterialInputSchema>;

// ─── Estimated Duration ───────────────────────────────────────────────────────

export const EstimatedDurationSchema = z.object({
	days: z.number().int().min(1).max(365),
	hoursPerDay: z.number().int().min(1).max(24).default(8),
});

export type EstimatedDuration = z.infer<typeof EstimatedDurationSchema>;

// ─── Main Input Schema ────────────────────────────────────────────────────────

export const CostProposalInputSchema = z
	.object({
		activityType: CostProposalActivityTypeSchema,
		clientName: z.string().max(200).optional(),
		location: z.string().min(1).max(500),
		locationType: LocationTypeSchema,
		technicians: z.number().int().min(1).max(50),
		supervisor: z.boolean(),
		engineer: z.boolean().default(false),
		estimatedDuration: EstimatedDurationSchema,
		scopeDescription: z.string().min(1).max(2000),
		measurements: z.array(CostMeasurementSchema).max(50).optional(),
		materials: z.array(CostMaterialInputSchema).max(100).optional(),
		clientBudget: z.number().nonnegative().optional(),
		requiresFinalCertification: z.boolean().default(false),
		nightWork: z.boolean().default(false),
		adverseWeather: z.boolean().default(false),
		requiresHeightWork: z.boolean().default(false),
		requiresHotWork: z.boolean().default(false),
		requiresLockoutTagout: z.boolean().default(false),
	})
	.strip();

export type CostProposalInput = z.infer<typeof CostProposalInputSchema>;

// ─── Result Line Item ─────────────────────────────────────────────────────────

export const CostProposalLineSourceSchema = z.enum([
	"catalog",
	"calculated",
	"user_provided",
	"estimated",
]);

export type CostProposalLineSource = z.infer<typeof CostProposalLineSourceSchema>;

export const CostProposalLineItemSchema = z.object({
	category: CostCategorySchema,
	item: z.string().min(1).max(300),
	quantity: z.number().positive(),
	unit: z.string().min(1).max(50),
	unitPrice: z.number().nonnegative(),
	total: z.number().nonnegative(),
	source: CostProposalLineSourceSchema,
	catalogItemId: z.string().optional(),
	notes: z.string().max(300).optional(),
});

export type CostProposalLineItem = z.infer<typeof CostProposalLineItemSchema>;

// ─── Subtotals ────────────────────────────────────────────────────────────────

export const CostProposalSubtotalsSchema = z.object({
	materials: z.number().nonnegative(),
	labor: z.number().nonnegative(),
	equipment: z.number().nonnegative(),
	transport: z.number().nonnegative(),
	other: z.number().nonnegative(),
});

export type CostProposalSubtotals = z.infer<typeof CostProposalSubtotalsSchema>;

// ─── Budget Comparison ────────────────────────────────────────────────────────

export const CostProposalBudgetComparisonSchema = z.object({
	clientBudget: z.number().nonnegative(),
	proposedTotal: z.number().nonnegative(),
	difference: z.number(),
	differencePercent: z.number(),
	isWithinBudget: z.boolean(),
});

export type CostProposalBudgetComparison = z.infer<typeof CostProposalBudgetComparisonSchema>;

// ─── Main Result Schema ───────────────────────────────────────────────────────

export const CostProposalResultSchema = z.object({
	activityDescription: z.string().min(1),
	generatedAt: z.string().datetime(),
	lineItems: z.array(CostProposalLineItemSchema),
	subtotals: CostProposalSubtotalsSchema,
	directCost: z.number().nonnegative(),
	suggestedMarginPercent: z.number().min(0).max(100),
	suggestedMarginAmount: z.number().nonnegative(),
	subtotal: z.number().nonnegative(),
	taxBase: z.number().nonnegative(),
	taxAmount: z.number().nonnegative(),
	taxRate: z.number().min(0).max(1),
	total: z.number().nonnegative(),
	totalRounded: z.number().nonnegative(),
	observations: z.array(z.string().max(500)),
	suggestedActions: z.array(z.string().max(300)),
	clientBudgetComparison: statusObjectOf(CostProposalBudgetComparisonSchema),
});

export type CostProposalResult = z.infer<typeof CostProposalResultSchema>;

// ─── API Response Envelope ────────────────────────────────────────────────────

export const CostSuggestionResponseSchema = z.object({
	success: z.literal(true),
	data: CostProposalResultSchema,
});

export type CostSuggestionResponse = z.infer<typeof CostSuggestionResponseSchema>;

// ─── Labor Rate Configuration (internal, not exposed in API) ───────────────────

export const CostLaborRoleSchema = z.enum([
	"field_technician",
	"certified_height_technician",
	"supervisor",
	"engineer",
]);

export type CostLaborRole = z.infer<typeof CostLaborRoleSchema>;

export const CostLaborRateSchema = z.object({
	role: CostLaborRoleSchema,
	hourlyRate: z.number().nonnegative(),
	nightPremiumPercent: z.number().min(0).max(1),
});

export type CostLaborRate = z.infer<typeof CostLaborRateSchema>;

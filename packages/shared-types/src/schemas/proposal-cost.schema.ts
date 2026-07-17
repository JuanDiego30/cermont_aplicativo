import { z } from "zod";

export const ProposalCostItemSchema = z.object({
	description: z.string().min(1),
	unit: z.string().optional(),
	quantity: z.number().positive(),
	unitPrice: z.number().nonnegative(),
	total: z.number().nonnegative(),
});
export type ProposalCostItem = z.infer<typeof ProposalCostItemSchema>;

export const ProposalCostBreakdownSchema = z.object({
	proposalId: z.string().optional(),
	proposalCode: z.string().optional(),
	title: z.string().optional(),
	clientName: z.string().optional(),
	status: z.string().optional(),
	items: z.array(ProposalCostItemSchema),
	subtotal: z.number().nonnegative(),
	taxRate: z.number().min(0).max(1),
	taxAmount: z.number().nonnegative(),
	totalWithTax: z.number().nonnegative(),
	validUntil: z.string().datetime().optional(),
	generatedAt: z.string().datetime().optional(),
});
export type ProposalCostBreakdown = z.infer<typeof ProposalCostBreakdownSchema>;

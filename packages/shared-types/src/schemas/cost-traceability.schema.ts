import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const CostTraceabilitySchema = z
	.object({
		_id: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		proposalValue: z.number().nullable(),
		estimatedMaterials: z.number().nullable(),
		realMaterials: z.number().nullable(),
		estimatedLabor: z.number().nullable(),
		realLabor: z.number().nullable(),
		equipmentCosts: z.number().nullable(),
		transportCosts: z.number().nullable(),
		aiuPercentage: z.number().nullable(),
		invoicedAmount: z.number().nullable(),
		paidAmount: z.number().nullable(),
		estimatedMargin: z.number().nullable(),
		realMargin: z.number().nullable(),
		variance: z.number().nullable(),
		variancePercentage: z.number().nullable(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type CostTraceability = z.infer<typeof CostTraceabilitySchema>;

export const CostTraceabilityResponseSchema = CostTraceabilitySchema.extend({
	proposalLabel: z.string().default("Valor Propuesta"),
	materialLabel: z.string().default("Materiales"),
	laborLabel: z.string().default("Mano de Obra"),
	varianceLabel: z.string().default("Variación"),
});
export type CostTraceabilityResponse = z.infer<typeof CostTraceabilityResponseSchema>;

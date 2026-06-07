import { z } from "zod";
import { statusObjectOf } from "../utils/status-types";
import { ObjectIdSchema } from "./common.schema";

export const CostTraceabilitySchema = z
	.object({
		_id: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		proposalValue: statusObjectOf(z.number()),
		estimatedMaterials: statusObjectOf(z.number()),
		realMaterials: statusObjectOf(z.number()),
		estimatedLabor: statusObjectOf(z.number()),
		realLabor: statusObjectOf(z.number()),
		equipmentCosts: statusObjectOf(z.number()),
		transportCosts: statusObjectOf(z.number()),
		aiuPercentage: statusObjectOf(z.number()),
		invoicedAmount: statusObjectOf(z.number()),
		paidAmount: statusObjectOf(z.number()),
		estimatedMargin: statusObjectOf(z.number()),
		realMargin: statusObjectOf(z.number()),
		variance: statusObjectOf(z.number()),
		variancePercentage: statusObjectOf(z.number()),
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

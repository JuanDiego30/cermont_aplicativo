/**
 * Closure Report Schema — Zod validation for closure reports
 *
 * Maps to backend model: apps/backend/src/models/ClosureReport.ts
 * Reference: DOC-09 Section Diccionario de Datos, DOC-07 Section Acta de Cierre
 */

import { z } from "zod";
import { MaterialItemSchema as OrderMaterialItemSchema } from "./order.schema";

const MaterialItemSchema = OrderMaterialItemSchema.omit({ delivered: true });

/**
 * Full closure report record (response)
 */
export const ClosureReportSchema = z.object({
	_id: z.string(),
	orderId: z.string(),
	technicalObservations: z.string().max(3000).optional(),
	materialsUsed: z.array(MaterialItemSchema).default([]),
	actualHours: z.number().nonnegative().optional(),
	completionNotes: z.string().max(2000).optional(),
	signedBy: z.string().optional(),
	signedAt: z.string().datetime().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type ClosureReport = z.infer<typeof ClosureReportSchema>;

/**
 * Create a new closure report
 */
export const CreateClosureReportSchema = ClosureReportSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateClosureReportInput = z.infer<typeof CreateClosureReportSchema>;

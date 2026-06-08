import { z } from "zod";

export const ExecutionGpsPointSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		accuracy: z.number().nonnegative().optional(),
		capturedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionGpsPoint = z.infer<typeof ExecutionGpsPointSchema>;

export const GpsPointSchema = ExecutionGpsPointSchema;
export type GpsPoint = ExecutionGpsPoint;

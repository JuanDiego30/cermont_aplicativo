import { z } from "zod";

export const OfflineActionSchema = z.enum(["create", "update", "delete"]);
export type OfflineAction = z.infer<typeof OfflineActionSchema>;

export const OfflineEntityTypeSchema = z.enum(["order", "checklist", "evidence"]);
export type OfflineEntityType = z.infer<typeof OfflineEntityTypeSchema>;

export const OfflineOperationSchema = z
	.object({
		id: z.string().min(1),
		type: OfflineEntityTypeSchema,
		action: OfflineActionSchema,
		payload: z.record(z.string(), z.json()),
		timestamp: z.string().min(1),
	})
	.strip();

export type OfflineOperation = z.infer<typeof OfflineOperationSchema>;

export const SyncBatchSchema = z
	.object({
		operations: z.array(OfflineOperationSchema).min(1).max(100),
	})
	.strip();

export type SyncBatch = z.infer<typeof SyncBatchSchema>;

export const SyncErrorSchema = z
	.object({
		id: z.string().min(1),
		error: z.string().min(1),
	})
	.strip();

export type SyncError = z.infer<typeof SyncErrorSchema>;

export const SyncResultSchema = z
	.object({
		processed: z.number().int().min(0),
		failed: z.number().int().min(0),
		errors: z.array(SyncErrorSchema),
	})
	.strip();

export type SyncResult = z.infer<typeof SyncResultSchema>;

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const QrCodeTypeSchema = z.enum([
	"order",
	"service_case",
	"execution_session",
	"equipment",
	"tool",
	"vehicle",
]);

export type QrCodeType = z.infer<typeof QrCodeTypeSchema>;

export const GenerateQrCodeSchema = z
	.object({
		entityType: QrCodeTypeSchema,
		entityId: ObjectIdSchema,
		label: z.string().max(100).optional(),
	})
	.strict();

export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeSchema>;

export const GenerateBulkQrCodesSchema = z
	.object({
		items: z.array(GenerateQrCodeSchema).min(1),
	})
	.strict();

export type GenerateBulkQrCodesInput = z.infer<typeof GenerateBulkQrCodesSchema>;

export const QrCodeSchema = z
	.object({
		_id: ObjectIdSchema,
		entityType: QrCodeTypeSchema,
		entityId: ObjectIdSchema,
		code: z.string().min(1),
		imageDataUrl: z.string(),
		label: z.string().optional(),
		generatedAt: z.string().datetime(),
		generatedBy: ObjectIdSchema,
	})
	.strict();

export type QrCode = z.infer<typeof QrCodeSchema>;

import { z } from "zod";

/**
 * Portal Sign Delivery Record Schema
 * Validates client signature input from the portal frontend.
 */
export const PortalSignDeliveryRecordSchema = z
	.object({
		clientName: z.string().min(1).max(200),
		clientDocumentType: z.enum(["NIT", "CC", "CE", "PASAPORTE"]).optional(),
		clientDocumentNumber: z.string().max(30).optional(),
		captureMethod: z.enum([
			"canvas_touch",
			"canvas_mouse",
			"fingerprint_scanner",
			"uploaded_image",
		]),
		imageData: z.string().min(1, "Signature image data is required"),
		gpsLocation: z
			.object({
				lat: z.number().min(-90).max(90),
				lng: z.number().min(-180).max(180),
				accuracy: z.number().positive().optional(),
			})
			.optional(),
	})
	.strict();

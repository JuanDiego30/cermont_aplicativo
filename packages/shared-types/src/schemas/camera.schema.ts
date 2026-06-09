import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const CameraTypeSchema = z.enum(["cctv", "ip", "analogica", "termica", "multisensor"]);
export type CameraType = z.infer<typeof CameraTypeSchema>;

export const CameraSchema = z
	.object({
		_id: ObjectIdSchema.optional(),
		model: z.string().min(1).max(200),
		brand: z.string().max(100).optional(),
		serialNumber: z.string().max(100).optional(),
		type: CameraTypeSchema.default("cctv"),
		clientId: ObjectIdSchema.optional(),
		siteId: ObjectIdSchema.optional(),
		location: z.string().max(200).optional(),
		height: z.number().nonnegative().optional(),
		connectionType: z.enum(["poe", "wireless", "coaxial", "fibra"]).optional(),
		notes: z.string().max(500).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Camera = z.infer<typeof CameraSchema>;
export const CreateCameraSchema = CameraSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
});
export type CreateCamera = z.infer<typeof CreateCameraSchema>;

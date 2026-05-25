import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Geo Point ───────────────────────────────────────────────────────────────

export const GeoPointSchema = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	altitude: z.number().optional(),
	accuracy: z.number().optional(),
	timestamp: z.string().datetime(),
	provider: z.string().optional(),
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;

// ─── Geo Fence ───────────────────────────────────────────────────────────────

export const GeoFenceSchema = z.object({
	_id: ObjectIdSchema,
	name: z.string().min(1),
	center: GeoPointSchema,
	radius: z.number().positive(), // meters
	metadata: z.record(z.string(), z.unknown()).optional(),
	isActive: z.boolean().default(true),
});

export type GeoFence = z.infer<typeof GeoFenceSchema>;

// ─── Tracking ────────────────────────────────────────────────────────────────

export const TechnicianCheckInSchema = z.object({
	_id: ObjectIdSchema,
	userId: ObjectIdSchema,
	orderId: ObjectIdSchema.optional(),
	type: z.enum(["check_in", "check_out"]),
	location: GeoPointSchema,
	timestamp: z.string().datetime(),
	deviceInfo: z.record(z.string(), z.unknown()).optional(),
});

export type TechnicianCheckIn = z.infer<typeof TechnicianCheckInSchema>;

export const TechnicianTrackSchema = z.object({
	_id: ObjectIdSchema,
	userId: ObjectIdSchema,
	points: z.array(GeoPointSchema),
	startedAt: z.string().datetime(),
	endedAt: z.string().datetime().optional(),
});

export type TechnicianTrack = z.infer<typeof TechnicianTrackSchema>;

// ─── Route Plan ───────────────────────────────────────────────────────────────

export const RoutePlanSchema = z.object({
	_id: ObjectIdSchema,
	title: z.string().min(1),
	technicianId: ObjectIdSchema,
	date: z.string().datetime(),
	stops: z.array(
		z.object({
			entityType: z.string(),
			entityId: z.string(),
			estimatedArrival: z.string().datetime(),
			location: GeoPointSchema,
		}),
	),
	status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
});

export type RoutePlan = z.infer<typeof RoutePlanSchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateCheckInSchema = z.object({
	orderId: z.string().optional(),
	type: z.enum(["check_in", "check_out"]),
	location: GeoPointSchema,
	deviceInfo: z.record(z.string(), z.unknown()).optional(),
});

export type CreateCheckInInput = z.infer<typeof CreateCheckInSchema>;

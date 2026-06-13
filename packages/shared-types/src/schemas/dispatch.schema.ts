import { z } from "zod";

export const GeoCoordinateSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

export type GeoCoordinate = z.infer<typeof GeoCoordinateSchema>;

export const DispatchPrioritySchema = z.enum(["alta", "media", "baja"]);
export const DispatchStopTypeSchema = z.enum(["pickup", "delivery", "service", "visit"]);

export const DispatchStopSchema = z.object({
	id: z.string().trim().min(1).max(120),
	label: z.string().trim().min(1).max(160),
	address: z.string().trim().min(3).max(300),
	coord: GeoCoordinateSchema,
	priority: DispatchPrioritySchema.optional(),
	estimatedDuration: z.number().int().min(1).max(1440).optional(),
	type: DispatchStopTypeSchema.optional(),
});

export type DispatchStop = z.infer<typeof DispatchStopSchema>;

export const DispatchTechnicianSchema = z.object({
	id: z.string().trim().min(1).max(120),
	name: z.string().trim().min(1).max(160),
	startLocation: GeoCoordinateSchema,
});

export type DispatchTechnician = z.infer<typeof DispatchTechnicianSchema>;

export const OptimizeRouteInputSchema = z.object({
	stops: z.array(DispatchStopSchema).min(1).max(100),
});

export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

export const AssignTechniciansInputSchema = z.object({
	technicians: z.array(DispatchTechnicianSchema).min(1).max(50),
	stops: z.array(DispatchStopSchema).min(1).max(100),
});

export type AssignTechniciansInput = z.infer<typeof AssignTechniciansInputSchema>;

export const DispatchGeocodeQuerySchema = z.object({
	q: z.string().trim().min(3).max(300),
});

export type DispatchGeocodeQuery = z.infer<typeof DispatchGeocodeQuerySchema>;

export const DispatchGeocodeResultSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal("found"),
		coordinate: GeoCoordinateSchema,
	}),
	z.object({
		status: z.literal("not_found"),
		reason: z.literal("ADDRESS_NOT_FOUND"),
	}),
	z.object({
		status: z.literal("unavailable"),
		reason: z.literal("GEOCODING_PROVIDER_UNAVAILABLE"),
	}),
]);

export type DispatchGeocodeResult = z.infer<typeof DispatchGeocodeResultSchema>;

export const OptimizedRouteSchema = z.object({
	stops: z.array(DispatchStopSchema),
	totalDistanceKm: z.number().min(0),
	totalDurationMin: z.number().min(0),
	orderedIds: z.array(z.string()),
	polyline: z.string().optional(),
});

export type OptimizedRoute = z.infer<typeof OptimizedRouteSchema>;

export const TechnicianAssignmentSchema = z.object({
	technicianId: z.string(),
	technicianName: z.string(),
	scheduledStops: z.array(z.string()),
	totalDistanceKm: z.number().min(0),
	totalDurationMin: z.number().min(0),
	startLocation: GeoCoordinateSchema,
});

export type TechnicianAssignment = z.infer<typeof TechnicianAssignmentSchema>;

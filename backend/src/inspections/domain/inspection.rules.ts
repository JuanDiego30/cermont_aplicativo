/**
 * Inspection Domain Rules
 *
 * Status transitions, rating scale constraints, and approval rules.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const INSPECTION_STATUSES = [
	"pending",
	"in_progress",
	"completed",
	"approved",
	"rejected",
] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const VALID_STATUS_TRANSITIONS: Record<InspectionStatus, InspectionStatus[]> = {
	pending: ["in_progress"],
	in_progress: ["completed"],
	completed: ["approved", "rejected"],
	approved: [],
	rejected: ["in_progress"],
};

export function isValidStatusTransition(
	current: InspectionStatus,
	next: InspectionStatus,
): boolean {
	return VALID_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export const RATING_SCALE = { min: 1, max: 5 } as const;

export function isValidRating(rating: number): boolean {
	return Number.isInteger(rating) && rating >= RATING_SCALE.min && rating <= RATING_SCALE.max;
}

export const INSPECTION_TYPES = [
	"grinder",
	"harness",
	"extinguisher",
	"vehicle",
	"electrical",
	"generic",
] as const;
export type InspectionType = (typeof INSPECTION_TYPES)[number];

export function isValidInspectionType(type: string): type is InspectionType {
	return (INSPECTION_TYPES as readonly string[]).includes(type);
}

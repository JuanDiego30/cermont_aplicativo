/**
 * Evidence Domain Rules
 *
 * Valid upload statuses, file type validation, GPS metadata rules.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const VALID_UPLOAD_ORDER_STATUSES = ["assigned", "in_progress", "completed"] as const;

export function canUploadEvidence(orderStatus: string): boolean {
	return (VALID_UPLOAD_ORDER_STATUSES as readonly string[]).includes(orderStatus as never);
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const DEFAULT_MAX_EVIDENCE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isAllowedImageType(mimeType: string): boolean {
	return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

export function isEvidenceSizeAllowed(
	sizeBytes: number,
	maxBytes: number = DEFAULT_MAX_EVIDENCE_SIZE_BYTES,
): boolean {
	return sizeBytes > 0 && sizeBytes <= maxBytes;
}

export const GPS_COORDINATE_RANGE = {
	lat: { min: -90, max: 90 },
	lng: { min: -180, max: 180 },
} as const;

export function isValidGpsCoordinate(lat: number, lng: number): boolean {
	return (
		lat >= GPS_COORDINATE_RANGE.lat.min &&
		lat <= GPS_COORDINATE_RANGE.lat.max &&
		lng >= GPS_COORDINATE_RANGE.lng.min &&
		lng <= GPS_COORDINATE_RANGE.lng.max
	);
}

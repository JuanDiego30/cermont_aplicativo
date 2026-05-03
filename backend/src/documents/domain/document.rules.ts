/**
 * Document Domain Rules
 *
 * File type validation, size limits, and document lifecycle states.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const ALLOWED_MIME_TYPES = [
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const DOCUMENT_STATUSES = ["pending", "signed", "approved", "archived", "rejected"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export function isAllowedMimeType(mimeType: string): boolean {
	return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isFileSizeAllowed(
	sizeBytes: number,
	maxBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
): boolean {
	return sizeBytes > 0 && sizeBytes <= maxBytes;
}

export function getFileExtension(mimeType: string): string {
	const map: Record<string, string> = {
		"application/pdf": ".pdf",
		"image/jpeg": ".jpg",
		"image/png": ".png",
		"image/webp": ".webp",
		"application/msword": ".doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
	};
	return map[mimeType] ?? "";
}

import type { EvidenceType } from "@cermont/shared-types";

// ─── Constants ───────────────────────────────────────────────────────────────

export const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
	{ value: "before", label: "Antes" },
	{ value: "during", label: "Durante" },
	{ value: "after", label: "Después" },
	{ value: "defect", label: "Defecto" },
	{ value: "safety", label: "Seguridad HSE" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_PHOTOS_PER_BATCH = 10;

// ─── Types ───────────────────────────────────────────────────────────────────

export type PhotoEntry = {
	id: string;
	file: File;
	previewUrl: string;
	title: string;
	type: EvidenceType;
	error?: string;
};

export type GpsCaptureState =
	| { state: "idle" }
	| { state: "fetching" }
	| { state: "success"; location: { lat: number; lng: number } }
	| { state: "error" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateFile(file: File): string | undefined {
	if (file.size > MAX_FILE_SIZE) {
		return "El archivo no debe superar 10MB";
	}
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
		return "Formato no válido. Use JPG, PNG o WebP";
	}
	return undefined;
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

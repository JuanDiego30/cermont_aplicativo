/**
 * Evidence Upload — useReducer state, actions, and reducer
 */
import type { EvidenceType } from "@cermont/shared-types";
import type { GpsCaptureState, PhotoEntry } from "./constants";

// ─── State ──────────────────────────────────────────────────────────────────

export interface EvidenceUploadState {
	photos: PhotoEntry[];
	gpsCapture: GpsCaptureState;
	isSubmitting: boolean;
	uploadProgress: { current: number; total: number } | null;
}

export const initialUploadState: EvidenceUploadState = {
	photos: [],
	gpsCapture: { state: "idle" },
	isSubmitting: false,
	uploadProgress: null,
};

// ─── Actions ────────────────────────────────────────────────────────────────

export type EvidenceAction =
	| { type: "ADD_PHOTOS"; payload: PhotoEntry[] }
	| { type: "REMOVE_PHOTO"; payload: string }
	| { type: "UPDATE_PHOTO_TITLE"; payload: { id: string; title: string } }
	| { type: "UPDATE_PHOTO_TYPE"; payload: { id: string; type: EvidenceType } }
	| { type: "SET_GPS"; payload: GpsCaptureState }
	| { type: "SET_SUBMITTING"; payload: boolean }
	| { type: "SET_UPLOAD_PROGRESS"; payload: { current: number; total: number } | null }
	| { type: "RESET" };

// ─── Reducer ────────────────────────────────────────────────────────────────

export function evidenceReducer(
	state: EvidenceUploadState,
	action: EvidenceAction,
): EvidenceUploadState {
	switch (action.type) {
		case "ADD_PHOTOS":
			return { ...state, photos: [...state.photos, ...action.payload] };

		case "REMOVE_PHOTO": {
			const target = state.photos.find((p) => p.id === action.payload);
			if (target) {
				URL.revokeObjectURL(target.previewUrl);
			}
			return { ...state, photos: state.photos.filter((p) => p.id !== action.payload) };
		}

		case "UPDATE_PHOTO_TITLE":
			return {
				...state,
				photos: state.photos.map((p) =>
					p.id === action.payload.id
						? {
								...p,
								title: action.payload.title,
								error: action.payload.title.trim() ? undefined : p.error,
							}
						: p,
				),
			};

		case "UPDATE_PHOTO_TYPE":
			return {
				...state,
				photos: state.photos.map((p) =>
					p.id === action.payload.id ? { ...p, type: action.payload.type } : p,
				),
			};

		case "SET_GPS":
			return { ...state, gpsCapture: action.payload };

		case "SET_SUBMITTING":
			return { ...state, isSubmitting: action.payload };

		case "SET_UPLOAD_PROGRESS":
			return { ...state, uploadProgress: action.payload };

		case "RESET":
			// Revoke all blob URLs before resetting
			for (const photo of state.photos) {
				URL.revokeObjectURL(photo.previewUrl);
			}
			return initialUploadState;

		default:
			return state;
	}
}

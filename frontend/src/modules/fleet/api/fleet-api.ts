/**
 * Fleet API Service
 *
 * Thin wrapper over `apiClient` for `/api/fleet` endpoints.
 */

import type { CreateVehicleInput, Vehicle, VehicleDocumentAlert } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface FleetListFilters {
	page?: number;
	limit?: number;
	status?: string;
	type?: string;
}

export interface FleetListEnvelope {
	success: boolean;
	data: Vehicle[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listVehicles(filters: FleetListFilters = {}): Promise<FleetListEnvelope> {
	const searchParams = new URLSearchParams();
	if (filters.page) {
		searchParams.set("page", String(filters.page));
	}
	if (filters.limit) {
		searchParams.set("limit", String(filters.limit));
	}
	if (filters.status) {
		searchParams.set("status", filters.status);
	}
	if (filters.type) {
		searchParams.set("type", filters.type);
	}
	const query = searchParams.toString();
	return apiClient.get<FleetListEnvelope>(`/fleet${query ? `?${query}` : ""}`);
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
	const envelope = await apiClient.post<{ success: true; data: Vehicle }>("/fleet", input);
	return envelope.data;
}

export async function getExpiringVehicleDocuments(): Promise<VehicleDocumentAlert[]> {
	const envelope = await apiClient.get<{ success: boolean; data: VehicleDocumentAlert[] }>(
		"/fleet/expiring-documents?days=30",
	);
	return envelope.data;
}

// ─── Fleet Photo API ────────────────────────────────────────────────

export interface FleetPhoto {
	_id: string;
	url: string;
	filename: string;
	title: string;
	isPrimary: boolean;
	uploadedAt: string;
}

export async function getVehiclePhotos(vehicleId: string): Promise<FleetPhoto[]> {
	const envelope = await apiClient.get<{ success: boolean; data: FleetPhoto[] }>(
		`/fleet/${vehicleId}/photos`,
	);
	return envelope.data;
}

export async function uploadVehiclePhoto(
	vehicleId: string,
	file: File,
	title?: string,
): Promise<FleetPhoto> {
	const formData = new FormData();
	formData.append("file", file);
	if (title) {
		formData.append("title", title);
	}
	const envelope = await apiClient.post<{ success: boolean; data: FleetPhoto }>(
		`/fleet/${vehicleId}/photos`,
		formData,
	);
	return envelope.data;
}

export async function setVehiclePrimaryPhoto(
	vehicleId: string,
	photoId: string,
): Promise<FleetPhoto> {
	const envelope = await apiClient.patch<{ success: boolean; data: FleetPhoto }>(
		`/fleet/${vehicleId}/photos/${photoId}/primary`,
		{},
	);
	return envelope.data;
}

export async function deleteVehiclePhoto(vehicleId: string, photoId: string): Promise<void> {
	await apiClient.delete(`/fleet/${vehicleId}/photos/${photoId}`);
}

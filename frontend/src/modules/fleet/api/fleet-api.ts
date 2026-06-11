/**
 * Fleet API Service
 *
 * Thin wrapper over `apiClient` for `/api/fleet` endpoints.
 */

import type {
	CreateVehicleInput,
	UpdateVehicleInput,
	Vehicle,
	VehicleDocumentAlert,
} from "@cermont/shared-types";
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

export async function updateVehicle(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
	const envelope = await apiClient.patch<{ success: true; data: Vehicle }>(`/fleet/${id}`, input);
	return envelope.data;
}

export async function getExpiringVehicleDocuments(): Promise<VehicleDocumentAlert[]> {
	const envelope = await apiClient.get<{ success: boolean; data: VehicleDocumentAlert[] }>(
		"/fleet/expiring-documents?days=30",
	);
	return envelope.data;
}

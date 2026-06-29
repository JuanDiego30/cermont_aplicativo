/**
 * Fleet Photo API methods
 */

import { apiClient } from "@/lib/http/api-client";

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

export async function deleteVehiclePhoto(
	vehicleId: string,
	photoId: string,
): Promise<void> {
	await apiClient.delete(`/fleet/${vehicleId}/photos/${photoId}`);
}

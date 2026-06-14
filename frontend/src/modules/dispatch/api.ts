import type {
	DispatchGeocodeResult,
	DispatchStop,
	DispatchTechnician,
	OptimizedRoute,
	TechnicianAssignment,
} from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface ApiEnvelope<T> {
	success: true;
	data: T;
}

export async function geocodeDispatchAddress(address: string): Promise<DispatchGeocodeResult> {
	const response = await apiClient.get<ApiEnvelope<DispatchGeocodeResult>>(
		`/dispatch/geocode?q=${encodeURIComponent(address)}`,
	);
	return response.data;
}

export async function optimizeDispatchRoute(stops: DispatchStop[]): Promise<OptimizedRoute> {
	const response = await apiClient.post<ApiEnvelope<OptimizedRoute>>("/dispatch/optimize", {
		stops,
	});
	return response.data;
}

export async function assignDispatchTechnicians(
	technicians: DispatchTechnician[],
	stops: DispatchStop[],
): Promise<TechnicianAssignment[]> {
	const response = await apiClient.post<ApiEnvelope<TechnicianAssignment[]>>("/dispatch/assign", {
		technicians,
		stops,
	});
	return response.data;
}

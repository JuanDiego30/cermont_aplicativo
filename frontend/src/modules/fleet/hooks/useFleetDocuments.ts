import { useQuery } from "@tanstack/react-query";
import { getVehicleDocumentStatus } from "../api/fleet-api";

export const fleetDocumentKeys = {
	all: ["fleet", "documents"] as const,
	byVehicle: (vehicleId: string) => ["fleet", "documents", vehicleId] as const,
};

export function useFleetDocuments(vehicleId: string) {
	return useQuery({
		queryKey: fleetDocumentKeys.byVehicle(vehicleId),
		queryFn: () => getVehicleDocumentStatus(vehicleId),
		enabled: !!vehicleId,
		staleTime: 5 * 60 * 1000,
	});
}

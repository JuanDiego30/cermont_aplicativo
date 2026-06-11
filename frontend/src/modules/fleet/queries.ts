"use client";

/**
 * Fleet — TanStack Query hooks
 */

import type { CreateVehicleInput, UpdateVehicleInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createVehicle,
	type FleetListFilters,
	getExpiringVehicleDocuments,
	listVehicles,
	updateVehicle,
} from "./api/fleet-api";

export const FLEET_KEYS = {
	all: ["fleet"] as const,
	list: (filters: FleetListFilters) => [...FLEET_KEYS.all, "list", filters] as const,
	expiring: () => [...FLEET_KEYS.all, "expiring-documents"] as const,
};

export function useVehicles(filters: FleetListFilters = {}) {
	return useQuery({
		queryKey: FLEET_KEYS.list(filters),
		queryFn: () => listVehicles(filters),
	});
}

export function useExpiringVehicleDocuments() {
	return useQuery({
		queryKey: FLEET_KEYS.expiring(),
		queryFn: () => getExpiringVehicleDocuments(),
	});
}

export function useCreateVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateVehicleInput) => createVehicle(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
		},
	});
}

export function useUpdateVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateVehicleInput }) =>
			updateVehicle(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
		},
	});
}

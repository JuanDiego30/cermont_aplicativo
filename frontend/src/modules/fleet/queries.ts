"use client";

/**
 * Fleet — TanStack Query hooks
 */

import type {
	CheckinVehicleAssignmentInput,
	CheckoutVehicleAssignmentInput,
	CreateVehicleAssignmentInput,
	CreateVehicleInput,
	UpdateVehicleInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	assignVehicle,
	checkinVehicle,
	checkoutVehicle,
	createVehicle,
	type FleetListFilters,
	getActiveVehicleAssignment,
	getExpiringVehicleDocuments,
	getVehicleHistory,
	listVehicles,
	updateVehicle,
} from "./api/fleet-api";

export const FLEET_KEYS = {
	all: ["fleet"] as const,
	list: (filters: FleetListFilters) => [...FLEET_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...FLEET_KEYS.all, "detail", id] as const,
	expiring: () => [...FLEET_KEYS.all, "expiring-documents"] as const,
	history: (vehicleId: string) => [...FLEET_KEYS.all, "history", vehicleId] as const,
	activeAssignment: (vehicleId: string) =>
		[...FLEET_KEYS.all, "activeAssignment", vehicleId] as const,
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

export function useUpdateVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateVehicleInput }) =>
			updateVehicle(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.detail(variables.id) });
		},
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

export function useVehicleHistory(vehicleId: string) {
	return useQuery({
		queryKey: FLEET_KEYS.history(vehicleId),
		queryFn: () => getVehicleHistory(vehicleId),
		enabled: !!vehicleId,
	});
}

export function useActiveVehicleAssignment(vehicleId: string) {
	return useQuery({
		queryKey: FLEET_KEYS.activeAssignment(vehicleId),
		queryFn: () => getActiveVehicleAssignment(vehicleId),
		enabled: !!vehicleId,
	});
}

export function useAssignVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			vehicleId,
			input,
		}: {
			vehicleId: string;
			input: CreateVehicleAssignmentInput;
		}) => assignVehicle(vehicleId, input),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.activeAssignment(variables.vehicleId) });
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.history(variables.vehicleId) });
		},
	});
}

export function useCheckoutVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			assignmentId,
			input,
		}: {
			assignmentId: string;
			input: CheckoutVehicleAssignmentInput;
		}) => checkoutVehicle(assignmentId, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
			const vehicleId = data?.vehicleId;
			if (vehicleId) {
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.detail(vehicleId) });
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.activeAssignment(vehicleId) });
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.history(vehicleId) });
			}
		},
	});
}

export function useCheckinVehicle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			assignmentId,
			input,
		}: {
			assignmentId: string;
			input: CheckinVehicleAssignmentInput;
		}) => checkinVehicle(assignmentId, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: FLEET_KEYS.all });
			const vehicleId = data?.vehicleId;
			if (vehicleId) {
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.detail(vehicleId) });
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.activeAssignment(vehicleId) });
				queryClient.invalidateQueries({ queryKey: FLEET_KEYS.history(vehicleId) });
			}
		},
	});
}

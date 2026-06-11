"use client";

/**
 * Customers (Client CRM) — TanStack Query hooks
 */

import type { CreateClient, UpdateClient } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CustomerListFilters,
	createCustomer,
	deactivateCustomer,
	getCustomer,
	getCustomerHistory,
	listCustomers,
	updateCustomer,
} from "./api/customers-api";

export const CUSTOMER_KEYS = {
	all: ["customers"] as const,
	list: (filters: CustomerListFilters) => [...CUSTOMER_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...CUSTOMER_KEYS.all, "detail", id] as const,
	history: (id: string) => [...CUSTOMER_KEYS.all, "history", id] as const,
};

export function useCustomers(filters: CustomerListFilters = {}) {
	return useQuery({
		queryKey: CUSTOMER_KEYS.list(filters),
		queryFn: () => listCustomers(filters),
	});
}

export function useCustomer(id: string) {
	return useQuery({
		queryKey: CUSTOMER_KEYS.detail(id),
		queryFn: () => getCustomer(id),
		enabled: Boolean(id),
	});
}

export function useCustomerHistory(id: string) {
	return useQuery({
		queryKey: CUSTOMER_KEYS.history(id),
		queryFn: () => getCustomerHistory(id),
		enabled: Boolean(id),
	});
}

export function useCreateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateClient) => createCustomer(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
		},
	});
}

export function useUpdateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateClient }) => updateCustomer(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
		},
	});
}

export function useDeactivateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deactivateCustomer(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
		},
	});
}

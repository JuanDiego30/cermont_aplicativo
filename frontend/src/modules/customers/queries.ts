"use client";

/**
 * Customers (Client CRM) — TanStack Query hooks
 */

import type { CreateClient, UpdateClient } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import {
	type CustomerListFilters,
	createCustomer,
	getCustomerHistory,
	listCustomers,
	updateCustomer,
} from "./api/customers-api";

const CUSTOMER_KEYS = {
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

export function useCustomerContacts(customerId: string | undefined) {
	const cid = customerId ?? "";
	return useQuery({
		queryKey: [...CUSTOMER_KEYS.detail(cid), "contacts"] as const,
		queryFn: async () => {
			if (!cid) return [] as import("@/modules/customers/api/customers-api").ClientContact[];
			const res = await apiClient.get<{ success: boolean; data: import("@/modules/customers/api/customers-api").ClientContact[] }>(
				`/customers/${cid}/contacts`,
			);
			return res.data ?? [];
		},
		enabled: Boolean(customerId),
	});
}

export function useCustomerServiceSites(customerId: string | undefined) {
	const cid = customerId ?? "";
	return useQuery({
		queryKey: [...CUSTOMER_KEYS.detail(cid), "service-sites"] as const,
		queryFn: async () => {
			if (!cid) return [] as import("@/modules/customers/api/customers-api").ServiceSite[];
			const res = await apiClient.get<{ success: boolean; data: import("@/modules/customers/api/customers-api").ServiceSite[] }>(
				`/customers/${cid}/service-sites`,
			);
			return res.data ?? [];
		},
		enabled: Boolean(customerId),
	});
}

export function useCreateCustomerServiceSite() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ customerId, input }: { customerId: string; input: { name: string; address: string; city?: string } }) => {
			const res = await apiClient.post<{ success: boolean; data: import("@/modules/customers/api/customers-api").ServiceSite }>(
				`/customers/${customerId}/service-sites`, input,
			);
			return res.data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(variables.customerId) });
		},
	});
}

export function useCustomerSearch(query: string, enabled: boolean) {
	return useQuery({
		queryKey: [...CUSTOMER_KEYS.list({ search: query }), "search"] as const,
		queryFn: () => listCustomers({ search: query, limit: 10 }),
		enabled,
	});
}

export function useCreateCustomerContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ customerId, input }: { customerId: string; input: { name: string; email?: string; phone?: string } }) => {
			const res = await apiClient.post<{ success: boolean; data: { _id: string; name: string; email?: string; phone?: string } }>(
				`/customers/${customerId}/contacts`, input,
			);
			return res.data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(variables.customerId) });
		},
	});
}

/**
 * Customers (Client CRM) API Service
 *
 * Thin wrapper over `apiClient` for `/api/clients` endpoints.
 */

import type { Client, CreateClient, UpdateClient } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface CustomerListFilters {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
}

export interface CustomerListEnvelope {
	success: boolean;
	data: Client[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CustomerHistoryEntry {
	_id: string;
	code: string;
	status?: string;
	currentStage?: string;
	total?: number;
	createdAt: string;
}

export interface CustomerHistory {
	client: Client;
	workRequests: CustomerHistoryEntry[];
	proposals: CustomerHistoryEntry[];
	serviceCases: CustomerHistoryEntry[];
	invoices: CustomerHistoryEntry[];
}

export async function listCustomers(
	filters: CustomerListFilters = {},
): Promise<CustomerListEnvelope> {
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
	if (filters.search) {
		searchParams.set("search", filters.search);
	}
	const query = searchParams.toString();
	return apiClient.get<CustomerListEnvelope>(`/clients${query ? `?${query}` : ""}`);
}

export async function getCustomer(id: string): Promise<Client> {
	const envelope = await apiClient.get<{ success: true; data: Client }>(`/clients/${id}`);
	return envelope.data;
}

export async function getCustomerHistory(id: string): Promise<CustomerHistory> {
	const envelope = await apiClient.get<{ success: true; data: CustomerHistory }>(
		`/clients/${id}/history`,
	);
	return envelope.data;
}

export async function createCustomer(input: CreateClient): Promise<Client> {
	const envelope = await apiClient.post<{ success: true; data: Client }>("/clients", input);
	return envelope.data;
}

export async function updateCustomer(id: string, input: UpdateClient): Promise<Client> {
	const envelope = await apiClient.patch<{ success: true; data: Client }>(`/clients/${id}`, input);
	return envelope.data;
}

export async function deactivateCustomer(id: string): Promise<Client> {
	const envelope = await apiClient.delete<{ success: true; data: Client }>(`/clients/${id}`);
	return envelope.data;
}

/**
 * Custom Fields API Service
 *
 * Thin wrapper over `apiClient` for `/api/custom-fields` endpoints.
 */

import type {
	CreateCustomFieldDefinitionDto,
	CustomFieldDefinition,
	UpdateCustomFieldDefinitionDto,
} from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export async function listCustomFieldDefinitions(
	entityType?: string,
	includeInactive = false,
): Promise<CustomFieldDefinition[]> {
	const searchParams = new URLSearchParams();
	if (entityType) {
		searchParams.set("entityType", entityType);
	}
	if (includeInactive) {
		searchParams.set("includeInactive", "true");
	}
	const query = searchParams.toString();
	const envelope = await apiClient.get<{ success: true; data: CustomFieldDefinition[] }>(
		`/custom-fields${query ? `?${query}` : ""}`,
	);
	return envelope.data;
}

export async function createCustomFieldDefinition(
	input: CreateCustomFieldDefinitionDto,
): Promise<CustomFieldDefinition> {
	const envelope = await apiClient.post<{ success: true; data: CustomFieldDefinition }>(
		"/custom-fields",
		input,
	);
	return envelope.data;
}

export async function updateCustomFieldDefinition(
	id: string,
	input: UpdateCustomFieldDefinitionDto,
): Promise<CustomFieldDefinition> {
	const envelope = await apiClient.put<{ success: true; data: CustomFieldDefinition }>(
		`/custom-fields/${id}`,
		input,
	);
	return envelope.data;
}

export async function deleteCustomFieldDefinition(id: string): Promise<void> {
	await apiClient.delete(`/custom-fields/${id}`);
}

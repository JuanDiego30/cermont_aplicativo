"use client";

/**
 * Custom Fields — TanStack Query hooks
 */

import type {
	CreateCustomFieldDefinitionDto,
	UpdateCustomFieldDefinitionDto,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCustomFieldDefinition,
	deleteCustomFieldDefinition,
	listCustomFieldDefinitions,
	updateCustomFieldDefinition,
} from "./api/custom-fields-api";

const CUSTOM_FIELD_KEYS = {
	all: ["custom-fields"] as const,
	list: (entityType: string, includeInactive: boolean) =>
		[...CUSTOM_FIELD_KEYS.all, "list", entityType, includeInactive] as const,
};

export function useCustomFieldDefinitions(entityType: string, includeInactive = false) {
	return useQuery({
		queryKey: CUSTOM_FIELD_KEYS.list(entityType, includeInactive),
		queryFn: () => listCustomFieldDefinitions(entityType, includeInactive),
		enabled: Boolean(entityType),
	});
}

export function useCreateCustomFieldDefinition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateCustomFieldDefinitionDto) => createCustomFieldDefinition(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOM_FIELD_KEYS.all });
		},
	});
}

export function useUpdateCustomFieldDefinition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateCustomFieldDefinitionDto }) =>
			updateCustomFieldDefinition(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOM_FIELD_KEYS.all });
		},
	});
}

export function useDeleteCustomFieldDefinition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteCustomFieldDefinition(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CUSTOM_FIELD_KEYS.all });
		},
	});
}

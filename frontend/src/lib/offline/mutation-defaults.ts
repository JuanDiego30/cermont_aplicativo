"use client";

import type {
	ApiEnvelope,
	Checklist,
	CompleteChecklistInput,
	CreateChecklistInput,
	UpdateChecklistItemInput,
} from "@cermont/shared-types";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

export const OFFLINE_MUTATION_KEYS = {
	evidenceUpload: ["evidences", "upload"] as const,
	fileUpload: ["files", "upload", "offline"] as const,
	checklistCreate: ["checklists", "create"] as const,
	checklistUpdateItem: ["checklists", "update-item"] as const,
	checklistComplete: ["checklists", "complete"] as const,
	executionCommand: ["execution-sessions", "command"] as const,
	serviceCaseAdvanceStep: ["service-cases", "advance-step"] as const,
	workRequestCreate: ["work-requests", "create"] as const,
	siteVisitCreate: ["site-visits", "create"] as const,
	siteVisitStart: ["site-visits", "start"] as const,
	siteVisitComplete: ["site-visits", "complete"] as const,
	siteVisitCancel: ["site-visits", "cancel"] as const,
	proposalCreate: ["proposals", "create"] as const,
	proposalUpdate: ["proposals", "update"] as const,
	proposalApprove: ["proposals", "approve"] as const,
	proposalReject: ["proposals", "reject"] as const,
	orderCreate: ["orders", "create"] as const,
	orderUpdate: ["orders", "update"] as const,
	costCreate: ["costs", "create"] as const,
	costUpdate: ["costs", "update"] as const,
	costDelete: ["costs", "delete"] as const,
	documentUpload: ["documents", "upload"] as const,
	documentArchive: ["documents", "archive"] as const,
	documentDelete: ["documents", "delete"] as const,
	documentSign: ["documents", "sign"] as const,
	resourceAllocate: ["resources", "allocate"] as const,
	maintenanceKitCreate: ["maintenance", "kit", "create"] as const,
	maintenanceKitUpdate: ["maintenance", "kit", "update"] as const,
	maintenanceKitDelete: ["maintenance", "kit", "delete"] as const,
	maintenanceComplete: ["maintenance", "complete"] as const,
	reportCreate: ["reports", "create"] as const,
	reportUpdate: ["reports", "update"] as const,
	reportGenerate: ["reports", "generate"] as const,
	reportApprove: ["reports", "approve"] as const,
	reportReject: ["reports", "reject"] as const,
	billingDeliveryRecordCreate: ["billing", "delivery-record", "create"] as const,
	billingDeliveryRecordSend: ["billing", "delivery-record", "send"] as const,
	billingDeliveryRecordSign: ["billing", "delivery-record", "sign"] as const,
	billingDeliveryRecordReject: ["billing", "delivery-record", "reject"] as const,
	billingSESApprove: ["billing", "ses", "approve"] as const,
	billingSESReject: ["billing", "ses", "reject"] as const,
	billingInvoice: ["billing", "invoice"] as const,
	invoiceSubmit: ["billing", "invoice", "submit"] as const,
} as const;

interface UpdateChecklistItemDefaultVariables extends UpdateChecklistItemInput {
	checklistId: string;
	itemId: string;
}

interface CompleteChecklistDefaultVariables extends CompleteChecklistInput {
	checklistId: string;
}

const registeredClients = new WeakSet<QueryClient>();

export function registerOfflineMutationDefaults(queryClient: QueryClient): void {
	if (registeredClients.has(queryClient)) {
		return;
	}

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.evidenceUpload, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.fileUpload, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.checklistCreate, {
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (variables: CreateChecklistInput) => {
			const body = await apiClient.post<ApiEnvelope<Checklist>>("/checklists", variables);
			if (!body.success) {
				throw new Error("Failed to create checklist");
			}
			return body.data;
		},
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.checklistUpdateItem, {
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (variables: UpdateChecklistItemDefaultVariables) => {
			const body = await apiClient.patch<ApiEnvelope<Checklist>>(
				`/checklists/${variables.checklistId}/items/${variables.itemId}`,
				{
					result: variables.result,
					observation: variables.observation,
				},
			);
			if (!body.success) {
				throw new Error("Failed to update checklist item");
			}
			return body.data;
		},
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.checklistComplete, {
		networkMode: "offlineFirst",
		retry: 0,
		mutationFn: async (variables: CompleteChecklistDefaultVariables) => {
			const body = await apiClient.post<ApiEnvelope<Checklist>>(
				`/checklists/${variables.checklistId}/validate`,
				{
					signature: variables.signature,
					observations: variables.observations,
				},
			);
			if (!body.success) {
				throw new Error("Failed to complete checklist");
			}
			return body.data;
		},
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.executionCommand, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.serviceCaseAdvanceStep, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.workRequestCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.siteVisitCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.siteVisitStart, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.siteVisitComplete, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.siteVisitCancel, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.proposalCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.proposalUpdate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.proposalApprove, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.proposalReject, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.orderCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.costCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.costUpdate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.costDelete, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.documentUpload, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.resourceAllocate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.documentArchive, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.documentDelete, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.documentSign, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.reportCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.reportUpdate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.reportApprove, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.reportReject, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingDeliveryRecordCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingDeliveryRecordSend, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingDeliveryRecordSign, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingSESApprove, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingSESReject, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.invoiceSubmit, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.maintenanceKitCreate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.maintenanceKitUpdate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.maintenanceKitDelete, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.maintenanceComplete, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.reportGenerate, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	queryClient.setMutationDefaults(OFFLINE_MUTATION_KEYS.billingInvoice, {
		networkMode: "offlineFirst",
		retry: 0,
	});

	registeredClients.add(queryClient);
}

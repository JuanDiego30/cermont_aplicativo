import type {
	AddExecutionIncidentCommand,
	AddExecutionLaborEntryCommand,
	AddExecutionMaterialUsageCommand,
	CompleteExecutionSessionCommand,
	ExecutionSession,
	ExecutionSessionListQuery,
	ExecutionSessionListResponse,
	OfflineJsonObject,
	OfflineJsonValue,
	PauseExecutionSessionCommand,
	ResumeExecutionSessionCommand,
	StartExecutionSessionCommand,
	SubmitExecutionDynamicFormCommand,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
import { enqueue, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/store/offline.store";

type ExecutionDetailEnvelope = {
	success: boolean;
	data: ExecutionSession;
	queued?: boolean;
};

const EXECUTION_KEYS = {
	all: ["execution-sessions"] as const,
	list: (filters?: Partial<ExecutionSessionListQuery>) =>
		[...EXECUTION_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...EXECUTION_KEYS.all, "detail", id] as const,
	byOrder: (orderId: string) => [...EXECUTION_KEYS.all, "order", orderId] as const,
} as const;

function buildExecutionListUrl(filters?: Partial<ExecutionSessionListQuery>): string {
	const queryParams = new URLSearchParams();
	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			if (typeof value === "string" && value.length > 0) {
				queryParams.set(key, value);
			}
			if (typeof value === "number") {
				queryParams.set(key, String(value));
			}
		}
	}
	const query = queryParams.toString();
	return query ? `/execution-sessions?${query}` : "/execution-sessions";
}

function unwrapExecutionDetail(response: ExecutionDetailEnvelope): ExecutionSession {
	if (!response.success) {
		throw new Error("No se pudo cargar la ejecucion");
	}
	return response.data;
}

function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

function toOfflinePayload(command: object, idempotencyKey: string): OfflineJsonObject {
	const payload: OfflineJsonObject = { idempotencyKey };

	for (const [key, value] of Object.entries(
		command as Record<string, OfflineJsonValue | undefined>,
	)) {
		if (typeof value !== "undefined") {
			payload[key] = value;
		}
	}

	return payload;
}

async function queueExecutionCommand<TCommand extends object>(
	id: string,
	path: string,
	command: TCommand,
): Promise<void> {
	const idempotencyKey = createUuid();
	const payload = toOfflinePayload(command, idempotencyKey);
	const entry: SyncQueueEntry = {
		id: createUuid(),
		endpoint: `/execution-sessions/${id}/${path}`,
		method: "POST",
		payload,
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey,
		dedupeKey: `execution:${id}:${path}:${JSON.stringify(payload)}`,
	};

	await enqueue(entry);
}

export function useExecutionSessions(filters?: Partial<ExecutionSessionListQuery>) {
	return useQuery({
		queryKey: EXECUTION_KEYS.list(filters),
		queryFn: async () => {
			const response = await apiClient.get<ExecutionSessionListResponse>(
				buildExecutionListUrl(filters),
			);
			return {
				items: response.data,
				pagination: response.pagination,
			};
		},
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useExecutionSession(id: string) {
	return useQuery({
		queryKey: EXECUTION_KEYS.detail(id),
		queryFn: async () => {
			const response = await apiClient.get<ExecutionDetailEnvelope>(`/execution-sessions/${id}`);
			return unwrapExecutionDetail(response);
		},
		enabled: Boolean(id),
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useExecutionSessionByOrder(orderId: string) {
	return useQuery({
		queryKey: EXECUTION_KEYS.byOrder(orderId),
		queryFn: async () => {
			const response = await apiClient.get<ExecutionDetailEnvelope>(
				`/orders/${orderId}/execution-session`,
			);
			return unwrapExecutionDetail(response);
		},
		enabled: Boolean(orderId),
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useCreateExecutionSessionForOrder(orderId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [...EXECUTION_KEYS.all, "create-for-order", orderId],
		mutationFn: () =>
			apiClient.post<ExecutionDetailEnvelope>(`/orders/${orderId}/execution-session`, {}),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.all });
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.byOrder(orderId) });
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(response.data._id ?? "") });
		},
	});
}

function useExecutionCommand<TCommand extends object>(id: string, path: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [...OFFLINE_MUTATION_KEYS.executionCommand, id, path],
		networkMode: "offlineFirst",
		mutationFn: async (command: TCommand) => {
			try {
				return await apiClient.post<ExecutionDetailEnvelope>(
					`/execution-sessions/${id}/${path}`,
					command,
				);
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					await queueExecutionCommand(id, path, command);
					const cached = queryClient.getQueryData<ExecutionSession>(EXECUTION_KEYS.detail(id));
					if (cached) {
						const updated = { ...cached };
						if (path === "start") {
							updated.status = "in_progress";
							updated.startedAt = new Date().toISOString();
						} else if (path === "pause") {
							updated.status = "paused";
						} else if (path === "resume") {
							updated.status = "in_progress";
						} else if (path === "complete") {
							updated.status = "completed";
							updated.completedAt = new Date().toISOString();
						} else if (path === "materials") {
							const matCmd = command as AddExecutionMaterialUsageCommand;
							updated.materialsUsed = [
								...(updated.materialsUsed || []),
								{
									usageId: createUuid(),
									materialId: matCmd.material.materialId,
									name: matCmd.material.name || "Material",
									quantityPlanned: matCmd.material.quantityPlanned || 0,
									quantityUsed: matCmd.material.quantityUsed || 1,
									unit: matCmd.material.unit || "units",
									recordedAt: new Date().toISOString(),
									recordedBy: matCmd.material.recordedBy || "system",
								},
							] as NonNullable<ExecutionSession["materialsUsed"]>;
						} else if (path === "labor") {
							const laborCmd = command as AddExecutionLaborEntryCommand;
							updated.laborEntries = [
								...(updated.laborEntries || []),
								{
									laborEntryId: createUuid(),
									userId: laborCmd.labor.userId,
									role: laborCmd.labor.role || "operator",
									startedAt: laborCmd.labor.startedAt || new Date().toISOString(),
									endedAt: laborCmd.labor.endedAt || new Date().toISOString(),
									durationMinutes: laborCmd.labor.durationMinutes || 60,
									description: laborCmd.labor.description || "Trabajo de campo",
								},
							] as NonNullable<ExecutionSession["laborEntries"]>;
						} else if (path === "incidents") {
							const incCmd = command as AddExecutionIncidentCommand;
							updated.incidents = [
								...(updated.incidents || []),
								{
									incidentId: createUuid(),
									type: incCmd.incident.type,
									severity: incCmd.incident.severity,
									description: incCmd.incident.description,
									occurredAt: incCmd.incident.occurredAt || new Date().toISOString(),
									reportedBy: incCmd.incident.reportedBy || "system",
									evidenceIds: incCmd.incident.evidenceIds || [],
									resolved: false,
								},
							] as NonNullable<ExecutionSession["incidents"]>;
						}
						queryClient.setQueryData(EXECUTION_KEYS.detail(id), updated);
						queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.byOrder(cached.workOrderId) });
						return { success: true, data: updated, queued: true };
					}
				}

				throw error;
			}
		},
		onSuccess: (response) => {
			if (response.queued) {
				return;
			}
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.all });
		},
	});
}

export function useStartExecutionSession(id: string) {
	return useExecutionCommand<StartExecutionSessionCommand>(id, "start");
}

export function usePauseExecutionSession(id: string) {
	return useExecutionCommand<PauseExecutionSessionCommand>(id, "pause");
}

export function useResumeExecutionSession(id: string) {
	return useExecutionCommand<ResumeExecutionSessionCommand>(id, "resume");
}

export function useCompleteExecutionSession(id: string) {
	return useExecutionCommand<CompleteExecutionSessionCommand>(id, "complete");
}

export function useAddExecutionMaterial(id: string) {
	return useExecutionCommand<AddExecutionMaterialUsageCommand>(id, "materials");
}

export function useAddExecutionLabor(id: string) {
	return useExecutionCommand<AddExecutionLaborEntryCommand>(id, "labor");
}

export function useAddExecutionIncident(id: string) {
	return useExecutionCommand<AddExecutionIncidentCommand>(id, "incidents");
}

export function useSubmitExecutionDynamicForm(id: string) {
	return useExecutionCommand<SubmitExecutionDynamicFormCommand>(id, "dynamic-form");
}

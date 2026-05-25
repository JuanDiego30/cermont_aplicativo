import type {
	AddExecutionIncidentCommand,
	AddExecutionLaborEntryCommand,
	AddExecutionMaterialUsageCommand,
	CompleteExecutionSessionCommand,
	ExecutionSession,
	ExecutionSessionListQuery,
	ExecutionSessionListResponse,
	PauseExecutionSessionCommand,
	ResumeExecutionSessionCommand,
	StartExecutionSessionCommand,
	SubmitExecutionDynamicFormCommand,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type ExecutionDetailEnvelope = {
	success: boolean;
	data: ExecutionSession;
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
		mutationFn: () =>
			apiClient.post<ExecutionDetailEnvelope>(`/orders/${orderId}/execution-session`, {}),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.all });
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.byOrder(orderId) });
			queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(response.data._id ?? "") });
		},
	});
}

function useExecutionCommand<TCommand>(id: string, path: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (command: TCommand) =>
			apiClient.post<ExecutionDetailEnvelope>(`/execution-sessions/${id}/${path}`, command),
		onSuccess: () => {
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

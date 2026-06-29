/**
 * Privacy requests TanStack Query hooks
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type PrivacyRequestInput, privacyRequestsApi } from "../api/privacy-requests";

const PRIVACY_KEYS = {
	all: ["privacy-requests"] as const,
	detail: (id: string) => ["privacy-requests", id] as const,
};

export function usePrivacyRequests() {
	return useQuery({
		queryKey: PRIVACY_KEYS.all,
		queryFn: privacyRequestsApi.list,
	});
}

export function usePrivacyRequest(id: string) {
	return useQuery({
		queryKey: PRIVACY_KEYS.detail(id),
		queryFn: () => privacyRequestsApi.get(id),
		enabled: !!id,
	});
}

export function useCreatePrivacyRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: PrivacyRequestInput) => privacyRequestsApi.create(input),
		onSuccess: () => {
			toast.success("Solicitud de privacidad enviada");
			queryClient.invalidateQueries({ queryKey: PRIVACY_KEYS.all });
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al enviar solicitud");
		},
	});
}

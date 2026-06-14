import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FormSubmissionPayload {
	templateId: string;
	stepCode: string;
	serviceCaseId?: string;
	executionSessionId?: string;
	values: Record<string, unknown>;
	photoAttachments?: Array<{
		fieldKey: string;
		fileId: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
	}>;
	status?: "draft" | "submitted";
}

export interface FormSubmission {
	_id: string;
	templateId: string;
	stepCode: string;
	serviceCaseId?: string;
	executionSessionId?: string;
	values: Record<string, unknown>;
	photoAttachments: Array<{
		fieldKey: string;
		fileId: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
	}>;
	submittedBy: string;
	submittedAt: string;
	status: "draft" | "submitted" | "archived";
	createdAt: string;
	updatedAt: string;
}

interface FormSubmissionEnvelope {
	data: FormSubmission;
}

// ── Query keys ─────────────────────────────────────────────────────────────

const FORM_SUBMISSION_KEYS = {
	all: ["form-submissions"] as const,
	list: (filters?: Record<string, string>) =>
		[...FORM_SUBMISSION_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...FORM_SUBMISSION_KEYS.all, "detail", id] as const,
	byServiceCase: (serviceCaseId: string) =>
		[...FORM_SUBMISSION_KEYS.all, "service-case", serviceCaseId] as const,
};

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Submit a CERMONT operational form.
 * Note: photo files must be uploaded separately via /api/files first.
 * Pass the returned fileId references in photoAttachments.
 */
export function useCreateFormSubmission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: FormSubmissionPayload): Promise<FormSubmissionEnvelope> => {
			return apiClient.post<FormSubmissionEnvelope>("/form-submissions", payload);
		},
		onSuccess: (_data, variables) => {
			// Invalidate the list for this service case
			if (variables.serviceCaseId) {
				void queryClient.invalidateQueries({
					queryKey: FORM_SUBMISSION_KEYS.byServiceCase(variables.serviceCaseId),
				});
			}
			void queryClient.invalidateQueries({
				queryKey: FORM_SUBMISSION_KEYS.all,
			});
		},
	});
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface EvidenceFormState {
	title: string;
	description: string;
	file: File | null;
}

export function useEvidenceForm(orderId: string, onSuccess?: () => void) {
	const [state, setState] = useState<EvidenceFormState>({
		title: "",
		description: "",
		file: null,
	});
	const queryClient = useQueryClient();

	const uploadMutation = useMutation({
		mutationFn: async (formData: FormData) => {
			const response = await apiClient.post("/evidences/upload", formData);
			return response;
		},
		onSuccess: () => {
			toast.success("Evidencia subida correctamente");
			setState({ title: "", description: "", file: null });
			queryClient.invalidateQueries({ queryKey: ["evidences"] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al subir la evidencia");
		},
	});

	const validateFile = useCallback((file: File): string | null => {
		if (file.size > MAX_FILE_SIZE) {
			return "El archivo no debe superar 10MB";
		}
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return "Formato no válido. Use JPG, PNG o WebP";
		}
		return null;
	}, []);

	const setTitle = useCallback((title: string) => {
		setState((prev) => ({ ...prev, title }));
	}, []);

	const setDescription = useCallback((description: string) => {
		setState((prev) => ({ ...prev, description }));
	}, []);

	const setFile = useCallback(
		(file: File | null) => {
			if (file) {
				const error = validateFile(file);
				if (error) {
					toast.error(error);
					return;
				}
			}
			setState((prev) => ({ ...prev, file }));
		},
		[validateFile],
	);

	const reset = useCallback(() => {
		setState({ title: "", description: "", file: null });
	}, []);

	const submit = useCallback(async () => {
		if (!state.file || !orderId || !state.title.trim()) {
			return;
		}

		const formData = new FormData();
		formData.append("file", state.file);
		formData.append("orderId", orderId);
		formData.append("type", "during");
		formData.append(
			"description",
			state.description.trim()
				? `${state.title.trim()} — ${state.description.trim()}`
				: state.title.trim(),
		);
		formData.append("capturedAt", new Date().toISOString());

		await uploadMutation.mutateAsync(formData);
	}, [state, orderId, uploadMutation]);

	return {
		...state,
		setTitle,
		setDescription,
		setFile,
		reset,
		submit,
		isUploading: uploadMutation.isPending,
		canUpload: !!orderId && !!state.file && !!state.title.trim() && !uploadMutation.isPending,
	};
}

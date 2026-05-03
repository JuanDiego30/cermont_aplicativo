"use client";

import type { ApiBody, Order, TransitionExecutionPhaseInput } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { queueOfflineAction } from "@/_shared/lib/pwa/offline-queue";
import { ORDERS_KEYS } from "../queries";

function isNetworkFailure(error: unknown): boolean {
	return (
		(typeof navigator !== "undefined" && !navigator.onLine) ||
		error instanceof TypeError ||
		error instanceof DOMException
	);
}

export function useOfflineExecution(orderId: string) {
	const queryClient = useQueryClient();

	const transitionMutation = useMutation({
		mutationFn: async (data: TransitionExecutionPhaseInput): Promise<Order> => {
			const body = await apiClient.patch<ApiBody<Order>>(
				`/orders/${orderId}/execution-phase`,
				data,
			);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || "Error al cambiar fase");
			}
			return body.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(orderId) });
		},
	});

	const mutateAsync = useCallback(
		async (data: TransitionExecutionPhaseInput): Promise<Order | null> => {
			try {
				return await transitionMutation.mutateAsync(data);
			} catch (error) {
				if (isNetworkFailure(error)) {
					await queueOfflineAction({
						type: "COMPLETE_EXECUTION_PHASE",
						payload: {
							id: orderId,
							targetPhase: data.targetPhase,
						},
						status: "pending",
					});
					return null;
				}
				throw error;
			}
		},
		[orderId, transitionMutation],
	);

	return {
		...transitionMutation,
		mutateAsync,
	};
}

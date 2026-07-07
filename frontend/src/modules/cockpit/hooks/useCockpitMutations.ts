import { useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerCockpitAction } from "../api/cockpit.api";
import { cockpitKeys } from "../utils/cockpitKeys";

export function useCockpitMutations(serviceCaseId: string) {
	const queryClient = useQueryClient();

	const advanceMutation = useMutation({
		mutationFn: (action: string) => triggerCockpitAction(serviceCaseId, action),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cockpitKeys.detail(serviceCaseId) });
			queryClient.invalidateQueries({ queryKey: cockpitKeys.all });
		},
	});

	return { advanceMutation };
}

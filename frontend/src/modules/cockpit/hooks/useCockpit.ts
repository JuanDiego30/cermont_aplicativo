import { useQuery } from "@tanstack/react-query";
import { fetchCockpit } from "../api/cockpit.api";
import type { CockpitData } from "../model/cockpit.types";
import { cockpitKeys } from "../utils/cockpitKeys";

export function useCockpit(serviceCaseId: string) {
	return useQuery<CockpitData>({
		queryKey: cockpitKeys.detail(serviceCaseId),
		queryFn: () => fetchCockpit(serviceCaseId),
		enabled: !!serviceCaseId,
		staleTime: 15_000,
		refetchInterval: 60_000,
	});
}
